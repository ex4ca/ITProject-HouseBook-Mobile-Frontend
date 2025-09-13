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
  lastUpdated?: string;
  completionStatus?: number;
};

export interface AssetFeature {
  name: string;
  value: string;
}

export interface Asset {
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