//profile.js

import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUser, FaEdit, FaKey, FaShoppingBag } from "react-icons/fa";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const Profile = () => {
  const { user, loading, isGoogleUser } = useSelector((state) => state.auth);

  // Check if user is null or undefined
  if (!user) {
    return <Loader />; // or any other loading indicator or message
  }

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Your Profile"} />

          <h2 className="mt-5 text-center">My Profile</h2>
          <div className="container mt-5">
            <div className="row justify-content-center">
              {/* User Details Card */}
              <div className="col-md-4 mb-4">
                <div className="card profile-card shadow">
                  <div className="card-body text-center">
                    <img
                      className="card-img-top rounded-circle mx-auto mt-3"
                      src={user.avatar.url}
                      alt={user.name}
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <h5 className="card-title mt-3">{user.name}</h5>
                    <p className="card-text">{user.email}</p>
                    <p className="card-text">
                      Joined On: {String(user.createdAt).substring(0, 10)}
                    </p>
                    <Link
                      to="/me/update"
                      className="btn btn-primary btn-sm mr-2"
                      title="Edit Profile"
                    >
                      <FaEdit /> Edit Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Orders and Password Card */}
              <div className="col-md-4 mb-4">
                <div className="card profile-card shadow">
                  <div className="card-body text-center">
                    <h5 className="card-title">My Orders</h5>
                    <Link
                      to="/orders/me"
                      className="btn btn-danger btn-block"
                      title="My Orders"
                    >
                      <FaShoppingBag /> My Orders
                    </Link>
                    <Link
                      to={
                        isGoogleUser
                          ? "/google/password/update"
                          : "/password/update"
                      }
                      className="btn btn-primary btn-block mt-3"
                      title="Change Password"
                    >
                      <FaKey /> Change Password
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Profile;
