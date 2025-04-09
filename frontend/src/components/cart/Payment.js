import React, { Fragment, useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  createOrder,
  clearErrors,
  updateOrder,
} from "../../actions/orderActions";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import './Payment.css';

const options = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      backgroundColor: "white",
    },
    invalid: {
      color: "#9e2146",
      iconColor: "#9e2146",
    },
  },
};

const Payment = ({ history }) => {
  const alert = useAlert();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { error } = useSelector((state) => state.newOrder);

  useEffect(() => {
    if (!stripe || !elements) {
      console.log("Stripe or Elements not loaded");
      return;
    }
    setIsLoading(false);
  }, [stripe, elements]);

  useEffect(() => {
    if (error) {
      alert.error(error);
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

  const paymentData = {
    amount: Math.round(orderInfo.totalPrice * 100),
  };

  const handleCardInputChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      alert.error("Payment system is not ready. Please try again.");
      return;
    }

    const payBtn = document.querySelector("#pay_btn");
    payBtn.disabled = true;
    setIsProcessing(true);
    setCardError(null);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post("/api/v1/payment/process", paymentData, config);
      
      if (!data.client_secret) {
        throw new Error("Could not get payment confirmation");
      }

      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      if (result.error) {
        setCardError(result.error.message);
        payBtn.disabled = false;
        setIsProcessing(false);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
          };

          dispatch(createOrder(order));
          dispatch(updateOrder(order._id, { status: "Paid" }));
          history.push("/success");
        } else {
          alert.error("Payment processing failed. Please try again.");
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error("Payment Error:", error);
      payBtn.disabled = false;
      setIsProcessing(false);
      alert.error(error.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <div className="shadow-lg text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading payment system...</span>
            </div>
            <p className="mt-3">Initializing payment system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <MetaData title={"Payment"} />
      <CheckoutSteps shipping confirmOrder payment />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h2 className="mb-4">Card Information</h2>
            
            <div className="form-group">
              <label htmlFor="card_num_field">Card Number</label>
              <CardNumberElement
                id="card_num_field"
                className="form-control"
                options={options}
                onChange={handleCardInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_exp_field">Card Expiry</label>
              <CardExpiryElement
                id="card_exp_field"
                className="form-control"
                options={options}
                onChange={handleCardInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card_cvc_field">Card CVC</label>
              <CardCvcElement
                id="card_cvc_field"
                className="form-control"
                options={options}
                onChange={handleCardInputChange}
              />
            </div>

            {cardError && (
              <div className="alert alert-danger mt-3">
                {cardError}
              </div>
            )}

            <div className="form-group text-center">
              <button
                id="pay_btn"
                type="submit"
                className="btn btn-block py-3"
                disabled={isProcessing || !stripe}
              >
                {isProcessing ? (
                  <span>
                    <i className="fa fa-spinner fa-spin"></i> Processing...
                  </span>
                ) : (
                  `Pay - Rs. ${orderInfo && orderInfo.totalPrice}`
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <img 
                src="/images/stripe-secure-badge.png" 
                alt="Secure Payments by Stripe" 
                style={{ height: '40px' }}
              />
              <p className="mt-2 text-muted">
                <small>Your payment is secured by Stripe. We never store your card details.</small>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Payment;
