import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt } from 'lucide-react';
import Button from './Button';

const PaymentModal = ({
    isOpen,
    onClose,
    onSave,
    clientData,
    planData,
    clients = [],
    plans = [],
    initialData = {}
}) => {
    const [selectedClient, setSelectedClient] = useState(clientData);
    const [selectedPlan, setSelectedPlan] = useState(planData);

    const [formData, setFormData] = useState({
        amount: planData?.price || initialData.amount || 0,
        paidAmount: planData?.price || initialData.paidAmount || 0,
        paymentMethod: 'cash',
        dueDate: initialData.dueDate || '',
        startDate: initialData.startDate || new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (clientData) setSelectedClient(clientData);
        if (planData) {
            setSelectedPlan(planData);
            setFormData(prev => ({
                ...prev,
                amount: initialData.amount !== undefined ? initialData.amount : planData.price,
                paidAmount: initialData.paidAmount !== undefined ? initialData.paidAmount : planData.price,
                dueDate: initialData.dueDate || prev.dueDate,
                startDate: initialData.startDate || prev.startDate
            }));
        }
    }, [clientData, planData]);

    if (!isOpen) return null;

    const handleClientChange = (clientId) => {
        const client = clients.find(c => c._id === clientId);
        setSelectedClient(client);

        // Auto-select client's active plan if available
        if (client?.membership?.planId) {
            const planId = typeof client.membership.planId === 'object' ? client.membership.planId._id : client.membership.planId;
            const plan = plans.find(p => p._id === planId);
            if (plan) handlePlanChange(plan._id);
        }
    };

    const handlePlanChange = (planId) => {
        const plan = plans.find(p => p._id === planId);
        setSelectedPlan(plan);
        if (plan) {
            setFormData(prev => ({
                ...prev,
                amount: plan.price,
                paidAmount: plan.price
            }));
        }
    };

    const balance = formData.amount - formData.paidAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!selectedClient) return alert("Please select a client");
        if (!selectedPlan) return alert("Please select a plan");

        // Validations
        if (formData.paidAmount > formData.amount) {
            return alert(`Paid amount cannot exceed total amount (₹${formData.amount})`);
        }

        if (balance > 0 && !formData.dueDate) {
            return alert("Due Date is required for partial payments");
        }

        setIsSubmitting(true);
        try {
            await onSave({
                ...formData,
                clientId: selectedClient._id,
                planId: selectedPlan._id,
                planName: selectedPlan.name,
                balance
            });
            onClose();
        } catch (error) {
            console.error("Payment failed:", error);
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-700/50 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Receipt className="text-primary" />
                        {initialData.id ? 'Update Payment' : 'Record Payment'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" disabled={isSubmitting}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Selection Section */}
                    <div className="space-y-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Select Client</label>
                            {clientData ? (
                                <p className="text-white font-medium p-2.5 bg-gray-800 rounded-lg border border-gray-700/50">{clientData.personalInfo?.name || clientData.name}</p>
                            ) : (
                                <select
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary outline-none transition-all"
                                    onChange={(e) => handleClientChange(e.target.value)}
                                    value={selectedClient?._id || ''}
                                    required
                                >
                                    <option value="">Choose Client...</option>
                                    {clients.map(c => (
                                        <option key={c._id} value={c._id}>{c.personalInfo?.name || c.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Select Plan</label>
                            {planData ? (
                                <p className="text-primary font-bold p-2.5 bg-gray-800 rounded-lg border border-gray-700/50">{planData.name}</p>
                            ) : (
                                <select
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary outline-none transition-all"
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                    value={selectedPlan?._id || ''}
                                    required
                                    disabled={!selectedClient}
                                >
                                    <option value="">Choose Plan...</option>
                                    {plans.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount (₹)</label>
                            <input
                                type="number"
                                readOnly
                                className="w-full bg-gray-800/50 border border-gray-800 rounded-lg p-3 text-gray-300 outline-none cursor-not-allowed"
                                value={formData.amount}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                            <select
                                className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                disabled={isSubmitting}
                            >
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Paid Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max={formData.amount}
                                className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.paidAmount}
                                onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                                disabled={isSubmitting}
                            />
                            <p className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${balance > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                Balance: ₹{balance.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${balance > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                                Due Date {balance > 0 && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="date"
                                required={balance > 0}
                                className={`w-full bg-dark border rounded-lg p-3 text-white outline-none transition-all ${balance > 0 ? 'border-amber-500/50 focus:border-amber-500' : 'border-gray-700 focus:border-primary'}`}
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                disabled={isSubmitting || balance === 0}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Save Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PaymentModal;


