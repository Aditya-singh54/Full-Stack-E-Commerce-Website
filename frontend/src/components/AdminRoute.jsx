import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
