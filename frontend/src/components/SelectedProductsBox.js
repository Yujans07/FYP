// SelectedProductsBox.js
import React from "react";

const SelectedProductsBox = ({
  selectedProducts,
  handleRemoveProduct,
  handleCancelComparison,
  handleCheckboxChange,
}) => {
  return (
    <div className="selected-products-box-container">
      <div className="selected-products-box">
        <div className="selected-products-header">
          <h2>Find Your Perfect Match</h2>
          <button
            className="btn btn-danger cancel-btn"
            onClick={handleCancelComparison}
          >
            Cancel
          </button>
        </div>
        <div className="compare-box row justify-content-center">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    {selectedProducts.map((product) => (
                      <th key={product._id}>{product.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Processor</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.processor}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>RAM</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.ram}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Operating System</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.operatingSystem}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Graphics</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.graphics}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Display</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.display}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Memory</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.memory}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Storage</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.storage}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Battery</td>
                    {selectedProducts.map((product) => (
                      <td key={product._id}>{product.battery}</td>
                    ))}
                  </tr>
                  {/* Add other rows for product details */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedProductsBox;
