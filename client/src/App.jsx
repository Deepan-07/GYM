import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/LoginPage';
import GymRegister from './pages/GymRegister';
import ClientRegister from './pages/ClientRegister';
import RegistrationSuccess from './pages/RegistrationSuccess';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';

// Owner
import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerClients from './pages/owner/Clients';
import OwnerPlans from './pages/owner/Plans';
import OwnerPayments from './pages/owner/Payments';
import OwnerRedTag from './pages/owner/RedTag';
import OwnerProfile from './pages/owner/Profile';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientPlans from './pages/client/ClientPlans';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGyms from './pages/admin/AdminGyms';
import AdminClients from './pages/admin/AdminClients';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || token === 'undefined' || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-dark min-h-screen text-slate-200">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            
            {/* Owner Routes */}
            <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="clients" element={<OwnerClients />} />
              <Route path="plans" element={<OwnerPlans />} />
              <Route path="payments" element={<OwnerPayments />} />
              <Route path="redtag" element={<OwnerRedTag />} />
              <Route path="profile" element={<OwnerProfile />} />
            </Route>
            
            {/* Client Routes */}
            <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/plans" element={<ProtectedRoute allowedRoles={['client']}><ClientPlans /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/gyms" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminGyms /></ProtectedRoute>} />
            <Route path="/admin/gyms/:gymId/clients" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminClients /></ProtectedRoute>} />

          </Routes>
        </div>
        <ToastContainer theme="dark" />
      </Router>
    </AuthProvider>
  );
};

export default App;
