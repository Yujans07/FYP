import React, { Fragment, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";

import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import axios from "axios";
import { useAlert } from "react-alert";
import { getOrderDetails } from "../../actions/orderActions";
import CashOnDeliveryButton from "./CashOnDeliveryButton";
import { createOrder, clearErrors } from "../../actions/orderActions";

const ConfirmOrder = ({ history }) => {
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const alert = useAlert();
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.newOrder);

  useEffect(() => {
    if (error) {
      alert.error(error.message || 'An error occurred while creating the order');
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error]);

  const order = {
    orderItems: cartItems,
    shippingInfo,
  };

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  if (orderInfo) {
    order.itemsPrice = orderInfo.itemsPrice;
    order.shippingPrice = orderInfo.shippingPrice;
    order.taxPrice = orderInfo.taxPrice;
    order.totalPrice = orderInfo.totalPrice;
  }

  // Calculate Order Prices
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 500 ? 0 : 25;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const processToPayment = () => {
    const data = {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    sessionStorage.setItem("orderInfo", JSON.stringify(data));
    history.push("/payment");
  };

  const handleKhaltiPayment = async () => {
    try {
      if (!isAuthenticated) {
        history.push("/login?redirect=shipping");
        return;
      }

      // Validate order data
      if (!cartItems.length) {
        throw new Error('Your cart is empty');
      }

      if (!shippingInfo.address || !shippingInfo.phoneNo) {
        throw new Error('Please fill in all shipping information');
      }

      // Calculate prices
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const shippingPrice = itemsPrice > 1000 ? 0 : 200;
      const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
      const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

      // Create order data with all required fields
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          product: item.product
        })),
        shippingInfo: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
          postalCode: shippingInfo.pinCode,
          phoneNo: shippingInfo.phoneNo
        },
        itemsPrice: itemsPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        paymentInfo: {
          method: "Khalti",
          status: "Pending"
        }
      };

      console.log('Creating order with data:', orderData);

      // Create order
      const result = await dispatch(createOrder(orderData));
      console.log('Order creation result:', result);

      if (!result || !result._id) {
        throw new Error('Order creation failed. Please try again.');
      }

      const orderId = result._id;

      // Prepare Khalti payment data
      const khaltiData = {
        amount: Math.round(Number(totalPrice) * 100), // Convert to paisa
        purchase_order_id: orderId,
        purchase_order_name: `Order #${orderId}`,
        customer_info: {
          name: user.name,
          email: user.email,
          phone: shippingInfo.phoneNo
        }
      };

      console.log('Sending Khalti payment request:', khaltiData);

      // Configure axios for the request
      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Make request to backend
      const { data } = await axios.post(
        "/api/v1/khalti/process",
        khaltiData,
        config
      );

      console.log('Received Khalti response:', data);

      if (data.success && data.paymentUrl) {
        // First try to open in a popup
        const paymentWindow = window.open(data.paymentUrl, '_blank', 'width=800,height=700,scrollbars=yes');
        
        if (!paymentWindow) {
          // If popup is blocked, show guidance and provide alternative
          alert.info(`
            Popup blocked! Please either:
            1. Click "Allow" on the popup blocker notification, then try again
            2. Click OK to open payment in a new tab instead
          `);
          
          // Try opening in a new tab as fallback
          window.open(data.paymentUrl, '_blank');
          return;
        }

        let paymentCompleted = false;
        let checkCount = 0;
        const maxChecks = 20; // Maximum number of status checks (1 minute)

        // Check payment status periodically
        const checkPaymentStatus = setInterval(async () => {
          try {
            checkCount++;
            
            // Stop checking after max attempts
            if (checkCount >= maxChecks) {
              clearInterval(checkPaymentStatus);
              if (!paymentWindow.closed) {
                paymentWindow.close();
              }
              alert.error('Payment verification timeout. Please check your order status.');
              return;
            }

            // Only check if payment window is still open
            if (!paymentWindow.closed) {
              const statusResponse = await axios.get(`/api/v1/khalti/status/${orderId}`, { withCredentials: true });
              console.log('Payment status check:', statusResponse.data);

              if (statusResponse.data.success) {
                if (statusResponse.data.status === 'Completed') {
                  paymentCompleted = true;
                  clearInterval(checkPaymentStatus);
                  if (!paymentWindow.closed) {
                    paymentWindow.close();
                  }
                  alert.success('Payment successful! Your order has been placed.');
                  history.push('/success');
                } else if (statusResponse.data.status === 'Failed') {
                  clearInterval(checkPaymentStatus);
                  if (!paymentWindow.closed) {
                    paymentWindow.close();
                  }
                  alert.error('Payment was not completed. Your order has been cancelled.');
                  // Cancel the order in the backend
                  try {
                    await axios.delete(`/api/v1/order/${orderId}`, { withCredentials: true });
                  } catch (deleteError) {
                    console.error('Error cancelling order:', deleteError);
                  }
                }
                // If status is 'Pending', continue checking
              }
            } else {
              // Window was closed by user before completion
              if (!paymentCompleted) {
                clearInterval(checkPaymentStatus);
                alert.info('Payment window closed. Please check your order status.');
                // Don't automatically cancel the order, let the user check their order status
              }
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
            // Don't clear interval on error, continue checking
            // But log the error for debugging
          }
        }, 3000); // Check every 3 seconds

        // Clear interval after 15 minutes (maximum time for payment completion)
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          if (!paymentWindow.closed && !paymentCompleted) {
            paymentWindow.close();
            alert.error('Payment session expired. Please check your order status.');
          }
        }, 900000); // 15 minutes

      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }

    } catch (error) {
      console.error('Khalti payment error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      // Show more detailed error message
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error?.message || 
        error.message || 
        "Payment initialization failed. Please try again.";

      alert.error(errorMessage);
    }
  };

  return (
    <Fragment>
      <MetaData title={"Confirm Order"} />

      <CheckoutSteps shipping confirmOrder />

      <div className="row d-flex justify-content-between">
        <div className="col-12 col-lg-8 mt-5 order-confirm">
          <h4 className="mb-3">Shipping Info</h4>
          <p>
            <b>Name:</b> {user && user.name}
          </p>
          <p>
            <b>Phone:</b> {shippingInfo.phoneNo}
          </p>
          <p className="mb-4">
            <b>Address:</b>{" "}
            {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}
          </p>

          <hr />
          <h4 className="mt-4">Your Cart Items:</h4>

          {cartItems.map((item) => (
            <Fragment key={`${item.product}-fragment`}>
              <hr />
              <div className="cart-item my-1" key={item.product}>
                <div className="row">
                  <div className="col-4 col-lg-2">
                    <img src={item.image} alt="Laptop" height="45" width="65" />
                  </div>

                  <div className="col-5 col-lg-6">
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </div>

                  <div className="col-4 col-lg-4 mt-4 mt-lg-0">
                    <p>
                      {item.quantity} x Rs. {item.price} ={" "}
                      <b>Rs. {(item.quantity * item.price).toFixed(2)}</b>
                    </p>
                  </div>
                </div>
              </div>
              <hr />
            </Fragment>
          ))}
        </div>

        <div className="col-12 col-lg-3 my-4">
          <div id="order_summary">
            <h4>Order Summary</h4>
            <hr />
            <p>
              Subtotal:{" "}
              <span className="order-summary-values">
                Rs. {itemsPrice.toFixed(2)}
              </span>
            </p>
            <p>
              Shipping:{" "}
              <span className="order-summary-values">Rs. {shippingPrice}</span>
            </p>
            <p>
              Tax: <span className="order-summary-values">Rs. {taxPrice}</span>
            </p>

            <hr />

            <p>
              Total:{" "}
              <span className="order-summary-values">Rs. {totalPrice}</span>
            </p>

            <hr />
            <button
              id="checkout_btn"
              className="btn btn-primary btn-block"
              onClick={processToPayment}
            >
              Pay with visa
            </button>
            <button
              id="checkout_btn"
              className="btn btn-primary btn-block"
              onClick={handleKhaltiPayment}
            >
              khalti - Rs. {totalPrice}
            </button>
            <CashOnDeliveryButton />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ConfirmOrder;

// { /* <h2>Choose Payment Option:</h2>
//       <button className="btn btn-primary" onClick={() => handlePayment("visa")}>
//         Pay via Visa
//       </button>
//       <button className="btn btn-primary" onClick={() => handlePayment("khalti")}>
//         Pay via Khalti
//       </button>
//       <button className="btn btn-primary" onClick={() => handlePayment("cashOnDelivery")}>
//         Cash on Delivery
//       </button>
//             <button
//               id="checkout_btn"
//               className="btn btn-primary btn-block"
//               onClick={processToPayment}
//             >
//               Proceed to Payment
//             </button>

//              */ }
