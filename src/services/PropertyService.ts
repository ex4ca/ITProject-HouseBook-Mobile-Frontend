import { supabase } from "../config/supabaseClient";
import type { 
  Property, 
  PropertyGeneral, 
  PropertyDetailsData, 
  AssetWithChangelog 
} from "../types";

/**
 * Fetches the list of previous owners for a specific property.
 *
 * @param {string} propertyId The UUID of the property to query.
 * @returns {Promise<PreviousOwnerHistory[]>} A promise that resolves
 * to an array of transfer objects. Each object includes the transfer
 * ID, the date of the transfer, and an array of owner names
 * associated with that transfer.
 * @throws {Error} Throws an error if the database query for transfers
 * or old owners fails.
 */
export async function fetchPreviousOwners(propertyId: string) {
  console.log("Fetching previous owners for property:", propertyId);

  // Fetch transfers for the property
  const { data: transfers, error } = await supabase
    .from("Transfers")
    .select("transfer_id, created_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }

  if (!transfers || transfers.length === 0) {
    console.log("No transfers found for this property");
    return [];
  }

  const transferIds = transfers.map((t) => t.transfer_id);

  // Fetch old owners for these transfers along with user info
  const { data: oldOwners, error: oldOwnersError } = await supabase
    .from("TransferOldOwners")
    .select(
      `
      transfer_id,
      owner_id,
      Owner (
        user_id,
        User (
          first_name,
          last_name
        )
      )
    `,
    )
    .in("transfer_id", transferIds);

  if (oldOwnersError) {
    console.error("Old owners fetch error:", oldOwnersError);
    throw oldOwnersError;
  }

  // Group old owners by transfer_id
  const ownersByTransfer: Record<string, { owner_name: string }[]> = {};
  oldOwners?.forEach((owner) => {
    if (!ownersByTransfer[owner.transfer_id])
      ownersByTransfer[owner.transfer_id] = [];
    let firstName = "";
    let lastName = "";
    // Owner may be an array or object
    const ownerObj = Array.isArray(owner.Owner) ? owner.Owner[0] : owner.Owner;
    if (ownerObj && ownerObj.User) {
      // User may be an array or object
      const userObj = Array.isArray(ownerObj.User)
        ? ownerObj.User[0]
        : ownerObj.User;
      if (userObj) {
        firstName = userObj.first_name || "";
        lastName = userObj.last_name || "";
      }
    }
    ownersByTransfer[owner.transfer_id].push({
      owner_name: `${firstName} ${lastName}`.trim(),
    });
  });

  // Map result back to transfers
  return transfers.map((transfer) => ({
    transfer_id: transfer.transfer_id,
    transfer_date: transfer.created_at,
    owners: ownersByTransfer[transfer.transfer_id] || [],
  }));
}

/**
 * Fetches a list of all available asset types from the `AssetTypes` table.
 *
 * Each asset type includes its ID, name, and associated discipline
 * (e.g., "Plumbing", "Electrical", "General").
 *
 * @returns A promise that resolves to an array of asset type objects. If an error occurs or
 * no data is found, it returns an empty array.
 */
export const fetchAssetTypes = async (): Promise<{ id: number; name: string; discipline: string }[]> => {
  const { data, error } = await supabase
    .from("AssetTypes")
    .select("id, name, discipline");

  if (error) {
    console.error("Error fetching asset types:", error.message);
    return [];
  }
  return data || [];
};

/**
 * Fetches all details for a property, and also identifies which assets
 * are within the scope of a specific job for the current tradie.
 */
export const fetchPropertyAndJobScope = async (
  propertyId: string,
  jobId: string,
) => {
  const { data: propertyData, error: propertyError } = await supabase
    .from("Property")
    .select(
      `
      property_id, name, address,
      Spaces ( id, name, type, Assets!left(id, description, asset_type_id, ChangeLog(id, specifications, change_description, created_at, status, User!ChangeLog_changed_by_user_id_fkey(first_name, last_name))))
    `,
    )
    .eq("property_id", propertyId)
    .single();

  if (propertyError) throw propertyError;

  const { data: jobAssets, error: jobAssetsError } = await supabase
    .from("JobAssets")
    .select("asset_id")
    .eq("job_id", jobId);

  if (jobAssetsError) throw jobAssetsError;

  const editableAssetIds = new Set(jobAssets.map((ja) => ja.asset_id));

  return {
    property: propertyData,
    editableAssetIds: editableAssetIds,
  };
};

/**
 * Fetches the profile of the owner of a specific property.
 * This is for a Tradie to see the owner's contact details.
 */
export const fetchPropertyOwner = async (
  propertyId: string,
): Promise<any | null> => {
  const { data, error } = await supabase
    .from("OwnerProperty")
    .select(
      `
            Owner!inner(
                User!Owner_user_id_fkey(user_id, first_name, last_name, phone, email)
            )
        `,
    )
    .eq("property_id", propertyId)
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
    roles: ["Owner"],
  };
};

