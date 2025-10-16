import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) {
      const item = state.items.find((i) => i.id === action.payload.cartItemId);
      if (item) item.quantity = action.payload.quantity;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;


