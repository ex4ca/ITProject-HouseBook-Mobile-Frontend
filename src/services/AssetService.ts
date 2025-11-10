import { supabase } from "../config/supabaseClient";
import type { AssetDetails } from "../types";

/**
 * Fetches all the details for a single asset, including its full change history
 * and nested space/property information.
 *
 * This function performs a complex Supabase query to join data from
 * `Assets`, `ChangeLog`, `User`, `Spaces`, and `Property`.
 *
 * It also transforms the nested array data returned by Supabase (e.g., `User`
 * and `Spaces`) into a cleaner, single-object format expected by the
 * `AssetDetails` type.
 */
export const fetchAssetDetails = async (
  assetId: string,
): Promise<AssetDetails | null> => {
  const { data, error } = await supabase
    .from("Assets")
    .select(
      `
            id,
            description,
            ChangeLog (
                id,
                created_at,
                change_description,
                specifications,
                User ( first_name, last_name )
            ),
            Spaces (
                name,
                Property ( name )
            )
        `,
    )
    .eq("id", assetId)
    .single();

  if (error) {
    console.error("Error fetching asset details:", error.message);
    return null;
  }

  const transformedData: AssetDetails = {
    id: data.id,
    description: data.description,
    ChangeLog: (data.ChangeLog || []).map((log) => ({
      id: log.id,
      created_at: log.created_at,
      change_description: log.change_description,
      specifications: log.specifications,
      User: log.User?.[0] || null, 
    })),
    Spaces: {
      name: data.Spaces?.[0]?.name || "",
      Property: {
        name: data.Spaces?.[0]?.Property?.[0]?.name || "",
      },
    },
  };

  return transformedData;
};

/**
 * Adds a new history entry (a 'ChangeLog' record) for a specific asset.
 *
 * This function requires an authenticated user to be logged in, as it
 * assigns the `changed_by_user_id` from the current session.
 *
 * As this is an "owner" action, the new entry's `status` is
 * automatically set to 'ACCEPTED'.
 */
export const addHistoryEntry = async (
  assetId: string,
  description: string,
  specifications: Record<string, any>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to add a history entry.");

  const { error } = await supabase.from("ChangeLog").insert({
    asset_id: assetId,
    change_description: description,
    specifications: specifications,
    changed_by_user_id: user.id,
    status: "ACCEPTED", // Owner actions are auto-accepted
  });

  if (error) {
    throw new Error(`Failed to add history entry: ${error.message}`);
  }
};