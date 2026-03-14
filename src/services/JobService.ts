import { supabase } from "../config/supabaseClient";
import type { ActiveTradieJob } from "../types";

/**
 * Fetches all *currently active* tradie jobs for a specific property.
 * This function is for **Owners** to see who is working on their property.
 *
 * It filters for `JobTradies` entries with an 'ACCEPTED' status and a
 * job `end_time` that has not passed.
 *
 * Automatic Cleanup: This function also *asynchronously* (fire and
 * forget) updates the status of any 'ACCEPTED' jobs it finds that
 * *have* expired, marking them as 'EXPIRED' in the database. This
 * cleans up stale data without blocking the UI.
 */
export const fetchActiveJobsForProperty = async (
  propertyId: string,
): Promise<ActiveTradieJob[]> => {
  const { data, error } = await supabase
    .from("Jobs")
    .select(
      `
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
        `,
    )
    .eq("property_id", propertyId)
    .eq("JobTradies.status", "ACCEPTED");

  if (error) {
    console.error("Error fetching active jobs:", error.message);
    return [];
  }

  if (!data) return [];

  const activeTradies: ActiveTradieJob[] = [];
  const expiredAssignments: { jobId: string; tradieId: string }[] = [];
  const currentTime = new Date();

  // Iterate through the fetched data to separate active and expired jobs.
  data.forEach((job) => {
    const jobEndTime = new Date(job.end_time);

    (job.JobTradies as any[]).forEach((jobTradie: any) => {
      // Check if the job's end_time has passed.
      if (job.end_time && jobEndTime < currentTime) {
        // If expired, add the assignment to a list to be updated.
        expiredAssignments.push({
          jobId: job.id,
          tradieId: jobTradie.tradie_id,
        });
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
    console.log(
      `Found ${expiredAssignments.length} expired job assignments to update.`,
    );
    Promise.all(
      expiredAssignments.map(async (assignment) => {
        const { error: updateError } = await supabase
          .from("JobTradies")
          .update({ status: "EXPIRED" })
          .eq("job_id", assignment.jobId)
          .eq("tradie_id", assignment.tradieId);

        if (updateError) {
          console.error(
            `Failed to expire job ${assignment.jobId} for tradie ${assignment.tradieId}:`,
            updateError.message,
          );
        }
      }),
    );
  }

  // Return only the list of active tradies.
  return activeTradies;
};

/**
 * Manually ends a specific tradie's session for a job.
 * This is an action performed by a Property Owner.
 * It sets the `JobTradies.status` to 'EXPIRED'.
 */
export const endTradieJob = async (
  jobId: string,
  tradieId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("JobTradies")
    .update({ status: "EXPIRED" })
    .eq("job_id", jobId)
    .eq("tradie_id", tradieId);

  if (error) {
    console.error("Error ending tradie's job session:", error.message);
    throw new Error("Could not end the tradie session.");
  }
};

/**
 * Fetches all jobs a tradie is assigned to via the JobTradies table.
 * This version now also fetches the splash_image for the property and creates a signed URL for it.
 */
export const getJobsForTradie = async (
  tradieUserId: string,
): Promise<any[]> => {
  const { data: tradieData, error: tradieError } = await supabase
    .from("Tradesperson")
    .select("tradie_id")
    .eq("user_id", tradieUserId)
    .single();

  if (tradieError || !tradieData) {
    console.error("Error fetching tradie profile:", tradieError?.message);
    return [];
  }

  const { data, error } = await supabase
    .from("JobTradies")
    .select(
      `
            status,
            Jobs (
                id,
                title,
                Property (
                    property_id,
                    name,
                    address,
                    splash_image,
                    PropertyImages (
                      image_link
                    )
                )
            )
        `,
    )
    .eq("tradie_id", tradieData.tradie_id)
    .eq("status", "ACCEPTED");

  if (error) {
    console.error("Error fetching jobs for tradie:", error.message);
    return [];
  }
  if (!data) return [];

  // Map the nested data and generate signed URLs for each splash image.
  const jobsWithSignedUrls = await Promise.all(
    data.map(async (jobTradie: any) => {
      const job = jobTradie?.Jobs;
      const property = job?.Property;

      // If the expected nested objects are missing, skip this entry.
      if (!job || !property) {
        console.warn(
          "Skipping jobTradie with missing Jobs/Property:",
          jobTradie,
        );
        return null;
      }

      let splashImageUrl = null;
      const propAny = property as any;
      const imageToLoad = property.splash_image || (propAny.PropertyImages && propAny.PropertyImages.length > 0 ? propAny.PropertyImages[0].image_link : null);

      if (imageToLoad) {
        if (imageToLoad.startsWith("http")) {
            splashImageUrl = imageToLoad;
        } else {
            let cleanPath = imageToLoad;
            if (cleanPath.toLowerCase().startsWith('property_images/')) {
                cleanPath = cleanPath.substring('property_images/'.length);
            }

            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("Property_Images")
                .createSignedUrl(cleanPath, 60 * 5); // 5-minute expiry

            if (signedUrlError) {
              if (signedUrlError.message?.includes("Object not found")) {
                  console.warn(`Image missing in bucket: ${cleanPath}`);
              } else {
                  console.error(`Error creating signed URL for ${cleanPath}:`, signedUrlError);
              }
            } else {
              splashImageUrl = signedUrlData.signedUrl;
            }
        }
      }

      return {
        job_id: job.id,
        title: job.title,
        status: jobTradie.status,
        property_id: property.property_id,
        name: property.name,
        address: property.address,
        splash_image: splashImageUrl, // Use the new signed URL
      };
    }),
  );

  // Filter out any skipped (null) entries.
  return jobsWithSignedUrls.filter(Boolean);
};

/**
 * Assigns a tradie to a job by creating an entry in the JobTradies table.
 * It now first validates that the propertyId from the QR code is valid.
 */
export const claimJobWithPin = async (
  propertyId: string,
  pin: string,
): Promise<{ success: boolean; message: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to claim a job.");

  const { data: tradie, error: tradieError } = await supabase
    .from("Tradesperson")
    .select("tradie_id")
    .eq("user_id", user.id)
    .single();

  if (tradieError || !tradie) {
    throw new Error("Could not identify your tradie profile.");
  }

  // Verify the propertyId from the QR code is valid.
  const { data: property, error: propertyError } = await supabase
    .from("Property")
    .select("property_id")
    .eq("property_id", propertyId)
    .single();

  // If we get an error or no data, the property ID from the QR code is invalid.
  if (propertyError || !property) {
    return {
      success: false,
      message: "Invalid Property QR Code. This property does not exist.",
    };
  }

  // Now that the property is confirmed, find a matching, active job.
  const { data: job, error: findError } = await supabase
    .from("Jobs")
    .select("id, end_time")
    .eq("property_id", propertyId)
    .eq("pin", pin)
    .gt("end_time", new Date().toISOString())
    .limit(1)
    .single();

  if (findError || !job) {
    return { success: false, message: "Invalid PIN or this job has expired." };
  }

  // Create a new entry in the JobTradies table to assign the job.
  const { error: insertError } = await supabase.from("JobTradies").insert({
    job_id: job.id,
    tradie_id: tradie.tradie_id,
    status: "ACCEPTED",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: true,
        message: "You are already assigned to this job.",
      };
    }
    console.error("Error assigning job:", insertError.message);
    return {
      success: false,
      message: "Failed to claim job. Please try again.",
    };
  }

  return { success: true, message: "Job successfully added to your list!" };
};
