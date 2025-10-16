import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product } from "../../types";
import { productService } from "../../services/api";
import { useCart } from "../../contexts/CartContext";

type ProductCardProps = {
  item: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(item, 1);
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  };

  const handleProductPress = () => {
    router.push({
      pathname: "/product-detail",
      params: { id: String(item.id) },
    });
  };

  // resolve image URI robustly: images can be array of objects or strings, image can be object or string
  const resolveImageUri = () => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') return first.url || undefined;
    }
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (typeof item.image === 'object') return item.image.url || undefined;
    }
    return undefined;
  };

  const imageUri = resolveImageUri();

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleProductPress}>
        <Image
          source={{
            uri: !imageFailed && imageUri ? imageUri : "https://via.placeholder.com/150x150?text=No+Image",
          }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
        />
        {__DEV__ && (
          <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }} numberOfLines={1}>
            {imageUri || 'no-image-uri'}
          </Text>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {item.productName || item.name || item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {typeof item.category === 'object' ? item.category?.categoryName : (item.category || '')}
        </Text>
        <Text style={styles.price}>
          {item.priceFull || (item.price ? `${Number(item.price).toLocaleString('vi-VN')} VNĐ` : '—')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, adding && styles.addButtonDisabled]}
        onPress={handleAddToCart}
        disabled={adding}
      >
        {adding ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Dùng API search-paging (phân trang)

  const loadProducts = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // new endpoint returns Product[] directly
      const productsArray = await productService.getProducts();
      setProducts(productsArray || []);
    } catch (_error) {
      console.error('Error loading products:', _error);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProducts(1, true);
  };

  // Không dùng loadMore khi đã có đủ dữ liệu cơ bản

  useEffect(() => {
    loadProducts();
  }, []);

  // Footer không dùng nữa

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Cửa hàng" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Cửa hàng" }} />
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard item={item} />}
  keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={null}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listContainer: { padding: 8 },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 8,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: { width: "100%", height: 120, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: "600", textAlign: "center", height: 40 },
  subtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53e3e",
    marginVertical: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: { color: "white", fontWeight: "bold", marginLeft: 4 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
