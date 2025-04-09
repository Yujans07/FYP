import React, { Fragment, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import Sidebar from "./Sidebar";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderDetails,
  updateOrder,
  clearErrors,
} from "../../actions/orderActions";
import { UPDATE_ORDER_RESET } from "../../constants/orderConstants";

const ProcessOrder = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("");
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, order = {} } = useSelector((state) => state.orderDetails);
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    user,
    totalPrice,
    orderStatus,
  } = order;
  const { error, isUpdated } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getOrderDetails(id));
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    if (isUpdated) {
      alert.success("Order updated successfully");
      dispatch({ type: UPDATE_ORDER_RESET });
      dispatch(getOrderDetails(id)); // Re-fetch order details to get updated data
    }
  }, [dispatch, alert, error, isUpdated, id]);

  const updateOrderHandler = (id) => {
    const formData = new FormData();
    formData.set("status", status);

    dispatch(updateOrder(id, formData));
  };

  const shippingDetails =
    shippingInfo &&
    `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`;

  const isPaid =
    orderStatus === "Delivered" ||
    (paymentInfo && paymentInfo.status === "succeeded");

  return (
    <Fragment>
      <MetaData title={`Process Order # ${order && order._id}`} />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>

        <div className="col-12 col-md-9">
          <Fragment>
            {loading ? (
              <Loader />
            ) : (
              <div className="row justify-content-around order-details-container">
                <div className="col-12 col-lg-5">
                  <h2 className="my-4 order-details-title">
                    Order # {order._id}
                  </h2>

                  <div className="section-content">
                    <h4 className="section-header mb-3">Shipping Info</h4>
                    <p>
                      <b>Name:</b> {user && user.name}
                    </p>
                    <p>
                      <b>Phone:</b> {shippingInfo && shippingInfo.phoneNo}
                    </p>
                    <p>
                      <b>Address:</b> {shippingDetails}
                    </p>
                    <p>
                      <b>Amount:</b> Rs. {totalPrice ? totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </p>
                  </div>

                  <hr />

                  <div className="section-content">
                    <h4 className="section-header mb-3">Payment</h4>
                    <p className={isPaid ? "greenColor" : "redColor"}>
                      <b>{isPaid ? "PAID" : "NOT PAID"}</b>
                    </p>
                    {paymentInfo && paymentInfo.id && (
                      <p>
                        <b>Stripe ID:</b> {paymentInfo.id}
                      </p>
                    )}
                  </div>

                  <hr />

                  <div className="section-content">
                    <h4 className="section-header mb-3">Order Status:</h4>
                    <p
                      className={
                        orderStatus && orderStatus.includes("Delivered")
                          ? "greenColor"
                          : "redColor"
                      }
                    >
                      <b>{orderStatus}</b>
                    </p>
                  </div>

                  <hr />

                  <div className="section-content order-items">
                    <h4 className="section-header mb-3">Order Items:</h4>
                    {orderItems &&
                      orderItems.map((item) => (
                        <div key={item.product} className="order-item">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid mr-3"
                          />
                          <div className="order-item-details">
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                            <p>Rs. {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p>{item.quantity} Piece(s)</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="col-12 col-lg-3 mt-5">
                  <h4 className="section-header mb-3">Update Status</h4>
                  <div className="status-dropdown">
                    <select
                      className="form-control mb-3"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-primary btn-block update-button"
                    onClick={() => updateOrderHandler(order._id)}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            )}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default ProcessOrder;
