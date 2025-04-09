import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MDBDataTable } from "mdbreact";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { myOrders, clearErrors } from "../../actions/orderActions";

const ListOrders = () => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const { loading, error, orders = [] } = useSelector((state) => state.myOrders);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    dispatch(myOrders());

    if (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while fetching orders';
      alert.error(errorMessage);
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error]);

  const setOrders = () => {
    // Ensure orders is an array before filtering
    const filteredOrders = Array.isArray(orders) 
      ? orders.filter((order) =>
          filterStatus ? order.orderStatus === filterStatus : true
        )
      : [];

    const data = {
      columns: [
        {
          label: "Order ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Num of Items",
          field: "numOfItems",
          sort: "asc",
        },
        {
          label: "Amount",
          field: "amount",
          sort: "asc",
        },
        {
          label: "Status",
          field: "status",
          sort: "asc",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    filteredOrders.forEach((order) => {
      data.rows.push({
        id: order._id,
        numOfItems: order.orderItems.length,
        amount: `Rs. ${order.totalPrice}`,
        status:
          order.orderStatus &&
          String(order.orderStatus).includes("Delivered") ? (
            <p style={{ color: "green" }}>{order.orderStatus}</p>
          ) : (
            <p style={{ color: "red" }}>{order.orderStatus}</p>
          ),
        actions: (
          <Link to={`/order/${order._id}`} className="btn btn-primary">
            <i className="fa fa-eye"></i>
          </Link>
        ),
      });
    });

    return data;
  };

  return (
    <Fragment>
      <MetaData title={"My Orders"} />

      <h1 className="text-center">My Orders</h1>

      <div className="filter-container">
        <label htmlFor="status_field" className="filter-label">
          Filter by Status
        </label>
        <select
          id="status_field"
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <MDBDataTable
          data={setOrders()}
          className="px-3"
          bordered
          striped
          hover
        />
      )}
    </Fragment>
  );
};

export default ListOrders;
