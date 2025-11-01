const fs = require('fs');
const assert = require('assert');

const src = fs.readFileSync('src/components/ConfirmModal.tsx', 'utf8');

// Check default props text
assert(src.includes("confirmText = 'Yes'") || src.includes('confirmText = "Yes"'), 'ConfirmModal should default confirmText to Yes');
assert(src.includes("cancelText = 'Cancel'") || src.includes('cancelText = "Cancel"'), 'ConfirmModal should default cancelText to Cancel');

console.log('PASS: ConfirmModal default props checks');
