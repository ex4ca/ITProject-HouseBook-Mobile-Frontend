const assert = require('assert');
const { normalizeEditableSpecs } = require('../src/utils/specHelpers');

const input = [
  { id: 1, key: ' color ', value: ' red ' },
  { id: 2, key: '', value: 'should be ignored' },
  { id: 3, key: 'size', value: ' Large ' },
];

const out = normalizeEditableSpecs(input);
assert.deepStrictEqual(out, { color: 'red', size: 'Large' });
console.log('PASS: normalizeEditableSpecs');
