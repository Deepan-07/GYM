import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ChevronLeft, Phone, Mail, User, CreditCard, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Button from '../../components/Button';
import { formatDisplayDate } from '../../utils/membership';
import ClientProfileHeader from '../../components/ClientProfileHeader';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'payment'

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const res = await api.get(`/client/${id}`);
                setClient(res.data.data);
            } catch (error) {
                toast.error("Failed to load client details");
                navigate('/owner/clients');
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex bg-dark h-screen justify-center items-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="flex flex-col bg-dark h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-8">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to List</span>
                    </button>

                </div>

                <ClientProfileHeader client={client} />

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl w-fit mb-6 border border-gray-700/50">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'personal' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                        <User size={18} /> Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'payment' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                        <CreditCard size={18} /> Payment History
                    </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'personal' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Registration Details */}
                            <div className="card bg-gray-900 border-gray-800">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                                    <User size={20} className="text-primary" /> Registration Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Gender</p>
                                            <p className="text-white font-medium capitalize">{client.personalInfo.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Date of Birth</p>
                                            <p className="text-white font-medium">{formatDisplayDate(client.personalInfo.dob)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Address</p>
                                        <p className="text-white font-medium">{client.personalInfo.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Medical Condition</p>
                                        <p className="text-white font-medium italic">{client.personalInfo.medicalCondition || 'None reported'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Emergency Contact</p>
                                        <p className="text-white font-medium">{client.personalInfo.emergencyContact || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Details */}
                            <div className="card bg-gray-900 border-gray-800">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                                    <Calendar size={20} className="text-accent" /> Membership Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Active Plan</p>
                                        <p className="text-2xl font-bold text-primary">{client.membership.planName || 'No Active Plan'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Start Date</p>
                                            <p className="text-white font-semibold flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                {formatDisplayDate(client.membership.startDate)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">End Date</p>
                                            <p className="text-white font-semibold flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                {formatDisplayDate(client.membership.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Duration</p>
                                            <p className="text-white font-medium">{client.membership.durationMonths} Month(s)</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Days Remaining</p>
                                            <p className={`text-xl font-bold ${client.membership.daysLeft < 7 ? 'text-alert' : 'text-accent'}`}>
                                                {client.membership.daysLeft} Days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-gray-900 border-gray-800 p-0 overflow-hidden">
                            <div className="p-6 border-b border-gray-800">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary" /> Payment History
                                </h3>
                            </div>

                            {client.paymentHistory && client.paymentHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Plan</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Mode</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {client.paymentHistory.map((payment) => (
                                                <tr key={payment._id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-gray-300 font-mono">{payment.paymentId}</td>
                                                    <td className="px-6 py-4 text-white font-medium">{payment.planName}</td>
                                                    <td className="px-6 py-4 text-gray-400">{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-accent font-bold">₹{payment.amount}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] uppercase font-bold">
                                                            {payment.mode}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="flex items-center justify-end gap-1.5 text-emerald-400 text-xs font-semibold">
                                                            <CheckCircle2 size={14} /> Success
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-500">
                                    <AlertCircle size={48} className="mx-auto mb-4 opacity-10" />
                                    <p>No payment history found for this client.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;
