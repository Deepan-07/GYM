import React, { useEffect, useState } from 'react';
// Sidebar removed (rendered via OwnerLayout)
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Users, UserCheck, AlertCircle, AlertTriangle, List, X } from 'lucide-react';
import ClientForm from '../../components/ClientForm';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`card relative overflow-hidden group`}>
     <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${color}`}></div>
     <div className="flex justify-between items-start">
        <div>
           <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
           <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 backdrop-blur-sm`}>
           {icon}
        </div>
     </div>
  </div>
);

const Dashboard = () => {
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

   const handleApprove = async (id) => {
       try {
           await api.put(`/client/${id}/approve`);
           toast.success("Client Approved!");
           fetchStats();
       } catch(e) { toast.error("Failed to approve"); }
   };

   const handleReject = async (id) => {
       try {
           await api.delete(`/client/${id}`);
           toast.success("Client request rejected and deleted");
           fetchStats();
       } catch(e) { toast.error("Failed to reject"); }
   };

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
                      <button className="bg-accent hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-accent/30 font-medium transition-all">
                        Record Payment
                      </button>
                   </div>
               </div>

               {/* Pending Approvals Section */}
               {stats?.pendingList?.length > 0 && (
                   <div className="mb-8 card border-yellow-500/20 bg-yellow-500/5">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Pending Approvals</h3>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                      <th className="p-3">Client ID & Name</th>
                                      <th className="p-3">Phone</th>
                                      <th className="p-3">Requested Plan</th>
                                      <th className="p-3">Start Date</th>
                                      <th className="p-3 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {stats.pendingList.map(client => (
                                      <tr key={client._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                          <td className="p-3 text-white font-medium">{client.clientId || 'Pending ID on approval'} - {client.personalInfo.name}</td>
                                          <td className="p-3 text-gray-400">{client.personalInfo.mobileNo}</td>
                                          <td className="p-3 text-gray-400">{client.membership.planName || 'N/A'}</td>
                                          <td className="p-3 text-gray-400">{client.membership.startDate ? new Date(client.membership.startDate).toLocaleDateString() : '-'}</td>
                                          <td className="p-3 text-right space-x-2">
                                              <button onClick={() => handleApprove(client._id)} className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white px-3 py-1 text-sm rounded transition-colors">Approve</button>
                                              <button onClick={() => handleReject(client._id)} className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 text-sm rounded transition-colors">Reject</button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                   </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
                   <StatCard title="Total Clients" value={stats?.stats?.totalClients} icon={<Users size={24} className="text-primary" />} color="bg-primary text-primary" />
                   <StatCard title="Active" value={stats?.stats?.activeClients} icon={<UserCheck size={24} className="text-accent" />} color="bg-accent text-accent" />
                   <StatCard title="Expiring Soon" value={stats?.stats?.expiringSoon} icon={<AlertCircle size={24} className="text-warning" />} color="bg-warning text-warning" />
                   <StatCard title="Overdue" value={stats?.stats?.redTagClients} icon={<AlertTriangle size={24} className="text-alert" />} color="bg-alert text-alert" />
                   <StatCard title="Total Plans" value={stats?.stats?.totalPlans} icon={<List size={24} className="text-gray-300" />} color="bg-gray-600 text-white" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Expiring Soon */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Expiring Soon</h3>
                        <span className="text-primary text-sm font-medium hover:underline cursor-pointer">View All</span>
                     </div>
                     {stats?.expiringSoonList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800 dashed">No clients expiring soon</div>
                     ) : (
                         <div className="space-y-4">
                             {stats?.expiringSoonList?.map(client => (
                                 <div key={client._id} className="flex justify-between items-center p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-warning/20 text-warning flex items-center justify-center font-bold">
                                            {client.avatar}
                                        </div>
                                        <div>
                                           <h4 className="font-semibold text-white">{client.personalInfo.name}</h4>
                                           <p className="text-xs text-gray-400">{client.membership.planName} • {client.membership.daysLeft} days left</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                         <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-semibold rounded-full">Expiring</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                  </div>

                  {/* Overdue List */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-alert"></div> Overdue</h3>
                        <span className="text-alert text-sm font-medium hover:underline cursor-pointer">View All</span>
                     </div>
                     {stats?.redTagList?.length === 0 ? (
                         <div className="py-8 text-center text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800 dashed">No overdue clients</div>
                     ) : (
                         <div className="space-y-4">
                             {stats?.redTagList?.map(client => (
                                 <div key={client._id} className="flex justify-between items-center p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-alert/20 text-alert flex items-center justify-center font-bold">
                                            {client.avatar}
                                        </div>
                                        <div>
                                           <h4 className="font-semibold text-white">{client.personalInfo.name}</h4>
                                           <p className="text-xs text-gray-400">{client.personalInfo.mobileNo}</p>
                                        </div>
                                     </div>
                                     <button className="bg-alert/10 hover:bg-alert hover:text-white border border-alert/20 text-alert text-xs px-4 py-1.5 rounded-full font-medium transition-colors">
                                         Renew
                                     </button>
                                 </div>
                             ))}
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
