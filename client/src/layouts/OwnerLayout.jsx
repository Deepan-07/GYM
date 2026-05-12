import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Tag, Receipt, CircleDollarSign, AlertCircle, User, UserPlus, UserMinus, Clock, CreditCard } from 'lucide-react';

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/owner/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/owner/clients',   label: 'Clients',    icon: Users },
    { to: '/owner/inactive-clients', label: 'Inactive Clients', icon: UserMinus },
    { to: '/owner/plans',     label: 'Plans',      icon: Tag },
    { to: '/owner/clients-payment', label: 'Clients Payment', icon: Receipt },
    { to: '/owner/dues',      label: 'Dues',       icon: CircleDollarSign },
    { to: '/owner/payment-ledger', label: 'Payment Ledger', icon: CircleDollarSign },
    { to: '/owner/requests',  label: 'Requests',   icon: UserPlus },
    { to: '/owner/profile',   label: 'Profile',    icon: User },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f1117' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '240px', minWidth: '240px',
        background: '#1a1d27',
        borderRight: '1px solid #2a2d3a',
        display: 'flex', flexDirection: 'column',
        padding: '0'
      }}>
        {/* Logo / Gym Name */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #2a2d3a'
        }}>
          <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '18px' }}>
            GymPro
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
            {user?.gymName || 'Gym Owner Portal'}
          </div>
          <div style={{
            marginTop: '8px', padding: '4px 8px',
            background: '#0f2d1f', borderRadius: '4px',
            color: '#4ade80', fontSize: '11px',
            fontWeight: 600, display: 'inline-block'
          }}>
            {user?.gymId || ''}
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '11px 20px',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : '#9ca3af',
                background: isActive ? '#2563eb' : 'transparent',
                borderRadius: isActive ? '0' : '0',
                fontSize: '14px', fontWeight: isActive ? 500 : 400,
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                transition: 'all 0.15s'
              })}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a2d3a' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px',
            background: 'transparent',
            border: '1px solid #374151',
            borderRadius: '6px', color: '#9ca3af',
            cursor: 'pointer', fontSize: '14px'
          }}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: '#0f1117', color: '#ffffff'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
