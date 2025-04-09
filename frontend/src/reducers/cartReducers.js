import {
  ADD_TO_CART,
  REMOVE_ITEM_CART,
  SAVE_SHIPPING_INFO,
  GET_CART_ITEMS,
  CLEAR_CART,
  UPDATE_CART_ITEM,
  CART_ERROR
} from "../constants/cartConstants";

const initialState = {
  cartItems: [],
  shippingInfo: {},
  error: null,
  loading: false
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const item = action.payload;
      const isItemExist = state.cartItems.find(i => i.product === item.product);

      if (isItemExist) {
        return {
          ...state,
          cartItems: state.cartItems.map(i =>
            i.product === isItemExist.product ? item : i
          ),
          error: null
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
          error: null
        };
      }

    case UPDATE_CART_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.product === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        error: null
      };

    case REMOVE_ITEM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(i => i.product !== action.payload),
        error: null
      };

    case GET_CART_ITEMS:
      return {
        ...state,
        cartItems: action.payload,
        error: null
      };

    case CLEAR_CART:
      return {
        ...state,
        cartItems: [],
        error: null
      };

    case SAVE_SHIPPING_INFO:
      return {
        ...state,
        shippingInfo: action.payload,
        error: null
      };

    case CART_ERROR:
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};
