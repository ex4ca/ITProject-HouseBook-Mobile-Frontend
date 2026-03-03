import React from "react";
import { View, Text } from "react-native";
import { componentDetailsStyles as styles } from "../styles/componentDetailsStyles";
import type { HistoryEntry } from "../types";

const HistoryEntryCard = ({ entry }: { entry: HistoryEntry }) => (
  <View style={styles.historyEntry}>
    <View style={styles.entryHeader}>
      <Text style={styles.entryDate}>
        {new Date(entry.created_at).toLocaleDateString()}
      </Text>
    </View>
    <View style={styles.entryContent}>
      <Text style={styles.entryTitle}>{entry.change_description}</Text>
    </View>
  </View>
);

export default HistoryEntryCard;
