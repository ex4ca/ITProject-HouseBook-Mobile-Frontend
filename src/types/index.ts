export type UserRole = 'owner' | 'tradie' | 'admin';

export type Property = {
  created_at: any;
  property_id: string;
  address: string;
  description: string;
  pin: string;
  name: string;
  type?: string;
  status?: string;
  last_updated?: string;
  completionStatus?: number;
};

export interface AssetFeature {
  name: string;
  value: string;
}

export interface Asset {
  id: any;
  typeId: string;
  name: string; // Used for display in the frontend during onboarding
  description: string; // This is stored in the database
  features: AssetFeature[];
}

export interface Space {
  type: string;
  name: string;
  assets: Asset[];
}

// Represents the data structure for onboarding a new property.
export interface OnboardingFormData {
  propertyName: string;
  propertyDescription: string;
  address: string;
  // Note: React Native handles file uploads differently. This might become an array of strings (URIs).
  floorPlans: File[]; 
  buildingPlans: File[];
}

// Defines the shape of a user profile used in the Authority/Role screen.
export interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  roles: string[];
}

// Extends the UserProfile with a status for connected tradies.
export interface Tradie extends UserProfile {
  status: string;
}

// This new type defines the shape of data for the PropertyGeneral screen.
export type PropertyGeneral = {
  name: string;
  address: string;
  description: string | null;
  total_floor_area: number | null;
  Spaces: {
    Assets: any;
    name: string; type: string 
}[];
  PropertyImages: { image_link: string; image_name: string }[];
};

export interface PendingRequest {
  id: string;
  change_description: string;
  specifications: Record<string, any>; 
  created_at: string;
  User: {
    first_name: string;
    last_name: string;
  } | null; 
  Assets: {
    description: string;
    Spaces: {
      name: string;
      Property: {
        name: string;
        property_id: string;
      };
    };
  };
}

export interface HistoryEntry {
  id: string;
  created_at: string;
  change_description: string;
  specifications: Record<string, any>;
  User: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface AssetDetails {
  id: string;
  description: string;
  ChangeLog: HistoryEntry[];
  Spaces: {
      name: string;
      Property: {
          name: string;
      }
  }
}

// Add these new types to your existing index.ts file.

export interface ChangelogEntry {
    id: string;
    specifications: Record<string, any>;
    change_description: string;
    created_at: string;
    status: 'ACCEPTED' | 'PENDING' | 'DECLINED';
    User: {
        first_name: string;
        last_name: string;
    } | null;
}

export interface AssetWithChangelog {
    id: string;
    description: string;
    ChangeLog: ChangelogEntry[];
}

export interface SpaceWithAssets {
    id: string;
    name: string;
    Assets: AssetWithChangelog[];
}

export interface PropertyDetailsData {
    Spaces: SpaceWithAssets[];
}

export interface EditableSpec {
    id: number;
    key: string;
    value: string;
}
