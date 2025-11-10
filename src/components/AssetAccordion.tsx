import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react-native";
import { PALETTE } from "../styles/palette";
import SpecificationDetails from "./SpecificationDetails";
import { propertyDetailsStyles as styles } from "../styles/propertyDetailsStyles";
import type { AssetWithChangelog } from "../types";

/**
 * A collapsible accordion component to display details for a specific asset.
 *
 * It shows the asset's description in the header. When expanded, it displays
 * the most recent "ACCEPTED" specifications and a history section. The history
 * section includes a button to add a new history entry.
 */
export default function AssetAccordion({
  asset,
  isExpanded,
  onToggle,
  onAddHistory,
}: {
  asset: AssetWithChangelog;
  isExpanded: boolean;
  onToggle: () => void;
  onAddHistory: (asset: AssetWithChangelog) => void;
}) {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );
  const acceptedLogs = asset.ChangeLog.filter(
    (log) => log.status === "ACCEPTED",
  );
  const latestChange = acceptedLogs[0] || null;

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={onToggle}>
        <Text style={styles.assetTitle}>{asset.description}</Text>
        {isExpanded ? (
          <ChevronDown color={PALETTE.textPrimary} size={20} />
        ) : (
          <ChevronRight color={PALETTE.textPrimary} size={20} />
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.assetContent}>
          <Text style={styles.contentSectionTitle}>Current Specifications</Text>
          {latestChange ? (
            <SpecificationDetails
              specifications={latestChange.specifications}
            />
          ) : (
            <Text style={styles.emptyText}>
              No accepted specifications yet.
            </Text>
          )}
          <View style={styles.historySectionHeader}>
            <Text style={styles.contentSectionTitle}>History</Text>
            <TouchableOpacity
              style={styles.addButtonSmall}
              onPress={() => onAddHistory(asset)}
            >
              <PlusCircle size={18} color={PALETTE.primary} />
              <Text style={styles.addButtonSmallText}>Add Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}