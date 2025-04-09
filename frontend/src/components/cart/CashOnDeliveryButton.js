import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, updateOrder } from "../../actions/orderActions";
import { clearCart } from "../../actions/cartActions";
import { useAlert } from "react-alert";

const CashOnDeliveryButton = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const alert = useAlert();
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Retrieve orderInfo from sessionStorage and parse it
  const orderInfoString = sessionStorage.getItem("orderInfo");
  const orderInfo = orderInfoString ? JSON.parse(orderInfoString) : null;

  const processToOrderSuccess = async () => {
    try {
      if (!user) {
        history.push("/login?redirect=shipping");
        return;
      }

      // Validate order data
      if (!cartItems.length) {
        throw new Error('Your cart is empty');
      }

      // Validate shipping information
      if (!shippingInfo || !shippingInfo.address || !shippingInfo.phoneNo) {
        throw new Error('Please fill in all shipping information');
      }

      // Ensure all required shipping fields are present
      const requiredShippingFields = ['address', 'city', 'country', 'phoneNo'];
      const missingFields = requiredShippingFields.filter(field => !shippingInfo[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following shipping information: ${missingFields.join(', ')}`);
      }

      // Calculate prices
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const shippingPrice = itemsPrice > 1000 ? 0 : 200;
      const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
      const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

      // Validate price calculations
      if (isNaN(itemsPrice) || isNaN(taxPrice) || isNaN(shippingPrice) || isNaN(totalPrice)) {
        throw new Error('Invalid price calculations');
      }

      // Create order data with all required fields
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: Number(item.quantity),
          image: item.image,
          price: Number(item.price),
          product: item.product
        })),
        shippingInfo: {
          address: shippingInfo.address || '',
          city: shippingInfo.city || '',
          state: shippingInfo.state || '',
          country: shippingInfo.country || '',
          postalCode: shippingInfo.postalCode || '',
          phoneNo: shippingInfo.phoneNo || ''
        },
        itemsPrice: Number(itemsPrice.toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        paymentInfo: {
          method: "Cash on Delivery",
          status: "Pending"
        },
        user: user._id,
        orderStatus: "Processing"
      };

      // Log detailed information about the order data
      console.log('Order Items:', orderData.orderItems);
      console.log('Shipping Info:', orderData.shippingInfo);
      console.log('Prices:', {
        itemsPrice: orderData.itemsPrice,
        taxPrice: orderData.taxPrice,
        shippingPrice: orderData.shippingPrice,
        totalPrice: orderData.totalPrice
      });
      console.log('Complete Order Data:', orderData);

      // Create order
      const result = await dispatch(createOrder(orderData));
      console.log('Order creation result:', result);

      if (!result || !result._id) {
        throw new Error('Order creation failed. Please try again.');
      }

      // Clear cart after successful order creation
      dispatch(clearCart());
      
      // Store order ID in session storage for success page
      sessionStorage.setItem('orderId', result._id);
      
      // Redirect to success page
      history.push('/success');
    } catch (error) {
      console.error('Error processing cash on delivery:', {
        error,
        message: error.message,
        orderInfo: orderInfo,
        shippingInfo: shippingInfo
      });
      alert.error(error.message || 'Failed to create order. Please try again.');
    }
  };

  return (
    <button
      id="checkout_btn"
      className="btn btn-primary btn-block"
      onClick={processToOrderSuccess}
    >
      Cash - Rs. {orderInfo?.totalPrice || '0.00'}
    </button>
  );
};

export default CashOnDeliveryButton;
