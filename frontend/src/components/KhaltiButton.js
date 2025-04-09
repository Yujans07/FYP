// src/components/KhaltiButton.js
import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const KhaltiButton = ({ totalPrice, handlePaymentSuccess }) => {
  const { order } = useSelector((state) => state.order);

  const handleKhaltiPayment = async () => {
    try {
      const response = await axios.post("/api/payment/khalti/initiate", {
        amount: totalPrice,
        purchase_order_id: order._id,
        purchase_order_name: "Mobile Hub Order",
        customer_info: {
          name: order.user.name,
          email: order.user.email,
          phone: order.shippingInfo.phoneNo,
        },
      });

      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error("Error initiating Khalti payment:", error);
      alert("Error initiating Khalti payment");
    }
  };

  return (
    <button
      id="checkout_btn"
      className="btn btn-info btn-block mt-2"
      onClick={handleKhaltiPayment}
    >
      Pay via Khalti
    </button>
  );
};

export default KhaltiButton;
