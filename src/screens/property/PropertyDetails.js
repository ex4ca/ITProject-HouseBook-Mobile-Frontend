import React, { useState, useEffect } from 'react';
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
import { DropField } from '../../components/common';
import { COLORS, FONTS, STYLES } from '../../components/styles/constants';
import { supabase } from '../../services/supabase';

// Enable LayoutAnimation on Android for the accordion effect
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Helper Component: Renders a single, expandable asset ---
const AssetAccordion = ({ asset, isExpanded, onToggle }) => {
  // The latest change is the first item after sorting
  const latestChange = asset.Change_Log && asset.Change_Log.length > 0 ? asset.Change_Log[0] : null;

  const toggle = () => {
    // Animate the expand/collapse transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.assetContainer}>
      <TouchableOpacity style={styles.assetHeader} onPress={toggle}>
        <Text style={styles.assetTitle}>{asset.name}</Text>
        <Text style={styles.assetToggleIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.assetContent}>
          {latestChange ? (
            <>
              <Text style={styles.changelogSectionTitle}>Current Specifications:</Text>
              <View style={styles.specificationsBox}>
                {Object.entries(latestChange.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specPair}>
                    <Text style={styles.specKey}>{key.replace(/_/g, ' ')}:</Text>
                    <Text style={styles.specValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
              
              {asset.Change_Log.length > 1 && (
                <>
                  <Text style={styles.changelogSectionTitle}>History:</Text>
                  {asset.Change_Log.map((entry, index) => (
                    <View key={entry.id} style={[styles.changelogEntry, index === 0 && styles.latestChangelog]}>
                      <Text style={styles.changelogDate}>
                        {new Date(entry.created_at).toLocaleString()}
                        {index === 0 && ' (Latest)'}
                      </Text>
                      <Text style={styles.changelogDescription}>“{entry.change_description}”</Text>
                      <Text style={styles.changelogAuthor}>- Changed by: {entry.changed_by_user_id || 'System'}</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <Text style={styles.placeholderText}>No specifications or history found for this asset.</Text>
          )}
        </View>
      )}
    </View>
  );
};


// --- Main Property Details Screen ---
const PropertyDetails = ({ route, navigation }) => {
  const propertyId = route.params?.propertyId;

  const [loading, setLoading] = useState(true);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [assetsBySpace, setAssetsBySpace] = useState({});
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [expandedAssetId, setExpandedAssetId] = useState(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Property')
        .select(`
          address,
          Spaces (
            id,
            name,
            type,
            Assets (
              id,
              name,
              Change_Log (
                id,
                specifications,
                change_description,
                created_at,
                changed_by_user_id
              )
            )
          )
        `)
        .eq('property_id', propertyId)
        .single();

      if (error) throw error;

      if (data) {
        setPropertyAddress(data.address);
        setSpaces(data.Spaces);

        const assetsMap = {};
        data.Spaces.forEach(space => {
          const sortedAssets = space.Assets.map(asset => ({
            ...asset,
            Change_Log: [...asset.Change_Log].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          }));
          assetsMap[space.id] = sortedAssets;
        });
        setAssetsBySpace(assetsMap);
        
        if (data.Spaces.length > 0) {
          setSelectedSpace(data.Spaces[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching property details: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentAssets = selectedSpace ? assetsBySpace[selectedSpace] || [] : [];
  const selectedSpaceName = spaces.find(s => s.id === selectedSpace)?.name || 'Select a Space';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading Details...</Text>
      </SafeAreaView>
    );
  }

  if (!propertyId) {
    return (
       <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
         </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.placeholderText}>No property selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.dropdownContainer}>
          <DropField
            options={spaces.map(s => s.name)}
            selectedValue={selectedSpaceName}
            onSelect={(name) => {
              const space = spaces.find(s => s.name === name);
              if (space) {
                setSelectedSpace(space.id);
                setExpandedAssetId(null); // Collapse any open asset when changing space
              }
            }}
            placeholder="Select a Space"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
          />
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{selectedSpaceName}</Text>
          
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
            <View style={styles.placeholderContent}>
                <Text style={styles.placeholderText}>No assets found in this space.</Text>
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
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: STYLES.spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: STYLES.spacing.sm,
  },
  dropdown: {
    width: '100%',
    height: 45,
  },
  dropdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerRightPlaceholder: {
    width: 40, 
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.textfield,
  },
  sectionContent: {
    padding: STYLES.spacing.lg,
  },
  sectionTitle: {
    ...FONTS.screenTitle,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: STYLES.spacing.xl,
  },
  placeholderContent: {
    marginTop: 40,
    padding: STYLES.spacing.xl,
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    alignItems: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    color: COLORS.grey,
  },
  // Asset Styles
  assetContainer: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.medium,
    marginBottom: STYLES.spacing.md,
    ...STYLES.shadow,
    overflow: 'hidden',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: STYLES.spacing.md,
    backgroundColor: '#f9f9f9',
  },
  assetTitle: {
    ...FONTS.title,
    fontSize: 18,
  },
  assetToggleIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  assetContent: {
    paddingHorizontal: STYLES.spacing.md,
    paddingBottom: STYLES.spacing.md,
  },
  // Changelog & Specs Styles
  changelogSectionTitle: {
    ...FONTS.title,
    fontSize: 16,
    marginTop: STYLES.spacing.md,
    marginBottom: STYLES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textfield,
    paddingBottom: STYLES.spacing.xs,
  },
  specificationsBox: {
    backgroundColor: '#f0f4f8',
    borderRadius: STYLES.borderRadius.small,
    padding: STYLES.spacing.md,
    marginBottom: STYLES.spacing.lg,
  },
  specPair: {
    flexDirection: 'row',
    marginBottom: STYLES.spacing.xs,
  },
  specKey: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    width: '40%',
  },
  specValue: {
    flex: 1,
  },
  changelogEntry: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.grey,
    paddingLeft: STYLES.spacing.md,
    marginBottom: STYLES.spacing.md,
  },
  latestChangelog: {
    borderLeftColor: COLORS.primary,
  },
  changelogDate: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: STYLES.spacing.xs,
  },
  changelogDescription: {
    fontStyle: 'italic',
    marginBottom: STYLES.spacing.xs,
  },
  changelogAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PropertyDetails;