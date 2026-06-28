import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

const calcTotals = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return acc + price * item.qty;
  }, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax, count: items.reduce((a, i) => a + i.qty, 0) };
};

const initialState = {
  items: cartFromStorage,
  ...calcTotals(cartFromStorage),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1, size, color } = action.payload;
      const existingIdx = state.items.findIndex(
        (i) => i._id === product._id && i.size === size && i.color === color
      );
      if (existingIdx >= 0) {
        state.items[existingIdx].qty += qty;
      } else {
        state.items.push({ ...product, qty, size, color });
      }
      const totals = calcTotals(state.items);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(
        (i) => !(i._id === productId && i.size === size && i.color === color)
      );
      const totals = calcTotals(state.items);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQty: (state, action) => {
      const { productId, size, color, qty } = action.payload;
      const item = state.items.find((i) => i._id === productId && i.size === size && i.color === color);
      if (item) item.qty = Math.max(1, qty);
      const totals = calcTotals(state.items);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.shipping = 0;
      state.tax = 0;
      state.total = 0;
      state.count = 0;
      localStorage.removeItem('cart');
    },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
