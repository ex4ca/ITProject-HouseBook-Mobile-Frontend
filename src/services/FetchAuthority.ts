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

/**
 * Fetches active tradies for a property by querying through the JobTradies table.
 * This version now filters for 'ACCEPTED' status and handles expired jobs by updating their
 * status in the background.
 * @param propertyId The ID of the property.
 */
export const fetchActiveJobsForProperty = async (propertyId: string): Promise<ActiveTradieJob[]> => {
    const { data, error } = await supabase
        .from('Jobs')
        .select(`
            id,
            title,
            end_time,
            JobTradies!inner (
                tradie_id,
                status,
                Tradesperson (
                    User (
                        first_name,
                        last_name
                    )
                )
            )
        `)
        .eq('property_id', propertyId)
        .eq('JobTradies.status', 'ACCEPTED');
        
    if (error) {
        console.error("Error fetching active jobs:", error.message);
        return [];
    }

    if (!data) return [];

    const activeTradies: ActiveTradieJob[] = [];
    const expiredAssignments: { jobId: string, tradieId: string }[] = [];
    const currentTime = new Date();

    // Iterate through the fetched data to separate active and expired jobs.
    data.forEach(job => {
        const jobEndTime = new Date(job.end_time);

        (job.JobTradies as any[]).forEach((jobTradie: any) => {
            // Check if the job's end_time has passed.
            if (job.end_time && jobEndTime < currentTime) {
                // If expired, add the assignment to a list to be updated.
                expiredAssignments.push({ jobId: job.id, tradieId: jobTradie.tradie_id });
            } else if (jobTradie.Tradesperson && jobTradie.Tradesperson.User) {
                // If not expired, add the tradie to the list to be displayed in the UI.
                activeTradies.push({
                    jobId: job.id,
                    jobTitle: job.title,
                    tradieId: jobTradie.tradie_id,
                    tradieName: `${jobTradie.Tradesperson.User.first_name} ${jobTradie.Tradesperson.User.last_name}`,
                });
            }
        });
    });

    // Asynchronously update the status of all expired assignments in the background.
    // We don't `await` this, so the UI can update instantly with the active tradies.
    if (expiredAssignments.length > 0) {
        console.log(`Found ${expiredAssignments.length} expired job assignments to update.`);
        Promise.all(expiredAssignments.map(async (assignment) => {
            const { error: updateError } = await supabase
                .from('JobTradies')
                .update({ status: 'EXPIRED' })
                .eq('job_id', assignment.jobId)
                .eq('tradie_id', assignment.tradieId);

            if (updateError) {
                console.error(`Failed to expire job ${assignment.jobId} for tradie ${assignment.tradieId}:`, updateError.message);
            }
        }));
    }

    // Return only the list of active tradies.
    return activeTradies;
};


/**
 * Ends a specific tradie's session by updating their status in the JobTradies table.
 * @param jobId The ID of the job.
 * @param tradieId The ID of the tradie to be removed.
 */
