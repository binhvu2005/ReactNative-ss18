import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Component cho mỗi dòng trong menu
type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  name: string;
  onPress?: () => void;
};
const MenuItem: React.FC<MenuItemProps> = ({ icon, name, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon} size={22} color="#007AFF" />
    </View>
    <Text style={styles.menuText}>{name}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
  </TouchableOpacity>
);

// Component Header chứa avatar và tên
const ProfileHeader = () => (
  <TouchableOpacity style={styles.profileContainer}>
    <Image
      source={{ uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }}
      style={styles.avatar}
    />
    <View style={styles.profileInfo}>
      <Text style={styles.userName}>Ngọ Văn Quý</Text>
      <Text style={styles.userEmail}>ngovanquy@example.com</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
  </TouchableOpacity>
);

// Component chính của màn hình
export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Tài khoản" }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader />

        {/* Phần Quản lý Tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
          <View style={styles.menuWrapper}>
            <MenuItem
              icon="receipt-outline"
              name="Lịch sử đơn hàng"
              onPress={() => {}}
            />
            <MenuItem
              icon="location-outline"
              name="Địa chỉ nhận hàng"
              onPress={() => {}}
            />
            <MenuItem
              icon="card-outline"
              name="Thông tin thanh toán"
              onPress={() => {}}
            />
            <MenuItem
              icon="star-outline"
              name="Đánh giá của tôi"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Phần Cài đặt & Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CÀI ĐẶT & HỖ TRỢ</Text>
          <View style={styles.menuWrapper}>
            <MenuItem
              icon="settings-outline"
              name="Cài đặt"
              onPress={() => {}}
            />
            <MenuItem
              icon="help-circle-outline"
              name="Trung tâm hỗ trợ"
              onPress={() => {}}
            />
            <MenuItem icon="call-outline" name="Liên hệ" onPress={() => {}} />
          </View>
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#e53e3e" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Profile Header
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  // Sections and Menu
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuWrapper: {
    backgroundColor: "white",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuIconContainer: {
    width: 30,
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    marginVertical: 20,
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#e53e3e",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
