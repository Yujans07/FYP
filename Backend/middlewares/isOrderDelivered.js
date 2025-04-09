const Order = require("../models/order");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isOrderDelivered = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findOne({
    user: req.user._id,
    product: req.body.productId,
    orderStatus: "Delivered",
  });

  if (!order) {
    return next(
      new ErrorHandler(
        "You can only post a review after your order has been delivered",
        400
      )
    );
  }

  next();
});
