import { useEffect, Fragment, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import CombinedHeader from "./components/layout/CombinedHeader";
import Footer from "./components/layout/Footer";
import ChatBot from "./components/layout/ChatBot";
import Home from "./components/Home";
import ProductDetails from "./components/product/ProductDetails";

import Cart from "./components/cart/Cart";
import Shipping from "./components/cart/Shipping";
import ConfirmOrder from "./components/cart/ConfirmOrder";
import Payment from "./components/cart/Payment";

import OrderReport from "./components/admin/OrderReport";
import OrderSuccess from "./components/cart/OrderSuccess";

// Cart Imports
import ListOrders from "./components/order/ListOrders";
import OrderDetails from "./components/order/OrderDetails";

// Auth or user imports
import Login from "./components/user/Login";
import Register from "./components/user/Register";
import Profile from "./components/user/Profile";
import UpdateProfile from "./components/user/UpdateProfile";
import UpdatePassword from "./components/user/UpdatePassword";
import ForgotPassword from "./components/user/ForgotPassword";
import NewPassword from "./components/user/NewPassword";
import UpdateGooglePassword from "./components/user/UpdateGooglePassword";

// Admin Imports
import Dashboard from "./components/admin/Dashboard";
import ProductList from "./components/admin/ProductList";
import NewProduct from "./components/admin/NewProduct";
import UpdateProduct from "./components/admin/UpdateProduct";
import OrdersList from "./components/admin/OrdersList";
import ProcessOrder from "./components/admin/ProcessOrder";
import UsersList from "./components/admin/UsersList";
import UpdateUser from "./components/admin/UpdateUser";
import ProductReviews from "./components/admin/ProductReviews";
import ExchangeList from "./components/admin/ExchangeList";

import ProtectedRoute from "./components/route/ProtectedRoute";
import { loadUser } from "./actions/userActions";
import { useSelector } from "react-redux";
import store from "./store";
import axios from "axios";

// Compare products
import CompareProducts from "./components/compareProducts";

// Payment
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

function App() {
  const [stripeApiKey, setStripeApiKey] = useState("");
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    store.dispatch(loadUser());

    async function getStripeApiKey() {
      try {
        const { data } = await axios.get("/api/v1/stripeapi");
        console.log("Stripe API Key loaded:", !!data.stripeApiKey); // Debug log
        setStripeApiKey(data.stripeApiKey);
      } catch (error) {
        console.error("Error fetching Stripe API Key:", error);
        setStripeError(error.response?.data?.message || "Failed to load payment system");
      }
    }

    getStripeApiKey();
  }, []);

  const { user, loading } = useSelector((state) => state.auth);

  return (
    <Router>
      <Fragment>
        <div className="App">
          <CombinedHeader />
          <div className="container container-fluid">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/search/:keyword" component={Home} />
              <Route exact path="/product/:id" component={ProductDetails} />

              <Route exact path="/cart" component={Cart} />
              <ProtectedRoute exact path="/shipping" component={Shipping} />
              <ProtectedRoute exact path="/order/confirm" component={ConfirmOrder} />
              <ProtectedRoute exact path="/order/:id" component={OrderDetails} />

              {stripeApiKey ? (
                <Elements stripe={loadStripe(stripeApiKey)}>
                  <ProtectedRoute path="/payment" component={Payment} />
                </Elements>
              ) : (
                <ProtectedRoute 
                  path="/payment" 
                  component={() => (
                    <div className="alert alert-danger">
                      {stripeError || "Payment system is loading..."}
                    </div>
                  )} 
                />
              )}

              <Route exact path="/password/forgot" component={ForgotPassword} />
              <Route exact path="/password/reset/:token" component={NewPassword} />
            </Switch>
          </div>
          <Route path="/products/compare" component={CompareProducts} />
          <Route path="/register" component={Register} />
          <ProtectedRoute exact path="/password/update" component={UpdatePassword} />
          <ProtectedRoute exact path="/dashboard" isAdmin={true} component={Dashboard} />
          <ProtectedRoute exact path="/admin/product" isAdmin={true} component={NewProduct} />
          <ProtectedRoute exact path="/admin/product/:id" isAdmin={true} component={UpdateProduct} />
          <ProtectedRoute exact path="/admin/order/:id" isAdmin={true} component={ProcessOrder} />
          <ProtectedRoute exact path="/admin/user/:id" isAdmin={true} component={UpdateUser} />
          <ProtectedRoute exact path="/admin/reviews" isAdmin={true} component={ProductReviews} />
          <ProtectedRoute exact path="/admin/products" isAdmin={true} component={ProductList} />
          <ProtectedRoute exact path="/admin/exchanges" isAdmin={true} component={ExchangeList} />
          <Route path="/login" component={Login} />
          <ProtectedRoute exact path="/me/update" component={UpdateProfile} />
          <ProtectedRoute exact path="/google/password/update" component={UpdateGooglePassword} />
          <ProtectedRoute exact path="/orders/me" component={ListOrders} />
          <ProtectedRoute exact path="/me" component={Profile} />
          <Route path="/admin/order-report" component={OrderReport} exact />
          <ProtectedRoute exact path="/admin/orders" isAdmin={true} component={OrdersList} />
          <ProtectedRoute exact path="/admin/users" isAdmin={true} component={UsersList} />
          <ProtectedRoute exact path="/success" component={OrderSuccess} />

          {/* {!loading && user && user.role && user.role !== "admin" && <Footer />} */}
          <ChatBot />
          <Footer />
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
