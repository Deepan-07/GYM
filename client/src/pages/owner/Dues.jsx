import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { CircleDollarSign, Search, Filter, History, AlertCircle, Clock } from 'lucide-react';
import Button from '../../components/Button';
import PaymentModal from '../../components/PaymentModal';

const Dues = () => {
    const [clients, setClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'overdue', 'expired'

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedDue, setSelectedDue] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsRes, plansRes, paymentsRes] = await Promise.all([
                api.get('/client'),
                api.get('/plan'),
                api.get('/payment')
            ]);
            setClients(clientsRes.data.data);
            setPlans(plansRes.data.data);
            setPayments(paymentsRes.data.data);
        } catch (e) {
            toast.error("Failed to load dues data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDuesList = () => {
        const dues = [];
        clients.forEach(client => {
            // Get all memberships (plural array and singular field for legacy/backward compatibility)
            const allMemberships = [...(client.memberships || [])];

            // Check if singular membership exists and isn't already in memberships array
            if (client.membership && client.membership.startDate) {
                const alreadyExists = allMemberships.some(m =>
                    new Date(m.startDate).getTime() === new Date(client.membership.startDate).getTime() &&
                    m.planId?.toString() === (client.membership.planId?._id || client.membership.planId)?.toString()
                );
                if (!alreadyExists) {
                    allMemberships.push(client.membership);
                }
            }

            allMemberships.forEach(m => {
                const finalPrice = Number(m.finalPrice || m.amount || 0);
                const totalPaid = Number(m.totalPaid || m.paidAmount || 0);
                const balance = finalPrice - totalPaid;

                if (balance > 0) {
                    const dueDate = m.dueDate ? new Date(m.dueDate) : null;
                    const endDate = m.endDate ? new Date(m.endDate) : null;

                    // Calculate flags
                    const isExpired = endDate && endDate < today;
                    const isOverdue = dueDate && dueDate < today;
                    const isPending = !isOverdue && !isExpired;

                    dues.push({
                        ...m,
                        clientId: client._id,
                        clientName: client.personalInfo?.name || client.name,
                        finalPrice,
                        totalPaid,
                        balance,
                        isExpired,
                        isOverdue,
                        isPending
                    });
                }
            });
        });
        return dues;
    };

    const filteredDues = getDuesList().filter(due => {
        if (activeTab === 'pending') return due.isPending;
        if (activeTab === 'overdue') return due.isOverdue;
        if (activeTab === 'expired') return due.isExpired;
        return false;
    });

    const handlePayNow = (due) => {
        // Find the corresponding payment record to update
        const payment = payments.find(p =>
            p.clientId.toString() === due.clientId.toString() &&
            p.planId.toString() === (due.planId?._id || due.planId)?.toString() &&
            new Date(p.startDate).getTime() === new Date(due.startDate).getTime()
        );

        setSelectedDue({
            ...due,
            paymentId: payment?._id
        });
        setIsUpdating(!!payment);
        setShowModal(true);
    };

    const handlePaymentSave = async (paymentData) => {
        try {
            if (isUpdating && selectedDue.paymentId) {
                // It's an update to an existing partial payment
                // We need to calculate how much ADDITIONAL was paid
                // But PaymentModal gives us the total paidAmount for the new state
                // However, the user said "Update payment in DB", and our PUT /payment/:id takes additionalAmount

                const additionalAmount = paymentData.paidAmount - selectedDue.totalPaid;
                if (additionalAmount < 0) {
                    toast.error("Paid amount cannot be less than previous amount");
                    return;
                }

                if (additionalAmount === 0) {
                    setShowModal(false);
                    return;
                }

                await api.put(`/payment/${selectedDue.paymentId}`, { additionalAmount });
                toast.success("Payment updated successfully");
            } else {
                // If no payment record found (shouldn't happen with new logic but for safety)
                // Or if we want to record it as a new payment anyway
                await api.post('/payment', {
                    ...paymentData,
                    amount: selectedDue.finalPrice, // Ensure we use the due's total
                });
                toast.success("Payment recorded successfully");
            }

            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to process payment");
            throw error;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="text-blue-400" />;
            case 'overdue': return <AlertCircle size={16} className="text-amber-400" />;

            default: return null;
        }
    };

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <CircleDollarSign size={32} className="text-primary" /> Outstanding Dues
                        </h1>
                        <p className="text-gray-400 mt-1">Manage and collect pending payments from clients.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-800/50 p-1 rounded-xl w-fit">
                    {[
                        { id: 'pending', label: 'Pending', icon: Clock },
                        { id: 'overdue', label: 'Overdue', icon: AlertCircle },

                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700 text-gray-400 text-sm tracking-wider uppercase">
                                    <th className="p-4 font-medium">Client Name</th>
                                    <th className="p-4 font-medium">Plan</th>
                                    <th className="p-4 font-medium text-right">Total Amount</th>
                                    <th className="p-4 font-medium text-right">Paid Amount</th>
                                    <th className="p-4 font-medium text-right">Balance</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan="8" className="text-center p-10 text-gray-500">Loading dues...</td></tr>
                                ) : filteredDues.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center p-10 text-gray-500">No {activeTab} dues found.</td></tr>
                                ) : (
                                    filteredDues.map((due, idx) => (
                                        <tr key={`${due.clientId}-${idx}`} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4 font-medium text-white">
                                                {due.clientName}
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {due.planName}
                                            </td>
                                            <td className="p-4 text-right text-gray-300 font-medium">
                                                ₹{due.finalPrice}
                                            </td>
                                            <td className="p-4 text-right text-emerald-400 font-medium">
                                                ₹{due.totalPaid}
                                            </td>
                                            <td className="p-4 text-right text-red-400 font-bold">
                                                ₹{due.balance}
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${due.isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    due.isOverdue ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {due.isExpired && <History size={16} className="text-red-400" />}
                                                    {!due.isExpired && due.isOverdue && <AlertCircle size={16} className="text-amber-400" />}
                                                    {due.isPending && <Clock size={16} className="text-blue-400" />}
                                                    {due.isExpired ? 'Expired' : due.isOverdue ? 'Overdue' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handlePayNow(due)}
                                                    className="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-sm font-semibold transition-all border border-primary/20 hover:border-primary"
                                                >
                                                    Pay Now
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && selectedDue && (
                <PaymentModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handlePaymentSave}
                    clientData={clients.find(c => c._id === selectedDue.clientId)}
                    planData={plans.find(p => p._id === selectedDue.planId)}
                    initialData={{
                        amount: selectedDue.finalPrice,
                        paidAmount: selectedDue.totalPaid,
                        dueDate: selectedDue.dueDate ? new Date(selectedDue.dueDate).toISOString().split('T')[0] : '',
                        startDate: selectedDue.startDate ? new Date(selectedDue.startDate).toISOString().split('T')[0] : '',
                        id: selectedDue.paymentId // Pass id to show "Update Payment" title
                    }}
                />
            )}
        </div>
    );
};

export default Dues;
