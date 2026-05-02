import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Receipt, Plus, X, Edit2 } from 'lucide-react';
import Button from '../../components/Button';
import { getPlanStatus } from '../../utils/membership';
import PaymentModal from '../../components/PaymentModal';

const Transactions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    
    // Form data for new payment
    const [formData, setFormData] = useState({
        clientId: '',
        planId: '',
        planName: '',
        amount: '',
        paidAmount: '',
        paymentMethod: 'cash',
        dueDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0]
    });
    
    // Data for updating existing payment
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [additionalAmount, setAdditionalAmount] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, clientsRes, plansRes] = await Promise.all([
                api.get('/payment'),
                api.get('/client'),
                api.get('/plan')
            ]);
            setPayments(paymentsRes.data.data.filter(p => {
                const paid = p.paidAmount !== undefined ? p.paidAmount : p.amount;
                return paid > 0;
            }));
            setClients(clientsRes.data.data);
            setPlans(plansRes.data.data);
        } catch(e) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state?.showPaymentModal && location.state?.client && clients.length > 0 && plans.length > 0) {
            const client = clients.find(c => c._id === location.state.client._id);
            if (client) {
                handleClientChange(client._id);
                setShowModal(true);
                // Clear the state so it doesn't reopen on refresh or re-render
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.state, clients, plans]);

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c._id === clientId);
        if (client && client.membership?.planId) {
            const plan = plans.find(p => p._id === (typeof client.membership.planId === 'object' ? client.membership.planId._id : client.membership.planId));
            
            setFormData(prev => ({
                ...prev,
                clientId: clientId,
                planId: plan?._id || '',
                planName: plan?.name || '',
                amount: plan?.price || '',
                paidAmount: plan?.price || '' // default to full payment
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                clientId: clientId,
                planId: '',
                planName: '',
                amount: '',
                paidAmount: ''
            }));
        }
    };

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        const plan = plans.find(p => p._id === planId);
        
        setFormData(prev => ({
            ...prev,
            planId: planId,
            planName: plan?.name || '',
            amount: plan?.price || '',
            paidAmount: plan?.price || ''
        }));
    };

    const selectedClientObj = clients.find(c => c._id === formData.clientId);
    const currentPlan = selectedClientObj?.memberships?.find(p => {
        const s = getPlanStatus(p);
        return s === 'Active';
    });
    const hasActivePlan = !!currentPlan;
    const currentEndDate = currentPlan?.endDate;

    const handleNewPaymentSubmit = async (paymentData) => {
        try {
            const payload = {
                ...formData,
                paidAmount: paymentData.paidAmount,
                paymentMethod: paymentData.paymentMethod,
                dueDate: paymentData.dueDate,
                startDate: paymentData.startDate
            };

            await api.post('/payment', payload);
            toast.success("Payment recorded successfully");
            
            // Clear navigation state to prevent modal reopening
            navigate(location.pathname, { replace: true });
            
            setShowModal(false);
            fetchData();
            // Reset form
            setFormData({
                clientId: '',
                planId: '',
                planName: '',
                amount: '',
                paidAmount: '',
                paymentMethod: 'cash',
                dueDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to record payment");
            throw error; // Let modal handle loading state
        }
    };

    const handleUpdatePaymentSubmit = async (e) => {
        e.preventDefault();
        
        const additional = Number(additionalAmount);
        const maxAllowed = selectedPayment.amount - getPaidAmount(selectedPayment);
        
        if (additional <= 0) return toast.error("Amount must be greater than 0");
        if (additional > maxAllowed) return toast.error(`Amount cannot exceed the balance of ₹${maxAllowed}`);

        try {
            await api.put(`/payment/${selectedPayment._id}`, { additionalAmount: additional });
            toast.success("Payment updated successfully");
            setShowUpdateModal(false);
            setAdditionalAmount('');
            setSelectedPayment(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update payment");
        }
    };

    const getPaidAmount = (payment) => {
        if (payment.paidAmount !== undefined) return payment.paidAmount;
        return payment.amount; // Old payments were fully paid
    };

    const getBalance = (payment) => {
        return payment.amount - getPaidAmount(payment);
    };

    const getStatusBadge = (status) => {
        // Support backwards compatibility for old payments which were always full
        if (!status) {
            return <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500">PAID</span>;
        }
        switch (status) {
            case 'paid':
                return <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500">PAID</span>;
            case 'partial':
                return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-500">PARTIAL</span>;
            case 'overdue':
                return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-600/20 text-red-500 border border-red-500/20 uppercase">OVERDUE</span>;
            default:
                return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-500">PENDING</span>;
        }
    };

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Transaction History</h1>
                        <p className="text-gray-400 mt-1">History of all successful payments.</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                        <Plus size={18} /> Record Payment
                    </Button>
                </div>

                <div className="bg-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700 text-gray-400 text-sm tracking-wider uppercase">
                                    <th className="p-4 font-medium">Receipt Info</th>
                                    <th className="p-4 font-medium">Client</th>
                                    <th className="p-4 font-medium">Plan</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium text-right">Total</th>
                                    <th className="p-4 font-medium text-right">Paid</th>
                                    <th className="p-4 font-medium text-right">Balance</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center p-10 text-gray-500">Loading payments...</td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center p-10 text-gray-500">No payment records found.</td></tr>
                                ) : (
                                    payments.map(payment => {
                                        const isOverdue = payment.status === 'overdue';
                                        return (
                                        <tr 
                                            key={payment._id} 
                                            className={`border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors ${isOverdue ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}
                                        >
                                            <td className="p-4">
                                                <p className="font-medium text-white">{payment.paymentId}</p>
                                                <p className="text-xs text-gray-400">{new Date(payment.createdAt || payment.date).toLocaleDateString('en-GB')}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-white">{payment.clientName}</p>
                                                <p className="text-xs text-gray-400 capitalize">{payment.paymentMethod || payment.mode}</p>
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {payment.planName}
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className={`font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>₹{payment.amount}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="font-medium text-emerald-400">₹{getPaidAmount(payment)}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="font-medium text-red-400">₹{getBalance(payment)}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {payment.status !== 'paid' && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setAdditionalAmount('');
                                                            setShowUpdateModal(true);
                                                        }}
                                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded transition-colors flex items-center justify-end gap-1 ml-auto"
                                                    >
                                                        <Edit2 size={14} /> Update
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Record New Payment Modal */}
            <PaymentModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleNewPaymentSubmit}
                clientData={selectedClientObj}
                planData={plans.find(p => p._id === formData.planId)}
                clients={clients}
                plans={plans}
                initialData={{
                    startDate: formData.startDate,
                    dueDate: formData.dueDate
                }}
            />

            {/* Update Payment Modal */}
            {showUpdateModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-gray-700/50 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <h2 className="text-lg font-bold text-white">Update Payment</h2>
                            <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePaymentSubmit} className="p-5 space-y-4">
                            <div className="bg-gray-800/50 p-3 rounded-lg text-sm mb-4 border border-gray-700/50">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-400">Total Amount:</span>
                                    <span className="text-white font-medium">₹{selectedPayment.amount}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-400">Already Paid:</span>
                                    <span className="text-emerald-400 font-medium">₹{getPaidAmount(selectedPayment)}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-700 mt-1">
                                    <span className="text-gray-300 font-medium">Remaining Balance:</span>
                                    <span className="text-red-400 font-bold">₹{getBalance(selectedPayment)}</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Additional Amount Paid (₹)</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    max={getBalance(selectedPayment)}
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={additionalAmount}
                                    onChange={(e) => setAdditionalAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Update</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
