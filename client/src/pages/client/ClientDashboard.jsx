import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Home, List } from 'lucide-react';
import Button from '../../components/Button';
import { calculateDaysLeft, formatDisplayDate } from '../../utils/membership';

const ClientSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col pt-6 px-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-accent flex justify-center items-center font-bold text-lg text-white shadow-lg shadow-accent/30">
          {user?.avatar || 'C'}
        </div>
        <div>
          <h2 className="font-bold text-white text-lg tracking-tight -mb-1 truncate">{user?.personalInfo?.name}</h2>
          <span className="text-xs text-gray-400 uppercase tracking-wider">{user?.gymName}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
          <NavLink to="/client" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white'}`}><Home size={20}/> Profile</NavLink>
          <NavLink to="/client/plans" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white'}`}><List size={20}/> Plans</NavLink>
      </div>

      <div className="pb-6 pt-4 border-t border-gray-800">
         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-alert transition-all group"><LogOut size={20}/> Logout</button>
      </div>
    </div>
  );
}

const ClientDashboard = () => {
   const { user } = useAuth();
   const [profile, setProfile] = useState(null);
   const [formState, setFormState] = useState(null);
   const [loading, setLoading] = useState(true);
   const [editing, setEditing] = useState(false);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/client/profile');
          setProfile(res.data.data);
          setFormState(res.data.data);
        } catch (error) {
          toast.error('Failed to load profile');
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
   }, []);

   const setPersonalInfo = (key, value) => {
      setFormState((current) => ({
        ...current,
        personalInfo: {
          ...current.personalInfo,
          [key]: value
        }
      }));
   };

   const handleCancel = () => {
      setFormState(profile);
      setEditing(false);
   };

   const handleSave = async () => {
      setSaving(true);
      try {
        const res = await api.put('/client/profile', {
          personalInfo: formState.personalInfo
        });
        setProfile(res.data.data);
        setFormState(res.data.data);
        setEditing(false);
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      } finally {
        setSaving(false);
      }
   };

   const getDaysLeftDisplay = () => {
      const membership = formState?.membership;
      if (!membership) return '-';

      const calcDb = calculateDaysLeft(membership.startDate, membership.endDate);
      const computedValue = calcDb !== null ? calcDb : (membership.daysLeft ?? '-');
      
      if (typeof computedValue === 'string' && computedValue.includes('Starts in')) {
         return computedValue;
      }
      
      if (membership.status === 'expired' || membership.status === 'overdue') {
         return 'Expired';
      }

      return `${computedValue} days left`;
   };

   const inputClassName = editing ? 'input-field' : 'input-field bg-gray-800/60 text-gray-500 cursor-not-allowed';

   if (loading || !formState) {
      return <div className="flex bg-dark h-screen overflow-hidden"><ClientSidebar /><div className="flex-1 flex justify-center items-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></div>;
   }

   return (
      <div className="flex bg-dark h-screen overflow-hidden">
        <ClientSidebar />
        <div className="flex-1 overflow-y-auto p-8 pt-10 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Profile</h1>
              <p className="text-gray-400 mt-1">View and manage your personal and membership details.</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                  <Button type="button" onClick={handleSave} isLoading={saving}>Save</Button>
                </>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
              )}
            </div>
          </div>

          <div className="card space-y-5">
            <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-4">Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Client ID</span><input value={formState.clientId || ''} disabled className="input-field bg-gray-800/60 text-gray-500 cursor-not-allowed" /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Gym ID</span><input value={formState.gymId || ''} disabled className="input-field bg-gray-800/60 text-gray-500 cursor-not-allowed" /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Name</span><input value={formState.personalInfo?.name || ''} onChange={(event) => setPersonalInfo('name', event.target.value)} disabled={!editing} className={inputClassName} /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Gender</span><input value={formState.personalInfo?.gender || ''} onChange={(event) => setPersonalInfo('gender', event.target.value)} disabled={!editing} className={inputClassName} /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Email</span><input value={formState.personalInfo?.email || ''} onChange={(event) => setPersonalInfo('email', event.target.value)} disabled={!editing} className={inputClassName} /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Mobile Number</span><input value={formState.personalInfo?.mobileNo || ''} onChange={(event) => setPersonalInfo('mobileNo', event.target.value)} disabled={!editing} className={inputClassName} /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Date of Birth</span><input value={formState.personalInfo?.dob ? formState.personalInfo.dob.slice(0, 10) : ''} onChange={(event) => setPersonalInfo('dob', event.target.value)} disabled={!editing} className={inputClassName} type="date" /></label>
              <label className="space-y-1"><span className="text-xs uppercase tracking-wider text-gray-500">Emergency Contact</span><input value={formState.personalInfo?.emergencyContact || ''} onChange={(event) => setPersonalInfo('emergencyContact', event.target.value)} disabled={!editing} className={inputClassName} /></label>
              <label className="space-y-1 md:col-span-2"><span className="text-xs uppercase tracking-wider text-gray-500">Address</span><textarea value={formState.personalInfo?.address || ''} onChange={(event) => setPersonalInfo('address', event.target.value)} disabled={!editing} className={`${inputClassName} h-24 resize-none`} /></label>
              <label className="space-y-1 md:col-span-2"><span className="text-xs uppercase tracking-wider text-gray-500">Medical Condition</span><textarea value={formState.personalInfo?.medicalCondition || ''} onChange={(event) => setPersonalInfo('medicalCondition', event.target.value)} disabled={!editing} className={`${inputClassName} h-24 resize-none`} /></label>
            </div>
          </div>

          <div className="card space-y-5">
            <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-4">Membership Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">Plan</p><p className="text-white">{formState.membership?.planName || 'N/A'}</p></div>
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">Duration</p><p className="text-white">{formState.membership?.durationMonths ? `${formState.membership.durationMonths} Months` : 'N/A'}</p></div>
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">Days Left</p><p className="text-white">{getDaysLeftDisplay()}</p></div>
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">Start Date</p><p className="text-white">{formatDisplayDate(formState.membership?.startDate)}</p></div>
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">End Date</p><p className="text-white">{formatDisplayDate(formState.membership?.endDate)}</p></div>
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-800"><p className="text-xs text-gray-500 uppercase mb-1">Status</p><p className="text-white uppercase">{formState.membership?.status?.replace('_', ' ') || 'N/A'}</p></div>
            </div>
          </div>
        </div>
      </div>
   );
};

export default ClientDashboard;
