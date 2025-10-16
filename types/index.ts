// Types cho sản phẩm
export interface Product {
  id: string | number;
  // API may return productName or productName-like fields
  productName?: string;
  name?: string;
  title?: string;
  description?: string;
  // price may be number and priceFull is formatted string
  price?: number | string;
  priceFull?: string;
  originalPrice?: number;
  // image can be string or object, images is array of objects
  image?: { id?: number; url: string } | string;
  images?: Array<{ id?: number; url: string; publicId?: string }>;
  // category can be object with categoryName
  category?: { id?: number | string; categoryName?: string; categoryStatus?: string; categoryDescription?: string } | string;
  brand?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Types cho giỏ hàng
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Types cho API response
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types cho search params
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Types cho cart operations
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
