import React, { useState, useEffect } from 'react';
// Sidebar removed
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Search, Filter, Plus } from 'lucide-react';
import Button from '../../components/Button';
import ClientForm from '../../components/ClientForm';
import ClientCard from '../../components/ClientCard';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formInstanceKey, setFormInstanceKey] = useState(0);

    const closeAddModal = () => {
        setShowAddModal(false);
        setFormInstanceKey((currentKey) => currentKey + 1);
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/client?status=${filterStatus}`);
            setClients(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch clients");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, [filterStatus]);

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this client?')) {
            try {
                await api.delete(`/client/${id}`);
                toast.success('Client deleted');
                fetchClients();
            } catch(e) {
                toast.error('Failed to delete');
            }
        }
    }

    const filteredClients = clients.filter(c => 
       c.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (c.clientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.personalInfo.mobileNo.includes(searchTerm)
    );

    const handleView = (client) => {
        toast.info(`Viewing ${client.personalInfo.name} will be wired here.`);
    };

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <></>
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="flex justify-between items-center mb-8">
                   <div>
                       <h1 className="text-3xl font-bold text-white tracking-tight">Clients</h1>
                       <p className="text-gray-400 mt-1">Manage and monitor all your gym members.</p>
                   </div>
                   <Button onClick={() => setShowAddModal(true)} className="gap-2">
                       <Plus size={18} /> Add Client
                   </Button>
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={closeAddModal}>
                        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(event) => event.stopPropagation()}>
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Enroll New Client</h2>
                                <ClientForm 
                                    key={formInstanceKey}
                                    mode="owner" 
                                    showCancel
                                    onCancel={closeAddModal}
                                    onSuccess={() => { 
                                        closeAddModal(); 
                                        toast.success('Client created successfully');
                                        fetchClients(); 
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="card mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900 border-gray-800">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                           type="text" 
                           placeholder="Search by name, ID or phone..." 
                           className="input-field pl-10"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto text-gray-300">
                        <Filter size={18} />
                        <select 
                           className="input-field py-2 w-full md:w-48 appearance-none"
                           value={filterStatus}
                           onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="active">Active</option>
                            <option value="expiring_soon">Expiring Soon</option>
                            <option value="expired">Expired</option>
                            <option value="red_tag">Red Tag</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="card bg-gray-900 border-gray-800 text-center py-16 text-gray-400">No clients found</div>
                ) : (
                    <div className="space-y-4">
                        {filteredClients.map((client) => (
                            <ClientCard
                                key={client._id}
                                client={client}
                                onView={handleView}
                                onDelete={(selectedClient) => handleDelete(selectedClient._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
