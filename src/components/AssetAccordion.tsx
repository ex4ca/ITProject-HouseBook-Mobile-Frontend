import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react-native";
import { propertyDetailsStyles as styles } from "../styles/propertyDetailsStyles";
import { PALETTE } from "../styles/palette";
import SpecificationDetails from "./SpecificationDetails";
import type { AssetWithChangelog } from "../types";

/**
 * A collapsible accordion component for a single asset.
 *
 * Displays:
 * - The asset description.
 * - The most recent "ACCEPTED" specifications.
 * - An "Add Entry" button (if `isEditable` is true).
 * - A collapsible list of all past "ACCEPTED" history entries.
 */
interface AssetAccordionProps {
  asset: AssetWithChangelog;
  isExpanded: boolean;
  onToggle: () => void;
  onAddHistory?: (asset: AssetWithChangelog) => void;
  isEditable?: boolean;
}

const AssetAccordion = ({
  asset,
  isExpanded,
  onToggle,
  onAddHistory,
  isEditable = false,
}: AssetAccordionProps) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const acceptedLogs = asset.ChangeLog.filter(
    (log) => log.status === "ACCEPTED",
  );
  const latestChange = acceptedLogs[0] || null;

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={onToggle}>
        <Text style={styles.assetTitle}>{asset.description}</Text>
        {isExpanded ? (
          <ChevronDown size={20} color={PALETTE.textPrimary} />
        ) : (
          <ChevronRight size={20} color={PALETTE.textPrimary} />
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.assetContent}>
          <Text style={styles.contentSectionTitle}>Current Specifications</Text>
          {latestChange ? (
            <SpecificationDetails specifications={latestChange.specifications} />
          ) : (
            <Text style={styles.emptyText}>No specifications found.</Text>
          )}
          <View style={styles.historySectionHeader}>
            <Text style={styles.contentSectionTitle}>History</Text>
            {isEditable && onAddHistory ? (
              <TouchableOpacity
                style={styles.addButtonSmall}
                onPress={() => onAddHistory(asset)}
              >
                <PlusCircle size={18} color={PALETTE.primary} />
                <Text style={styles.addButtonSmallText}>Add Entry</Text>
              </TouchableOpacity>
            ) : isEditable ? (
               <Text style={styles.permissionText}>
                You don't have permission to edit.
              </Text>
            ) : null}
          </View>
          {acceptedLogs.length > 1 ? (
            acceptedLogs.slice(1).map((entry) => (
              <View key={entry.id} style={styles.historyItemContainer}>
                <TouchableOpacity
                  style={styles.historyEntry}
                  onPress={() =>
                    setExpandedHistoryId((prev) =>
                      prev === entry.id ? null : entry.id,
                    )
                  }
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.created_at).toLocaleString()}
                    </Text>
                    {expandedHistoryId === entry.id ? (
                      <ChevronDown color={PALETTE.textSecondary} size={16} />
                    ) : (
                      <ChevronRight color={PALETTE.textSecondary} size={16} />
                    )}
                  </View>
                  <Text style={styles.historyDescription}>
                    “{entry.change_description}”
                  </Text>
                  <Text style={styles.historyAuthor}>
                    By:{" "}
                    {entry.User
                      ? `${entry.User.first_name} ${entry.User.last_name}`
                      : "System"}
                  </Text>
                </TouchableOpacity>
                {expandedHistoryId === entry.id && (
                  <View style={styles.historySpecBox}>
                    <SpecificationDetails specifications={entry.specifications} />
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No other history entries.</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default AssetAccordion;