// Small pure helper to extract disciplines and map disciplines to spaces
function getDisciplinesAndMapping(spacesData, assetTypes) {
  const disciplinesSet = new Set();
  const mapping = {};

  (spacesData || []).forEach((space) => {
    (space.Assets || []).forEach((asset) => {
      const assetType = (assetTypes || []).find((t) => t.id === asset.asset_type_id);
      const discipline = (assetType && assetType.discipline) || 'General';

      disciplinesSet.add(discipline);

      if (!mapping[discipline]) {
        mapping[discipline] = [];
      }

      const exists = mapping[discipline].find((s) => s.id === space.id);
      if (!exists) mapping[discipline].push(space);
    });
  });

  const disciplines = Array.from(disciplinesSet).sort();
  return { disciplines, mapping };
}

module.exports = { getDisciplinesAndMapping };
