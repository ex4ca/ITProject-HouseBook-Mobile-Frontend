import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { fetchJobDetails } from '../../services/FetchAuthority';
import { propertyListStyles as styles } from '../../styles/propertyListStyles'; 
import { PALETTE } from '../../styles/palette';

export default function TradieJobDetails() {
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        const data = await fetchJobDetails(jobId);
        setJobDetails(data);
        setLoading(false);
      };
      loadData();
    }, [jobId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  if (!jobDetails) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Could not load job details.</Text>
      </SafeAreaView>
    );
  }

  const renderAssetCard = ({ item }: { item: any }) => (
    <View style={pageStyles.assetCard}>
      <Text style={pageStyles.assetDescription}>{item.description}</Text>
      <Text style={pageStyles.assetSpace}>Located in: {item.spaceName}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContentContainer}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{jobDetails.Property.name}</Text>
            <Text style={styles.headerSubtitle}>{jobDetails.title}</Text>
        </View>

        <Text style={styles.listTitle}>Assets for this Job</Text>

        {jobDetails.assets.length > 0 ? (
             <FlatList
                data={jobDetails.assets}
                renderItem={renderAssetCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false} 
             />
        ) : (
            <Text style={styles.emptyListText}>No specific assets are assigned to this job.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const pageStyles = StyleSheet.create({
    assetCard: {
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
    },
    assetSpace: {
        fontSize: 14,
        color: PALETTE.textSecondary,
        marginTop: 4,
    }
});
