// AuthRouteGuard.js
import { useAuthentication } from "context/AuthenticationService";
import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

function AuthRouteGuard({ children }) {
  const authContext = useAuthentication();
  console.log("context");
  console.log(authContext);
  const authenticated = false;
  if (!authenticated) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return children;
}

AuthRouteGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRouteGuard;
