import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartService } from '../services/api';

// Types cho Cart Context
interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  refreshCart: () => Promise<void>;
}

// Action types
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { cartItemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState = {
  cart: null,
  loading: false,
  error: null,
};

// Reducer
const cartReducer = (state: typeof initialState, action: CartAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART': {
      const incoming = action.payload;
      const safeItems = incoming?.items ?? [];
      const safeTotalItems = incoming?.totalItems ?? safeItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
      const safeTotalAmount = incoming?.totalAmount ?? safeItems.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 0)), 0);
      return { 
        ...state, 
        cart: incoming
          ? { ...incoming, items: safeItems, totalItems: safeTotalItems, totalAmount: safeTotalAmount }
          : null,
        error: null 
      };
    }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'ADD_TO_CART': {
      const existingCart = state.cart ?? {
        id: 'local-cart',
        userId: 'local',
        items: [] as CartItem[],
        totalItems: 0,
        totalAmount: 0,
      };
      const currentItems = existingCart.items ?? [];
      return {
        ...state,
        cart: {
          ...existingCart,
          items: [...currentItems, action.payload],
          totalItems: (existingCart.totalItems ?? 0) + (action.payload.quantity || 0),
          totalAmount: (existingCart.totalAmount ?? 0) + ((action.payload.price || 0) * (action.payload.quantity || 0)),
        },
      };
    }
    
    case 'UPDATE_CART_ITEM': {
      if (!state.cart) return state;
      const sourceItems = state.cart.items ?? [];
      const updatedItems = sourceItems.map(item =>
        item.id === action.payload.cartItemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const totalItems = updatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalAmount = updatedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          totalItems,
          totalAmount,
        },
      };
    }
    
    case 'REMOVE_FROM_CART': {
      if (!state.cart) return state;
      const currentItems = state.cart.items ?? [];
      const filteredItems = currentItems.filter(item => item.id !== action.payload);
      const newTotalItems = filteredItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const newTotalAmount = filteredItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          totalItems: newTotalItems,
          totalAmount: newTotalAmount,
        },
      };
    }
    
    case 'CLEAR_CART': {
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      };
    }
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error: any) {
      // Nếu API cart không tồn tại, khởi tạo cart rỗng
      if (error.message?.includes('Cart API not available')) {
        console.warn('Using local cart state management');
        dispatch({ 
          type: 'SET_CART', 
          payload: {
            id: 'local-cart',
            userId: '17',
            items: [],
            totalItems: 0,
            totalAmount: 0,
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể tải giỏ hàng' });
        console.error('Error loading cart:', error);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartItem = await cartService.addToCart({
        productId: product.id,
        quantity,
      });
      
      // Nếu API thành công, reload cart
      if (cartItem.id && !cartItem.id.startsWith('mock-')) {
        await loadCart();
      } else {
        // Nếu sử dụng mock data, thêm vào local state
        dispatch({ type: 'ADD_TO_CART', payload: cartItem });
      }
    } catch (error: any) {
      if (error.message?.includes('Cart API not available')) {
        // Sử dụng local state management
        const cartItem: CartItem = {
          id: `local-${Date.now()}`,
          productId: product.id,
          product: product,
          quantity: quantity,
          price: product.price,
        };
        dispatch({ type: 'ADD_TO_CART', payload: cartItem });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể thêm sản phẩm vào giỏ hàng' });
        console.error('Error adding to cart:', error);
        throw error;
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.updateCartItem(cartItemId, { quantity });
      await loadCart(); // Reload cart to get updated data
    } catch (error: any) {
      if (error.message?.includes('Cart API not available')) {
        // Sử dụng local state management
        dispatch({ type: 'UPDATE_CART_ITEM', payload: { cartItemId, quantity } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể cập nhật số lượng sản phẩm' });
        console.error('Error updating cart item:', error);
        throw error;
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.removeFromCart(cartItemId);
      await loadCart(); // Reload cart to get updated data
    } catch (error: any) {
      if (error.message?.includes('Cart API not available')) {
        // Sử dụng local state management
        dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể xóa sản phẩm khỏi giỏ hàng' });
        console.error('Error removing from cart:', error);
        throw error;
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.clearCart();
      await loadCart(); // Reload cart to get updated data
    } catch (error: any) {
      if (error.message?.includes('Cart API not available')) {
        // Sử dụng local state management
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Không thể xóa toàn bộ giỏ hàng' });
        console.error('Error clearing cart:', error);
        throw error;
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getTotalItems = (): number => {
    return state.cart?.totalItems || 0;
  };

  const getTotalAmount = (): number => {
    return state.cart?.totalAmount || 0;
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const value: CartContextType = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalAmount,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
