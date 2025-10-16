import {supabase} from "../config/supabaseClient";

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