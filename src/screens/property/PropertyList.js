import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Home } from 'lucide-react-native';
import { supabase } from '../../api/supabaseClient';

const PALETTE = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  primary: '#1F2937',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const PropertyListScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Use a ref to prevent multiple fetches from running at the same time.
  const isFetching = useRef(false);

  // This function contains all the logic to fetch fresh data for the screen.
  const fetchData = useCallback(async () => {
    // If a fetch is already in progress, don't start another one.
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProperties([]);
        setUserName('');
        return;
      }

      // Fetch user's name and their properties concurrently.
      const [propertiesResponse, userResponse] = await Promise.all([
        supabase
          .from('Owner')
          .select('OwnerProperty(Property(property_id, name, address, created_at))')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('User')
          .select('first_name')
          .eq('user_id', user.id)
          .single(),
      ]);

      // Process the user's name from the response.
      if (userResponse.data) {
        setUserName(userResponse.data.first_name);
      }
      if (userResponse.error) {
        throw userResponse.error;
      }

      // Process the properties from the response.
      if (propertiesResponse.data && propertiesResponse.data.OwnerProperty) {
        const fetchedProperties = propertiesResponse.data.OwnerProperty.map(item => ({
          ...item.Property,
          id: item.Property.property_id,
        }));
        fetchedProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProperties(fetchedProperties);
      } else {
        setProperties([]);
      }
      if (propertiesResponse.error) {
        // A .single() query can error if no row is found, which is a valid case.
        // throw if it's not a "not found" error.
        if (propertiesResponse.error.code !== 'PGRST116') {
            throw propertiesResponse.error;
        }
      }

    } catch (err) {
      console.error("Error fetching data: ", err.message);
      setProperties([]);
      setUserName('');
    } finally {
      // Ensure the fetching flag and loading state are always reset.
      isFetching.current = false;
      setLoading(false);
    }
  }, []);
  
  // useFocusEffect runs the fetch logic every time the screen comes into view.
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // This effect sets up the real-time subscription.
  useEffect(() => {
    const channel = supabase
      .channel('public:Property')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        // When the database changes, re-run the guarded fetch logic.
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);
  
  const renderPropertyCard = ({ item }) => {
    const imageUrl = `https://placehold.co/600x400/E5E7EB/111827?text=${encodeURIComponent(item.name || 'Property')}`;
      
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.propertyImage} />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.name}</Text>
          <Text style={styles.propertyAddress} numberOfLines={2}>{item.address}</Text>
          <Text style={styles.propertyDate}>
            Listed: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {userName || 'Owner'}</Text>
        <Text style={styles.headerSubtitle}>Here is your property overview.</Text>
      </View>

      <View style={styles.overviewCard}>
        <Home size={24} color={PALETTE.primary} />
        <View style={styles.overviewTextContainer}>
          <Text style={styles.overviewLabel}>Total Properties</Text>
          <Text style={styles.overviewValue}>{properties.length}</Text>
        </View>
      </View>
      
      <Text style={styles.listTitle}>My Properties</Text>
    </>
  );

  if (loading && properties.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyListText}>You haven't added any properties yet.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContentContainer}
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
    minHeight: 300,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PALETTE.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    marginTop: 4,
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  overviewTextContainer: {
    marginLeft: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: PALETTE.textSecondary,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  propertyImage: {
    width: 100,
    height: '100%',
    backgroundColor: PALETTE.border,
  },
  propertyInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.textPrimary,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 8,
  },
  propertyDate: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    opacity: 0.8,
  },
  emptyListText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    textAlign: 'center',
  },
});

export default PropertyListScreen;