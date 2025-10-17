import { supabase } from '../config/supabaseClient';

export async function fetchPreviousOwners(propertyId: string) {
  console.log('Fetching previous owners for property:', propertyId);

  // Fetch transfers for the property
  const { data: transfers, error } = await supabase
    .from('Transfers')
    .select('transfer_id, created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transfers:', error);
    throw error;
  }

  if (!transfers || transfers.length === 0) {
    console.log('No transfers found for this property');
    return [];
  }

  const transferIds = transfers.map((t) => t.transfer_id);


  // Fetch old owners for these transfers along with user info
  const { data: oldOwners, error: oldOwnersError } = await supabase
    .from('TransferOldOwners')
    .select(`
      transfer_id,
      owner_id,
      Owner (
        user_id,
        User (
          first_name,
          last_name
        )
      )
    `)
    .in('transfer_id', transferIds);

  if (oldOwnersError) {
    console.error('Old owners fetch error:', oldOwnersError);
    throw oldOwnersError;
  }

  // Group old owners by transfer_id
  const ownersByTransfer: Record<string, { owner_name: string }[]> = {};
  oldOwners?.forEach((owner) => {
    if (!ownersByTransfer[owner.transfer_id]) ownersByTransfer[owner.transfer_id] = [];
    let firstName = '';
    let lastName = '';
    // Owner may be an array or object
    const ownerObj = Array.isArray(owner.Owner) ? owner.Owner[0] : owner.Owner;
    if (ownerObj && ownerObj.User) {
      // User may be an array or object
      const userObj = Array.isArray(ownerObj.User) ? ownerObj.User[0] : ownerObj.User;
      if (userObj) {
        firstName = userObj.first_name || '';
        lastName = userObj.last_name || '';
      }
    }
    ownersByTransfer[owner.transfer_id].push({
      owner_name: `${firstName} ${lastName}`.trim(),
    });
  });

  // Map result back to transfers
  return transfers.map((transfer) => ({
    transfer_id: transfer.transfer_id,
    transfer_date: transfer.created_at,
    owners: ownersByTransfer[transfer.transfer_id] || [],
  }));
}