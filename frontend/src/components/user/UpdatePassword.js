import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import MetaData from "../layout/MetaData";
import { updatePassword } from "../../actions/userActions";
import { UPDATE_PASSWORD_RESET } from "../../constants/userConstants";

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  const alert = useAlert();
  const history = useHistory();
  const dispatch = useDispatch();

  const { error, isUpdated, loading } = useSelector(
    (state) => state.updatePassword
  );

  useEffect(() => {
    if (error) {
      alert.error(error.errMessage || "old password is invalid");
      dispatch({ type: UPDATE_PASSWORD_RESET }); // Reset error state after showing alert
    }

    if (isUpdated) {
      alert.success("Password updated successfully");
      dispatch({ type: UPDATE_PASSWORD_RESET });
      history.push("/me");
    }
  }, [dispatch, alert, error, isUpdated, history]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updatePassword({ oldPassword, password }));
  };

  return (
    <Fragment>
      <MetaData title={"Change Password"} />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form onSubmit={submitHandler}>
            <h1 className="mt-2 mb-5">Update Password</h1>
            <div className="form-group">
              <label htmlFor="old_password_field">Old Password</label>
              <input
                type="password"
                id="old_password_field"
                className="form-control"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password_field">New Password</label>
              <input
                type="password"
                id="new_password_field"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn update-btn btn-block mt-4 mb-3"
              disabled={loading ? true : false}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default UpdatePassword;
