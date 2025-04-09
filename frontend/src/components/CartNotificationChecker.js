// Frontend Logic

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserCartItems,
  sendCartNotifications,
} from "../../actions/cartActions";

const CartNotificationChecker = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserCartItems());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const sendNotification = async () => {
      if (cartItems.length > 0) {
        try {
          await dispatch(sendCartNotifications());
        } catch (error) {
          console.error("Error sending cart notification:", error);
        }
      }
    };

    sendNotification();
  }, [cartItems, dispatch]);

  return null;
};

export default CartNotificationChecker;
