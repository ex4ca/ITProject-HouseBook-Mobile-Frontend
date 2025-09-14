import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Plus, Edit } from 'lucide-react-native';

// Import the new, separated logic and styles
import { fetchAssetDetails, addHistoryEntry } from '../../services/AssetService';
import { componentDetailsStyles as styles } from '../../styles/componentDetailsStyles';
import { PALETTE } from '../../styles/palette';
import type { AssetDetails, HistoryEntry } from '../../types';
import { Button } from '../../components';

// --- SUB-COMPONENTS ---

const HistoryEntryCard = ({ entry }: { entry: HistoryEntry }) => (
    <View style={styles.historyEntry}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.entryContent}>
        <Text style={styles.entryTitle}>{entry.change_description}</Text>
        {/* Render specifications if they exist */}
      </View>
    </View>
);

const AddEntryModal = ({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: (description: string) => void; }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!description.trim()) {
            Alert.alert("Missing Information", "Please provide a description for the entry.");
            return;
        }
        onSubmit(description);
        setDescription(''); // Reset after submit
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add New History Entry</Text>
                    <TextInput
                        style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="Description of work or update..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                    <View style={styles.modalButtons}>
                        <Button text="Cancel" onPress={onClose} style={{ backgroundColor: PALETTE.background }} textStyle={{ color: PALETTE.textPrimary }} />
                        <Button text="Add Entry" onPress={handleSubmit} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ComponentDetails = ({ route, navigation }: { route: any; navigation: any }) => {
  const { assetId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDataAsync = async () => {
        if (!assetId) {
          if (isActive) setLoading(false);
          return;
        }
        if (isActive) setLoading(true);
        try {
          const data = await fetchAssetDetails(assetId);
          if (isActive) {
            setAssetDetails(data);
          }
        } catch (error: any) {
          if (isActive) {
            Alert.alert("Error", "Could not load asset details.");
            console.error(error.message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadDataAsync();

      return () => {
        isActive = false;
      };
    }, [assetId])
  );
  
  const handleAddEntry = async (description: string) => {
      if (!assetId) return;
      try {
          await addHistoryEntry(assetId, description, {});
          setIsAddingEntry(false);
          // Reload data by calling fetchAssetDetails again
          const data = await fetchAssetDetails(assetId);
          setAssetDetails(data);
      } catch (error: any) {
          Alert.alert("Error", error.message);
      }
  };

  if (loading) {
    return (<SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={PALETTE.primary} /></SafeAreaView>);
  }

  if (!assetDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Text>Back</Text></TouchableOpacity></View>
        <View style={styles.centerContainer}><Text>Asset not found.</Text></View>
      </SafeAreaView>
    );
  }
  
  const { description, ChangeLog, Spaces } = assetDetails;
  const breadcrumb = `${Spaces.Property.name} / ${Spaces.name}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={PALETTE.textPrimary} />
          <Text style={styles.backButtonText}>{breadcrumb}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{description}</Text>
        
        {ChangeLog.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                   .map((entry) => <HistoryEntryCard key={entry.id} entry={entry} />)}
      </ScrollView>

      <TouchableOpacity style={styles.floatingAddButton} onPress={() => setIsAddingEntry(true)}>
        <Edit size={24} color={PALETTE.card} />
      </TouchableOpacity>

      <AddEntryModal
        visible={isAddingEntry}
        onClose={() => setIsAddingEntry(false)}
        onSubmit={handleAddEntry}
      />
    </SafeAreaView>
  );
};

export default ComponentDetails;