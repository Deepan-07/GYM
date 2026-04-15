import React, { useState, useEffect } from 'react';
// Sidebar removed
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Receipt } from 'lucide-react';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/payment');
                setPayments(res.data.data);
            } catch(e) {
                toast.error("Failed to load payments");
            }
            setLoading(false);
        };
        fetchPayments();
    }, []);

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <></>
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-white tracking-tight">Payment Ledger</h1>
                   <p className="text-gray-400 mt-1">History of all transactions.</p>
                </div>

                <div className="bg-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700 text-gray-400 text-sm tracking-wider uppercase">
                                    <th className="p-4 font-medium">Receipt Info</th>
                                    <th className="p-4 font-medium">Client</th>
                                    <th className="p-4 font-medium">Plan</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Mode</th>
                                    <th className="p-4 font-medium text-right font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center p-10 text-gray-500">Loading payments...</td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center p-10 text-gray-500">No payment records found.</td></tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment._id} className="hover:bg-gray-800/20 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 text-primary rounded-lg border border-blue-500/20">
                                                        <Receipt size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{payment.paymentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-white">{payment.clientName}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-300">{payment.planName || 'N/A'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-400">{new Date(payment.date).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${payment.mode === 'cash' ? 'bg-green-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-400'}`}>
                                                    {payment.mode.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="font-bold text-white text-lg">₹{payment.amount}</p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
