import { supabase } from "../config/supabaseClient";
import type { UserRole } from "../types";

type SignupData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  userType: UserRole;
  phone: string;
};

/**
 * Handles the user signup process. This function supports two scenarios:
 * 1.  **New User:** Creates an entry in `auth.users`, an entry in `public.User`,
 * and an entry in the role-specific table (e.g., `Owner`).
 * 2.  **Existing User, New Role:** If a user with the email already exists in
 * `public.User`, it skips auth/user creation and only attempts to add
 * an entry to the new role-specific table.
 */
export const signupUser = async (signupData: SignupData) => {
  const { data: existingUser } = await supabase
    .from("User")
    .select("user_id")
    .eq("email", signupData.email)
    .single();

  let userId: string;

  if (existingUser) {
    userId = existingUser.user_id;
    console.log(
      `User ${signupData.email} already exists. Adding new role: ${signupData.userType}`,
    );
  } else {
    // New user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("User ID not returned from signup");
    userId = authData.user.id;

    // Insert into the main User table
    const { error: insertError } = await supabase.from("User").insert({
      user_id: userId,
      email: signupData.email,
      first_name: signupData.first_name,
      last_name: signupData.last_name,
      phone: signupData.phone,
    });

    if (insertError) throw new Error(insertError.message);
  }

  // Insert into the role-specific table for both new and existing users.
  const roleTable =
    signupData.userType.charAt(0).toUpperCase() + signupData.userType.slice(1);
  const { error: roleError } = await supabase
    .from(roleTable)
    .insert([{ user_id: userId }]);

  if (roleError) {
    if (roleError.code === "23505") {
      // Unique constraint violation
      throw new Error(
        `You are already registered as a ${signupData.userType}. Please log in.`,
      );
    }
    throw new Error(roleError.message);
  }

  return { email: signupData.email, userType: signupData.userType, userId };
};

/**
 * Logs in a user and validates their intended role.
 *
 * This function first authenticates with Supabase Auth. If successful, it
 * performs a second check to ensure the user's ID exists in the role-specific
 * table (e.g., `Owner`) they are trying to log in as.
 *
 * If the user authenticates but does not have the specified role, they are
 * immediately signed out, and an error is thrown.
 */
export const loginUser = async (
  email: string,
  password: string,
  intendedRole: UserRole,
) => {
  const { data: sessionData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(signInError.message);
  if (!sessionData.user) throw new Error("Login failed, user not found.");

  const userId = sessionData.user.id;
  const roleTable =
    intendedRole.charAt(0).toUpperCase() + intendedRole.slice(1);

  // Check if the user has the role they are trying to log in as.
  const { count, error: roleError } = await supabase
    .from(roleTable)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (roleError) {
    await supabase.auth.signOut(); // Log them out to prevent a broken state
    throw new Error(`Database error checking role: ${roleError.message}`);
  }

  if (count === 0) {
    // If they don't have the role, sign them out and show an error.
    await supabase.auth.signOut();
    throw new Error(
      `You do not have a ${intendedRole} account. Please sign up or select a different role.`,
    );
  }

  // If the check passes, return the session. The onAuthStateChange listener will handle the rest.
  return sessionData;
};