import { supabase } from "../config/supabaseClient";
import * as FileSystem from "expo-file-system";

const API_BASE_URL = "https://housebook-backend.vercel.app";

/**
 * A helper function to get a fresh, valid Supabase session.
 *
 * It checks if the current session's access token is expired or
 * within 60 seconds of expiring. If it is, it attempts to
 * refresh the session before returning it.
 */
const getFreshSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required. No active session found.");
  }

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  const sixtySecondsFromNow = Date.now() + 60 * 1000;

  if (expiresAt < sixtySecondsFromNow) {
    console.log(
      "Access token is expired or expiring soon. Refreshing session...",
    );
    const { data: refreshedData, error } = await supabase.auth.refreshSession();
    if (error || !refreshedData.session) {
      throw new Error(
        error?.message || "Could not refresh session. Please log in again.",
      );
    }
    return refreshedData.session;
  }

  return session;
};

/**
 * Fetches an array of secure, signed URLs for a property's images.
 *
 * This function communicates with a custom backend API (at `API_BASE_URL`),
 * not directly with Supabase storage. It authenticates the request using
 * a fresh Supabase access token.
 */
export const fetchPropertyImages = async (
  propertyId: string,
): Promise<string[]> => {
  const session = await getFreshSession();

  const response = await fetch(
    `${API_BASE_URL}/api/images?propertyId=${propertyId}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Failed to fetch property images. Status:",
      response.status,
      "Response:",
      errorText,
    );
    throw new Error("Failed to fetch property images.");
  }

  const { images } = await response.json();
  return images || [];
};

/**
 * Sets a specific image as the property's main splash image ("cover photo").
 *
 * This function sends a `PATCH` request to the custom backend API,
 * providing the signed URL of the image to be set as the new splash image.
 * The backend is responsible for extracting the file path from the
 * signed URL and updating the `Property` table.
 */
export const setSplashImage = async (signedUrl: string) => {
  const session = await getFreshSession();
  const response = await fetch(`${API_BASE_URL}/api/images`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signedUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to set splash image.");
  }

  return await response.json();
};