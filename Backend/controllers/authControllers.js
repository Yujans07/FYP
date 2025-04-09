const User = require("../models/user");
const auth = require("../routes/auth");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const { getWelcomeEmail } = require("../utils/emailTemplates");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a user   => /api/v1/register
// Register a user   => /api/v1/register
// Register a user   => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // Log the incoming request body for debugging
    console.log("Register request body role:", req.body.role);
    
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const { name, email, password, role } = req.body;

    // Create user data object
    const userData = {
      name,
      email,
      password,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      }
    };

    // Explicitly set the role if provided
    if (role) {
      userData.role = role;
      console.log(`Setting user role to: ${role}`);
    }

    const user = await User.create(userData);
    
    // Log the created user (without sensitive info)
    console.log("User created with role:", user.role);

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to Mobile Hub!",
        message: getWelcomeEmail(user.name)
      });
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the registration if email fails
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error in registerUser:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});


// Login User  =>  /a[i/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Checks if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(user, 200, res);
});

// Forgot Password   =>  /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('Forgot password request received for email:', req.body.email);
    
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log('User not found with email:', req.body.email);
      return next(new ErrorHandler("User not found with this email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    console.log('Reset token generated for user:', user.email);

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
      const emailInfo = await sendEmail({
        email: user.email,
        subject: "Mobile Hub Password Recovery",
        message,
      });

      console.log('Password reset email sent successfully:', emailInfo.messageId);

      res.status(200).json({
        success: true,
        message: `Email sent to: ${user.email}`,
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler(emailError.message, 500));
    }
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password   =>  /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  // Setup new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get currently logged in user details   =>   /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update / Change password for regular user => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400)); // Ensure status code 400
  }

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

// Update / Change password for Google user => /api/v1/google/password/update
exports.updateGooglePassword = catchAsyncErrors(async (req, res, next) => {
  // Find the user by ID and select the 'provider' and 'hashedPassword' fields
  const user = await User.findById(req.user.id).select(
    "+provider +hashedPassword"
  );

  // Check if the user is a Google user
  if (user.provider !== "google") {
    return next(
      new ErrorHandler("Only Google users can update their password")
    );
  }

  try {
    // Check if the old password provided matches the current password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(new ErrorHandler("Old password is incorrect"));
    }

    // Update the hashed password with the new password
    user.password = req.body.password;
    user.hashedPassword = await bcrypt.hash(req.body.password, 10);
    await user.save();

    // Send the updated user data with the new token
    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // Update avatar
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const image_id = user.avatar.public_id;
    const res = await cloudinary.v2.uploader.destroy(image_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Logout user   =>   /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Admin Routes

// Get all users => /api/v1/admin/users

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get user details => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user profile   =>   /api/v1/admin/user/:Id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete user details => /api/v1/admin/user/:id

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  // Remove  avatar from cloudinary

  const image_id = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(image_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
});

// Signin with google => /google

// Signin with google => /google
exports.google = catchAsyncErrors(async (req, res, next) => {
  const { displayName, email, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const result = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      user = await User.create({
        name: displayName,
        password: hashedPassword,
        email,
        avatar: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Google Authentication Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// exports.google = catchAsyncErrors(async (req, res, next) => {
//   const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
//     folder: "avatars",
//     width: 150,
//     crop: "scale",
//   });
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword, ...rest } = user._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie("access_token", token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     } else {
//       const generatedPassword =
//         Math.random().toString(36).slice(-8) +
//         Math.random().toString(36).slice(-8);
//       const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
//       const newUser = new User({
//         name:
//           req.body.name.split(" ").join("").toLowerCase() +
//           Math.floor(Math.random() * 10000).toString(),
//         email: req.body.email,
//         password: hashedPassword,
//         avatar: {
//           public_id: result.public_id,
//           url: result.secure_url,
//         },
//       });
//       await newUser.save();
//       const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword2, ...rest } = newUser._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie("access_token", token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// Controller function to get user data
// exports.getUserData = async (req, res, next) => {
//   try {
//     // Fetch user data from the database
//     const userData = await User.findById(req.user.id);

//     // Check if user data exists
//     if (!userData) {
//       return next(new ErrorHandler("User data not found", 404));
//     }

//     // Send user data as response
//     res.status(200).json({
//       success: true,
//       data: userData,
//     });
//   } catch (error) {
//     // Handle errors
//     next(error);
//   }
// };