export const getPropertiesByOwner = async (
  userId: string,
): Promise<Property[] | null> => {
  const { data, error } = await supabase
    .from("Owner")
    .select(
      `
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
        `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching properties:", error.message);
    return null;
  }

  if (!data) return [];

  // Guard against null OwnerProperty entries and missing Property objects.
  const properties: Property[] = data
    .flatMap((owner: any) => owner?.OwnerProperty || [])
    .map((op: any) => op?.Property)
    .filter((p: any) => p != null);

  // Process both splash images and activity status concurrently.
  const processedProperties = await Promise.all(
    properties.map(async (property) => {
      if (!property) return null;
      let processedProperty = { ...property } as any;

      // Set activity status based on the Property.status field.
      processedProperty.isActive = property.status === "ACTIVE";

      // Generate a signed URL for the splash image if it exists.
      if (property.splash_image) {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("Property_Images")
            .createSignedUrl(property.splash_image, 60 * 5); // 5-minute expiry

        if (signedUrlError) {
          console.error(
            `Error creating signed URL for ${property.splash_image}:`,
            signedUrlError,
          );
          // If signing fails, nullify the image so a placeholder is used.
          processedProperty.splash_image = null;
        } else {
          processedProperty.splash_image = signedUrlData.signedUrl;
        }
      }
      return processedProperty;
    }),
  );

  // Filter any null results and return.
  return processedProperties.filter(Boolean);
};

// Fetches the detailed general data for a single property.
export const fetchPropertyGeneralData = async (
  propertyId: string,
): Promise<PropertyGeneral | null> => {
  const { data, error } = await supabase
    .from("Property")
    .select(
      `
          name,
          address,
          description,
          total_floor_area,
          block_size,
          PropertyImages ( image_link, image_name ),
          Spaces (
            id,
            name,
            type,
            Assets (
              id,
              description,
              AssetTypes ( discipline ),
              ChangeLog ( 
                specifications, 
                status,
                created_at
              )
            )
          )
        `,
    )
    .eq("property_id", propertyId)
    .single();

  if (error) {
    console.error("Error fetching general property data:", error.message);
    return null;
  }
  return data as unknown as PropertyGeneral;
};

// Fetches all the details for a single property.
export const fetchPropertyDetails = async (
  propertyId: string,
): Promise<PropertyDetailsData | null> => {
  const { data, error } = await supabase
    .from("Property")
    .select(
      `
        Spaces (id, name, Assets (id, description, asset_type_id, ChangeLog (id, specifications, change_description, created_at, status, User!ChangeLog_changed_by_user_id_fkey(first_name, last_name))))
      `,
    )
    .eq("property_id", propertyId)
    .order("created_at", {
      foreignTable: "Spaces.Assets.ChangeLog",
      ascending: false,
    })
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching property details:", error.message);
    return null;
  }
  return data as unknown as PropertyDetailsData;
};

// Adds a new space to a property.
export const addSpace = async (
  propertyId: string,
  name: string,
  type: string,
) => {
  const { error } = await supabase
    .from("Spaces")
    .insert({ property_id: propertyId, name, type });
  if (error) throw new Error(error.message);
};

// Adds a new asset to a space.
export const addAsset = async (
  description: string,
  spaceId: string,
  assetTypeId: number,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in.");

  const { data: newAsset, error: assetError } = await supabase
    .from("Assets")
    .insert({ description, space_id: spaceId, asset_type_id: assetTypeId })
    .select()
    .single();
  if (assetError) throw new Error(assetError.message);

  const { error: changelogError } = await supabase
    .from("ChangeLog")
    .insert({
      asset_id: newAsset.id,
      specifications: {},
      change_description: "Asset created.",
      changed_by_user_id: user.id,
      status: "ACCEPTED",
    });
  if (changelogError) throw new Error(changelogError.message);
};

/**
 * Adds a new history entry for an asset as an **Owner**.
 */
export const addHistoryOwner = async (
  asset: AssetWithChangelog,
  description: string,
  specifications: Record<string, string>,
) => {
  if (!asset) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in.");

  const { error } = await supabase
    .from("ChangeLog")
    .insert({
      asset_id: asset.id,
      specifications,
      change_description: description,
      changed_by_user_id: user.id,
      status: "ACCEPTED",
    });
  if (error) throw new Error(error.message);
};

/**
 * Adds a new history entry for an asset as a Tradie
 */
export const addHistoryTradie = async (
  asset: AssetWithChangelog,
  description: string,
  specifications: Record<string, string>,
) => {
  if (!asset) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in.");

  const { error } = await supabase
    .from("ChangeLog")
    .insert({
      asset_id: asset.id,
      specifications,
      change_description: description,
      changed_by_user_id: user.id,
      status: "PENDING",
    });
  if (error) throw new Error(error.message);
};
