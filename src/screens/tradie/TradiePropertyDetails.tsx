import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { fetchPropertyAndJobScope } from '../../services/FetchAuthority';
import { propertyListStyles as styles } from '../../styles/propertyListStyles';
import { PALETTE } from '../../styles/palette';
import { Lock, Edit3 } from 'lucide-react-native';

export default function TradiePropertyDetails() {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { propertyId, jobId } = route.params as { propertyId: string, jobId: string };
  
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any | null>(null);
  const [editableIds, setEditableIds] = useState(new Set());

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
            const { property, editableAssetIds } = await fetchPropertyAndJobScope(propertyId, jobId);
            setPropertyData(property);
            setEditableIds(editableAssetIds);
        } catch (error) {
            console.error("Error fetching property scope:", error);
            setPropertyData(null);
        } finally {
            setLoading(false);
        }
      };
      loadData();
    }, [propertyId, jobId])
  );

  if (loading) {
    return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={PALETTE.primary} /></SafeAreaView>;
  }

  if (!propertyData) {
     return <SafeAreaView style={styles.centerContainer}><Text>Could not load property details.</Text></SafeAreaView>
  }

  const renderSpace = ({ item: space }: { item: any }) => (
    <View style={pageStyles.spaceContainer}>
      <Text style={styles.listTitle}>{space.name}</Text>
      {space.Assets.map((asset: any) => {
        const isEditable = editableIds.has(asset.id);
        return (
          <TouchableOpacity 
            key={asset.id} 
            style={pageStyles.assetCard}
            // Navigate to component details, passing the isEditable flag
            onPress={() => navigation.navigate('ComponentDetails', { assetId: asset.id, isEditable: isEditable })}
          >
            <Text style={pageStyles.assetDescription}>{asset.description}</Text>
            {isEditable ? (
              <Edit3 size={18} color={PALETTE.success} />
            ) : (
              <Lock size={18} color={PALETTE.textSecondary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={propertyData.Spaces}
        renderItem={renderSpace}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{propertyData.name}</Text>
            <Text style={styles.headerSubtitle}>Spaces & Assets</Text>
          </View>
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}

const pageStyles = StyleSheet.create({
    spaceContainer: {
        marginBottom: 24,
    },
    assetCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: PALETTE.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: PALETTE.border,
    },
    assetDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: PALETTE.textPrimary,
        flex: 1,
    },
});

