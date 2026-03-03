import type { SpaceWithAssets, PropertyGeneral } from "../types";

type AssetType = {
  id: number;
  name: string;
  discipline: string;
};

function getDisciplinesAndMapping(
  spacesData: SpaceWithAssets[],
  assetTypes: AssetType[],
) {
  const disciplinesSet = new Set<string>();
  const mapping: Record<string, SpaceWithAssets[]> = {};

  (spacesData || []).forEach((space) => {
    (space.Assets || []).forEach((asset) => {
      const assetType = (assetTypes || []).find(
        (t) => t.id === asset.asset_type_id,
      );
      const discipline = (assetType && assetType.discipline) || "General";

      disciplinesSet.add(discipline);

      if (!mapping[discipline]) {
        mapping[discipline] = [];
      }

      const exists = mapping[discipline].find((s) => s.id === space.id);
      if (!exists) {
        mapping[discipline].push(space);
      }
    });
  });

  const disciplines = Array.from(disciplinesSet).sort();
  return { disciplines, mapping };
}

function calculateSpaceCounts(spaces: PropertyGeneral['Spaces'] | undefined): Record<string, number> {
  if (!spaces) return {};
  return spaces.reduce((acc, space) => {
    const type = space.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export { getDisciplinesAndMapping, calculateSpaceCounts };