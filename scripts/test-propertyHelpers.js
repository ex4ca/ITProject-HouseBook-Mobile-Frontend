const assert = require('assert');
const { getDisciplinesAndMapping } = require('../src/utils/propertyHelpers');

const assetTypes = [
  { id: 1, name: 'AC', discipline: 'HVAC' },
  { id: 2, name: 'Sink', discipline: 'Plumbing' },
];

const spaces = [
  { id: 's1', name: 'Kitchen', Assets: [{ id: 'a1', asset_type_id: 2 }] },
  { id: 's2', name: 'Living', Assets: [{ id: 'a2', asset_type_id: 1 }] },
  { id: 's3', name: 'Garage', Assets: [{ id: 'a3', asset_type_id: 999 }] }, // unknown type
];

const { disciplines, mapping } = getDisciplinesAndMapping(spaces, assetTypes);

// expectations
assert.deepStrictEqual(disciplines, ['General', 'HVAC', 'Plumbing']);
assert(mapping['HVAC'].some(s => s.id === 's2'));
assert(mapping['Plumbing'].some(s => s.id === 's1'));
assert(mapping['General'].some(s => s.id === 's3'));

console.log('PASS: propertyHelpers.getDisciplinesAndMapping');
