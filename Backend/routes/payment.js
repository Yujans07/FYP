const express = require("express");
const router = express.Router();

const {
  processPayment,
  sendStripApi,
  processKhaltiPayment,
} = require("../controllers/paymentController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/payment/process").post(isAuthenticatedUser, processPayment);
router.route("/stripeapi").get(isAuthenticatedUser, sendStripApi);
router.route("/khalti/process").post(isAuthenticatedUser, processKhaltiPayment);

module.exports = router;
