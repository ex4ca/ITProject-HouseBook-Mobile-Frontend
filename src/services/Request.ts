import { supabase } from '../config/supabaseClient';
import type { PendingRequest } from '../types';

export const fetchPendingRequests = async (propertyId: string): Promise<PendingRequest[]> => {
    const { data, error } = await supabase
      .from('ChangeLog')
      .select(`
        id, 
        change_description, 
        specifications, 
        created_at,
        User:User!ChangeLog_changed_by_user_id_fkey(first_name, last_name),
        Assets:Assets!inner(
            description,
            Spaces:Spaces!inner(
                name,
                Property:Property!inner(name, property_id)
            )
        )
      `)
      .eq('status', 'PENDING')
      .eq('Assets.Spaces.property_id', propertyId);

    if (error) {
        console.error("Error fetching requests:", error.message);
        return [];
    }

    // Transform the response to match PendingRequest with proper error handling
    return (data || []).map(item => {
        // Safely extract nested data with fallbacks
        const asset = item.Assets?.[0];
        const space = asset?.Spaces?.[0];
        const property = space?.Property?.[0];
        
        return {
            id: item.id,
            change_description: item.change_description,
            specifications: item.specifications,
            created_at: item.created_at,
            User: item.User?.[0] || null,
            Assets: {
                description: asset?.description || 'No description',
                Spaces: {
                    name: space?.name || 'Unknown space',
                    Property: {
                        name: property?.name || 'Unknown property',
                        property_id: property?.property_id || 'unknown'
                    }
                }
            }
        };
    });
};

export const updateRequestStatus = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    const { error } = await supabase
      .from('ChangeLog')
      .update({ status })
      .eq('id', id);

    if (error) {
        throw new Error(`Failed to update request status: ${error.message}`);
    }
};
