// Import necessary modules
const Order = require("../models/order");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendEmail = require("../utils/sendEmail");
const { getOrderConfirmationEmail, getOrderShippedEmail } = require("../utils/emailTemplates");
const mongoose = require("mongoose");

// Create a new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('Received order creation request:', req.body);
    
    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
    } = req.body;

    // Validate required fields
    if (!orderItems || !orderItems.length) {
      return next(new ErrorHandler("No order items found", 400));
    }

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.phoneNo) {
      return next(new ErrorHandler("Shipping information is incomplete", 400));
    }

    // Validate prices
    if (!itemsPrice || !taxPrice || !shippingPrice || !totalPrice) {
      return next(new ErrorHandler("Order prices are missing", 400));
    }

    // Create order with initial status
    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo: {
        ...paymentInfo,
        status: "Pending"
      },
      orderStatus: "Processing",
      user: req.user._id,
    });

    console.log('Order created successfully:', order);

    // Send order confirmation email
    try {
      await sendEmail({
        email: req.user.email,
        subject: "Order Confirmation - Mobile Hub",
        message: getOrderConfirmationEmail(req.user.name, order._id, totalPrice)
      });
      console.log("Order confirmation email sent successfully");
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    res.status(200).json({ 
      success: true, 
      order,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.error(`Invalid Order ID received in getSingleOrder: ${orderId}`);
    return next(new ErrorHandler("Invalid Order ID", 400));
  }

  const order = await Order.findById(orderId).populate("user", "name email");

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({ success: true, order });
});

// Get logged-in user's orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  res.status(200).json({ success: true, orders });
});

// Get all orders - Admin
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  res.status(200).json({ success: true, totalAmount, orders });
});

// Update / Process order - Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.error(`Invalid Order ID received in updateOrder: ${orderId}`);
    return next(new ErrorHandler("Invalid Order ID", 400));
  }

  const order = await Order.findById(orderId).populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  // Update stock
  await Promise.all(order.orderItems.map(item => updateStock(item.product, item.quantity)));

  order.orderStatus = req.body.status;

  if (order.paymentMethod === "COD" && req.body.status === "Delivered") {
    order.paymentInfo = { ...order.paymentInfo, status: "succeeded" };
  }

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Send shipping notification email if order is shipped
  if (req.body.status === "Shipped") {
    try {
      await sendEmail({
        email: order.user.email,
        subject: "Your Order Has Been Shipped - Mobile Hub",
        message: getOrderShippedEmail(order.user.name, order._id, order.trackingNumber || "Not available yet")
      });
      console.log("Shipping notification email sent successfully");
    } catch (emailError) {
      console.error("Error sending shipping notification email:", emailError);
      // Don't fail the order update if email fails
    }
  }

  res.status(200).json({
    success: true,
    order
  });
});

// Delete order - Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.error(`Invalid Order ID received in deleteOrder: ${orderId}`);
    return next(new ErrorHandler("Invalid Order ID", 400));
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  await order.deleteOne();

  res.status(200).json({ success: true });
});

// Helper function to update product stock
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  if (product) {
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
  } else {
    console.warn(`Product not found while updating stock: ${id}`);
  }
}





// const Order = require("../models/order");
// const Product = require("../models/product");

// const ErrorHandler = require("../utils/errorHandler");
// const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
// const mongoose = require("mongoose");

// // Create a new order => /api/v1/order/new
// exports.newOrder = catchAsyncErrors(async (req, res, next) => {
//   const {
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//   } = req.body;

//   const order = await Order.create({
//     orderItems,
//     shippingInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     paymentInfo,
//     paidAt: Date.now(),
//     user: req.user._id,
//   });

//   res.status(200).json({
//     success: true,
//     order,
//   });
// });

// // Get single order => /api/v1/order/:id
// exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
//   const orderId = req.params.id;

//   if (!mongoose.Types.ObjectId.isValid(orderId)) {
//     console.error(`Invalid Order ID received: ${orderId}`);
//     return next(new ErrorHandler("Invalid Order ID", 400));
//   }

//   const order = await Order.findById(orderId).populate("user", "name email");

//   if (!order) {
//     return next(new ErrorHandler("No order found with this ID", 404));
//   }

//   res.status(200).json({
//     success: true,
//     order,
//   });
// });

// // Get logged in user orders => /api/v1/orders/me
// exports.myOrders = catchAsyncErrors(async (req, res, next) => {
//   const orders = await Order.find({ user: req.user.id });

//   res.status(200).json({
//     success: true,
//     orders,
//   });
// });

// // Get all orders => /api/v1/admin/orders/
// exports.allOrders = catchAsyncErrors(async (req, res, next) => {
//   const orders = await Order.find();

//   let totalAmount = 0;

//   orders.forEach((order) => {
//     totalAmount += order.totalPrice;
//   });

//   res.status(200).json({
//     success: true,
//     totalAmount,
//     orders,
//   });
// });

// // Update / Process order - ADMIN => /api/v1/admin/order/:id
// exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
//   const orderId = req.params.id;

//   if (!mongoose.Types.ObjectId.isValid(orderId)) {
//     return next(new ErrorHandler("Invalid Order ID", 400));
//   }

//   const order = await Order.findById(orderId);

//   if (!order) {
//     return next(new ErrorHandler("No order found with this ID", 404));
//   }

//   if (order.orderStatus === "Delivered") {
//     return next(new ErrorHandler("You have already delivered this order", 400));
//   }

//   // Update stock for each item
//   const updateStockPromises = order.orderItems.map(async (item) => {
//     await updateStock(item.product, item.quantity);
//   });

//   await Promise.all(updateStockPromises);

//   order.orderStatus = req.body.status;

//   // Check if the order is COD and being marked as Delivered
//   if (order.paymentMethod === "COD" && req.body.status === "Delivered") {
//     order.paymentInfo = { ...order.paymentInfo, status: "succeeded" };
//   }

//   if (req.body.status === "Delivered") {
//     order.deliveredAt = Date.now();
//   }

//   await order.save();

//   console.log(`Order ${orderId} updated:`, order); // Debugging line

//   res.status(200).json({
//     success: true,
//     order, // Return the updated order for confirmation
//   });
// });

// async function updateStock(id, quantity) {
//   const product = await Product.findById(id);

//   product.stock = product.stock - quantity;

//   await product.save({ validateBeforeSave: false });
// }

// // Delete order => /api/v1/admin/order/:id
// exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
//   const orderId = req.params.id;

//   if (!mongoose.Types.ObjectId.isValid(orderId)) {
//     return next(new ErrorHandler("Invalid Order ID", 400));
//   }

//   const order = await Order.findById(orderId);

//   if (!order) {
//     return next(new ErrorHandler("No order found with this ID", 404));
//   }

//   await order.deleteOne();

//   res.status(200).json({
//     success: true,
//   });
// });
