import { Stack } from "expo-router";
import "react-native-reanimated";
import { CartProvider } from "../contexts/CartContext";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Màn hình chi tiết sản phẩm, hiển thị dạng modal */}
            <Stack.Screen
              name="product-detail"
              options={{
                presentation: "modal",
                headerShown: false, // Ẩn header mặc định để tự custom
              }}
            />
          </Stack>
        </CartProvider>
      </QueryClientProvider>
    </Provider>
  );
}
