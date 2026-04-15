import React, { useState, useEffect } from 'react';
// Sidebar removed
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { AlertOctagon } from 'lucide-react';
import ClientCard from '../../components/ClientCard';

const RedTag = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRedTagClients = async () => {
        try {
            const res = await api.get('/redtag');
            setClients(res.data.data);
        } catch(e) {
            toast.error("Failed to load red tag clients");
        }
        setLoading(false);
    };

    useEffect(() => { fetchRedTagClients(); }, []);

    const handleRenewMock = (client) => {
        toast.info("Renew workflow would open here. Mock complete.");
    };

    const handleView = (client) => {
        toast.info(`Viewing ${client.personalInfo.name} will be wired here.`);
    };

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <></>
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                       <AlertOctagon className="text-alert" size={32} /> Red Tag Members
                   </h1>
                   <p className="text-gray-400 mt-1">Clients whose memberships have expired by more than 3 days.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-alert border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="card bg-gray-900 border-alert/20 text-center py-16 text-gray-400">No clients found</div>
                ) : (
                    <div className="space-y-4">
                        {clients.map((client) => (
                            <ClientCard
                                key={client._id}
                                client={client}
                                onView={handleView}
                                onRenew={handleRenewMock}
                                showRenew
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedTag;
