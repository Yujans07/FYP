// cartRoutes.js
const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getUserCartItems,
  removeCartItem,
  updateCartItem,
  clearCart,
  sendCartNotifications
} = require("../controllers/cartController");
const { isAuthenticatedUser } = require("../middlewares/auth");

// All cart routes require authentication
router.use(isAuthenticatedUser);

// Cart operations
router.route("/cart/add").post(addItemToCart);
router.route("/cart/items").get(getUserCartItems);
router.route("/cart/item/:productId").delete(removeCartItem);
router.route("/cart/item/:productId").put(updateCartItem);
router.route("/cart/clear").delete(clearCart);
router.route("/cart/notifications").post(sendCartNotifications);

module.exports = router;
