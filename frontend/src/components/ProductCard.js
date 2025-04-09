import React from "react";
import { FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProductCard = ({ product, col }) => {
  return (
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
        <p className="card-text ">Rs. {product.price}</p>
        <Link
          to={`/product/${product._id}`}
          id="view_btn"
          className="btn btn-block btn-sm mt-2"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
