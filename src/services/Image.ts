import { supabase } from '../config/supabaseClient';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = 'https://housebook-backend.vercel.app';

/**
 * A helper function to get a fresh, valid session token.
 * It will try to refresh the token if it's expired or about to expire.
 */
const getFreshSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Authentication required. No active session found.");
  }

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  const sixtySecondsFromNow = Date.now() + 60 * 1000;

  if (expiresAt < sixtySecondsFromNow) {
    console.log("Access token is expired or expiring soon. Refreshing session...");
    const { data: refreshedData, error } = await supabase.auth.refreshSession();
    if (error || !refreshedData.session) {
      throw new Error(error?.message || "Could not refresh session. Please log in again.");
    }
    return refreshedData.session;
  }

  return session;
};

/**
 * Fetches secure, signed URLs for a property's images from your Vercel API.
 * @param propertyId The ID of the property.
 */
export const fetchPropertyImages = async (propertyId: string): Promise<string[]> => {
  const session = await getFreshSession();

  const response = await fetch(`${API_BASE_URL}/api/images?propertyId=${propertyId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch property images. Status:", response.status, "Response:", errorText);
    throw new Error('Failed to fetch property images.');
  }

  const { images } = await response.json();
  return images || [];
};

/**
 * Uploads a new image for a property via your secure Vercel API.
 * @param propertyId The ID of the property.
 * @param imageAsset The image asset from the Expo Image Picker.
 * @param description An optional description for the image.
 */
export const uploadPropertyImage = async (
  propertyId: string,
  imageAsset: { uri: string; fileName?: string | null; mimeType?: string | null },
  description: string = ''
) => {
  const session = await getFreshSession();

  const uri = imageAsset.uri;
  const fileType = imageAsset.mimeType || 'image/jpeg';
  const fileName = imageAsset.fileName || uri.split('/').pop() || 'photo.jpg';

  const formData = new FormData();
  formData.append('propertyId', propertyId);
  formData.append('description', description);
  
  // @ts-ignore
  formData.append('file', {
    uri,
    name: fileName,
    type: fileType,
  });

  const response = await fetch(`${API_BASE_URL}/api/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image.');
  }

  return await response.json();
};

/**
 * Deletes one or more property images using the backend API.
 * @param signedUrls An array of signed URLs of the images to be deleted.
 */
export const deletePropertyImages = async (signedUrls: string[]) => {
    const session = await getFreshSession();
    const response = await fetch(`${API_BASE_URL}/api/images`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signedUrls }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete images.');
    }

    return await response.json();
};

/**
 * Sets a specific image as the property's main splash image using the backend API.
 * @param signedUrl The signed URL of the image to be set as the splash image.
 */
export const setSplashImage = async (signedUrl: string) => {
    const session = await getFreshSession();
    const response = await fetch(`${API_BASE_URL}/api/images`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signedUrl }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set splash image.');
    }

    return await response.json();
};