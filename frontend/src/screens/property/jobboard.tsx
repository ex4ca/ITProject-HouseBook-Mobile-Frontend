
import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const sampleJobs = [
	{ id: "1", title: "Fix leaking tap", property: "Unit 3, 12 High St" },
	{ id: "2", title: "Replace broken window", property: "House - 45 Park Ave" },
	{ id: "3", title: "Unblock drain", property: "Flat 2B, 9 Ocean Rd" },
];

export default function JobBoard() {
	const navigation = useNavigation();

	const renderItem = ({ item }: { item: { id: string; title: string; property: string } }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => {
				// For now just log and navigate back; replace with real navigation to details when available
				// @ts-ignore
				navigation.navigate("PropertyDetails", { propertyId: item.id });
			}}
		>
			<Text style={styles.title}>{item.title}</Text>
			<Text style={styles.subtitle}>{item.property}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Jobs</Text>
			<FlatList
				data={sampleJobs}
				keyExtractor={(i) => i.id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 24 }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#fff" },
	header: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
	card: { padding: 12, borderRadius: 8, backgroundColor: "#f7f7f7", marginBottom: 10 },
	title: { fontSize: 16, fontWeight: "500" },
	subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
});
