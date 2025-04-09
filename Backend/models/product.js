const { kStringMaxLength } = require("buffer");
const mongoose = require("mongoose");
const { resourceUsage } = require("process");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },

  price: {
    type: Number,
    required: [true, "Please enter product price"],
    maxLength: [5, "Product name cannot exceed 5 characters"],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please select category for this product"],
    enum: {
      values: [
        "Samsung",
        "Apple",
        "Xiaomi",
        "OnePlus",
        "Oppo",
        "Vivo",
        "Realme",
        "Google",
        "Others"
      ],
      message: "Please select correct category for product",
    },
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxLength: [5, "Product name cannot exceed 5 characters"],
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  // Mobile Phone specifications for comparison purposes
  processor: {
    type: String,
    required: false,
  },
  ram: {
    type: String,
    required: false,
  },
  storage: {
    type: String,
    required: false,
  },
  display: {
    type: String,
    required: false,
  },
  battery: {
    type: String,
    required: false,
  },
  camera: {
    type: String,
    required: false,
  },
  operatingSystem: {
    type: String,
    required: false,
  },
  network: {
    type: String,
    required: false,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
