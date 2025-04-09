import axios from "axios";
import {
  ADD_TO_CART,
  REMOVE_ITEM_CART,
  SAVE_SHIPPING_INFO,
  GET_CART_ITEMS,
  CLEAR_CART,
  UPDATE_CART_ITEM,
  CART_ERROR
} from "../constants/cartConstants";

// Add item to cart
export const addItemToCart = (id, quantity) => async (dispatch, getState) => {
  try {
    const { data } = await axios.get(`/api/v1/product/${id}`);
    const { isAuthenticated } = getState().auth;

    if (!isAuthenticated) {
      return;
    }

    const cartItem = {
      product: data.product._id,
      name: data.product.name,
      price: data.product.price,
      image: data.product.images[0].url,
      stock: data.product.stock,
      quantity
    };

    // Add to database since user is authenticated
    await axios.post("/api/v1/cart/add", {
      productId: id,
      quantity
    });

    dispatch({
      type: ADD_TO_CART,
      payload: cartItem
    });

    // Update localStorage after state update
    const { cart: { cartItems } } = getState();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch (error) {
    console.error('Add to cart error:', error);
    dispatch({
      type: CART_ERROR,
      payload: error.response?.data?.message || "Failed to add item to cart"
    });
  }
};

// Remove item from cart
export const removeItemFromCart = (id) => async (dispatch, getState) => {
  try {
    const { isAuthenticated } = getState().auth;

    if (!isAuthenticated) {
      return;
    }

    await axios.delete(`/api/v1/cart/item/${id}`);
    
    dispatch({
      type: REMOVE_ITEM_CART,
      payload: id
    });

    // Update localStorage after state update
    const { cart: { cartItems } } = getState();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch (error) {
    console.error('Remove from cart error:', error);
    dispatch({
      type: CART_ERROR,
      payload: error.response?.data?.message || "Failed to remove item from cart"
    });
  }
};

// Update cart item quantity
export const updateCartItem = (id, quantity) => async (dispatch, getState) => {
  try {
    const { isAuthenticated } = getState().auth;

    if (!isAuthenticated) {
      return;
    }

    await axios.put(`/api/v1/cart/item/${id}`, { quantity });

    dispatch({
      type: UPDATE_CART_ITEM,
      payload: { id, quantity }
    });

    // Update localStorage after state update
    const { cart: { cartItems } } = getState();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch (error) {
    console.error('Update cart error:', error);
    dispatch({
      type: CART_ERROR,
      payload: error.response?.data?.message || "Failed to update cart item"
    });
  }
};

// Get cart items
export const getCartItems = () => async (dispatch, getState) => {
  try {
    const { isAuthenticated } = getState().auth;

    if (!isAuthenticated) {
      const localCartItems = localStorage.getItem("cartItems");
      dispatch({
        type: GET_CART_ITEMS,
        payload: localCartItems ? JSON.parse(localCartItems) : []
      });
      return;
    }

    const { data } = await axios.get("/api/v1/cart/items");
    console.log('Cart items from server:', data);

    // Format cart items to match the required structure
    const formattedCartItems = data.cartItems.map(item => {
      if (!item.productId) {
        console.warn('Product data missing for cart item:', item);
        return null;
      }
      return {
        product: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.images?.[0]?.url || '',
        stock: item.productId.stock,
        quantity: item.quantity
      };
    }).filter(item => item !== null); // Remove any null items

    dispatch({
      type: GET_CART_ITEMS,
      payload: formattedCartItems
    });

    // Update localStorage with formatted items
    localStorage.setItem("cartItems", JSON.stringify(formattedCartItems));
  } catch (error) {
    console.error('Get cart items error:', error);
    // Try to get items from localStorage as fallback
    const localCartItems = localStorage.getItem("cartItems");
    dispatch({
      type: GET_CART_ITEMS,
      payload: localCartItems ? JSON.parse(localCartItems) : []
    });
    dispatch({
      type: CART_ERROR,
      payload: error.response?.data?.message || "Failed to fetch cart items"
    });
  }
};

// Clear cart
export const clearCart = () => async (dispatch, getState) => {
  try {
    const { isAuthenticated } = getState().auth;

    if (isAuthenticated) {
      await axios.delete("/api/v1/cart/clear");
    }

    dispatch({
      type: CLEAR_CART
    });

    localStorage.removeItem("cartItems");
  } catch (error) {
    console.error('Clear cart error:', error);
    dispatch({
      type: CART_ERROR,
      payload: error.response?.data?.message || "Failed to clear cart"
    });
  }
};

// Save shipping info
export const saveShippingInfo = (data) => async (dispatch) => {
  try {
    dispatch({
      type: SAVE_SHIPPING_INFO,
      payload: data
    });

    localStorage.setItem("shippingInfo", JSON.stringify(data));
  } catch (error) {
    console.error('Save shipping info error:', error);
    dispatch({
      type: CART_ERROR,
      payload: "Failed to save shipping information"
    });
  }
};
