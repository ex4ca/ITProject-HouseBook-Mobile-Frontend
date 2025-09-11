import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { DropField } from '../../components/common';
import { supabase } from '../../api/supabaseClient';

// Enables LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Consistent color palette for the Notion-like design.
const PALETTE = {
  background: '#F8F9FA', // A very light grey for contrast
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#111827',
  border: '#E5E7EB',
};

// Renders a block of key-value pairs for asset specifications.
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

// An accordion component to display an asset and its change history.
const AssetAccordion = ({ asset, isExpanded, onToggle }) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const latestChange = asset.ChangeLog?.[0] || null;

  const toggleAsset = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const toggleHistoryEntry = (entryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedHistoryId(expandedHistoryId === entryId ? null : entryId);
  };

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={toggleAsset}>
        <Text style={styles.assetTitle}>{asset.name}</Text>
        {isExpanded ? <ChevronDown color={PALETTE.textPrimary} size={20} /> : <ChevronRight color={PALETTE.textPrimary} size={20} />}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.assetContent}>
          {latestChange ? (
            <>
              <Text style={styles.contentSectionTitle}>Current Specifications</Text>
              <SpecificationDetails specifications={latestChange.specifications} />
              
              {asset.ChangeLog.length > 1 && (
                <>
                  <Text style={styles.contentSectionTitle}>History</Text>
                  {asset.ChangeLog.slice(1).map((entry) => (
                    <View key={entry.id} style={styles.historyItemContainer}>
                      <TouchableOpacity 
                        style={styles.historyEntry}
                        onPress={() => toggleHistoryEntry(entry.id)}
                      >
                        <View style={styles.historyHeader}>
                          <Text style={styles.historyDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                          {expandedHistoryId === entry.id ? <ChevronDown color={PALETTE.textSecondary} size={16} /> : <ChevronRight color={PALETTE.textSecondary} size={16} />}
                        </View>
                        <Text style={styles.historyDescription}>“{entry.change_description}”</Text>
                        <Text style={styles.historyAuthor}>By: {entry.User ? `${entry.User.first_name} ${entry.User.last_name}` : 'System'}</Text>
                      </TouchableOpacity>
                      {expandedHistoryId === entry.id && (
                        <View style={styles.historySpecBox}>
                          <SpecificationDetails specifications={entry.specifications} />
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No specifications found for this asset.</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Main screen component for displaying property details.
const PropertyDetailsScreen = ({ route, navigation }) => {
  const { propertyId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [assetsBySpace, setAssetsBySpace] = useState({});
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [expandedAssetId, setExpandedAssetId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (propertyId) {
        fetchPropertyData();
      } else {
        setLoading(false);
      }
    }, [propertyId])
  );

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Property')
        .select(`
          Spaces ( 
            id, 
            name, 
            Assets ( 
              id, 
              name, 
              ChangeLog ( 
                id, 
                specifications, 
                change_description, 
                created_at,
                User ( first_name, last_name )
              )
            )
          )
        `)
        .eq('property_id', propertyId)
        .single();

      if (error) throw error;

      if (data && data.Spaces) {
        setSpaces(data.Spaces);
        const assetsMap = {};
        data.Spaces.forEach(space => {
          const sortedAssets = space.Assets.map(asset => ({
            ...asset,
            ChangeLog: [...asset.ChangeLog].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          }));
          assetsMap[space.id] = sortedAssets;
        });
        setAssetsBySpace(assetsMap);
        
        if (data.Spaces.length > 0) {
          setSelectedSpace(data.Spaces[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching property details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentAssets = selectedSpace ? assetsBySpace[selectedSpace] || [] : [];
  const selectedSpaceName = spaces.find(s => s.id === selectedSpace)?.name || 'Select a Space';

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </SafeAreaView>
    );
  }

  if (!propertyId || spaces.length === 0) {
    return (
       <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={PALETTE.textPrimary} />
            </TouchableOpacity>
         </View>
        <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No details found for this property.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.dropdownContainer}>
          <DropField
            options={spaces.map(s => s.name)}
            selectedValue={selectedSpaceName}
            onSelect={(name) => {
              const space = spaces.find(s => s.name === name);
              if (space) {
                setSelectedSpace(space.id);
                setExpandedAssetId(null);
              }
            }}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{selectedSpaceName}</Text>
        <View style={styles.contentContainer}>
          {currentAssets.length > 0 ? (
            currentAssets.map(asset => (
              <AssetAccordion
                key={asset.id}
                asset={asset}
                isExpanded={expandedAssetId === asset.id}
                onToggle={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
              />
            ))
          ) : (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No assets found in this space.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.card,
  },
  scrollContainer: {
    backgroundColor: PALETTE.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // Ensure empty state has some height
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    backgroundColor: PALETTE.card,
  },
  backButton: {
    padding: 8,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  // Styles for the DropField component
  dropdown: {
    backgroundColor: PALETTE.card,
    borderColor: PALETTE.border,
    borderWidth: 1,
  },
  dropdownText: {
    color: PALETTE.textPrimary,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: PALETTE.textSecondary,
    fontSize: 16,
  },
  assetContainer: {
    backgroundColor: PALETTE.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  assetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    flex: 1,
  },
  assetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specificationsBox: {
    backgroundColor: PALETTE.background,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  specPair: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  specKey: {
    fontWeight: '500',
    textTransform: 'capitalize',
    width: '40%',
    color: PALETTE.textSecondary,
  },
  specValue: {
    flex: 1,
    color: PALETTE.textPrimary,
  },
  historyItemContainer: {
    marginTop: 8,
  },
  historyEntry: {
    padding: 12,
    backgroundColor: PALETTE.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
    color: PALETTE.textSecondary,
  },
  historyDescription: {
    fontStyle: 'italic',
    color: PALETTE.textPrimary,
    marginTop: 8,
  },
  historyAuthor: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  historySpecBox: {
    paddingTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: PALETTE.border,
    marginTop: 12, 
    marginLeft: 16, 
  },
});

export default PropertyDetailsScreen;

