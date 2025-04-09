// // UpdateGooglePassword.js

// import React, { Fragment, useState, useEffect } from "react";
// import { useHistory } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useAlert } from "react-alert";
// import { UPDATE_PASSWORD_RESET } from "../../constants/userConstants";

// const UpdateGooglePassword = () => {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const alert = useAlert();
//   const history = useHistory();
//   const dispatch = useDispatch();

//   const { error, isUpdated, loading } = useSelector((state) => state.user);

//   useEffect(() => {
//     if (error) {
//       alert.error(error);
//       dispatch(clearErrors());
//     }

//     if (isUpdated) {
//       alert.success("Password updated successfully");
//       history.push("/me");
//       dispatch({ type: UPDATE_PASSWORD_RESET });
//     }
//   }, [dispatch, alert, error, history, isUpdated]);

//   const submitHandler = (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert.error("Passwords do not match");
//       return;
//     }

//     dispatch(updateGooglePassword({ password }));
//   };

//   return (
//     <Fragment>
//       <div className="row wrapper">
//         <div className="col-10 col-lg-5">
//           <form className="shadow-lg" onSubmit={submitHandler}>
//             <h1 className="mt-2 mb-5">Update Password</h1>

//             <div className="form-group">
//               <label htmlFor="new_password_field">New Password</label>
//               <input
//                 type="password"
//                 id="new_password_field"
//                 className="form-control"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="confirm_password_field">Confirm Password</label>
//               <input
//                 type="password"
//                 id="confirm_password_field"
//                 className="form-control"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>

//             <button
//               type="submit"
//               className="btn update-btn btn-block mt-4 mb-3"
//               disabled={loading ? true : false}
//             >
//               Update Password
//             </button>
//           </form>
//         </div>
//       </div>
//     </Fragment>
//   );
// };

// export default UpdateGooglePassword;
