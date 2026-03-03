import React, { useMemo } from "react";
import { View, Text } from "react-native";
import {
  Bed,
  Bath,
  Home as HomeIcon,
  Maximize,
  Car,
  Utensils,
} from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import { propertyGeneralStyles as styles } from "../styles/propertyGeneralStyles";
import type { PropertyGeneral } from "../types";

export interface PropertyStatsCardProps {
  property: PropertyGeneral | null;
  spaceCounts: Record<string, number>;
}

export default function PropertyStatsCard({ property, spaceCounts }: PropertyStatsCardProps) {
  const PropertyStats = useMemo(() => {
    const statTypes = [
      {
        key: "bedroom",
        label: "Bedrooms",
        icon: <Bed color={PALETTE.primary} size={20} />,
      },
      {
        key: "bathroom",
        label: "Bathrooms",
        icon: <Bath color={PALETTE.primary} size={20} />,
      },
      {
        key: "kitchen",
        label: "Kitchens",
        icon: <Utensils color={PALETTE.primary} size={20} />,
      },
      {
        key: "living",
        label: "Living Rooms",
        icon: <HomeIcon color={PALETTE.primary} size={20} />,
      },
      {
        key: "garage",
        label: "Garages",
        icon: <Car color={PALETTE.primary} size={20} />,
      },
    ];
    const allowedKeys = statTypes.map((stat) => stat.key);
    const filteredSpaceCounts = Object.fromEntries(
      Object.entries(spaceCounts).filter(([key]) => allowedKeys.includes(key)),
    );
    const stats = statTypes
      .filter((stat) => filteredSpaceCounts[stat.key])
      .map((stat) => ({
        icon: stat.icon,
        label: stat.label,
        value: filteredSpaceCounts[stat.key]?.toString() || "0",
      }));
      
    if (property?.total_floor_area) {
      stats.push({
        icon: <Maximize color={PALETTE.primary} size={20} />,
        label: "Floor Area",
        value: `${property.total_floor_area} m²`,
      });
    }
    if (property?.block_size) {
      stats.push({
        icon: <Maximize color={PALETTE.primary} size={20} />,
        label: "Block Size",
        value: `${property.block_size} m²`,
      });
    }
    return stats;
  }, [spaceCounts, property]);

  return (
    <View style={styles.detailsCard}>
      <Text style={styles.cardTitle}>Property Details</Text>
      <View style={styles.statsGrid}>
        {PropertyStats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            {stat.icon}
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
