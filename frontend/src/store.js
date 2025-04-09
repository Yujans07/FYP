import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import {
  productsReducer,
  newProductReducer,
  productDetailsReducer,
  productReducer,
  newReviewReducer,
  productReviewsReducer,
  reviewReducer,
  selectedProductsReducer,
  randomProductsReducer,
} from "./reducers/productReducers";

import {
  authReducer,
  userReducer,
  forgotPasswordReducer,
  allUsersReducer,
  userDetailsReducer,
  updatePasswordReducer,
} from "./reducers/userReducers";

import { cartReducer } from "./reducers/cartReducers";

import {
  newOrderReducer,
  myOrdersReducer,
  orderDetailsReducer,
  allOrdersReducer,
  orderReducer,
} from "./reducers/orderReducers";

import {
  newExchangeReducer,
  myExchangesReducer,
  exchangesReducer,
  exchangeReducer
} from "./reducers/exchangeReducers";

const reducer = combineReducers({
  products: productsReducer,
  productDetails: productDetailsReducer,
  newProduct: newProductReducer,
  product: productReducer,
  productReviews: productReviewsReducer,
  review: reviewReducer,
  auth: authReducer,
  user: userReducer,
  allUsers: allUsersReducer,
  userDetails: userDetailsReducer,
  forgotPassword: forgotPasswordReducer,
  cart: cartReducer,
  newOrder: newOrderReducer,
  myOrders: myOrdersReducer,
  allOrders: allOrdersReducer,
  orderDetails: orderDetailsReducer,
  order: orderReducer,
  newReview: newReviewReducer,
  selectedProducts: selectedProductsReducer,
  randomProducts: randomProductsReducer,
  updatePassword: updatePasswordReducer,
  exchange: newExchangeReducer,
  myExchanges: myExchangesReducer,
  exchanges: exchangesReducer,
  exchangeUpdate: exchangeReducer
});

let initialState = {
  auth: {
    user: null,
    loading: false,
    isAuthenticatedUser: false,
    error: null,
  },

  cart: {
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],

    shippingInfo: localStorage.getItem("shippingInfo")
      ? JSON.parse(localStorage.getItem("shippingInfo"))
      : {},
  },
};

const middleware = [thunk];
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
