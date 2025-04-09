import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, clearErrors } from "../../actions/orderActions";

const OrderDetails = ({ match }) => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const {
    loading,
    error,
    order = {},
  } = useSelector((state) => state.orderDetails);
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    user,
    totalPrice,
    orderStatus,
  } = order;

  useEffect(() => {
    dispatch(getOrderDetails(match.params.id));

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error, match.params.id]);

  const shippingDetails =
    shippingInfo &&
    `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`;

  const isPaid =
    paymentInfo && paymentInfo.status === "succeeded" ? true : false;

  return (
    <Fragment>
      <MetaData title={"Order Details"} />

      {loading ? (
        <Loader />
      ) : (
        <div className="container py-4">
          <h1 className="text-center my-4">Order Details</h1>

          <div className="row pb-4">
            <div className="col-lg-6">
              <div className="card border-0">
                <div className="card-body">
                  <h5 className="card-title mb-4">Shipping Information</h5>
                  <p className="card-text mb-1">
                    <strong>Name:</strong> {user && user.name}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Phone:</strong>{" "}
                    {shippingInfo && shippingInfo.phoneNo}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Address:</strong> {shippingDetails}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0">
                <div className="card-body">
                  <h5 className="card-title mb-4">Payment</h5>
                  <p
                    className={`card-text mb-1 ${
                      isPaid ? "text-success" : "text-danger"
                    }`}
                  >
                    <strong>{isPaid ? "PAID" : "NOT PAID"}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Items</h5>
              {orderItems &&
                orderItems.map((item) => (
                  <div
                    key={item.product}
                    className="d-flex justify-content-between align-items-center mb-3"
                  >
                    <div className="col-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded"
                      />
                    </div>
                    <div className="col-6">
                      <Link
                        to={`/product/${item.product}`}
                        className="text-decoration-none"
                      >
                        <p className="mb-0">{item.name}</p>
                      </Link>
                    </div>
                    <div className="col-3 text-end">
                      <p className="mb-0">
                        Rs. {item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card border-0 mt-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              <p className="mb-1">
                <strong>Total Price:</strong> Rs. {totalPrice}
              </p>
              <p
                className={`mb-0 ${
                  orderStatus && String(orderStatus).includes("Delivered")
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                <strong>Order Status:</strong> {orderStatus}
              </p>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default OrderDetails;
