const fs = require('fs');
const assert = require('assert');

const btnSrc = fs.readFileSync('src/components/Button.tsx', 'utf8');

// Ensure the Button component accepts 'disabled' prop and uses it in styles/disabled
assert(btnSrc.includes('disabled?: boolean') || btnSrc.includes("disabled = false"), 'Button must accept disabled prop');
assert(btnSrc.includes('disabled && styles.disabledButton') || btnSrc.includes('disabled && styles.disabledText'), 'Button should apply disabled styles when disabled');

console.log('PASS: Button component source checks');
