// Product.js
import React from "react";
import { Link } from "react-router-dom";

const Product = ({ product, col, handleSelectProduct, selectedProducts }) => {
  const isSelected = selectedProducts.some(
    (selectedProduct) => selectedProduct._id === product._id
  );

  const toggleProductSelection = () => {
    if (isSelected) {
      handleSelectProduct(product, false); // Unselect the product if already selected
    } else {
      handleSelectProduct(product, true); // Select the product if not selected
    }
  };

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${col} my-3`}>
      <div className="card p-3 shadow hover-effect rounded">
        <img
          alt="imageOfproduct"
          className="card-img-top mx-auto"
          src={product.images[0].url}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h5>
          <div className="ratings mt-auto">
            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{ width: `${(product.ratings / 5) * 100}%` }}
              ></div>
            </div>
            <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>
          </div>
          <p className="card-text">Rs. {product.price}</p>
          <div className="compare-text">
            Compare
            <input
              type="checkbox"
              checked={isSelected}
              onChange={toggleProductSelection}
              style={{ marginLeft: "5px", transform: "scale(1.5)" }}
            />
          </div>
          <Link
            to={`/product/${product._id}`}
            id="view_btn"
            className="btn btn-block btn-sm mt-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Product;
