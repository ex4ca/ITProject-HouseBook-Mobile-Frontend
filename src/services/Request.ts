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
      .eq('Assets.Spaces.Property.property_id', propertyId);

    if (error) {
        console.error("Error fetching requests:", error.message);
        return [];
    }

    // Using 'any' to bypass Supabase's complex type inference issues
    const anyData = data as any[];

    // CORRECTED: This mapping now expects nested objects instead of arrays,
    // which matches the data structure returned by the '!inner' join.
    return (anyData || []).map(item => {
        const asset = item.Assets;
        const space = asset?.Spaces;
        const property = space?.Property;
        
        return {
            id: item.id,
            change_description: item.change_description,
            specifications: item.specifications,
            created_at: item.created_at,
            User: item.User, // User is also a direct object
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

// Fetch all requests (pending and accepted) for a specific tradie and property
export const fetchTradieRequests = async (propertyId: string, tradieUserId: string): Promise<{
  pending: PendingRequest[];
  accepted: PendingRequest[];
}> => {
    console.log("Fetching tradie requests for:", { propertyId, tradieUserId });
    
    const { data, error } = await supabase
      .from('ChangeLog')
      .select(`
        id, 
        change_description, 
        specifications, 
        created_at,
        status,
        User:User!ChangeLog_changed_by_user_id_fkey(first_name, last_name),
        Assets:Assets!inner(
            description,
            Spaces:Spaces!inner(
                name,
                Property:Property!inner(name, property_id)
            )
        )
      `)
      .eq('Assets.Spaces.Property.property_id', propertyId)
      .eq('changed_by_user_id', tradieUserId)
      .in('status', ['PENDING', 'ACCEPTED']);

    if (error) {
        console.error("Error fetching tradie requests:", error.message);
        return { pending: [], accepted: [] };
    }

    console.log("Raw data from fetchTradieRequests:", data);

    const anyData = data as any[];

    const requests = (anyData || []).map(item => {
        const asset = item.Assets;
        const space = asset?.Spaces;
        const property = space?.Property;
        
        return {
            id: item.id,
            change_description: item.change_description,
            specifications: item.specifications,
            created_at: item.created_at,
            status: item.status,
            User: item.User,
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

    return {
        pending: requests.filter(req => req.status === 'PENDING'),
        accepted: requests.filter(req => req.status === 'ACCEPTED')
    };
};

// Create a new request for a tradie
export const createTradieRequest = async (
    assetId: string, 
    description: string, 
    specifications: Record<string, any> = {}
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to create a request.");

    console.log("Creating tradie request with:", {
        assetId,
        description,
        specifications,
        userId: user.id
    });

    const { data, error } = await supabase
        .from('ChangeLog')
        .insert({
            asset_id: assetId,
            change_description: description,
            specifications: specifications,
            changed_by_user_id: user.id,
            status: 'PENDING'
        })
        .select();

    if (error) {
        console.error("Error creating tradie request:", error);
        throw new Error(`Failed to create request: ${error.message}`);
    }

    console.log("Successfully created tradie request:", data);
};

// Cancel a pending request
export const cancelTradieRequest = async (id: string) => {
    const { error } = await supabase
      .from('ChangeLog')
      .update({ 
        status: 'DECLINED',
        action: 'DELETED'
      })
      .eq('id', id);

    if (error) {
        throw new Error(`Failed to cancel request: ${error.message}`);
    }
};