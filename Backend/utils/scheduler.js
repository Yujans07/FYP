const schedule = require("node-schedule");
const sendEmail = require("./sendEmail");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");

const job = schedule.scheduleJob("0 0 * * *", async () => {
  try {
    console.log("Starting scheduler...");

    const usersWithCartItems = await Cart.aggregate([
      {
        $group: {
          _id: "$userId",
          cartItems: { $push: "$productId" },
        },
      },
    ]);

    console.log(`Total users with cart items: ${usersWithCartItems.length}`);

    for (const user of usersWithCartItems) {
      console.log(`Processing user with ID: ${user._id}`);

      try {
        if (user.cartItems.length > 0) {
          // Fetch user details to get the email address
          const userDetails = await User.findById(user._id);

          if (!userDetails) {
            console.error(`User with ID: ${user._id} not found`);
            continue;
          }

          // Fetch product details
          const products = await Product.find({ _id: { $in: user.cartItems } });

          const productDetails = products.map((product) => {
            return {
              name: product.name,
              image: product.images[0]?.url,
            };
          });

          // Create HTML email content
          let productDetailsHtml = productDetails
            .map((product) => {
              return `
              <div style="margin-bottom: 10px;">
                <img src="${product.image}" alt="${product.name}" style="width: 100px; height: auto; margin-right: 10px; vertical-align: middle;">
                <span style="vertical-align: middle;">${product.name}</span>
              </div>
            `;
            })
            .join("");

          console.log(
            `Sending email notification to user with ID: ${user._id}...`
          );
          await sendEmail({
            email: userDetails.email,
            subject: "Items in Your Cart",
            message: `
              <p>Dear ${userDetails.name},</p>
              <p>You have the following items in your cart:</p>
              ${productDetailsHtml}
              <p>Please complete your purchase soon!</p>
              <p>Best Regards,<br>Mobile Hub</p>
            `,
          });
          console.log(`Email notification sent to user with ID: ${user._id}.`);
        } else {
          console.log(`No cart items found for user with ID: ${user._id}.`);
        }
      } catch (error) {
        console.error(`Error processing user with ID: ${user._id}:`, error);
      }
    }

    console.log("Scheduler completed.");
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
});

module.exports = job;
