import React from "react";

const BlankBoxTable = ({
  selectedProducts,
  handleRemoveProduct,
  uncheckToggle,
}) => {
  const handleRemoveAndUncheck = (product) => {
    handleRemoveProduct(product);
    uncheckToggle(product._id);
    // Call a function to uncheck the toggle for the removed product
    // (This function needs to be implemented)
  };

  const hasBlankBox = selectedProducts.length < 3;

  return (
    <div className="selected-products-box">
      <div className="selected-products-header">
        <h2>Selected Products</h2>
        <button className="compare-now-button">Compare Now</button>
      </div>
      <div className="selected-products-container">
        {selectedProducts.map((product) => (
          <div
            key={product._id}
            className="product-card shadow-lg p-3 mb-5 bg-white rounded"
          >
            <button
              className="remove-product-button"
              onClick={() => handleRemoveAndUncheck(product)}
            >
              Remove
            </button>
            <img src={product.images[0].url} alt={product.name} />
            <p>{product.name}</p>
          </div>
        ))}
        {/* Add two blank cards */}
        {[...Array(3 - selectedProducts.length)].map((_, index) => (
          <div
            key={index}
            className="product-card shadow-lg p-3 mb-5 bg-white rounded"
          >
            {/* Add blank content */}
          </div>
        ))}
      </div>
      {/* Display "Limit Reached" message conditionally */}
      {!hasBlankBox && <p>Limit Reached</p>}
    </div>
  );
};

export default BlankBoxTable;
