// AuthRouteGuard.js
import { useAuthentication } from "context/AuthenticationService";
import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

function AuthRouteGuard({ children }) {
  const { authenticated } = useAuthentication();

  if (!authenticated) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return children;
}

AuthRouteGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRouteGuard;
