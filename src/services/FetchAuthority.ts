import { supabase } from '../config/supabaseClient';
import { UserProfile, Tradie, Property, ActiveTradieJob } from '../types';

// Fetches the profile of the currently logged-in user.
export const fetchMyProfile = async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('User')
        .select('user_id, first_name, last_name, phone, email')
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
    }

    return {
        id: data.user_id,
        name: `${data.first_name} ${data.last_name}`,
        phone: data.phone,
        email: data.email,
        roles: [], 
    };
};

export const fetchActiveJobsForProperty = async (propertyId: string): Promise<ActiveTradieJob[]> => {
    const { data, error } = await supabase
        .from('Jobs')
        .select(`
            id,
            title,
            status,
            Tradesperson (
                tradie_id,
                User (
                    first_name,
                    last_name
                )
            )
        `)
        .eq('property_id', propertyId)
        .eq('status', 'ACCEPTED'); 

    if (error) {
        console.error("Error fetching active jobs:", error.message);
        return [];
    }
    
    const anyData = data as any[];

    return anyData.map(job => {
        const user = job.Tradesperson.User;
        return {
            jobId: job.id,
            jobTitle: job.title,
            tradieId: job.Tradesperson.tradie_id,
            tradieName: `${user.first_name} ${user.last_name}`,
        }
    });
};

export const endTradieJob = async (jobId: string): Promise<void> => {
    const { error } = await supabase
        .from('Jobs')
        .update({ status: 'REVOKED' }) 
        .eq('id', jobId);

    if (error) {
        console.error("Error ending tradie job:", error.message);
        throw new Error('Could not end the tradie session.');
    }
};

// Fetches the list of all tradies and correctly maps to the Tradie type
export const fetchPropertyTradies = async (propertyId: string): Promise<Tradie[]> => {
    const { data, error } = await supabase
        .from('PropertyTradies')
        .select(`
            id, 
            status,
            Tradesperson!property_tradies_tradie_id_fkey(
                tradie_id,
                User!Tradesperson_user_id_fkey(user_id, first_name, last_name, phone, email)
            )
        `)
        .eq('property_id', propertyId);

    if (error) {
        console.error("Error fetching property tradies:", error.message);
        return [];
    }
    
    // Using 'any' to bypass Supabase's complex type inference issues
    const anyData = data as any[];

    return anyData.map(item => {
        const user = item.Tradesperson.User;
        return {
            connectionId: item.id,
            id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            phone: user.phone,
            email: user.email,
            status: item.status,
            roles: [], 
        }
    });
};

// Fetches the profile of the owner of a specific property.
export const fetchPropertyOwner = async (propertyId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('OwnerProperty')
        .select(`
            Owner!inner(
                User!Owner_user_id_fkey(user_id, first_name, last_name, phone, email)
            )
        `)
        .eq('property_id', propertyId)
        .single();

    if (error || !data) {
        console.error("Error fetching property owner:", error?.message);
        return null;
    }

    const ownerUser = data.Owner[0].User[0];
    return {
        id: ownerUser.user_id,
        name: `${ownerUser.first_name} ${ownerUser.last_name}`,
        phone: ownerUser.phone,
        email: ownerUser.email,
        roles: ['Owner'],
    };
};

export const getPropertiesByOwner = async (userId: string): Promise<Property[] | null> => {
    const { data, error } = await supabase
        .from('Owner')
        .select(`
            OwnerProperty (
                Property ( 
                    property_id, 
                    name, 
                    address, 
                    description, 
                    pin, 
                    created_at,
                    status 
                )
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching properties:", error.message);
        return null;
    }
    
    if (!data) return [];

    const properties: Property[] = data
        .flatMap(owner => owner.OwnerProperty)
        .flatMap(op => op.Property);

    return properties;
}

export const fetchMyFirstName = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('User')
        .select('first_name')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error("Error fetching user's first name:", error.message);
        return null;
    }
    return data?.first_name || null;
}

// Fetch jobs (properties) assigned to the currently logged-in tradie.
export const getJobsForTradie = async (tradieUserId: string): Promise<any[] | null> => {
    const { data, error } = await supabase
        .from('PropertyTradies')
        .select(`
            id,
            status,
            Property ( property_id, name, address, status ),
            Property!inner(OwnerProperty(Owner(User(user_id, first_name, last_name, email))))
        `)
        .eq('tradie_user_id', tradieUserId);

    if (error) {
        console.error('Error fetching jobs for tradie:', error.message);
        return null;
    }

    if (!data) return [];

    // Map to Property[] shape (approximate)
    return data.map((row: any) => ({
        property_id: row.Property?.property_id || row.id,
        name: row.Property?.name || 'Property',
        address: row.Property?.address || '',
        status: row.status || row.Property?.status || '',
    }));
}