import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { ChevronLeft, Phone, Mail, User, CreditCard, Calendar, CheckCircle2, AlertCircle, Clock, X, FileText } from 'lucide-react';
import Button from '../../components/Button';
import { formatDisplayDate, calculateDaysLeft, getPlanStatus, getPaymentStatus, getClientPlans } from '../../utils/membership';
import ClientProfileHeader from '../../components/ClientProfileHeader';

const ClientDetail = ({ clientId: propClientId, onClose, simplified = false }) => {
    const { id: paramId } = useParams();
    const id = propClientId || paramId;
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'payment'
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const getPaidAmount = (p) => {
        const paid = p.paidAmount !== undefined ? p.paidAmount : p.amount;
        return Number(paid) || 0;
    };
    const getBalance = (p) => {
        if (p.amount === 0) return 0; // Installment record, doesn't carry a balance itself
        const total = Number(p.amount) || 0;
        return Math.max(0, total - getPaidAmount(p));
    };

    const getStatusBadge = (status) => {
        if (!status || status === 'paid') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">PAID</span>;
        if (status === 'partial') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PARTIAL</span>;
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">OVERDUE</span>;
    };

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
            <div className={propClientId ? "flex justify-center items-center h-64" : "flex bg-dark h-screen justify-center items-center"}>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className={propClientId ? "flex flex-col bg-gray-900 overflow-hidden" : "flex flex-col bg-dark h-screen overflow-hidden"}>
            <div className={propClientId ? "flex-1 overflow-y-auto p-4 md:p-6" : "flex-1 overflow-y-auto p-4 md:p-8 pt-8"}>
                {/* Header Actions */}
                {!propClientId && (
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back to List</span>
                        </button>
                    </div>
                )}

                <ClientProfileHeader client={client} showStatus={!simplified} />

                {/* Tabs */}
                {!simplified && (
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
                )}

                {/* Tab Content */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'personal' ? (
                        <div className={simplified ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
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
                                        <Calendar size={20} className="text-accent" /> Membership Lifecycle
                                    </h3>
                                    <div className="space-y-8">
                                        {(() => {
                                            const memberships = client.memberships || (client.membership?.startDate ? [client.membership] : []);
                                            const { currentPlan, nextPlan, previousPlans, gaps } = getClientPlans(memberships);
                                            
                                            const getPaymentBadgeStyle = (status) => {
                                                switch(status) {
                                                    case 'PAID': return 'bg-green-500 text-white';
                                                    case 'PENDING': return 'bg-yellow-500 text-black';
                                                    case 'OVERDUE': return 'bg-red-500 text-white';
                                                    default: return 'bg-gray-500 text-white';
                                                }
                                            };

                                            return (
                                                <>
                                                    {/* CURRENT PLAN */}
                                                    <div>
                                                        <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-3">Current Plan</p>
                                                        {currentPlan ? (
                                                            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="text-xl font-bold text-emerald-400">{currentPlan.planName}</p>
                                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">Active</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPaymentBadgeStyle(currentPlan.paymentStatus)}`}>
                                                                            {currentPlan.paymentStatus}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Starts</p>
                                                                        <p className="text-white font-medium">{formatDisplayDate(currentPlan.startDate)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Expires</p>
                                                                        <p className="text-white font-medium">{formatDisplayDate(currentPlan.endDate)}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Info */}
                                                                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Paid / Balance</p>
                                                                        <p className="text-white font-medium">₹{currentPlan.totalPaid || 0} / <span className="text-accent">₹{currentPlan.balance || 0}</span></p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Due Date</p>
                                                                        <p className="text-white font-medium">{currentPlan.dueDate ? formatDisplayDate(currentPlan.dueDate) : 'No Due Date'}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 pt-4 border-t border-emerald-500/10 flex justify-between items-center">
                                                                    <span className="text-gray-400 text-xs">Days Remaining:</span>
                                                                    <span className="text-emerald-400 font-bold">{calculateDaysLeft(currentPlan.startDate, currentPlan.endDate)} Days</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 bg-gray-800/20 rounded-xl border border-gray-800/50 flex flex-col items-center justify-center text-center">
                                                                <AlertCircle size={32} className="text-gray-600 mb-2 opacity-20" />
                                                                <p className="text-gray-400 font-bold">No Active Plan</p>
                                                                <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-1">Renewal Required</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* GAP WARNINGS */}
                                                    {gaps.map((gap, i) => (
                                                        <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                                                            <AlertCircle size={18} className="text-red-400" />
                                                            <p className="text-xs text-red-400 font-medium">
                                                                No active plan between {formatDisplayDate(gap.from)} and {formatDisplayDate(gap.to)}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    {/* NEXT PLAN */}
                                                    {nextPlan && (
                                                        <div>
                                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-3">Next Plan</p>
                                                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="text-lg font-bold text-blue-400">{nextPlan.planName}</p>
                                                                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold uppercase">Upcoming</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPaymentBadgeStyle(nextPlan.paymentStatus)}`}>
                                                                            {nextPlan.paymentStatus}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-blue-400/60 font-medium mb-4">Starts automatically on {formatDisplayDate(nextPlan.startDate)}</p>
                                                                
                                                                <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Paid / Balance</p>
                                                                        <p className="text-white font-medium">₹{nextPlan.totalPaid || 0} / <span className="text-accent">₹{nextPlan.balance || 0}</span></p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Due Date</p>
                                                                        <p className="text-white font-medium">{nextPlan.dueDate ? formatDisplayDate(nextPlan.dueDate) : 'No Due Date'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* PREVIOUS PLANS */}
                                                    {previousPlans.length > 0 && (
                                                        <div>
                                                            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-3">Previous Plans</p>
                                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                                {previousPlans.map((plan, i) => (
                                                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-800/50">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-white text-sm font-semibold">{plan.planName}</p>
                                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getPaymentBadgeStyle(plan.paymentStatus)}`}>
                                                                                    {plan.paymentStatus}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[10px] text-gray-500">{formatDisplayDate(plan.startDate)} - {formatDisplayDate(plan.endDate)}</p>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-600 font-bold uppercase">Expired</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                        </div>
                    ) : (
                        <div className="card bg-gray-900/40 border-gray-800 p-0 overflow-hidden shadow-2xl backdrop-blur-sm">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary" /> Payment History
                                </h3>
                            </div>

                            {client.paymentHistory && client.paymentHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-800/30 border-b border-gray-800 text-gray-400 text-[10px] font-black tracking-widest uppercase">
                                                <th className="px-6 py-4">Receipt Info</th>
                                                <th className="px-6 py-4">Plan</th>
                                                <th className="px-6 py-4">Mode</th>
                                                <th className="px-6 py-4 text-right">Total</th>
                                                <th className="px-6 py-4 text-right">Paid</th>
                                                <th className="px-6 py-4 text-right">Balance</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-center">Bill</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {client.paymentHistory.map((payment) => (
                                                <tr key={payment._id} className="hover:bg-gray-800/30 transition-all group">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-white text-sm">#{payment.paymentId}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">{new Date(payment.createdAt || payment.date || payment.paymentDate).toLocaleDateString('en-GB')}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-300 text-xs font-medium">{payment.planName}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${(payment.paymentMethod || payment.mode || 'cash') === 'cash' ? 'text-emerald-400 bg-emerald-400/5' : 'text-blue-400 bg-blue-400/5'}`}>
                                                            {payment.paymentMethod || payment.mode || 'cash'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-200 font-bold text-sm">₹{payment.amount || 0}</td>
                                                    <td className="px-6 py-4 text-right text-emerald-400 font-bold text-sm">₹{getPaidAmount(payment)}</td>
                                                    <td className="px-6 py-4 text-right text-rose-500 font-bold text-sm">₹{getBalance(payment)}</td>
                                                    <td className="px-6 py-4 text-center">{getStatusBadge(payment.status)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                            title="View Bill"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-gray-500">
                                    <AlertCircle size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-medium">No payment history found.</p>
                                    <p className="text-xs mt-1">This client hasn't made any transactions yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Receipt Modal */}
            {showReceiptModal && selectedPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b-2 border-dashed border-gray-200 relative">
                            <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900"><X size={20} /></button>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-primary" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Payment Receipt</h2>
                                <p className="text-gray-500 font-medium mt-1">Transaction ID: #{selectedPayment.paymentId}</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-y-4">
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Name</p><p className="font-bold">{client.personalInfo.name}</p></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Name</p><p className="font-bold">{selectedPayment.planName}</p></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p><p className="font-bold">{new Date(selectedPayment.createdAt || selectedPayment.date || selectedPayment.paymentDate).toLocaleDateString('en-GB')}</p></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</p><p className="font-bold uppercase">{selectedPayment.paymentMethod || selectedPayment.mode || 'CASH'}</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Billable</span><span className="font-bold">₹{selectedPayment.amount}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-emerald-600">₹{getPaidAmount(selectedPayment)}</span></div>
                                <div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-black uppercase text-xs tracking-wider">Balance Due</span><span className="font-black text-rose-600">₹{getBalance(selectedPayment)}</span></div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 text-center"><p className="text-xs text-gray-400 font-medium italic">Thank you for your business!</p></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetail;
