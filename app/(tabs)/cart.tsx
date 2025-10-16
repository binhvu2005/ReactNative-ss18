import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartItem as CartItemType } from "../../types";
import { useCart } from "../../contexts/CartContext";

type CartItemProps = { 
  item: CartItemType;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
};

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: () => onRemove(item.id)
        },
      ]
    );
  };

  return (
    <View style={styles.itemContainer}>
      <Image
        source={{ 
          uri: item.product.image || "https://via.placeholder.com/80x80?text=No+Image" 
        }}
        style={styles.itemImage}
        resizeMode="contain"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString("vi-VN")} VNĐ
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
          >
            <Ionicons 
              name="remove-circle-outline" 
              size={28} 
              color={item.quantity <= 1 ? "#ccc" : "#555"} 
            />
          </TouchableOpacity>
          {updating ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.quantityText}>{item.quantity}</Text>
          )}
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating}
          >
            <Ionicons name="add-circle-outline" size={28} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleRemove} disabled={updating}>
        <Ionicons name="trash-outline" size={24} color="#e53e3e" />
      </TouchableOpacity>
    </View>
  );
};

type CartSummaryProps = {
  subtotal: number;
  shippingFee: number;
  onShippingFeeChange: (fee: number) => void;
  onClearCart: () => void;
};

const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  shippingFee, 
  onShippingFeeChange,
  onClearCart 
}) => {
  const total = subtotal + shippingFee;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tạm tính</Text>
        <Text style={styles.summaryValue}>
          {subtotal.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
        <TextInput 
          keyboardType="numeric" 
          style={styles.textInput}
          value={shippingFee.toString()}
          onChangeText={(text) => onShippingFeeChange(parseInt(text) || 0)}
          placeholder="0"
        />
      </View>
      <View style={styles.separator} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        <Text style={styles.totalValue}>
          {total.toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
      
      {/* Clear cart button */}
      <TouchableOpacity style={styles.clearCartButton} onPress={onClearCart}>
        <Ionicons name="trash-outline" size={20} color="#e53e3e" />
        <Text style={styles.clearCartText}>Xóa toàn bộ giỏ hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CartScreen() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const [shippingFee, setShippingFee] = useState(0);
  const [clearingCart, setClearingCart] = useState(false);

  const handleClearCart = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              setClearingCart(true);
              await clearCart();
              Alert.alert("Thành công", "Đã xóa toàn bộ giỏ hàng");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa giỏ hàng");
            } finally {
              setClearingCart(false);
            }
          }
        },
      ]
    );
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateCartItem(cartItemId, quantity);
    } catch (error) {
      throw error;
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      Alert.alert("Thành công", "Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa sản phẩm");
    }
  };

  if (loading && !cart) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Giỏ hàng của bạn" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Giỏ hàng của bạn" }} />
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem 
            item={item} 
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        )}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          cartItems.length > 0 ? (
            <CartSummary 
              subtotal={subtotal}
              shippingFee={shippingFee}
              onShippingFeeChange={setShippingFee}
              onClearCart={handleClearCart}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
            <Text style={styles.emptySubText}>
              Hãy thêm một số sản phẩm để bắt đầu mua sắm!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  // CartItem styles
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#e53e3e" },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityText: { fontSize: 18, fontWeight: "bold", marginHorizontal: 15 },
  // Summary styles
  summaryContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 16, color: "#666" },
  summaryValue: { fontSize: 16, fontWeight: "500" },
  separator: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#e53e3e" },
  clearCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e53e3e",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 15,
  },
  clearCartText: {
    color: "#e53e3e",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  // Empty state styles
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: { marginTop: 10, fontSize: 16, color: "#888" },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
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
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 150,
    height: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#333",
  },
});
