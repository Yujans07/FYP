// Create and send token and save in the cookie.

const sendToken = (user, statusCode, res) => {
  // Create JWT token
  const token = user.getJwtToken();

  // Options  for cookie
  const options = {
    maxAge: process.env.COOKIE_EXPIRES_TIME_MS,
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
