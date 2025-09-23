// src/services/Property.ts
import { supabase } from '../config/supabaseClient';
import type { Property, PropertyGeneral } from '../types';
import { v4 as uuid } from 'uuid';

/** === Storage configuration (match your Supabase UI) === */
const BUCKET_ID = 'PropertyImage';            // bucket name shown in your screenshot
const ROOT_FOLDER = 'property_images';        // folder inside the bucket (optional)

/** =========================
 *  PROPERTY QUERIES (yours)
 *  ========================= */

/** Fetches all properties owned by a specific user for the list view. */
export const getPropertiesByOwner = async (userId: string): Promise<Property[] | null> => {
  const { data, error } = await supabase
    .from('Owner')
    .select(`OwnerProperty (Property ( property_id, name, address, description, pin, created_at ))`)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching properties:', error.message);
    return null;
  }
  if (!data) return [];

  const properties: Property[] = data
    .flatMap((owner: any) => owner.OwnerProperty)
    .flatMap((op: any) => op.Property);

  return properties;
};

/** Fetches the detailed general data for a single property. */
export const fetchPropertyGeneralData = async (propertyId: string): Promise<PropertyGeneral | null> => {
  const { data, error } = await supabase
    .from('Property')
    .select(`
      name,
      address,
      description,
      total_floor_area,
      Spaces ( type ),
      PropertyImages (
        id,
        image_link,
        image_name,
        is_primary,
        created_at
      )
    `)
    .eq('property_id', propertyId)
    .single();

  if (error) {
    console.error('Error fetching general property data:', error.message);
    return null;
  }
  return data as PropertyGeneral;
};

/** Convenience: fetch images only (primary first). */
export async function getPropertyImages(propertyId: string) {
  const { data, error } = await supabase
    .from('PropertyImages')
    .select('id, property_id, image_link, image_name, is_primary, created_at')
    .eq('property_id', propertyId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** =========================
 *  IMAGE UPLOAD / UPDATE
 *  ========================= */

/**
 * React-Native friendly upload (Expo ImagePicker/DocumentPicker).
 * Pass: [{ uri, name, type }, ...]
 *  - Uploads to Storage bucket "PropertyImage" at "property_images/{propertyId}/{uuid}.{ext}"
 *  - Inserts a row into PropertyImages with the public URL
 *  - First upload becomes primary if none exists
 */
export async function uploadPropertyImagesRN(
  propertyId: string,
  files: Array<{ uri: string; name: string; type: string }>
) {
  // Check if a primary image already exists
  const { data: existingPrimary, error: chkErr } = await supabase
    .from('PropertyImages')
    .select('id')
    .eq('property_id', propertyId)
    .eq('is_primary', true)
    .maybeSingle();
  if (chkErr) throw chkErr;

  let hasPrimary = !!existingPrimary;
  const results: { id: string; url: string }[] = [];

  for (const f of files) {
    // 1) Read file bytes in RN
    const res = await fetch(f.uri);
    const blob = await res.blob();

    const ext = (f.name.split('.').pop() || 'png').toLowerCase();
    const objectName = `${ROOT_FOLDER}/${propertyId}/${uuid()}.${ext}`;

    // 2) Upload to Storage
    const { error: upErr } = await supabase.storage
      .from(BUCKET_ID)
      .upload(objectName, blob, { cacheControl: '3600', upsert: false });
    if (upErr) throw upErr;

    // 3) Get public URL
    const { data: pub } = supabase.storage.from(BUCKET_ID).getPublicUrl(objectName);
    const publicUrl = pub.publicUrl;

    // 4) Insert DB row (first becomes primary)
    const { data: inserted, error: insErr } = await supabase
      .from('PropertyImages')
      .insert({
        property_id: propertyId,
        image_link: publicUrl,
        image_name: f.name,
        is_primary: !hasPrimary,
      })
      .select('id, image_link')
      .single();
    if (insErr) throw insErr;

    if (!hasPrimary) {
      hasPrimary = true;
      // Optional: keep Property.splash_image updated for list thumbnails
      await setPropertySplash(propertyId, publicUrl).catch(() => {});
    }

    results.push({ id: inserted!.id, url: inserted!.image_link });
  }

  return results;
}

/** Make one image the primary/cover for a property. */
export async function setPrimaryPropertyImage(propertyId: string, imageId: string) {
  const { error } = await supabase
    .from('PropertyImages')
    .update({ is_primary: true })
    .eq('id', imageId)
    .eq('property_id', propertyId);
  if (error) throw error;

  // Keep splash_image in sync (optional)
  const { data: row, error: selErr } = await supabase
    .from('PropertyImages')
    .select('image_link')
    .eq('id', imageId)
    .single();
  if (!selErr && row?.image_link) {
    await setPropertySplash(propertyId, row.image_link).catch(() => {});
  }
}

/** Delete an image: remove from Storage (best-effort) then delete DB row. */
export async function deletePropertyImage(imageId: string) {
  // Look up URL to derive Storage path
  const { data: row } = await supabase
    .from('PropertyImages')
    .select('image_link')
    .eq('id', imageId)
    .single();

  if (row?.image_link) {
    // URL format: https://<project>.co/storage/v1/object/public/<BUCKET_ID>/<path>
    const marker = `/storage/v1/object/public/${BUCKET_ID}/`;
    const idx = row.image_link.indexOf(marker);
    if (idx >= 0) {
      const path = row.image_link.slice(idx + marker.length);
      await supabase.storage.from(BUCKET_ID).remove([path]).catch(() => {});
    }
  }

  const { error } = await supabase.from('PropertyImages').delete().eq('id', imageId);
  if (error) throw error;
}

/** Optional helper: set Property.splash_image (used by list cards, etc.) */
export async function setPropertySplash(propertyId: string, url: string) {
  const { error } = await supabase
    .from('Property')
    .update({ splash_image: url })
    .eq('property_id', propertyId);
  if (error) throw error;
}
