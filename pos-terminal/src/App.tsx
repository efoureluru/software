import React, { useEffect } from 'react';
// Main App Component
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import POS from './pages/POS';
import Login from './pages/Login';
import VerifyTicket from './pages/VerifyTicket';
import AdminDashboard from './pages/AdminDashboard';
import Accounts from './pages/Accounts';
import RideManagement from './pages/RideManagement';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // If user is admin but tries to go to POS - maybe allow? or separate?
    // If user is pos but tries to go to Admin - definitely block.
    if (role === 'admin' && user.role !== 'admin') {
      return <Navigate to="/pos" replace />;
    }
  }

  return children;
}

function App() {
  // Setup Global Axios Interceptors
  useEffect(() => {
    // Request Interceptor: Attach Token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Also set x-auth-token for legacy routes
          config.headers['x-auth-token'] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Auto Logout on 401/403
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (!window.location.hash.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.hash = '#/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/pos"
          element={
            <PrivateRoute>
              <POS />
            </PrivateRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PrivateRoute>
              <VerifyTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <PrivateRoute role="admin">
              <Accounts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/rides"
          element={
            <PrivateRoute role="admin">
              <RideManagement />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/pos" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
