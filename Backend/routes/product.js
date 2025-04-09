const express = require("express");
const router = express.Router();

const {
  getProducts,
  getAdminProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
  compareProducts,
  notifyMe,
} = require("../controllers/productController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { isOrderDelivered } = require("../middlewares/isOrderDelivered");

router.route("/products").get(getProducts);
router.route("/admin/products").get(getAdminProducts);

router.route("/product/:id").get(getSingleProduct).post(notifyMe);

router.route("/products/compare").get(compareProducts);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(isAuthenticatedUser, getProductReviews);
router.route("/reviews").delete(isAuthenticatedUser, deleteReview);

module.exports = router;
