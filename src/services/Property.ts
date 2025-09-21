import { supabase } from '../config/supabaseClient';
import type { Property, PropertyGeneral } from '../types';

// Fetches all properties owned by a specific user for the list view.
export const getPropertiesByOwner = async (userId: string): Promise<Property[] | null> => {
    const { data, error } = await supabase
        .from('Owner')
        .select(`OwnerProperty (Property ( property_id, name, address, description, pin, created_at ))`)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching properties:", error.message);
        return null;
    }
    if (!data) return [];

    const properties: Property[] = data.flatMap(owner => owner.OwnerProperty).flatMap(op => op.Property);
    return properties;
}

// Fetches the detailed general data for a single property.
export const fetchPropertyGeneralData = async (propertyId: string): Promise<PropertyGeneral | null> => {
    const { data, error } = await supabase
        .from('Property')
        .select(`
          name,
          address,
          description,
          total_floor_area,
          PropertyImages ( image_link, image_name ),
          Spaces (
            id,
            name,
            type,
            Assets (
              id,
              description,
              AssetTypes ( discipline ),
              ChangeLog ( 
                specifications, 
                status,
                created_at
              )
            )
          )
        `)
        .eq('property_id', propertyId)
        .single();
        
      if (error) {
          console.error("Error fetching general property data:", error.message);
          return null;
      }
  // Supabase returns a loose shape; cast to PropertyGeneral to satisfy TypeScript.
  return data as unknown as PropertyGeneral;
}