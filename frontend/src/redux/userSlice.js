import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    userCity: null,
    userState: null,
    userAddress: null,
    shopsInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    outOfStockItems: {},
    totalAmount: 0,
    myOrders: [],
    searchItems: [],
    socket: null,
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserCity: (state, action) => {
      state.userCity = action.payload;
    },
    setUserState: (state, action) => {
      state.userState = action.payload;
    },
    setUserAddress: (state, action) => {
      state.userAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setItemsOutOfStock: (state, action) => {
  const { itemId, outOfStock } = action.payload;
  state.outOfStockItems[itemId] = outOfStock;
},

    addToCart: (state, action) => {
      const item = action.payload;
      if (!Array.isArray(state.cartItems)) state.cartItems = [];
      const existingItem = state.cartItems.find((i) => i.id === item.id);
      if (existingItem) existingItem.quantity += item.quantity;
      else state.cartItems.push({ ...item });
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
        state.totalAmount = state.cartItems.reduce(
          (sum, i) => sum + i.quantity * i.price,
          0
        );
      }
    },
    removeFromCart: (state, action) => {
      const { id } = action.payload;
      state.cartItems = state.cartItems.filter((i) => i.id !== id);
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );
    },
    setMyOrders: (state, action) => {
      state.myOrders = action.payload || [];
    },
    addMyOrders: (state, action) => {
      state.myOrders = [...(state.myOrders || []), ...action.payload];
    },

    // 🔹 Corrected reducer for manual status update
  updateOrderStatus: (state, action) => {
  const { orderId, shopId, status } = action.payload;

  const order = state.myOrders.find((o) => o._id == orderId);
  if (order && order.shopOrders) {
    // agar ek hi shopOrder hai (object form)
    if (!Array.isArray(order.shopOrders)) {
      if (order.shopOrders.shop._id == shopId) {
        order.shopOrders.status = status;
      }
    } 
    // agar multiple shopOrders array form me ho
    else {
      const shopOrder = order.shopOrders.find(
        (so) => so.shop._id == shopId
      );
      if (shopOrder) {
        shopOrder.status = status;
      }
    }
  }
},


    // 🔹 Corrected reducer for socket updates
    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      if (!state.myOrders) return;
      const order = state.myOrders.find(o => o._id == orderId);
      if (!order || !order.shopOrders) return;

      const shopOrder = order.shopOrders.find(so => so.shop._id == shopId);
      if (shopOrder) shopOrder.status = status;
    },

    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
    
  },
});

export const {
  setUserData,
  setUserCity,
  setUserState,
  setUserAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  setItemsOutOfStock,
  addToCart,
  updateQuantity,
  removeFromCart,
  setMyOrders,
  addMyOrders,
  updateOrderStatus,
  updateRealtimeOrderStatus,
  setSearchItems,
  setSocket,
} = userSlice.actions;

export default userSlice.reducer;
