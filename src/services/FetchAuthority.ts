import { supabase } from '../config/supabaseClient';
import { UserProfile, Tradie, Property } from '../types';

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

    // This is a placeholder for now. In the future, you would fetch skills.
    return {
        id: data.user_id,
        name: `${data.first_name} ${data.last_name}`,
        phone: data.phone,
        email: data.email,
        roles: [], 
    };
};

// Fetches the list of all tradies connected to a specific property.
export const fetchPropertyTradies = async (propertyId: string): Promise<Tradie[]> => {
    // Corrected: Using an explicit join hint to resolve ambiguity.
    const { data, error } = await supabase
        .from('PropertyTradies')
        .select(`
            status,
            Tradesperson!inner(
                User!Tradesperson_user_id_fkey(user_id, first_name, last_name, phone, email)
            )
        `)
        .eq('property_id', propertyId);

    if (error) {
        console.error("Error fetching property tradies:", error.message);
        return [];
    }
    
    // Format the data to match our Tradie interface.
    return data.map(item => {
        const user = item.Tradesperson[0].User[0];
        return {
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
    // Corrected: Using an explicit join hint for consistency and robustness.
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

// Fetches all properties owned by a specific user.
export const getPropertiesByOwner = async (userId: string): Promise<Property[] | null> => {
    const { data, error } = await supabase
        .from('Owner')
        .select(`
            OwnerProperty (
                Property ( property_id, name, address, description, pin, created_at )
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
