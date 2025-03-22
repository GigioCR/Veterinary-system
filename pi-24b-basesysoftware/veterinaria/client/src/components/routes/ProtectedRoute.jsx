import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ role, redirectTo = "/login" }) => {
  const accessToken = localStorage.getItem('access_token');

  // Redirect to login if there is no token
  if (!accessToken) {
    return <Navigate to={redirectTo} />;
  }

  try {
    // Decode the token to get user role and expiration
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;

    // Check if the token has expired
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userType');
      return <Navigate to={redirectTo} />;
    }

    // Check if the user has the required role
    if (role && decodedToken.userType !== role) {
      return <Navigate to={redirectTo} />;
    }

    // If all checks pass, render the Outlet for nested routes
    return <Outlet />;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userType');
    return <Navigate to={redirectTo} />;
  }
};

export default ProtectedRoute;
