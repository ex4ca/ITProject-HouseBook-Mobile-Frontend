export type RootStackParamList = {
  Main: undefined;
  PropertyDetails: { propertyId: string; isOwner: boolean };
  AssetAdd: undefined;
};

export type PropertyControlTabParamList = {
  General: { propertyId: string };
  Details: { propertyId: string; isOwner: boolean };
  Requests: { propertyId: string };
  Authority: { propertyId: string; isOwner: boolean };
};
