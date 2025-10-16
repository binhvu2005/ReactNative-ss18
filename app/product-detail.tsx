import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product } from "../types";
import { productService } from "../services/api";
import { useCart } from "../contexts/CartContext";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(id!);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // resolve image uri for different product shapes
  const resolveImageUri = (p: Product | null) => {
    if (!p) return undefined;
    if (Array.isArray((p as any).images) && (p as any).images.length > 0) {
      const first = (p as any).images[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') return first.url || undefined;
    }
    if ((p as any).image) {
      const img = (p as any).image;
      if (typeof img === 'string') return img;
      if (typeof img === 'object') return img.url || undefined;
    }
    return undefined;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header tùy chỉnh */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-social-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri: resolveImageUri(product) || "https://via.placeholder.com/300x300?text=No+Image",
          }}
          style={styles.productImage}
        />

        <View style={styles.detailsContainer}>
          {/* Tên và Đánh giá */}
          <Text style={styles.productName}>{product.productName || product.name}</Text>
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" color="#FFC700" size={20} />
              <Text style={styles.ratingText}>
                {product.rating} ({product.reviewCount || 0} đánh giá)
              </Text>
            </View>
          )}

          {/* Mô tả */}
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* Thông tin bổ sung */}
          {product.brand && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thương hiệu:</Text>
              <Text style={styles.infoValue}>{product.brand}</Text>
            </View>
          )}

          {product.category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Danh mục:</Text>
              <Text style={styles.infoValue}>{typeof product.category === 'object' ? (product.category as any).categoryName : product.category}</Text>
            </View>
          )}

          {product.stock !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tồn kho:</Text>
              <Text style={[
                styles.infoValue, 
                product.stock > 0 ? styles.inStock : styles.outOfStock
              ]}>
                {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
              </Text>
            </View>
          )}

          {/* Chọn số lượng */}
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Giá tiền</Text>
          <Text style={styles.priceValue}>
            {product.priceFull ? product.priceFull : (product.price ? `${Number(product.price).toLocaleString('vi-VN')} VNĐ` : '—')}
          </Text>
          {product.originalPrice && product.price && Number(product.originalPrice) > Number(product.price) && (
            <Text style={styles.originalPrice}>
              {Number(product.originalPrice).toLocaleString('vi-VN')} VNĐ
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={24} color="white" />
              <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  productImage: { width: "100%", height: 300, resizeMode: "contain" },
  detailsContainer: { padding: 20 },
  productName: { fontSize: 24, fontWeight: "bold", color: "#222" },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  ratingText: { marginLeft: 8, fontSize: 16, color: "#555" },
  description: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
    marginVertical: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 16, color: "#666" },
  infoValue: { fontSize: 16, fontWeight: "500" },
  inStock: { color: "#22c55e" },
  outOfStock: { color: "#ef4444" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  priceLabel: { fontSize: 16, color: "gray" },
  priceValue: { fontSize: 22, fontWeight: "bold", color: "#e53e3e" },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addToCartText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
