import { supabase } from '../config/supabaseClient';
import type { PropertyDetailsData, AssetWithChangelog } from '../types';

export type PropertyImageRow = {
  id: string;
  property_id: string;
  image_link: string;
  image_name: string | null;
  description: string | null;
  created_at: string;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<PropertyDetailsData | null> => {
  const { data, error } = await supabase
    .from('Property')
    .select(`
      Spaces (
        id,
        name,
        Assets (
          id,
          description,
          ChangeLog (
            id,
            specifications,
            change_description,
            created_at,
            status,
            User!ChangeLog_changed_by_user_id_fkey ( first_name, last_name )
          )
        )
      )
    `)
    .eq('property_id', propertyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching property details:', error.message);
    return null;
  }
  return data as unknown as PropertyDetailsData | null;
};

export const addSpace = async (propertyId: string, name: string, type: string) => {
  const { error } = await supabase.from('Spaces').insert({ property_id: propertyId, name, type });
  if (error) throw new Error(error.message);
};

export const addAsset = async (description: string, spaceId: string, assetTypeId: number) => {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const user = userRes.user;
  if (!user) throw new Error('User must be logged in.');

  const { data: newAsset, error: assetError } = await supabase
    .from('Assets')
    .insert({ description, space_id: spaceId, asset_type_id: assetTypeId })
    .select()
    .single();
  if (assetError) throw new Error(assetError.message);

  const { error: changelogError } = await supabase
    .from('ChangeLog')
    .insert({
      asset_id: newAsset.id,
      specifications: {},
      change_description: 'Asset created.',
      changed_by_user_id: user.id,
      status: 'ACCEPTED'
    });
  if (changelogError) throw new Error(changelogError.message);
};

export const addHistory = async (
  asset: AssetWithChangelog,
  description: string,
  specifications: Record<string, string>
) => {
  if (!asset) return;

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const user = userRes.user;
  if (!user) throw new Error('User must be logged in.');

  const { error } = await supabase
    .from('ChangeLog')
    .insert({
      asset_id: asset.id,
      specifications,
      change_description: description,
      changed_by_user_id: user.id,
      status: 'ACCEPTED'
    });
  if (error) throw new Error(error.message);
};

export const fetchPropertyImages = async (
  propertyId: string
): Promise<Array<PropertyImageRow & { url: string }>> => {
  const { data, error } = await supabase
    .from('PropertyImages')
    .select('id,property_id,image_link,image_name,description,created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error || !data?.length) return [];

  const paths = data.map(d => d.image_link);
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('PropertyImage') // bucket name
    .createSignedUrls(paths, 3600);
  if (signErr || !signed) return [];

  const map = new Map(signed.map(s => [s.path, s.signedUrl!]));
  return data.map(d => ({ ...d, url: map.get(d.image_link)! }));
};

export const insertPropertyImageRecord = async (args: {
  propertyId: string;
  storagePath: string;
  imageName?: string;
  description?: string;
}) => {
  const { error } = await supabase.from('PropertyImages').insert({
    property_id: args.propertyId,
    image_link: args.storagePath,
    image_name: args.imageName ?? null,
    description: args.description ?? null
  });
  if (error) throw new Error(error.message);
};
