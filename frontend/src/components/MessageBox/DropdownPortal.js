import React from "react";
import ReactDOM from "react-dom";

const DropdownPortal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export default DropdownPortal;
