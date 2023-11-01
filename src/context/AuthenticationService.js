// AuthenticationService.js
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AuthenticationContext = createContext();

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};

export const AuthenticationProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
  const [notification, setNotification] = useState({
    isShow: false,
    type: "",
    title: "",
    description: "",
  });

  // Function to handle token refresh
  const refreshAccessToken = async () => {
    // Make an API call to refresh the access token using the refresh token
    try {
      //   const response = await fetch("/api/refresh-token", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${refreshToken}`,
      //     },
      //   });
      //   if (response.ok) {
      //     const data = await response.json();
      //     setAccessToken(data.accessToken);
      //     // Schedule the next token refresh (e.g., a minute before expiration)
      //     const expiresIn = data.expiresIn * 1000;
      //     setTimeout(refreshAccessToken, expiresIn - 60000);
      //   } else {
      //     // Handle token refresh failure (e.g., log the user out)
      //     logout();
      //   }
    } catch (error) {
      // Handle network errors
      console.error("Token refresh failed:", error);
    }
  };

  const login = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Schedule the first token refresh
    const expiresIn = 1000; /* Expires In in milliseconds */
    setTimeout(refreshAccessToken, expiresIn - 60000);

    setAuthenticated(true);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Cancel any scheduled token refresh

    setAuthenticated(false);
  };

  const removeNotification = () => {
    setNotification({
      isShow: false,
      type: "",
      title: "",
      description: "",
    });
  };

  const customNotification = {
    success: ({ title, message }) =>
      setNotification({ isShow: true, title, message, type: "success" }),
    error: ({ title, message }) => setNotification({ isShow: true, title, message, type: "error" }),
    info: ({ title, message }) => setNotification({ isShow: true, title, message, type: "info" }),
    warning: ({ title, message }) =>
      setNotification({ isShow: true, title, message, type: "warning" }),
  };
  // Check if the access token is still valid on initial load
  useEffect(() => {
    console.log("checking");
    const accessTokenLocal = localStorage.getItem("accessToken");
    console.log(accessTokenLocal);
    if (accessTokenLocal) {
      setAuthenticated(true);
      setAccessToken(accessTokenLocal);
      // Decode and check the expiration of the access token
      // If it's expired, refresh it
    }
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{
        notification,
        customNotification,
        removeNotification,
        authenticated,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

AuthenticationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
