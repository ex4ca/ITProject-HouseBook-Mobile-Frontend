import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation } from "react-native";
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react-native";
import { propertyRequestsStyles as styles } from "../styles/requestStyles";
import { PALETTE } from "../styles/palette";
import type { PendingRequest } from "../types";
import SpecificationDetails from "./SpecificationDetails";

/**
 * Renders a single collapsible card for a pending request or a work history item.
 *
 * It is capable of being used by either a Tradie or an Owner.
 *
 * - If `showActions` is true, it displays action buttons.
 * - If `onUpdateStatus` is provided (Owner mode), it shows both "Accept" and "Decline".
 * - If `onCancel` is provided instead (Tradie mode), it shows only a "Cancel" button.
 * - If the status is "ACCEPTED" or "DECLINED", it shows a status badge.
 * - The card can be expanded to show detailed specifications.
 */
interface RequestCardProps {
  item: PendingRequest;
  showActions?: boolean;
  onUpdateStatus?: (id: string, status: "ACCEPTED" | "DECLINED") => void;
  onCancel?: (id: string) => void;
}

const RequestCard = ({
  item,
  showActions = true,
  onUpdateStatus,
  onCancel,
}: RequestCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Safely displays the user's name or defaults to "System".
  const submittedByText = item.User
    ? `${item.User.first_name} ${item.User.last_name}`
    : "System";

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.propertyName}>{item.Assets.Spaces.name}</Text>
            <Text style={styles.assetName}>{item.Assets.description}</Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color={PALETTE.textSecondary} />
          ) : (
            <ChevronRight size={20} color={PALETTE.textSecondary} />
          )}
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.descriptionText}>
            "{item.change_description}"
          </Text>
          {(item.status === "ACCEPTED" || item.status === "DECLINED") && (
            <View
              style={[
                styles.statusLabel,
                item.status === "ACCEPTED"
                  ? styles.statusLabelAccepted
                  : styles.statusLabelRejected,
              ]}
            >
              <Text
                style={[
                  styles.statusLabelText,
                  item.status === "ACCEPTED"
                    ? styles.statusLabelTextAccepted
                    : styles.statusLabelTextRejected,
                ]}
              >
                {item.status === "ACCEPTED" ? "Accepted" : "Rejected"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.submittedBy}>Submitted by: {submittedByText}</Text>
        <Text style={styles.submittedDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailsTitle}>Requested Specifications</Text>
          <SpecificationDetails specifications={item.specifications} />
        </View>
      )}

      {showActions && (
        <View style={styles.actionButtons}>
          {onUpdateStatus && (
            <>
              <TouchableOpacity
                style={[styles.statusButton, styles.declineButton]}
                onPress={() => onUpdateStatus(item.id, "DECLINED")}
              >
                <XCircle size={18} color={PALETTE.danger} />
                <Text
                  style={[styles.statusButtonText, { color: PALETTE.danger }]}
                >
                  Decline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.acceptButton]}
                onPress={() => onUpdateStatus(item.id, "ACCEPTED")}
              >
                <CheckCircle size={18} color={PALETTE.success} />
                <Text
                  style={[styles.statusButtonText, { color: PALETTE.success }]}
                >
                  Accept
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          {onCancel && item.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.statusButton, styles.declineButton]}
              onPress={() => onCancel(item.id)}
            >
              <XCircle size={18} color={PALETTE.danger} />
              <Text style={[styles.statusButtonText, { color: PALETTE.danger }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default RequestCard;
