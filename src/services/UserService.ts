import { supabase } from "../config/supabaseClient";
import type { UserProfile } from "../types";

/**
 * Fetches the profile of the *currently logged-in* user from the public
 * `User` table.
 *
 * @returns {Promise<UserProfile | null>} A promise that resolves to a
 * formatted `UserProfile` object, or `null` if the user is not logged in
 * or their profile is not found.
 */
export const fetchMyProfile = async (): Promise<UserProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("User")
    .select("user_id, first_name, last_name, phone, email")
    .eq("user_id", user.id)
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

export const fetchMyFirstName = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("User")
    .select("first_name")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user's first name:", error.message);
    return null;
  }
  return data?.first_name || null;
};

/**
 * Fetches specific profile details for a given user ID from the 'User' table.
 */
export const fetchUserProfile = async (userId: string): Promise<{first_name: string; last_name: string; email: string}> => {
  const { data, error } = await supabase
    .from("User")
    .select("first_name, last_name, email")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
};
