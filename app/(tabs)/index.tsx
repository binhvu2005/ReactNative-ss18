import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dữ liệu fix cứng
const BANNERS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz4dHcWY64rkXUbh43-5OxxHjetnb6rhTWn-X1_LUl54k_A1nh2Z4_4gTVXQVkCEKUUGw&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNimCQr3YssnWmF5z5N4JMgHfmrijmlnz5tTGHJ_4_GMudR4qarFHhKWoAidEHdLap54g&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRni2ktUQi1PLZk57NlLUwrLndAhG70WSEfoK4zt0aNnwFazxVHBEiIvXU1eiu9XAlA-Og&usqp=CAU",
];
const CATEGORIES = [
  { name: "Thời trang", icon: "shirt-outline" },
  { name: "Điện tử", icon: "hardware-chip-outline" },
  { name: "Trang sức", icon: "diamond-outline" },
  { name: "Gia dụng", icon: "home-outline" },
  { name: "Sách", icon: "book-outline" },
];
const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Áo thun Premium Slim Fit",
    price: 350000,
    image:
      "https://tourandtate.com/vi/cdn/shop/files/2_7489a4ea-74f4-4a95-8729-945b68c22d66.jpg?v=1759694762",
  },
  {
    id: "2",
    name: "Ổ cứng di động WD 2TB",
    price: 1850000,
    image:
      "https://bizweb.dktcdn.net/100/433/921/products/o-cung-di-dong-ssd-western-elements-se-2tb-1.jpg?v=1715065532673",
  },
  {
    id: "3",
    name: "Vòng tay rồng John Hardy",
    price: 12500000,
    image: "https://m.media-amazon.com/images/I/61ibX4qwYnL._AC_SL1500_.jpg",
  },
];

const { width: screenWidth } = Dimensions.get("window");

// --- Các Component con ---

const HomeHeader = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.greeting}>Chào buổi sáng</Text>
      <Text style={styles.userName}>Quý</Text>
    </View>
    <TouchableOpacity>
      <Ionicons name="notifications-outline" size={26} color="#333" />
    </TouchableOpacity>
  </View>
);

const SearchBar = () => (
  <View style={styles.searchContainer}>
    <Ionicons name="search-outline" size={22} color="#888" />
    <TextInput placeholder="Tìm kiếm sản phẩm..." style={styles.searchInput} />
  </View>
);

const PromoCarousel = () => (
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    style={styles.carouselContainer}
  >
    {BANNERS.map((uri, index) => (
      <Image key={index} source={{ uri }} style={styles.bannerImage} />
    ))}
  </ScrollView>
);

const CategoryList = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Danh mục</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {CATEGORIES.map((category) => (
        <TouchableOpacity key={category.name} style={styles.categoryCard}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name={category.icon as any} size={28} color="#007AFF" />
          </View>
          <Text style={styles.categoryText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const FeaturedProducts = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {FEATURED_PRODUCTS.map((item) => (
        <TouchableOpacity key={item.id} style={styles.productCard}>
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// --- Màn hình chính ---

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <SearchBar />
        <PromoCarousel />
        <CategoryList />
        <FeaturedProducts />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- StyleSheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#888",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  // SearchBar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 15,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  // PromoCarousel
  carouselContainer: {
    marginTop: 20,
  },
  bannerImage: {
    width: screenWidth - 40,
    height: 180,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  // Section
  section: {
    marginTop: 30,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  // CategoryList
  categoryCard: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#f0f2f5",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  // FeaturedProducts
  productCard: {
    width: 160,
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImage: {
    width: "100%",
    height: 100,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53e3e",
    marginTop: 5,
  },
});
