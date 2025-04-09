const getWelcomeEmail = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Mobile Hub!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with Mobile Hub. We're excited to have you on board!</p>
      <p>You can now start shopping for your favorite mobile devices and accessories.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The Mobile Hub Team</p>
    </div>
  `;
};

const getOrderConfirmationEmail = (name, orderId, totalAmount) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your order! We're processing it now.</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order ID: ${orderId}</li>
        <li>Total Amount: Rs. ${totalAmount}</li>
      </ul>
      <p>You can track your order status in your account dashboard.</p>
      <p>Best regards,<br>The Mobile Hub Team</p>
    </div>
  `;
};

const getOrderShippedEmail = (name, orderId, trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your Order Has Been Shipped!</h2>
      <p>Hello ${name},</p>
      <p>Great news! Your order has been shipped.</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order ID: ${orderId}</li>
        <li>Tracking Number: ${trackingNumber}</li>
      </ul>
      <p>You can track your package using the tracking number above.</p>
      <p>Best regards,<br>The Mobile Hub Team</p>
    </div>
  `;
};

const getPasswordResetEmail = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Mobile Hub Team</p>
    </div>
  `;
};

module.exports = {
  getWelcomeEmail,
  getOrderConfirmationEmail,
  getOrderShippedEmail,
  getPasswordResetEmail
}; 