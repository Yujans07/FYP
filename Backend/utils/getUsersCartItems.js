// Function to check users' carts and retrieve the products
const User = require("../models/user");

const getUsersCartItems = async (userId) => {
  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (user) {
      return user.cart.map((item) => item.productId);
    }
    return [];
  } catch (error) {
    console.error("Error fetching user's cart items:", error);
    return [];
  }
};

module.exports = getUsersCartItems;
