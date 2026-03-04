import React, { useState } from "react";
import { View, Text, Image, FlatList, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { PALETTE } from "../styles/palette";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: { id: string; uri: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No images uploaded yet.</Text>
      </View>
    );
  }

  const formattedImages = images.map((img) => ({ uri: img.uri }));

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={images}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.imageSlide} 
            activeOpacity={0.9}
            onPress={() => {
              setCurrentImageIndex(index);
              setIsVisible(true);
            }}
          >
            <Image source={{ uri: item.uri }} style={styles.propertyImage} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />

      <ImageViewing
        images={formattedImages}
        imageIndex={currentImageIndex}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
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
