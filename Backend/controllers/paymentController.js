const catchAsyncError = require("../middlewares/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const axios = require("axios");

const Order = require("../models/order");

// Process stripe payments  => /api/v1/payment/process
exports.processPayment = catchAsyncError(async (req, res, next) => {
  try {
    console.log('Processing Stripe payment:', {
      amount: req.body.amount,
      currency: 'inr'
    });

    // Validate amount
    if (!req.body.amount || req.body.amount < 100) { // Minimum 1 rupee (100 paise)
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: { 
        integration_check: "accept_a_payment",
        order_id: req.body.orderId || 'unknown'
      },
      description: 'Mobile Hub Order Payment',
      payment_method_types: ['card'],
      shipping: req.body.shippingInfo ? {
        name: req.body.shippingInfo.name,
        address: {
          line1: req.body.shippingInfo.address,
          city: req.body.shippingInfo.city,
          postal_code: req.body.shippingInfo.postalCode,
          country: req.body.shippingInfo.country
        }
      } : undefined
    });

    console.log('Payment Intent created:', {
      id: paymentIntent.id,
      status: paymentIntent.status
    });

    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("Stripe Payment Error:", {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message
    });
  }
});

// Send stripe API key  => /api/v1/stripeapi
exports.sendStripApi = catchAsyncError(async (req, res, next) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({
      success: false,
      message: "Stripe publishable key is not configured"
    });
  }

  res.status(200).json({
    stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Process Khalti payment => /api/v1/khalti/process
exports.processKhaltiPayment = catchAsyncError(async (req, res, next) => {
  try {
    // Validate Khalti API key
    if (!process.env.KHALTI_SECRET_KEY) {
      console.error('Khalti API key is not configured');
      return res.status(500).json({
        success: false,
        message: "Payment gateway is not properly configured"
      });
    }

    console.log('Received Khalti payment request:', req.body);
    const { amount, purchase_order_id, purchase_order_name, customer_info } = req.body;

    // Validate required fields
    if (!amount || !purchase_order_id || !purchase_order_name || !customer_info) {
      console.error('Missing required fields:', { amount, purchase_order_id, purchase_order_name, customer_info });
      return res.status(400).json({
        success: false,
        message: "Missing required fields for payment"
      });
    }

    // Validate amount (minimum 10 Rs for test)
    if (amount < 1000) { // amount in paisa (10 Rs = 1000 paisa)
      return res.status(400).json({
        success: false,
        message: "Amount must be at least Rs. 10 for test payments"
      });
    }

    // Check if order exists
    const order = await Order.findById(purchase_order_id);
    if (!order) {
      console.error('Order not found:', purchase_order_id);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Validate order status
    if (order.orderStatus !== 'Processing') {
      console.error('Invalid order status:', order.orderStatus);
      return res.status(400).json({
        success: false,
        message: "Order is not in a valid state for payment"
      });
    }

    // Prepare payload for Khalti API (Test Environment)
    const payload = {
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      amount: parseInt(amount),
      purchase_order_id,
      purchase_order_name,
      customer_info: {
        name: customer_info.name || 'Test User',
        email: customer_info.email || 'test@example.com',
        phone: customer_info.phone || '9800000000'
      },
      amount_breakdown: [
        {
          label: "Total Amount",
          amount: parseInt(amount)
        }
      ],
      product_details: [
        {
          identity: purchase_order_id,
          name: purchase_order_name,
          total_price: parseInt(amount),
          quantity: 1,
          unit_price: parseInt(amount)
        }
      ]
    };

    console.log('Sending request to Khalti:', {
      url: `${process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com'}/api/v2/epayment/initiate/`,
      payload
    });

    // Configure Khalti API request with test credentials
    const config = {
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    };

    // Make request to Khalti API
    const response = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com'}/api/v2/epayment/initiate/`,
      payload,
      config
    );

    console.log('Received response from Khalti:', response.data);

    if (!response.data.payment_url) {
      throw new Error('No payment URL received from Khalti');
    }

    // Update order with payment details
    await Order.findByIdAndUpdate(purchase_order_id, {
      paymentInfo: {
        id: response.data.pidx,
        status: 'Initiated',
        type: 'Khalti'
      }
    });

    // Send response back to frontend
    res.status(200).json({
      success: true,
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx
    });

  } catch (error) {
    console.error('Khalti Payment Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
      config: error.config
    });

    // Handle specific Khalti API errors
    if (error.response?.data?.error_key) {
      return res.status(400).json({
        success: false,
        message: error.response.data.detail || "Payment initialization failed",
        error: error.response.data
      });
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({
        success: false,
        message: "Unable to connect to payment gateway",
        error: error.message
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

// Check Khalti payment status => /api/v1/khalti/status/:orderId
exports.checkKhaltiPaymentStatus = catchAsyncError(async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    console.log('Checking payment status for order:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.paymentInfo || !order.paymentInfo.id) {
      return res.status(400).json({
        success: false,
        message: "No payment information found for this order"
      });
    }

    // Configure Khalti API request
    const config = {
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    };

    // Check payment status with Khalti
    const response = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com'}/api/v2/epayment/lookup/`,
      { pidx: order.paymentInfo.id },
      config
    );

    console.log('Khalti payment status response:', response.data);

    // Map Khalti status to our status
    let status;
    switch (response.data.status) {
      case 'Completed':
        status = 'Completed';
        break;
      case 'Pending':
        status = 'Pending';
        break;
      case 'Cancelled':
      case 'Expired':
      case 'Failed':
        status = 'Failed';
        break;
      default:
        status = 'Failed';
    }

    // Update order status based on payment status
    if (status === 'Completed') {
      await Order.findByIdAndUpdate(orderId, {
        paymentInfo: {
          ...order.paymentInfo,
          status: 'Completed'
        },
        paidAt: Date.now()
      });
    } else if (status === 'Failed') {
      await Order.findByIdAndUpdate(orderId, {
        paymentInfo: {
          ...order.paymentInfo,
          status: 'Failed'
        }
      });
    }

    return res.status(200).json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error checking Khalti payment status:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    // Handle specific Khalti API errors
    if (error.response?.data?.detail) {
      return res.status(400).json({
        success: false,
        status: 'Failed',
        message: error.response.data.detail
      });
    }

    res.status(500).json({
      success: false,
      status: 'Failed',
      message: "Failed to check payment status",
      error: error.message
    });
  }
});
