import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../api/supabaseClient';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react-native';

const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
  danger: '#DC2626',
  success: '#16A34A',
};

// Renders the specification details for a change request.
const SpecificationDetails = ({ specifications }) => (
  <View style={styles.specificationsBox}>
    {Object.entries(specifications).map(([key, value]) => (
      <View key={key} style={styles.specPair}>
        <Text style={styles.specKey}>{key.replace(/_/g, ' ')}</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    ))}
  </View>
);

// Renders a single pending request card.
const RequestCard = ({ item, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);
  }

  // Safely displays the user's name or defaults to "System".
  const submittedByText = item.User 
    ? `${item.User.first_name} ${item.User.last_name}` 
    : 'System';

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
                <Text style={styles.propertyName}>{item.Assets.Spaces.Property.name}</Text>
                <Text style={styles.assetName}>{item.Assets.Spaces.name} / {item.Assets.name}</Text>
            </View>
            {isExpanded ? <ChevronDown size={20} color={PALETTE.textSecondary} /> : <ChevronRight size={20} color={PALETTE.textSecondary} />}
        </View>
        <Text style={styles.descriptionText}>“{item.change_description}”</Text>
        <Text style={styles.submittedBy}>Submitted by: {submittedByText}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
          <View style={styles.expandedContent}>
              <Text style={styles.detailsTitle}>Requested Specifications</Text>
              <SpecificationDetails specifications={item.specifications} />
          </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.statusButton, styles.declineButton]} onPress={() => onUpdateStatus(item.id, 'DECLINED')}>
            <XCircle size={18} color={PALETTE.danger} />
            <Text style={[styles.statusButtonText, { color: PALETTE.danger }]}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statusButton, styles.acceptButton]} onPress={() => onUpdateStatus(item.id, 'ACCEPTED')}>
            <CheckCircle size={18} color={PALETTE.success} />
            <Text style={[styles.statusButtonText, { color: PALETTE.success }]}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PropertyRequest = ({ route, navigation }) => {
  const { propertyId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchRequests = async () => {
        if (!propertyId) {
            setLoading(false);
            return;
        };
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('ChangeLog')
            .select(`
              id, change_description, specifications, created_at,
              User ( first_name, last_name ),
              Assets ( description, Spaces ( name, Property ( name, property_id )))
            `)
            .eq('status', 'PENDING')
            .eq('Assets.Spaces.property_id', propertyId);

          if (error) throw error;
          setRequests(data || []);
        } catch (err) {
          console.error("Error fetching requests:", err.message);
          setRequests([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRequests();
    }, [propertyId])
  );

  const handleUpdateStatus = async (id, status) => {
    const { error } = await supabase
      .from('ChangeLog')
      .update({ status })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', `Failed to update request status: ${error.message}`);
    } else {
      // Refresh the list after updating.
      setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={PALETTE.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pending Requests</Text>
            <View style={{ width: 40 }} />
        </View>
      <FlatList
        data={requests}
        renderItem={({ item }) => <RequestCard item={item} onUpdateStatus={handleUpdateStatus} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No pending requests for this property.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PALETTE.card,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardHeaderText: {
      flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  assetName: {
      fontSize: 14,
      color: PALETTE.textSecondary,
      marginTop: 2,
  },
  descriptionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: PALETTE.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  submittedBy: {
      fontSize: 12,
      color: PALETTE.textSecondary,
      textAlign: 'right',
      paddingHorizontal: 16,
      paddingBottom: 16,
  },
  expandedContent: {
      borderTopWidth: 1,
      borderColor: PALETTE.border,
      padding: 16,
  },
  detailsTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: PALETTE.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 8,
  },
  specificationsBox: {
    backgroundColor: PALETTE.background,
    borderRadius: 6,
    padding: 12,
  },
  specPair: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  specKey: {
    fontWeight: '500',
    width: '40%',
    color: PALETTE.textSecondary,
  },
  specValue: {
    flex: 1,
    color: PALETTE.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: PALETTE.background,
    padding: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  declineButton: {
      backgroundColor: '#FEF2F2',
  },
  acceptButton: {
      backgroundColor: '#F0FDF4',
  },
  statusButtonText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
  },
});

export default PropertyRequest;