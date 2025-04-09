// OrderStatistics.js

import React from "react";

const OrderStatistics = ({ orderStatisticsData }) => {
  return (
    <div>
      <h1>Order Statistics by Month</h1>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(orderStatisticsData).map(([month, totalAmount]) => (
            <tr key={month}>
              <td>{month}</td>
              <td>{`$${totalAmount.toFixed(2)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderStatistics;
