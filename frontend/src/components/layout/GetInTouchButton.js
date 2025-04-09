// GetInTouchButton.js

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

const GetInTouchButton = ({ onClick }) => {
  return (
    <div className="get-in-touch-button" onClick={onClick}>
      <FontAwesomeIcon icon={faEnvelope} />
    </div>
  );
};

export default GetInTouchButton;
