import axios from 'axios';
import {
  Product,
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest
} from '../types';
import { AUTH_CONFIG, getAuthHeader, isTokenValid } from '../config/auth';

// NOTE: Per request, we're focusing on products first. The cart API
// is intentionally stubbed below (disabled) to avoid affecting product
// development. Replace the stubs with the real implementation when ready.

// Tạo axios instance — xây dựng baseURL một cách an toàn để tránh duplicate /api/v1
const _normalizedBase = AUTH_CONFIG.baseURL.replace(/\/$/, '');
const finalBase = _normalizedBase.endsWith('/api/v1') ? _normalizedBase : `${_normalizedBase}/api/v1`;

const api = axios.create({
  baseURL: finalBase,
  timeout: AUTH_CONFIG.timeout,
  headers: {
    ...AUTH_CONFIG.defaultHeaders,
    ...getAuthHeader(),
  },
});

// Cart API may live under root (no /api/v1). Build cartBase by removing /api/v1
const cartBase = _normalizedBase.endsWith('/api/v1') ? _normalizedBase.replace(/\/api\/v1$/, '') : _normalizedBase;
const cartApi = axios.create({
  baseURL: cartBase,
  timeout: AUTH_CONFIG.timeout,
  headers: {
    ...AUTH_CONFIG.defaultHeaders,
    ...getAuthHeader(),
  },
});

// Interceptor để xử lý request (thêm token nếu cần)
api.interceptors.request.use(
  (config) => {
    // Kiểm tra token validity trước khi gửi request
    if (!isTokenValid()) {
      console.warn('Token may be expired, request may fail');
    }

    // Token đã được thêm vào headers mặc định, không cần xử lý thêm
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Xử lý lỗi authentication
    if (error.response?.status === 401) {
      console.error('Authentication failed - Token may be expired');
      // Có thể thêm logic để refresh token hoặc redirect đến login
    }

    return Promise.reject(error);
  }
);

// API Services
export const productService = {
  // Lấy danh sách sản phẩm. Thử nhiều endpoint nếu endpoint 'all' không tồn tại.
  getProducts: async (): Promise<Product[]> => {
    const endpoints = ['/products/all', '/products', '/products/search-paging'];
    let lastError: any = null;

    for (const ep of endpoints) {
      try {
        const res: any = await api.get(ep);
        // api interceptor returns response.data already. Normalize result:
        if (Array.isArray(res)) {
          return res as Product[];
        }
        // If paginated response like { data: [...] }
        if (res && res.data && Array.isArray(res.data)) {
          return res.data as Product[];
        }
        // If single object or other, attempt to pull items array
        if (res && typeof res === 'object') {
          // try common keys
          if (Array.isArray(res.items)) return res.items as Product[];
          if (Array.isArray(res.products)) return res.products as Product[];
        }
        // If we reach here, response shape unexpected; return as empty array
        return Array.isArray(res) ? res : [];
      } catch (err: any) {
        lastError = err;
        const status = err?.response?.status;
        console.warn(`Endpoint ${ep} failed:`, status ?? err?.message ?? err);
        // try next endpoint
      }
    }

    console.error('All product endpoints failed', lastError);
    throw lastError;
  },

  // Lấy thông tin chi tiết sản phẩm
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response as unknown as Product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm (trả về mảng Product)
  searchProducts: async (query: string, params: Record<string, any> = {}): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products/search-paging', {
        params: { ...params, search: query }
      });
      return response as unknown as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};

// Provide a lightweight in-memory cart while the real cart API is not used.
let localCart: Cart = {
  id: 'local-cart',
  userId: 'local-user',
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const recalcCart = () => {
  localCart.totalItems = localCart.items.reduce((s, it) => s + it.quantity, 0);
  localCart.totalAmount = localCart.items.reduce((s, it) => s + (it.price * it.quantity), 0);
};

export const cartService = {
  getCart: async (): Promise<Cart> => {
    // return a copy to avoid accidental external mutation
    return JSON.parse(JSON.stringify(localCart));
  },

  addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
    // Try to fetch product details from productService; if fails, create minimal item
    let product: any = null;
    try {
      product = await productService.getProductById(String(data.productId));
    } catch (e) {
      product = { id: data.productId, name: 'Unknown', price: typeof data.productId === 'number' ? Number(data.productId) : 0 };
    }

    const existing = localCart.items.find(it => it.productId === String(data.productId));
    if (existing) {
      existing.quantity += data.quantity;
    } else {
      const newItem: CartItem = {
        id: `local-${Date.now()}`,
        productId: String(data.productId),
        product: product as any,
        quantity: data.quantity,
        price: (product?.price && typeof product.price === 'number') ? product.price : (product?.price ? Number(product.price) : 0),
      };
      localCart.items.push(newItem);
    }

    recalcCart();
    return localCart.items[localCart.items.length - 1];
  },

  updateCartItem: async (cartItemId: string, data: UpdateCartItemRequest): Promise<CartItem> => {
    const item = localCart.items.find(it => it.id === cartItemId);
    if (!item) throw new Error('Cart item not found');
    item.quantity = data.quantity;
    recalcCart();
    return item;
  },

  removeFromCart: async (cartItemId: string): Promise<void> => {
    localCart.items = localCart.items.filter(it => it.id !== cartItemId);
    recalcCart();
  },

  clearCart: async (): Promise<void> => {
    localCart.items = [];
    recalcCart();
  },
};

export default api;
