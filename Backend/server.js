const app = require("./app");
const connectDatabase = require("./config/database");

const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const sendEmail = require("./utils/sendEmail");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("Shutting down server due to uncaught exception");
  process.exit(1);
});

// Import scheduler (ensure scheduler logic is implemented in utils/scheduler.js)
const scheduler = require("./utils/scheduler");

// Setting up config file
dotenv.config({ path: "./config/config.env" });

// Connecting to database
connectDatabase();

// Setting up Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Contact API route for handling contact form submissions
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const emailOptions = {
    email: process.env.SMTP_EMAIL, // Send email to yourself or a designated admin
    subject: `New contact from ${name}`,
    message: `
      <h1>Contact Details</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    // Send email
    await sendEmail(emailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);  // Log the error
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection");
  process.exit(1);
});
