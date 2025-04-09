import React, { Fragment } from "react";
import { Route, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { logout } from "../../actions/userActions";
import Search from "./Search";
import { getProducts } from "../../actions/productActions";
import "../../App.css";

const CombinedHeader = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const location = useLocation();

  const { user, loading } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const categories = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",
    "Google",
    "Others"
  ];

  const logoutHandler = () => {
    dispatch(logout());
    alert.success("Logged out successfully.");
  };

  const handleCategorySelect = (category) => {
    dispatch(getProducts("", 1, [1000, 1000000], category || "", 0));
  };

  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    const categoryHeader = document.querySelector(".category-header");
    const content = document.querySelector(".content");

    if (navbar && categoryHeader) {
      // Check if navbar and categoryHeader exist
      if (window.scrollY > 0) {
        navbar.classList.add("fixed");
        categoryHeader.classList.add("fixed");
        content.style.paddingTop =
          "156px"; /* Adjust this value according to the combined height of both headers */
      } else {
        navbar.classList.remove("fixed");
        categoryHeader.classList.remove("fixed");
        content.style.paddingTop = "0";
      }
    }
  });

  return (
    <Fragment>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="/images/brand.png" alt="Mobile Hub" className="logo" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto align-items-center">
              <li className="nav-item search-item">
                <Route render={({ history }) => <Search history={history} />} />
              </li>
              <li className="nav-item">
                <Link to="/cart" className="nav-link" id="cart">
                  <div className="cart-icon">
                    <i className="fas fa-shopping-cart"></i>
                    <span id="cart_count">{cartItems.length}</span>
                  </div>
                </Link>
              </li>
              {user ? (
                <li className="nav-item ml-auto">
                  <div className="avatar-container">
                    <figure className="avatar avatar-nav">
                      {user.avatar && (
                        <img
                          src={user.avatar.url}
                          alt={user && user.name}
                          className="rounded-circle avatar-nav"
                        />
                      )}
                    </figure>
                  </div>
                  <div className="dropdown-container">
                    <span className="username">{user && user.name}</span>
                    <div
                      className="dropdown-menu dropdown-menu-right"
                      aria-labelledby="navbarDropdown"
                    >
                      {user && user.role === "admin" && (
                        <Link className="dropdown-item" to="/dashboard">
                          Dashboard
                        </Link>
                      )}
                      <Link className="dropdown-item" to="/orders/me">
                        Orders
                      </Link>
                      <Link className="dropdown-item" to="/me">
                        Profile
                      </Link>
                      <Link
                        className="dropdown-item text-danger"
                        to="/"
                        onClick={logoutHandler}
                      >
                        Logout
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                !loading && (
                  <li className="nav-item">
                    <Link to="/login" className="btn" id="login_btn">
                      Login
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </nav>
      {location.pathname === "/" && (
        <nav className="category-header navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
            <div className="navbar-nav">
              <div className="nav-item category-item">
                <span
                  className="nav-link"
                  onClick={() => handleCategorySelect(null)}
                >
                  All Products
                </span>
              </div>
              {categories.map((category) => (
                <div key={category} className="nav-item category-item">
                  <span
                    className="nav-link"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}
      <div className="content">{/* Your content goes here */}</div>
    </Fragment>
  );
};

export default CombinedHeader;
