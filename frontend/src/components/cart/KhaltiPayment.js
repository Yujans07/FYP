import React, { useEffect } from "react";
import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  createOrder,
  clearErrors,
  updateOrder,
} from "../../actions/orderActions";
import axios from "axios";

const KhaltiPayment = ({ history }) => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { error } = useSelector((state) => state.newOrder);

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

  const submitHandler = async (e) => {
    e.preventDefault();
    document.querySelector("#pay_btn").disabled = true;

    try {
      // Create order first
      const { payload: createdOrder } = await dispatch(createOrder(order));
      
      if (!createdOrder || !createdOrder._id) {
        alert.error("Failed to create order");
        document.querySelector("#pay_btn").disabled = false;
        return;
      }

      // Prepare Khalti payment data
      const khaltiPaymentData = {
        amount: Math.round(orderInfo.totalPrice * 100), // Convert to paisa
        purchase_order_id: createdOrder._id,
        purchase_order_name: `Order #${createdOrder._id}`,
        customer_info: {
          name: user.name,
          email: user.email,
          phone: shippingInfo.phoneNo || ""
        }
      };

      // Initialize Khalti payment
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/v1/khalti/process",
        khaltiPaymentData,
        config
      );

      if (data.success && data.paymentUrl) {
        // Redirect to Khalti payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Failed to initialize payment");
      }

    } catch (error) {
      document.querySelector("#pay_btn").disabled = false;
      alert.error(error.response?.data?.message || "Payment initialization failed");
    }
  };

  return (
    <div>
      <MetaData title={"Khalti Payment"} />
      <CheckoutSteps shipping confirmOrder payment />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-4">Khalti Payment</h1>
            <div className="order-info-box mb-4">
              <h4>Order Summary</h4>
              <p>Total Amount: Rs. {orderInfo && orderInfo.totalPrice}</p>
              <p>Items: {cartItems.length}</p>
              <p>Shipping To: {shippingInfo.address}</p>
            </div>
            <button 
              id="pay_btn" 
              type="submit" 
              className="btn btn-block py-3"
              disabled={!orderInfo || !orderInfo.totalPrice}
            >
              Pay with Khalti - Rs. {orderInfo && orderInfo.totalPrice}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KhaltiPayment;
