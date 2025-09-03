// Mock data for development
export const mockProperties = [
  {
    id: '1',
    address: '300 Collins St, Melbourne VIC 3000',
    status: 'Ongoing',
    statusColor: '#007AFF',
    image: null,
    type: 'House',
    size: '238 m2',
    bedrooms: 4,
    bathrooms: 2,
    livingAreas: 2,
    garageSpaces: 2,
    description: 'Open-plan living/dining + separate media room',
    garage: 'Double garage with remote-controlled door',
    blockSize: '620 m²',
    sections: {
      exterior: {
        wallCeilings: [],
        flooring: [],
        doorHandles: []
      },
      interior: {
        flooring: [],
        doorHandles: [],
        kitchen: {
          sink: [
            {
              id: 'sink-1',
              date: '20 April 2025',
              title: 'Pipe material updated',
              description: 'Description...',
              status: 'completed'
            },
            {
              id: 'sink-2', 
              date: '15 January 2025',
              title: 'Hot water fixed',
              description: 'Description...',
              status: 'completed'
            }
          ],
          oven: [],
          cabinet: [],
          kitchenIsland: [],
          fridge: []
        },
        bathroom: [],
        lightingElectrical: []
      }
    }
  },
  {
    id: '2',
    address: '145 Elizabeth St, Richmond VIC 3121',
    status: 'Finished',
    statusColor: '#4CAF50',
    image: null,
    type: 'Apartment',
    size: '185 m2',
    bedrooms: 2,
    bathrooms: 1,
    livingAreas: 1,
    garageSpaces: 1,
    description: 'Modern apartment with city views',
    garage: 'Single covered parking space',
    blockSize: 'N/A',
    sections: {
      exterior: {
        wallCeilings: [],
        flooring: [],
        doorHandles: []
      },
      interior: {
        flooring: [],
        doorHandles: [],
        kitchen: {
          sink: [],
          oven: [],
          cabinet: [],
          kitchenIsland: [],
          fridge: []
        },
        bathroom: [],
        lightingElectrical: []
      }
    }
  },
  {
    id: '3',
    address: '145 Elizabeth St, Richmond VIC 3121',
    status: 'Finished',
    statusColor: '#4CAF50',
    image: null,
    type: 'Townhouse',
    size: '210 m2',
    bedrooms: 3,
    bathrooms: 2,
    livingAreas: 2,
    garageSpaces: 2,
    description: 'Three-level townhouse with courtyard',
    garage: 'Tandem garage for two cars',
    blockSize: '150 m²',
    sections: {
      exterior: {
        wallCeilings: [],
        flooring: [],
        doorHandles: []
      },
      interior: {
        flooring: [],
        doorHandles: [],
        kitchen: {
          sink: [],
          oven: [],
          cabinet: [],
          kitchenIsland: [],
          fridge: []
        },
        bathroom: [],
        lightingElectrical: []
      }
    }
  }
];

export const mockUsers = [
  {
    id: '1',
    name: 'Antonio owner',
    phone: '+61123213',
    email: 'xyz.com',
    roles: ['Owner'],
    type: 'owner'
  },
  {
    id: '2',
    name: 'Antonio tradie',
    phone: '+61456789',
    email: 'mike@tradieservice.com',
    roles: ['painter', 'electrician'],
    type: 'tradie'
  }
];

export const sortOptions = [
  { label: 'By Newest', value: 'newest' },
  { label: 'By Oldest', value: 'oldest' },
  { label: 'By A-Z', value: 'a-z' },
  { label: 'By Z-A', value: 'z-a' }
];

export const kitchenComponents = [
  'sink',
  'oven', 
  'cabinet',
  'kitchen island',
  'fridge'
];

export const interiorSections = [
  'Flooring',
  'Door & Handles', 
  'Kitchen',
  'Bathroom',
  'Lighting & Electrical'
];

export const exteriorSections = [
  'Wall & Ceilings',
  'Flooring',
  'Door & Handles'
];
