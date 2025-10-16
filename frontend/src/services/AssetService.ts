import { supabase } from '../config/supabaseClient';
import type { AssetDetails } from '../types';

// Fetches all the details for a single asset, including its full change history.
export const fetchAssetDetails = async (assetId: string): Promise<AssetDetails | null> => {
    const { data, error } = await supabase
        .from('Assets')
        .select(`
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
        `)
        .eq('id', assetId)
        .single();

    if (error) {
        console.error("Error fetching asset details:", error.message);
        return null;
    }

    // Transform the data to match the expected types
    const transformedData: AssetDetails = {
        id: data.id,
        description: data.description,
        ChangeLog: (data.ChangeLog || []).map(log => ({
            id: log.id,
            created_at: log.created_at,
            change_description: log.change_description,
            specifications: log.specifications,
            User: log.User?.[0] || null // Extract first user or null
        })),
        Spaces: {
            name: data.Spaces?.[0]?.name || '',
            Property: {
                name: data.Spaces?.[0]?.Property?.[0]?.name || ''
            }
        }
    };

    return transformedData;
};

// The addHistoryEntry function remains the same
export const addHistoryEntry = async (
    assetId: string,
    description: string,
    specifications: Record<string, any>
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to add a history entry.");

    const { error } = await supabase
        .from('ChangeLog')
        .insert({
            asset_id: assetId,
            change_description: description,
            specifications: specifications,
            changed_by_user_id: user.id,
            status: 'ACCEPTED', // Owner actions are auto-accepted
        });

    if (error) {
        throw new Error(`Failed to add history entry: ${error.message}`);
    }
};