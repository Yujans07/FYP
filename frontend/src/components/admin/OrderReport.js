import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import Sidebar from "./Sidebar";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { allOrders, clearErrors } from "../../actions/orderActions";
import { MDBDataTable } from "mdbreact";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const OrderReport = () => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const { loading, error, orders } = useSelector((state) => state.allOrders);

  useEffect(() => {
    dispatch(allOrders());

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error]);

  const aggregateOrdersByMonth = () => {
    const aggregatedData = {};

    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.toLocaleString("default", { month: "long" });

        if (!aggregatedData[month]) {
          aggregatedData[month] = order.totalPrice;
        } else {
          aggregatedData[month] += order.totalPrice;
        }
      });
    }

    return aggregatedData;
  };

  const orderStatisticsData = aggregateOrdersByMonth();

  const months = Object.keys(orderStatisticsData);
  const totalAmounts = Object.values(orderStatisticsData);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Total Amount",
        data: totalAmounts,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(75, 192, 192, 0.4)",
        hoverBorderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  const setOrders = () => {
    const data = {
      columns: [
        {
          label: "SL",
          field: "sl",
          sort: "asc",
        },
        {
          label: "Order ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Total Amount",
          field: "amount",
          sort: "asc",
        },
        {
          label: "Shipping Price",
          field: "shippingPrice",
          sort: "asc",
        },
        {
          label: "VAT/TAX",
          field: "tax",
          sort: "asc",
        },
        {
          label: "Status",
          field: "status",
          sort: "asc",
        },
      ],
      rows: [],
    };

    if (!orders) {
      return data;
    }

    orders.forEach((order, index) => {
      data.rows.push({
        sl: index + 1,
        id: order._id,
        amount: `Rs. ${order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        shippingPrice: `Rs. ${(order.shippingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        tax: `Rs. ${(order.taxPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status:
          order.orderStatus &&
          String(order.orderStatus).includes("Delivered") ? (
            <p style={{ color: "green" }}>{order.orderStatus}</p>
          ) : (
            <p style={{ color: "red" }}>{order.orderStatus}</p>
          ),
      });
    });
    return data;
  };

  const customTooltip = (tooltipModel) => {
    let totalAmount = 0;

    if (tooltipModel.label) {
      const month = tooltipModel.label;

      if (orderStatisticsData.hasOwnProperty(month)) {
        totalAmount = orderStatisticsData[month];
      }
    }

    return `Total Amount: Rs. ${totalAmount.toFixed(2)}`;
  };

  return (
    <Fragment>
      <MetaData title={"Order Report"} />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <Fragment>
            <h4 className="my-5">Order Statistics by Month</h4>
            <div
              className="chart-container"
              style={{ height: "400px", width: "600px" }}
            >
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                          return "Rs" + value.toFixed(2);
                        },
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: customTooltip,
                      },
                    },
                  },
                  legend: {
                    display: false,
                  },
                }}
              />
            </div>
            <h4 className="my-5">
              Total Orders
              <div className="order-box">
                <span className="order-count">{orders && orders.length}</span>
              </div>
            </h4>

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
        </div>
      </div>
    </Fragment>
  );
};

export default OrderReport;
