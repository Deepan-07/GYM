import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Users, UserCheck, AlertCircle, AlertTriangle, List, X, UserPlus, Eye, Activity, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../components/ClientForm';
import ClientDetail from './ClientDetail';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`card relative overflow-hidden group`}>
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
     
     <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-in-out ${color}`}></div>
  </div>
);

const ClientTable = ({ clients, onView }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Client</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {clients.map(client => (
                    <tr key={client._id} className="hover:bg-gray-800/30 transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {client.personalInfo?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-white font-semibold truncate">{client.personalInfo?.name}</span>
                                    <span className="text-gray-400 text-xs truncate">{client.clientId || 'N/A'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className="text-gray-300 text-sm">{client.personalInfo?.mobileNo}</span>
                                <span className="text-gray-500 text-xs">{client.personalInfo?.email || 'N/A'}</span>
                            </div>
                        </td>
                        <td className="p-4 text-right">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onView(client); }}
                                className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                title="View Details"
                            >
                                <Eye size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Dashboard = () => {
   const navigate = useNavigate();
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [showAddModal, setShowAddModal] = useState(false);
   const [viewClient, setViewClient] = useState(null);
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <StatCard title="Total Clients" value={stats?.stats?.totalClients || 0} icon={<Users size={24} className="text-primary" />} color="bg-primary text-primary" />
                    <StatCard title="Active Clients" value={stats?.stats?.activeClients || 0} icon={<UserCheck size={24} className="text-emerald-400" />} color="bg-emerald-500 text-emerald-500" />
                    <StatCard 
                        title="Retention Rate" 
                        value={`${stats?.stats?.totalClients > 0 ? ((stats?.stats?.activeClients / stats?.stats?.totalClients) * 100).toFixed(1) : 0}%`} 
                        icon={<Activity size={24} className="text-blue-400" />} 
                        color="bg-blue-500 text-blue-500" 
                    />
                    <div onClick={() => navigate('/owner/requests')} className="cursor-pointer">
                        <StatCard title="Pending Requests" value={stats?.pendingList?.length || 0} icon={<UserPlus size={24} className="text-yellow-500" />} color="bg-yellow-500 text-yellow-500" />
                    </div>
                    <StatCard title="Expiring Soon" value={stats?.stats?.expiringSoon || 0} icon={<AlertCircle size={24} className="text-warning" />} color="bg-warning text-warning" />
                    <StatCard title="Expired" value={stats?.stats?.expiredClients || 0} icon={<AlertTriangle size={24} className="text-alert" />} color="bg-alert text-alert" />
                </div>

               {/* Recent Clients */}
               <div className="card p-0 mb-8 bg-gray-900/30 border-gray-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  <div className="flex justify-between items-center p-6 border-b border-gray-800">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-primary" /> Recent Clients
                     </h3>
                     <button onClick={() => navigate('/owner/clients')} className="text-primary text-sm hover:underline font-medium">
                        View All
                     </button>
                  </div>
                  {stats?.recentClients?.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 bg-gray-800/20 dashed">No clients found</div>
                  ) : (
                      <ClientTable clients={stats?.recentClients || []} onView={setViewClient} />
                  )}
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Expiring Soon */}
                  <div className="card p-0 bg-gray-900/30 border-gray-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                     <div className="flex justify-between items-center p-6 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Expiring Soon</h3>
                     </div>
                     {stats?.expiringSoonList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 dashed">No clients expiring soon</div>
                     ) : (
                         <div>
                             <ClientTable clients={stats?.expiringSoonList?.slice(0, 3) || []} onView={setViewClient} />

                             {stats?.stats?.expiringSoon > 3 && (
                               <div className="p-4 border-t border-gray-800">
                                   <button 
                                     onClick={() => navigate('/owner/clients?status=Expiring Soon')}
                                     className="w-full py-2 text-primary text-sm font-medium hover:bg-primary/10 rounded-lg border border-primary/20 transition-all"
                                    >
                                     View More
                                   </button>
                               </div>
                             )}
                         </div>
                     )}
                  </div>

                  {/* Expired List */}
                  <div className="card p-0 bg-gray-900/30 border-gray-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                     <div className="flex justify-between items-center p-6 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-alert"></div> Expired</h3>
                     </div>
                     {stats?.expiredList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 dashed">No expired clients</div>
                     ) : (
                         <div>
                             <ClientTable clients={stats?.expiredList?.slice(0, 3) || []} onView={setViewClient} />

                             {stats?.stats?.expiredClients > 3 && (
                               <div className="p-4 border-t border-gray-800">
                                   <button 
                                     onClick={() => navigate('/owner/expired')}
                                     className="w-full py-2 text-alert text-sm font-medium hover:bg-alert/10 rounded-lg border border-alert/20 transition-all"
                                   >
                                     View More
                                   </button>
                               </div>
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

            {/* View Client Modal */}
            {viewClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative bg-gray-900 border border-gray-700/50 rounded-xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-white">Client Details</h2>
                            <button onClick={() => setViewClient(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <ClientDetail clientId={viewClient._id} onClose={() => setViewClient(null)} />
                        </div>
                    </div>
                </div>
            )}

       </div>
   );
};

export default Dashboard;
