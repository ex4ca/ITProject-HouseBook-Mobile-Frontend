import { supabase } from "../config/supabaseClient";
import type { PropertyDetailsData, AssetWithChangelog } from "../types";

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
  // The data will now be correctly sorted before it even reaches your component.
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
