
import type { SpaceWithAssets } from "../types";

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

export { getDisciplinesAndMapping };