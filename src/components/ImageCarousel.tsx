import React from "react";
import { View, Text, Image, FlatList, Dimensions, StyleSheet } from "react-native";
import { PALETTE } from "../styles/palette";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: { id: string; uri: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No images uploaded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={images}
        renderItem={({ item }) => (
          <View style={styles.imageSlide}>
            <Image source={{ uri: item.uri }} style={styles.propertyImage} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: 250,
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  centerContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  imageSlide: {
    width: width - 40, // Account for parent padding (20 on each side in General screens)
    justifyContent: "center",
    alignItems: "center",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
});
