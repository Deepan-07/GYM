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
import OwnerInactiveClients from './pages/owner/InactiveClients';
import OwnerPlans from './pages/owner/Plans';
import ClientsPayment from './pages/owner/ClientsPayment';
import OwnerDues from './pages/owner/Dues';
import OwnerOverdue from './pages/owner/Overdue';
import OwnerProfile from './pages/owner/Profile';
import OwnerRequests from './pages/owner/ClientRequests';
import ClientDetail from './pages/owner/ClientDetail';
import PaymentLedger from './pages/owner/PaymentLedger';

// Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientPlans from './pages/client/ClientPlans';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGyms from './pages/admin/AdminGyms';
import AdminClients from './pages/admin/AdminClients';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-dark">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  
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
              <Route path="inactive-clients" element={<OwnerInactiveClients />} />
              <Route path="plans" element={<OwnerPlans />} />
              <Route path="clients-payment" element={<ClientsPayment />} />
              <Route path="dues" element={<OwnerDues />} />
              <Route path="overdue" element={<OwnerOverdue />} />
              <Route path="payment-ledger" element={<PaymentLedger />} />
              <Route path="profile" element={<OwnerProfile />} />
              <Route path="requests" element={<OwnerRequests />} />
              <Route path="clients/:id" element={<ClientDetail />} />
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
