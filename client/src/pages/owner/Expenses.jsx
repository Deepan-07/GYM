import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    Download, 
    CircleDollarSign, 
    Calendar, 
    Tag, 
    FileText,
    X,
    ChevronDown,
    Eye
} from 'lucide-react';

const CATEGORIES = ['Rent', 'Salary', 'Utilities', 'Equipment', 'Maintenance', 'Other'];

const CATEGORY_COLORS = {
    Rent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Salary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Utilities: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Equipment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Maintenance: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [currentExpense, setCurrentExpense] = useState(null);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/expenses');
            const onlyExpenses = res.data.data.filter(e => !e.isReminder);
            setExpenses(onlyExpenses);
        } catch (error) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleOpenModal = (mode, expense = null) => {
        setModalMode(mode);
        if ((mode === 'edit' || mode === 'view') && expense) {
            setCurrentExpense(expense);
            setFormData({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: new Date(expense.date).toISOString().split('T')[0],
                note: expense.note || ''
            });
        } else {
            setCurrentExpense(null);
            setFormData({
                title: '',
                amount: '',
                category: 'Other',
                date: new Date().toISOString().split('T')[0],
                note: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.title.trim()) {
            return toast.error("Please enter a valid title");
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            return toast.error("Please enter a valid amount greater than 0");
        }

        try {
            if (modalMode === 'add') {
                await api.post('/expenses', formData);
                toast.success("Expense added successfully");
            } else {
                await api.put(`/expenses/${currentExpense._id}`, formData);
                toast.success("Expense updated successfully");
            }
            setShowModal(false);
            fetchExpenses();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await api.delete(`/expenses/${id}`);
            toast.success("Expense deleted successfully");
            fetchExpenses();
        } catch (error) {
            toast.error("Failed to delete expense");
        }
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             exp.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === 'All' || exp.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="flex flex-col h-full bg-dark">
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Expenses Management</h1>
                        <p className="text-gray-400 mt-1">Track and manage your gym's operational costs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleOpenModal('add')}
                            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 font-medium transition-all"
                        >
                            <Plus size={20} /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Stats Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gray-900/50 border-gray-800 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <CircleDollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Expenses</p>
                                <h3 className="text-2xl font-black text-white">₹{totalAmount.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                    {/* Add more mini-stats if needed */}
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by title or category..."
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select 
                            className="bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer min-w-[150px]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="card p-0 bg-gray-900/30 border-gray-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No expenses found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Expense Details</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredExpenses.map((exp) => (
                                        <tr key={exp._id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-semibold">{exp.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}`}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {new Date(exp.date).toLocaleDateString('en-GB')}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-white font-black">₹{exp.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal('view', exp); }}
                                                        className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', exp); }}
                                                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(exp._id); }}
                                                        className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative bg-dark border border-gray-700/50 rounded-xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            {modalMode === 'view' ? <Eye className="text-emerald-400" /> : <CircleDollarSign className="text-primary" />}
                            {modalMode === 'add' ? 'Add Expense' : modalMode === 'edit' ? 'Edit Entry' : 'View Details'}
                        </h2>
                        
                        {modalMode === 'view' ? (
                            <div className="space-y-4">
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Title</p>
                                    <p className="text-white font-medium">{formData.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                                        <p className="text-white font-black text-xl">₹{Number(formData.amount).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block mt-1 ${CATEGORY_COLORS[formData.category] || CATEGORY_COLORS.Other}`}>
                                            {formData.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="text-white">{new Date(formData.date).toLocaleDateString('en-GB')}</p>
                                </div>
                                {formData.note && (
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{formData.note}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary"
                                        placeholder="e.g., Monthly Rent"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            >
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary [color-scheme:dark]"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Notes (Optional)</label>
                                    <textarea 
                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                        placeholder="Add any additional details..."
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all mt-4"
                                >
                                    {modalMode === 'add' ? 'Create Expense' : 'Save Changes'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
