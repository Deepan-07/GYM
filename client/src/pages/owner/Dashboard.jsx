import React, { useEffect, useState } from 'react';
// Sidebar removed (rendered via OwnerLayout)
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Users, UserCheck, AlertCircle, AlertTriangle, List, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../components/ClientForm';
import ClientProfileHeader from '../../components/ClientProfileHeader';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`card relative overflow-hidden group`}>
     {/* Decorative background shape */}
     <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 ease-out ${color}`}></div>
     
     <div className="flex justify-between items-start relative z-10">
        <div>
           <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1 opacity-80 group-hover:opacity-100 transition-opacity">{title}</p>
           <h3 className="text-3xl font-black text-white group-hover:text-primary transition-colors duration-300">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 backdrop-blur-md border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
           {icon}
        </div>
     </div>
     
     {/* Bottom accent line */}
     <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-in-out ${color}`}></div>
  </div>
);

const Dashboard = () => {
   const navigate = useNavigate();
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [showAddModal, setShowAddModal] = useState(false);
   const [formInstanceKey, setFormInstanceKey] = useState(0);
   const [isFormDirty, setIsFormDirty] = useState(false);

   const closeAddModal = (force = false) => {
       if (!force && isFormDirty) {
           if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) {
               return;
           }
       }
       setShowAddModal(false);
       setFormInstanceKey((currentKey) => currentKey + 1);
       setIsFormDirty(false);
   };

   const fetchStats = async () => {
       try {
           const res = await api.get('/gym/dashboard');
           setStats(res.data.data);
       } catch (error) {
           toast.error("Failed to load dashboard data");
       } finally {
           setLoading(false);
       }
   };

   useEffect(() => {
       fetchStats();
   }, []);


   if(loading) return <div className="flex flex-1 justify-center items-center min-h-screen pt-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

   return (
       <div className="flex flex-col h-full bg-dark">
           <div className="flex-1 overflow-y-auto p-8 pt-10">
               <div className="flex justify-between items-center mb-8">
                   <div>
                      <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                      <p className="text-gray-400 mt-1">Here is what's happening in your Gym today.</p>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 font-medium transition-all">
                        + Add Client
                      </button>
                      <button onClick={() => navigate('/owner/transactions', { state: { showPaymentModal: true } })} className="bg-accent hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-accent/30 font-medium transition-all">
                        Record Payment
                      </button>
                   </div>
               </div>


               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                   <StatCard title="Total Clients" value={stats?.stats?.totalClients} icon={<Users size={24} className="text-primary" />} color="bg-primary text-primary" />
                   <StatCard title="Active" value={stats?.stats?.activeClients} icon={<UserCheck size={24} className="text-accent" />} color="bg-accent text-accent" />
                   <div onClick={() => navigate('/owner/requests')} className="cursor-pointer">
                       <StatCard title="Pending Requests" value={stats?.pendingList?.length || 0} icon={<UserPlus size={24} className="text-yellow-500" />} color="bg-yellow-500 text-yellow-500" />
                   </div>
                   <StatCard title="Expiring Soon" value={stats?.stats?.expiringSoon} icon={<AlertCircle size={24} className="text-warning" />} color="bg-warning text-warning" />
                   <StatCard title="Payment Overdue" value={stats?.stats?.overdueClients} icon={<AlertTriangle size={24} className="text-alert" />} color="bg-alert text-alert" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Expiring Soon */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Expiring Soon</h3>
                     </div>
                     {stats?.expiringSoonList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800 dashed">No clients expiring soon</div>
                     ) : (
                         <div className="space-y-3">
                             {stats?.expiringSoonList?.slice(0, 3).map(client => (
                                 <div 
                                   key={client._id} 
                                   onClick={() => navigate(`/owner/clients/${client._id}`)}
                                   className="cursor-pointer"
                                 >
                                     <ClientProfileHeader client={client} compact />
                                 </div>
                             ))}

                             {stats?.stats?.expiringSoon > 3 && (
                               <button 
                                 onClick={() => navigate('/owner/clients?status=expiring_soon')}
                                 className="w-full mt-2 py-2 text-primary text-sm font-medium hover:bg-primary/10 rounded-lg border border-primary/20 transition-all"
                                >
                                 View More
                               </button>
                             )}
                         </div>
                     )}
                  </div>

                  {/* Overdue List */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-alert"></div> Payment Overdue</h3>
                     </div>
                     {stats?.overdueList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800 dashed">No payment overdue clients</div>
                     ) : (
                         <div className="space-y-3">
                             {stats?.overdueList?.slice(0, 3).map(client => (
                                 <div 
                                   key={client._id} 
                                   onClick={() => navigate(`/owner/clients/${client._id}`)}
                                   className="cursor-pointer"
                                 >
                                     <ClientProfileHeader client={client} compact />
                                 </div>
                             ))}

                             {stats?.stats?.overdueClients > 3 && (
                               <button 
                                 onClick={() => navigate('/owner/overdue')}
                                 className="w-full mt-2 py-2 text-alert text-sm font-medium hover:bg-alert/10 rounded-lg border border-alert/20 transition-all"
                               >
                                 View More
                               </button>
                             )}
                         </div>
                     )}
                  </div>
               </div>
           </div>

           {/* Add Client Modal */}
           {showAddModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                   <div className="relative bg-dark border border-gray-700/50 rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                       <button type="button" onClick={() => closeAddModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10">
                           <X size={24} />
                       </button>
                       <h2 className="text-2xl font-bold text-white mb-6">Add New Client</h2>
                       <ClientForm 
                           key={formInstanceKey}
                           mode="owner" 
                           showCancel
                           onCancel={() => closeAddModal(false)}
                           onDirtyChange={setIsFormDirty}
                           onSuccess={() => {
                               closeAddModal(true);
                               toast.success('Client added successfully');
                               fetchStats();
                           }}
                       />
                   </div>
               </div>
           )}

       </div>
   );
};

export default Dashboard;