export const endTradieJob = async (jobId: string, tradieId: string): Promise<void> => {
    const { error } = await supabase
        .from('JobTradies')
        .update({ status: 'EXPIRED' }) 
        .eq('job_id', jobId)
        .eq('tradie_id', tradieId);

    if (error) {
        console.error("Error ending tradie's job session:", error.message);
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
                    status,
                    splash_image 
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
        .flatMap((owner: any) => owner.OwnerProperty)
        .map((op: any) => op.Property);

    // Process both splash images and activity status concurrently.
    const processedProperties = await Promise.all(
        properties.map(async (property) => {
            let processedProperty = { ...property };

            // Set activity status based on the Property.status field.
            processedProperty.isActive = property.status === 'ACTIVE';

            // Generate a signed URL for the splash image if it exists.
            if (property.splash_image) {
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('Property_Images')
                    .createSignedUrl(property.splash_image, 60 * 5); // 5-minute expiry

                if (signedUrlError) {
                    console.error(`Error creating signed URL for ${property.splash_image}:`, signedUrlError);
                    // If signing fails, nullify the image so a placeholder is used.
                    processedProperty.splash_image = null;
                } else {
                    processedProperty.splash_image = signedUrlData.signedUrl;
                }
            }
            return processedProperty;
        })
    );

    return processedProperties;
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
 * Fetches all jobs a tradie is assigned to via the JobTradies table.
 * This function now correctly joins through the new assignment table.
 * @param tradieUserId The user_id of the currently logged-in tradie.
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

    // Query the JobTradies table to find all accepted jobs for this tradie
    const { data, error } = await supabase
        .from('JobTradies')
        .select(`
            status,
            Jobs (
                id,
                title,
                Property (
                    property_id,
                    name,
                    address
                )
            )
        `)
        .eq('tradie_id', tradieData.tradie_id)
        .eq('status', 'ACCEPTED');

    if (error) {
        console.error('Error fetching jobs for tradie:', error.message);
        return [];
    }

    // Map the nested data to the flat structure the UI expects
    return (data || []).map((jobTradie: any) => ({
        job_id: jobTradie.Jobs.id,
        title: jobTradie.Jobs.title,
        status: jobTradie.status, // Status now comes from the JobTradies table
        property_id: jobTradie.Jobs.Property.property_id,
        name: jobTradie.Jobs.Property.name,
        address: jobTradie.Jobs.Property.address,
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
    .update({ tradie_id: tradie.tradie_id, status: 'ACCEPTED' })
    .eq('id', pendingJob.id)
    .eq('status', 'PENDING'); 

  if (updateError) {
    console.error('Error claiming job:', updateError.message);
    return { success: false, message: 'Failed to claim job. Another tradie may have just accepted it.' };
  }

  return { success: true, message: 'Job successfully added to your list!' };
};

/**
 * Fetches comprehensive details for a single job, including property info
 * and a filtered list of assets linked specifically to this job.
 * @param jobId The ID of the job to fetch.
 */
export const fetchJobDetails = async (jobId: string): Promise<any | null> => {
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
      ),
      JobAssets (
        Assets (
          id,
          description,
          Spaces (
            name
          )
        )
      )
    `)
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job details:', error.message);
    return null;
  }

  // The query returns nested data, so we can simplify it for the UI.
  // The assets are already filtered by the database through the JobAssets join.
  const jobDetails = {
    ...data,
    // Flatten the assets array for easier rendering
    assets: data.JobAssets.map((ja: any) => ({
        ...ja.Assets,
        spaceName: ja.Assets.Spaces.name,
    }))
  };

  return jobDetails;
};


/**
 * Assigns a tradie to a job by creating an entry in the JobTradies table.
 * It now first validates that the propertyId from the QR code is valid.
 * @param propertyId The ID of the property.
 * @param pin The PIN for the job.
 */
export const claimJobWithPin = async (propertyId: string, pin: string): Promise<{ success: boolean; message: string }> => {
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

  // Step 1: Verify the propertyId from the QR code is valid.
  const { data: property, error: propertyError } = await supabase
    .from('Property')
    .select('property_id')
    .eq('property_id', propertyId)
    .single();

  // If we get an error or no data, the property ID from the QR code is invalid.
  if (propertyError || !property) {
    return { success: false, message: 'Invalid Property QR Code. This property does not exist.' };
  }

  // Step 2: Now that the property is confirmed, find a matching, active job.
  const { data: job, error: findError } = await supabase
    .from('Jobs')
    .select('id, end_time')
    .eq('property_id', propertyId)
    .eq('pin', pin)
    .gt('end_time', new Date().toISOString()) // Check if end_time is greater than the current time
    .limit(1)
    .single();

  if (findError || !job) {
    return { success: false, message: 'Invalid PIN or this job has expired.' };
  }

  // Step 3: Create a new entry in the JobTradies table to assign the job.
  const { error: insertError } = await supabase
    .from('JobTradies')
    .insert({
      job_id: job.id,
      tradie_id: tradie.tradie_id,
      status: 'ACCEPTED',
    });

  if (insertError) {
    if (insertError.code === '23505') {
        return { success: true, message: 'You are already assigned to this job.' };
    }
    console.error('Error assigning job:', insertError.message);
    return { success: false, message: 'Failed to claim job. Please try again.' };
  }

  return { success: true, message: 'Job successfully added to your list!' };
};

/**
 * Fetches all details for a property, and also identifies which assets
 * are within the scope of a specific job for the current tradie.
 * @param propertyId The ID of the property to view.
 * @param jobId The ID of the current job.
 */
export const fetchPropertyAndJobScope = async (propertyId: string, jobId: string) => {
  const { data: propertyData, error: propertyError } = await supabase
    .from('Property')
    .select(`
      property_id, name, address,
      Spaces ( id, name, type, Assets!left(id, description, asset_type_id, ChangeLog(id, specifications, change_description, created_at, status, User!ChangeLog_changed_by_user_id_fkey(first_name, last_name))))
    `)
    .eq('property_id', propertyId)
    .single();

  if (propertyError) throw propertyError;

  const { data: jobAssets, error: jobAssetsError } = await supabase
    .from('JobAssets')
    .select('asset_id')
    .eq('job_id', jobId);
  
  if (jobAssetsError) throw jobAssetsError;

  const editableAssetIds = new Set(jobAssets.map(ja => ja.asset_id));

  return {
    property: propertyData,
    editableAssetIds: editableAssetIds,
  };
};