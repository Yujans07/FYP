import axios from "axios";
import {
  ALL_PRODUCTS_REQUEST,
  ALL_PRODUCTS_SUCCESS,
  ALL_PRODUCTS_FAIL,
  ADMIN_PRODUCTS_REQUEST,
  ADMIN_PRODUCTS_SUCCESS,
  ADMIN_PRODUCTS_FAIL,
  NEW_PRODUCT_REQUEST,
  NEW_PRODUCT_SUCCESS,
  NEW_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAIL,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,
  NEW_REVIEW_REQUEST,
  NEW_REVIEW_SUCCESS,
  NEW_REVIEW_FAIL,
  GET_REVIEWS_REQUEST,
  GET_REVIEWS_SUCCESS,
  GET_REVIEWS_FAIL,
  DELETE_REVIEW_REQUEST,
  DELETE_REVIEW_SUCCESS,
  DELETE_REVIEW_FAIL,
  ADD_SELECTED_PRODUCT,
  REMOVE_SELECTED_PRODUCT,
  RANDOM_PRODUCTS_REQUEST,
  RANDOM_PRODUCTS_SUCCESS,
  RANDOM_PRODUCTS_FAIL,
  NOTIFY_REQUEST,
  NOTIFY_SUCCESS,
  NOTIFY_FAIL,
  CLEAR_SELECTED_PRODUCTS,
  CLEAR_ERRORS,
} from "../constants/productConstants";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1";

// GET PRODUCTS (Handles Filters)
export const getProducts =
  (keyword = "", currentPage = 1, price = [0, 10000], category, rating = 0) =>
  async (dispatch) => {
    try {
      dispatch({ type: ALL_PRODUCTS_REQUEST });

      let link = `${API_URL}/products?keyword=${keyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&ratings[gte]=${rating}`;

      if (category && category.length > 0) {
        // If category is an array, use the first category
        const categoryValue = Array.isArray(category) ? category[0] : category;
        link += `&category=${categoryValue}`;
      }

      console.log('Fetching products with URL:', link); // Debug log

      const { data } = await axios.get(link);

      console.log('Received products data:', data); // Debug log

      // Check if we have products data
      if (data && data.products) {
        dispatch({
          type: ALL_PRODUCTS_SUCCESS,
          payload: {
            products: data.products,
            productsCount: data.productsCount || data.products.length,
            resPerPage: data.resPerPage || 10,
            filteredProductsCount: data.filteredProductsCount || data.products.length
          }
        });
      } else {
        throw new Error('No products data received');
      }
    } catch (error) {
      console.error('Error fetching products:', error); // Debug log
      dispatch({
        type: ALL_PRODUCTS_FAIL,
        payload: error.response?.data?.message || error.message || "Failed to fetch products"
      });
    }
  };

// CREATE NEW PRODUCT
export const newProduct = (productData) => async (dispatch) => {
  try {
    dispatch({ type: NEW_PRODUCT_REQUEST });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
    };

    // Log the form data for debugging
    console.log("Form data entries:");
    for (let [key, value] of productData.entries()) {
      console.log(key, value);
    }

    const { data } = await axios.post(`${API_URL}/admin/product/new`, productData, config);

    dispatch({ type: NEW_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    console.error("Error creating product:", error);
    dispatch({
      type: NEW_PRODUCT_FAIL,
      payload: error.response?.data?.message || "Failed to create product",
    });
  }
};

// DELETE PRODUCT (Admin)
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    const { data } = await axios.delete(`${API_URL}/admin/product/${id}`);

    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: data.message });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAIL,
      payload: error.response?.data?.message || "Failed to delete product",
    });
  }
};

// UPDATE PRODUCT (Admin)
export const updateProduct = (id, productData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PRODUCT_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(`${API_URL}/admin/product/${id}`, productData, config);

    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: UPDATE_PRODUCT_FAIL,
      payload: error.response?.data?.message || "Failed to update product",
    });
  }
};

// GET PRODUCT DETAILS
export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });

    const { data } = await axios.get(`${API_URL}/product/${id}`);

    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data.product });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error.response?.data?.message || "Failed to fetch product details",
    });
  }
};

// CREATE NEW REVIEW
export const newReview = (reviewData) => async (dispatch) => {
  try {
    dispatch({ type: NEW_REVIEW_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(`${API_URL}/review`, reviewData, config);

    dispatch({ type: NEW_REVIEW_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: NEW_REVIEW_FAIL,
      payload: error.response?.data?.message || "Failed to submit review",
    });
  }
};

// GET ALL PRODUCTS (Admin)
export const getAdminProducts = () => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_PRODUCTS_REQUEST });

    const { data } = await axios.get(`${API_URL}/admin/products`);

    dispatch({ type: ADMIN_PRODUCTS_SUCCESS, payload: data.products });
  } catch (error) {
    dispatch({
      type: ADMIN_PRODUCTS_FAIL,
      payload: error.response?.data?.message || "Failed to fetch admin products",
    });
  }
};

// GET PRODUCT REVIEWS
export const getProductReviews = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_REVIEWS_REQUEST });

    const { data } = await axios.get(`${API_URL}/reviews?id=${id}`);

    dispatch({ type: GET_REVIEWS_SUCCESS, payload: data.reviews });
  } catch (error) {
    dispatch({
      type: GET_REVIEWS_FAIL,
      payload: error.response?.data?.message || "Failed to fetch reviews",
    });
  }
};

// DELETE PRODUCT REVIEW
export const deleteReview = (id, productId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_REVIEW_REQUEST });

    const { data } = await axios.delete(`${API_URL}/reviews/?id=${id}&productId=${productId}`);

    dispatch({ type: DELETE_REVIEW_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: DELETE_REVIEW_FAIL,
      payload: error.response?.data?.message || "Failed to delete review",
    });
  }
};

// GET RANDOM PRODUCTS
export const getRandomProducts = () => async (dispatch) => {
  try {
    dispatch({ type: RANDOM_PRODUCTS_REQUEST });

    const { data } = await axios.get(`${API_URL}/random-products`);

    dispatch({ type: RANDOM_PRODUCTS_SUCCESS, payload: data.randomProducts });
  } catch (error) {
    dispatch({
      type: RANDOM_PRODUCTS_FAIL,
      payload: error.response?.data?.message || "Failed to fetch random products",
    });
  }
};

// NOTIFY ME
export const notifyMe = (productId, email) => async (dispatch) => {
  try {
    dispatch({ type: NOTIFY_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    await axios.post(`${API_URL}/notify`, { productId, email }, config);

    dispatch({ type: NOTIFY_SUCCESS });
  } catch (error) {
    dispatch({
      type: NOTIFY_FAIL,
      payload: error.response?.data?.error || "Failed to notify",
    });
  }
};

// CLEAR ERRORS
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
