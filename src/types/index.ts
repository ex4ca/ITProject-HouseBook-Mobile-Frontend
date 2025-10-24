export type UserRole = 'owner' | 'tradesperson' | 'admin';

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
  isActive?: boolean;
  splash_image?: string | null; 
};

// Defines the shape of a user profile. The 'id' here is the user_id.
export interface UserProfile {
  id: string; 
  name: string;
  phone: string | null;
  email: string;
  roles: string[];
}

export interface Tradie extends UserProfile {
  connectionId: string; // The unique ID from the PropertyTradies table row
  status: string;
}

// NEW: Defines the shape for a tradie with an active job
export interface ActiveTradieJob {
  jobId: string;
  jobTitle: string;
  tradieId: string;
  tradieName: string;
}

type GeneralAsset = {
  id: string;
  description: string;
  AssetTypes: {
    discipline: string;
  } | null;
  ChangeLog: {
    specifications: Record<string, any>;
    status: string;
    created_at: string;
  }[];
};

type GeneralSpace = {
  id: string;
  name: string;
  type: string;
  Assets: GeneralAsset[];
};

export type PropertyGeneral = {
  name: string;
  address: string;
  description: string | null;
  total_floor_area: number | null;
  block_size: number | null;
  Spaces: GeneralSpace[];
  PropertyImages: { image_link: string; image_name: string }[];
};

export interface AssetFeature {
  name: string;
  value: string;
}

export interface Asset {
  id: any;
  typeId: string;
  name: string;
  description: string;
  features: AssetFeature[];
}

export interface Space {
  type: string;
  name: string;
  assets: Asset[];
}

export interface OnboardingFormData {
  propertyName: string;
  propertyDescription: string;
  address: string;
  floorPlans: File[]; 
  buildingPlans: File[];
}

export interface PendingRequest {
  id: string;
  change_description: string;
  specifications: Record<string, any>; 
  created_at: string;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
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
    asset_type_id: number;
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