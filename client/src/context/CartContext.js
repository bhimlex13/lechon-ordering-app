import React, { createContext, useReducer, useContext, useEffect } from 'react';
import api from '../api'; 
import { useAuth } from './AuthContext'; 

// 1. Initial State - ALWAYS EMPTY INITIALLY
const initialState = {
  cartItems: [],
};

// 2. Create Context
export const CartContext = createContext(initialState);

// 3. Custom hook
export const useCart = () => {
  return useContext(CartContext);
};

// 4. Reducer Function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_SET_ITEMS': {
        return { ...state, cartItems: action.payload };
    }

    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existItem = state.cartItems.find((x) => x._id === newItem._id);

      let cartItems;
      if (existItem) {
        cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? { ...newItem, qty: x.qty + newItem.qty } : x
        );
      } else {
        cartItems = [...state.cartItems, newItem];
      }
      return { ...state, cartItems };
    }
    
    case 'CART_UPDATE_QTY': {
      const { _id, qty } = action.payload;
      const cartItems = state.cartItems.map((x) =>
        x._id === _id ? { ...x, qty: qty } : x
      );
      return { ...state, cartItems };
    }

    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cartItems.filter(
        (x) => x._id !== action.payload._id
      );
      return { ...state, cartItems };
    }
    
    case 'CART_CLEAR': {
      return { ...state, cartItems: [] };
    }
    
    default:
      return state;
  }
};

// 5. Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { userInfo } = useAuth(); 

  // NOTE: We NO LONGER use localStorage. Cart is 100% server-side.

  // A. Load Cart on Login
  useEffect(() => {
    const fetchUserCart = async () => {
        // Check if we are on the URL returned by PayMongo (Success Page) to prevent resurrection
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment_success')) {
            return; 
        }

        try {
            // Just GET the cart. No syncing local items.
            const { data } = await api.get('/api/users/cart');
            dispatch({ type: 'CART_SET_ITEMS', payload: data });
        } catch (error) {
            console.error("Failed to fetch cart", error);
        }
    };

    if (userInfo) {
        fetchUserCart();
    } else {
        // If logged out, clear the cart view
        dispatch({ type: 'CART_CLEAR' });
    }
    // eslint-disable-next-line
  }, [userInfo]); 


  // --- Helper to Update Server ---
  const updateServerCart = async (newCartItems) => {
      if (userInfo) {
          try {
              await api.put('/api/users/cart', { cartItems: newCartItems });
          } catch (error) {
              console.error("Failed to update server cart", error);
          }
      }
  };

  // --- Action Functions ---

  const addItemToCart = async (item, qty) => {
    // NOTE: We don't check login here because the UI will block access.
    // But as a safeguard, if no userInfo, we do nothing (or update local state transiently).
    
    const newItem = { ...item, qty: Number(qty) };
    const existItem = state.cartItems.find((x) => x._id === newItem._id);
    let newCartItems;
    
    if (existItem) {
        newCartItems = state.cartItems.map((x) =>
            x._id === existItem._id ? { ...newItem, qty: x.qty + newItem.qty } : x
        );
    } else {
        newCartItems = [...state.cartItems, newItem];
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: newItem });
    
    if (userInfo) {
        await updateServerCart(newCartItems);
    }
  };
  
  const updateCartQty = async (_id, qty) => {
    const newCartItems = state.cartItems.map((x) =>
        x._id === _id ? { ...x, qty: Number(qty) } : x
    );

    dispatch({ type: 'CART_UPDATE_QTY', payload: { _id, qty: Number(qty) } });
    
    if (userInfo) {
        await updateServerCart(newCartItems);
    }
  };

  const removeItemFromCart = async (_id) => {
    const newCartItems = state.cartItems.filter((x) => x._id !== _id);

    dispatch({ type: 'CART_REMOVE_ITEM', payload: { _id } });
    
    if (userInfo) {
        await updateServerCart(newCartItems);
    }
  };
  
  const clearCart = async () => {
    dispatch({ type: 'CART_CLEAR' });
    if (userInfo) {
        try {
             await api.put('/api/users/cart', { cartItems: [] });
        } catch (err) {
             console.error("Failed to clear server cart", err);
        }
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state, 
        addItemToCart,
        updateCartQty,
        removeItemFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};