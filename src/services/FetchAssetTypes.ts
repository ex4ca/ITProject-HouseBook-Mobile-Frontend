import {supabase} from "../config/supabaseClient";

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