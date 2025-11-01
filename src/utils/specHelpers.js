// Normalize editableSpecs array into specifications object
function normalizeEditableSpecs(editableSpecs) {
  const specs = {};
  (editableSpecs || []).forEach((spec) => {
    const key = (spec.key || '').trim();
    const value = (spec.value || '').trim();
    if (key) {
      specs[key] = value;
    }
  });
  return specs;
}

module.exports = { normalizeEditableSpecs };
