import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, List } from 'lucide-react';
import { toast } from 'react-toastify';

// Sidebar code duplicated lightly to keep it self contained without making too many generic layout wrappers, though a real app might use Outlet.
const ClientSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    return (
      <div className="h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col pt-6 px-4">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex justify-center items-center font-bold text-lg text-white">{user?.avatar || 'C'}</div>
          <div><h2 className="font-bold text-white text-lg tracking-tight -mb-1 truncate">{user?.personalInfo?.name}</h2></div>
        </div>
        <div className="flex-1 space-y-2">
            <NavLink to="/client" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white'}`}><Home size={20}/> Profile</NavLink>
            <NavLink to="/client/plans" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white'}`}><List size={20}/> Plans</NavLink>
        </div>
        <div className="pb-6 pt-4 border-t border-gray-800">
           <button onClick={() => {logout(); navigate('/login');}} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-alert transition-all group"><LogOut size={20}/> Logout</button>
        </div>
      </div>
    );
  }

const ClientPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/plan');
                setPlans(res.data.data);
            } catch(e) {
                toast.error("Failed to load plans");
            }
            setLoading(false);
        };
        fetchPlans();
    }, []);

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <ClientSidebar />
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <h1 className="text-3xl font-bold text-white mb-8">Available Gym Plans</h1>

                {loading ? <div className="text-gray-500">Loading plans...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan._id} className="card relative flex flex-col group border-primary/20 transition-colors">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.planName}</h3>
                                <p className="text-primary text-3xl font-black mb-4">₹{plan.price}<span className="text-sm text-gray-400 font-normal"> / {plan.durationMonths} months</span></p>
                                <p className="text-gray-400 text-sm flex-1 mb-6">{plan.description}</p>
                                <p className="text-xs text-gray-500">Contact gym owner to subscribe to this plan.</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPlans;
