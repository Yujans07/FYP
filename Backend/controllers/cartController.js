// cartController.js
const Cart = require("../models/cart");
const ErrorHandler = require("../utils/errorHandler");

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if the item already exists in the cart for the user
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity = quantity || cartItem.quantity + 1;
      await cartItem.save();
    } else {
      // Create a new cart item
      cartItem = new Cart({
        userId,
        productId,
        quantity: quantity || 1,
      });
      await cartItem.save();
    }

    res.status(201).json({
      success: true,
      cartItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get user's cart items
exports.getUserCartItems = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    
    const cartItems = await Cart.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price images stock' // Only select needed fields
      });

    res.status(200).json({
      success: true,
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    });
  } catch (error) {
    console.error("Error fetching user's cart items:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cartItem = await Cart.findOneAndDelete({ userId, productId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    const cartItem = await Cart.findOne({ userId, productId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      cartItem
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Controller function to send notifications to registered users if they have items in their cart
exports.sendCartNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is available in the request
    const cartItems = await Cart.find({ userId }).populate("productId");

    if (cartItems.length > 0) {
      const productNames = cartItems
        .map((item) => item.productId.name)
        .join(", ");
      await sendEmail({
        email: req.user.email,
        subject: "Items in Your Cart",
        message: `Dear ${req.user.name},
        You have the following items in your cart: ${productNames}. Please complete your purchase soon!
        
        Best Regards,
        YourApp`,
      });
      res.status(200).json({
        success: true,
        message: "Cart notifications sent successfully",
      });
    } else {
      res.status(200).json({ success: true, message: "No items in the cart" });
    }
  } catch (error) {
    console.error("Error sending cart notifications:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error. Please try again." });
  }
};
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.find({ userId });

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

