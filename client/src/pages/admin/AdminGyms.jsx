import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { AdminSidebar } from './AdminDashboard';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const AdminGyms = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchGyms = async () => {
        try {
            const res = await api.get('/admin/gyms');
            setGyms(res.data.data);
        } catch(e) {
            toast.error("Failed to load gyms");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    const toggleStatus = async (id) => {
        try {
            await api.put(`/admin/gym/${id}/status`);
            fetchGyms();
            toast.success("Gym status toggled");
        } catch(e) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">All Vendor Gyms</h1>

                <div className="bg-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700 text-gray-400 text-sm tracking-wider uppercase">
                                <th className="p-4 font-medium">Gym Details</th>
                                <th className="p-4 font-medium">Owner</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-10 text-gray-500">Loading...</td></tr>
                            ) : gyms.map(gym => (
                                <tr key={gym._id} className="hover:bg-gray-800/20">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                            {gym.gymName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{gym.gymName}</p>
                                            <p className="text-xs text-gray-400">{gym.gymId}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">{gym.ownerName}</td>
                                    <td className="p-4 text-sm text-gray-300">{gym.gymContact}</td>
                                    <td className="p-4">
                                        {gym.isActive ? 
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full">Active</span> : 
                                            <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full">Inactive</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <Button variant="secondary" onClick={() => navigate(`/admin/gyms/${gym.gymId}/clients`)} className="!py-1.5 !px-3 text-xs">
                                            View Clients
                                        </Button>
                                        <Button variant={gym.isActive ? "danger" : "primary"} onClick={() => toggleStatus(gym._id)} className="!py-1.5 !px-3 text-xs">
                                            {gym.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminGyms;
