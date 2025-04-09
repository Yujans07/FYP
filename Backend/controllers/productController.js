const Product = require("../models/product");
const User = require("../models/user");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");
const Cart = require("../models/cart");
const Notification = require("../models/notification");
require("dotenv").config({ path: "./backend/config/config.env" });
const sendEmail = require("../utils/sendEmail");
const { validationResult } = require("express-validator");
const getUsersCartItems = require("../utils/getUsersCartItems");

//create new product  => /api/v1//admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  // Check if images are provided in the request
  if (!req.body.images) {
    return res.status(400).json({
      error: 'Please provide at least one product image',
      details: 'The "images" property is required in the request body',
    });
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  // Validate that images array is not empty
  if (!images || images.length === 0) {
    return next(new ErrorHandler('Please provide valid product images', 400));
  }

  let imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});


//Get all products => /api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const productsCount = await Product.countDocuments();

  const apiFeatures = new APIFeatures(Product.find().sort({ createdAt: -1 }), req.query)
    .search()
    .filter()
    .pagination(resPerPage);

  const products = await apiFeatures.query;
  const filteredProductsCount = products.length;

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products,
  });
});

// const products = await apiFeatures.query;
//Get all products (Admin) => /api/v1/admin/products?
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

//Get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// //Update product => /api/v1/admin/product/:id
// exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
//   let product = await Product.findById(req.params.id);

//   if (!product) {
//     return next(new ErrorHandler("Product not found", 404));
//   }

//   let images = [];
//   if (typeof req.body.images === "string") {
//     images.push(req.body.images);
//   } else {
//     images = req.body.images;
//   }

//   if (images !== undefined) {
//     for (let i = 0; i < product.images.length; i++) {
//       const result = await cloudinary.v2.uploader.destroy(
//         product.images[i].public_id
//       );
//     }

//     let imagesLinks = [];

//     for (let i = 0; i < images.length; i++) {
//       const result = await cloudinary.v2.uploader.upload(images[i], {
//         folder: "products",
//       });

//       imagesLinks.push({
//         public_id: result.public_id,
//         url: result.secure_url,
//       });
//     }

//     req.body.images = imagesLinks;
//   }

//   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

//Update product => /api/v1/admin/product/:id  // and checking the status of the product and updating
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(
        product.images[i].public_id
      );
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  const previousStock = product.stock;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // Check if product stock has changed from 0 to a positive number
  if (previousStock === 0 && product.stock > 0) {
    // Fetch notifications for this product
    const notifications = await Notification.find({ productId: product._id });

    // Send notification emails to subscribed users
    for (const notification of notifications) {
      await sendEmail({
        email: notification.email,
        subject: "Product Available",
        message: `Dear User,
        Great news! The product '${product.name}' you've been waiting for is now available! 🎉 Kindly visit our website and check it out.

        Best Regards,
        Mobile Hub`,
      });

      // Optionally, delete the notification from the database after sending the email
      await Notification.findByIdAndDelete(notification._id);
    }
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const productId = req.params.id;

  try {
    // Check if the product is in any user's cart
    const cartItem = await Cart.findOne({ productId });

    if (cartItem) {
      return res.status(400).json({
        success: false,
        message: "Product is in users' carts. Cannot delete.",
      });
    }

    // If product is not in any cart, proceed with deletion
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Deleting images associated with the product
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(
        product.images[i].public_id
      );
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviwed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviwed) {
    // Update existing review

    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    // Add new review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  // Calculate product ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  // Save the updated product
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Product Reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review  => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      validator: false,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});

// controllers/productController.js
//controllers.js:

exports.compareProducts = async (req, res) => {
  try {
    // Split the received productIds by comma
    const productIds = req.query.productIds.split(",");

    // Log the received productIds
    console.log("Received productIds:", productIds);

    // Check if productIds is empty or contains only empty strings
    if (
      !productIds ||
      productIds.length === 0 ||
      productIds.every((id) => id.trim() === "")
    ) {
      console.log("Product IDs are missing");
      return res
        .status(400)
        .json({ message: "Product IDs are required for comparison" });
    }

    // Filter out any empty strings from the array
    const validProductIds = productIds.filter((id) => id.trim() !== "");

    // Log the parsed array of productIds
    console.log("Parsed productIds:", validProductIds);

    // Fetch product details from the database based on the product IDs
    const products = await Product.find({ _id: { $in: validProductIds } });

    // Send the fetched products back to the client
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.notifyMe = async (req, res) => {
//   // Check for validation errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { productId, email } = req.body;

//   try {
//     // Check if notification already exists
//     const existingNotification = await Notification.findOne({
//       productId,
//       email,
//     });

//     if (existingNotification) {
//       return res
//         .status(400)
//         .json({ error: "You are already notified for this product." });
//     }

//     // Save the notification to the database
//     await Notification.create({ productId, email });

//     // Check if the product is in stock
//     const product = await Product.findById(productId);
//     if (product.stock > 0) {
//       // Send email notification asynchronously
//       const message = {
//         to: email,
//         subject: `Dear User, Great news! The product '${product.name}' you've been waiting for is now available! 🎉 Kindly visit our website and check it out.

//         Best Regards,
//         Laptop Zone`,
//       };
//       await sendEmail(message);
//     }

//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).json({ error: "Server error. Please try again." });
//   }
// };

exports.notifyMe = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId, email } = req.body;

  try {
    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      productId,
      email, // Use the email from the authenticated user
    });

    if (existingNotification) {
      return res
        .status(400)
        .json({ error: "You are already notified for this product." });
    }

    // Create new notification
    await Notification.create({ productId, email });

    res.status(200).json({
      success: true,
      message: "You will be notified once the product is available.",
    });
  } catch (error) {
    console.error("Error saving notification:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};
