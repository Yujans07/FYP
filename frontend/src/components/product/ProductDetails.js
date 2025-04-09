import React, { Fragment, useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import ProductCard from "../ProductCard";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ListReviews from "../review/ListReviews";
import axios from "axios";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductDetails,
  newReview,
  clearErrors,
} from "../../actions/productActions";

import { myOrders } from "../../actions/orderActions";

import { addItemToCart } from "../../actions/cartActions";
import { NEW_REVIEW_RESET } from "../../constants/productConstants";
import ExchangeForm from '../exchange/ExchangeForm';

const ProductDetails = ({ match, col, history }) => {
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [comboItem, setComboItem] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isComboSelected, setIsComboSelected] = useState(false);
  const [showExchangeForm, setShowExchangeForm] = useState(false);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const handleNotifyMe = async () => {
    if (!isAuthenticated) {
      // Redirect to login page if user is not authenticated
      history.push(`/login?redirect=product/${match.params.id}`);
    } else {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const { data } = await axios.post(
          `/api/v1/product/${match.params.id}`,
          { email: user.email, productId: match.params.id },
          config
        );

        console.log(data);
        setNotifySuccess(true); // Set notifySuccess directly
      } catch (error) {
        alert.error("Error in notification request. Please try again.");
        console.error(error); // Handle error
      }
    }
  };
  const dispatch = useDispatch();
  const alert = useAlert();

  const { loading, error, product } = useSelector(
    (state) => state.productDetails
  );
  const { products } = useSelector((state) => state.products);

  const { error: reviewError, success } = useSelector(
    (state) => state.newReview
  );

  const { orders } = useSelector((state) => state.myOrders);

  useEffect(() => {
    dispatch(getProductDetails(match.params.id));
    dispatch(myOrders());

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }

    if (reviewError) {
      alert.error(reviewError);
      dispatch(clearErrors());
    }

    if (success) {
      alert.success("Review posted successfully");
      dispatch({ type: NEW_REVIEW_RESET });

      // Refetch product details after review is successfully posted
      dispatch(getProductDetails(match.params.id));
    }

    // Fetch a random combo item from the Accessories category
    const fetchRandomComboItem = async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/products?category=Accessories`
        );
        if (data.products.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.products.length);
          setComboItem(data.products[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching combo item:", error);
      }
    };

    fetchRandomComboItem();
  }, [dispatch, alert, error, reviewError, match.params.id, success]);

  // const addToCart = async () => {
  //   try {
  //     // Get the user ID from the Redux state
  //     const userId = user ? user._id : null;

  //     if (!userId) {
  //       throw new Error("User not authenticated");
  //     }

  //     // Dispatch action to add item to cart in Redux state
  //     await dispatch(addItemToCart(match.params.id, quantity, userId));

  //     if (!isAuthenticated) {
  //       alert("You can continue as a guest or log in to save your cart.");
  //     }

  //     alert.success("Item Added to Cart");

  //     // Optionally redirect the user to their cart page or any other page
  //     // history.push('/cart');
  //   } catch (error) {
  //     console.error("Error adding item to cart:", error);
  //     alert.error("Failed to add item to cart. Please try again.");
  //   }
  // };

  const addToCart = async () => {
    try {
      await dispatch(addItemToCart(match.params.id, quantity));
      if (!isAuthenticated) {
        alert.show("You can continue as a guest or log in to save your cart.");
      } else {
        alert.success("Item Added to Cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert.error("Failed to add item to cart. Please try again.");
    }
  };

  const addToCartCombo = () => {
    if (comboItem) {
      dispatch(addItemToCart(comboItem._id, 1));
      alert.success("Combo Item Added to Cart");
    }
  };

  const increaseQty = () => {
    const count = document.querySelector(".count");

    if (count.valueAsNumber >= product.stock) return;

    const qty = count.valueAsNumber + 1;
    setQuantity(qty);
  };

  const decreaseQty = () => {
    const count = document.querySelector(".count");

    if (count.valueAsNumber <= 1) return;

    const qty = count.valueAsNumber - 1;
    setQuantity(qty);
  };

  function setUserRatings() {
    const stars = document.querySelectorAll(".star");

    stars.forEach((star, index) => {
      star.starValue = index + 1;

      ["click", "mouseover", "mouseout"].forEach(function (e) {
        star.addEventListener(e, showRatings);
      });
    });

    function showRatings(e) {
      stars.forEach((star, index) => {
        if (e.type === "click") {
          if (index < this.starValue) {
            star.classList.add("orange");

            setRating(this.starValue);
          } else {
            star.classList.remove("orange");
          }
        }

        if (e.type === "mouseover") {
          if (index < this.starValue) {
            star.classList.add("yellow");
          } else {
            star.classList.remove("yellow");
          }
        }

        if (e.type === "mouseout") {
          star.classList.remove("yellow");
        }
      });
    }
  }

  const reviewHandler = () => {
    // Check if the user has any orders with status "Delivered"
    const hasDeliveredOrder = orders.some(
      (order) =>
        order.orderStatus === "Delivered" &&
        order.orderItems.some((item) => item.product === match.params.id)
    );

    if (hasDeliveredOrder) {
      const formData = new FormData();

      formData.set("rating", rating);
      formData.set("comment", comment);
      formData.set("productId", match.params.id);

      dispatch(newReview(formData));
    } else {
      alert.error(
        "You can only post a review for delivered orders of this product."
      );
    }
  };

  // Calculate total price when comboItem or quantity changes
  useEffect(() => {
    if (product && comboItem) {
      if (isComboSelected) {
        setTotalPrice(product.price + comboItem.price);
      } else {
        setTotalPrice(product.price);
      }
    }
  }, [product, comboItem, quantity, isComboSelected]);

  const handleComboSelection = () => {
    setIsComboSelected(!isComboSelected);
  };

  const handleAddToCart = () => {
    if (isComboSelected && comboItem) {
      dispatch(addItemToCart(product._id, quantity));
      dispatch(addItemToCart(comboItem._id, 1));
      alert.success("Both Products Added to Cart");
    } else {
      alert.error("Please select the combo item first");
    }
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={product.name} />
          <div className="row d-flex justify-content-around">
            <div className="col-12 col-lg-5 img-fluid" id="product_image">
              <Carousel pause="hover">
                {product.images &&
                  product.images.map((image) => (
                    <Carousel.Item key={image.public_id}>
                      <img
                        className="d-block w-100"
                        src={image.url}
                        alt={product.title}
                      />
                    </Carousel.Item>
                  ))}
              </Carousel>
            </div>

            <div className="col-12 col-lg-5 mt-5">
              <h3>{product.name}</h3>
              <p id="product_id">Product # {product._id}</p>

              <hr />

              <div className="rating-outer">
                <div
                  className="rating-inner"
                  style={{ width: `${(product.ratings / 5) * 100}%` }}
                ></div>
              </div>
              <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>

              <hr />

              <p id="product_price">Rs. {product.price}</p>
              <div className="stockCounter d-inline">
                <span className="btn btn-danger minus" onClick={decreaseQty}>
                  -
                </span>

                <input
                  type="number"
                  className="form-control count d-inline"
                  value={quantity}
                  readOnly
                />

                <span className="btn btn-primary plus" onClick={increaseQty}>
                  +
                </span>
              </div>
              <button
                type="button"
                id="cart_btn"
                className="btn btn-primary d-inline ml-3"
                disabled={product.stock === 0}
                onClick={addToCart}
              >
                Add to Cart
              </button>

              {/* Notify Me button */}
              <button
                type="button"
                id="cart_btn"
                onClick={handleNotifyMe}
                className="btn btn-primary d-inline ml-3"
              >
                Auto Notify
              </button>

              {notifySuccess && (
                <p>
                  We have received your message. You will be notified via email
                  once the product becomes available.
                </p>
              )}

              <hr />

              <p>
                Status:{" "}
                <span
                  id="stock_status"
                  className={product.stock > 0 ? "greenColor" : "redColor"}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </p>

              <hr />

              <h4 className="mt-2">Description:</h4>
              <p>{product.description}</p>
              <hr />

              <h4>Specifications:</h4>
              <ul>
                <li>Processor: {product.processor}</li>
                <li>RAM: {product.ram}</li>
                <li>Operating System: {product.operatingSystem}</li>
                <li>Graphics: {product.graphics}</li>
                <li>Display: {product.display}</li>
                <li>Memory: {product.memory}</li>
                <li>Storage: {product.storage}</li>
                <li>Battery: {product.battery}</li>
              </ul>

              {user ? (
                // Check if orders data is available and then check if the user has any orders with status "Delivered" for the product
                orders &&
                orders.length > 0 &&
                orders.some(
                  (order) =>
                    order.orderStatus === "Delivered" &&
                    order.orderItems.some(
                      (item) => item.product === match.params.id
                    )
                ) ? (
                  <button
                    id="review_btn"
                    type="button"
                    className="btn btn-primary mt-4"
                    data-toggle="modal"
                    data-target="#ratingModal"
                    onClick={setUserRatings}
                  >
                    Submit Your Review
                  </button>
                ) : (
                  <div className="alert alert-danger mt-5" type="alert">
                    You can only post a review for delivered orders of this
                    product.
                  </div>
                )
              ) : (
                <div className="alert alert-danger mt-5" type="alert">
                  You need to be logged in to post a review.
                </div>
              )}

              <div className="row mt-2 mb-5">
                <div className="rating w-50">
                  <div
                    className="modal fade"
                    id="ratingModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="ratingModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="ratingModalLabel">
                            Submit Review
                          </h5>
                          <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <ul className="stars">
                            <li className="star">
                              <i className="fa fa-star"></i>
                            </li>
                            <li className="star">
                              <i className="fa fa-star"></i>
                            </li>
                            <li className="star">
                              <i className="fa fa-star"></i>
                            </li>
                            <li className="star">
                              <i className="fa fa-star"></i>
                            </li>
                            <li className="star">
                              <i className="fa fa-star"></i>
                            </li>
                          </ul>

                          <textarea
                            name="review"
                            id="review"
                            className="form-control mt-3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>

                          <button
                            className="btn my-3 float-right review-btn px-4 text-white"
                            onClick={reviewHandler}
                            data-dismiss="modal"
                            aria-label="Close"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  id="exchange_btn"
                  className="btn btn-primary px-4"
                  onClick={() => setShowExchangeForm(true)}
                  disabled={product.stock === 0}
                >
                  Exchange Your Phone
                </button>
              </div>

              {showExchangeForm && (
                <div className="exchange-modal">
                  <ExchangeForm
                    product={product}
                    onClose={() => setShowExchangeForm(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Combo Offer Section */}
          {comboItem && (
            <div className="combo-offer-box">
              <h2 className="combo-offer-heading">Combo Offer</h2>
              <div className="combo-product d-flex">
                <div className="card p-3 m-3" style={{ width: "18rem" }}>
                  <img
                    src={product.images[0].url}
                    className="card-img-top"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">Rs. {product.price}</p>
                  </div>
                </div>
                <div className="plus-sign">+</div>

                <div className="card p-3 m-3" style={{ width: "18rem" }}>
                  <img
                    src={comboItem.images[0].url}
                    className="card-img-top"
                    alt={comboItem.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{comboItem.name}</h5>
                    <p className="card-text">Rs. {comboItem.price}</p>
                  </div>
                </div>
              </div>
              <p className="total-price">Total Price: ${totalPrice}</p>
              <div className="button-group">
                {isComboSelected && (
                  <button
                    className="btn btn-primary mr-3"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleComboSelection}
                >
                  {isComboSelected ? "Unselect Combo" : "Select Combo"}
                </button>
              </div>
            </div>
          )}

          {/* Recommendations section */}

          <section id="recommendations" className="container mt-4">
            <h2>Similar Products You May Like</h2>
            <div className="row justify-content-center">
              {products.slice(0, 4).map((product) => (
                <div className="col-sm-6 col-lg-3 my-4" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {product.reviews && product.reviews.length > 0 && (
            <ListReviews reviews={product.reviews} />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetails;
