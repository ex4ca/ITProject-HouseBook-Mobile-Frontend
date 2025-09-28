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

/**
 * Fetches all jobs assigned to the currently logged-in tradie.
 * This query joins the Jobs, Property, and Owner tables to provide comprehensive
 * details for the job board.
 */
export const getJobsForTradie = async (tradieUserId: string): Promise<any[]> => {
    const { data: tradieData, error: tradieError } = await supabase
      .from('Tradesperson')
      .select('tradie_id')
      .eq('user_id', tradieUserId)
      .single();

    if (tradieError || !tradieData) {
        console.error('Error fetching tradie profile:', tradieError?.message);
        return [];
    }

    const { data, error } = await supabase
        .from('Jobs')
        .select(`
            id,
            title,
            status,
            Property (
                property_id,
                name,
                address
            )
        `)
        .eq('tradie_id', tradieData.tradie_id);

    if (error) {
        console.error('Error fetching jobs for tradie:', error.message);
        return [];
    }

    // Map the data to a flat structure for easier use in the UI component.
    return data.map((job: any) => ({
        job_id: job.id,
        title: job.title,
        status: job.status,
        property_id: job.Property.property_id,
        name: job.Property.name,
        address: job.Property.address,
    }));
};

/**
 * Allows a tradie to claim a pending job by scanning a property's QR code.
 * It checks if a job is available and assigns it to the current user.
 * @param propertyId The ID of the property scanned from the QR code.
 * @returns An object indicating success and a corresponding message.
 */
export const claimJobByPropertyId = async (propertyId: string): Promise<{ success: boolean; message: string }> => {
  // First, find a job that is pending for the given property.
  const { data: pendingJob, error: findError } = await supabase
    .from('Jobs')
    .select('id, tradie_id')
    .eq('property_id', propertyId)
    .eq('status', 'PENDING')
    .limit(1)
    .single();

  if (findError || !pendingJob) {
    return { success: false, message: 'No pending job found for this property, or the job has already been taken.' };
  }

  // Then, get the current user's tradie ID.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to claim a job.');
  
  const { data: tradie, error: tradieError } = await supabase
    .from('Tradesperson')
    .select('tradie_id')
    .eq('user_id', user.id)
    .single();
  
  if (tradieError || !tradie) {
    throw new Error('Could not identify your tradie profile.');
  }

  // Finally, attempt to update the job with the tradie's ID and set the status to 'accepted'.
  const { error: updateError } = await supabase
    .from('Jobs')
    .update({ tradie_id: tradie.tradie_id, status: 'accepted' })
    .eq('id', pendingJob.id)
    .eq('status', 'PENDING'); // Ensures atomicity

  if (updateError) {
    console.error('Error claiming job:', updateError.message);
    return { success: false, message: 'Failed to claim job. Another tradie may have just accepted it.' };
  }

  return { success: true, message: 'Job successfully added to your list!' };
};