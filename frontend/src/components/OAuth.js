import React from "react";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { login } from "../actions/userActions";
import { useHistory } from "react-router-dom";
import GoogleButton from "react-google-button";

export default function OAuth() {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      const res = await fetch("/api/v1/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to login with Google");
      }

      const data = await res.json();

      // Save token to local storage

      dispatch(login(data.user));
      history.push("/");
      // Redirect based on user role
    } catch (error) {
      console.error("Unable to login with Google", error);
      // Handle error, e.g., display error message to user
    }
  };

  return (
    <GoogleButton
      type="button"
      onClick={handleGoogleClick}
      className="bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-95"
    />
  );
}
