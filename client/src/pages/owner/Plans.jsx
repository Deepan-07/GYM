import React, { useState, useEffect } from 'react';
// Sidebar removed
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [formData, setFormData] = useState({ planName: '', durationMonths: '', price: '', description: '' });

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plan');
            setPlans(res.data.data);
        } catch(e) {
            toast.error("Failed to load plans");
        }
        setLoading(false);
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleEdit = (plan) => {
        setFormData({ planName: plan.planName, durationMonths: plan.durationMonths, price: plan.price, description: plan.description });
        setEditingPlanId(plan._id);
        setShowModal(true);
    };

    const handleCreateNew = () => {
        setFormData({ planName: '', durationMonths: '', price: '', description: '' });
        setEditingPlanId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPlanId) {
                await api.put(`/plan/${editingPlanId}`, formData);
                toast.success("Plan Updated");
            } else {
                await api.post('/plan', formData);
                toast.success("Plan Created");
            }
            setShowModal(false);
            setEditingPlanId(null);
            fetchPlans();
            setFormData({ planName: '', durationMonths: '', price: '', description: '' });
        } catch(e) {
            toast.error(editingPlanId ? "Failed to update plan" : "Failed to create plan");
        }
    }

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to deactivate this plan?")) {
            try {
                await api.delete(`/plan/${id}`);
                toast.success("Plan removed");
                fetchPlans();
            } catch(e) {}
        }
    }

    return (
        <div className="flex bg-dark h-screen overflow-hidden">
            <></>
            <div className="flex-1 overflow-y-auto p-8 pt-10">
                <div className="flex justify-between items-center mb-8">
                   <div>
                       <h1 className="text-3xl font-bold text-white tracking-tight">Gym Plans</h1>
                       <p className="text-gray-400 mt-1">Manage your membership packages.</p>
                   </div>
                   <Button onClick={handleCreateNew} className="gap-2">
                       <Plus size={18} /> Create Plan
                   </Button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 mt-20">Loading plans...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan._id} className="card relative flex flex-col group border-primary/20 hover:border-primary/50 transition-colors">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(plan)} className="text-blue-400 hover:text-blue-300 bg-gray-800 p-1.5 rounded"><Edit2 size={14}/></button>
                                    <button onClick={() => handleDelete(plan._id)} className="text-alert hover:text-red-400 bg-gray-800 p-1.5 rounded"><Trash2 size={14}/></button>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{plan.planName}</h3>
                                <p className="text-primary text-3xl font-black mb-4">₹{plan.price}<span className="text-sm text-gray-400 font-normal"> / {plan.durationMonths} months</span></p>
                                <p className="text-gray-400 text-sm flex-1 mb-6">{plan.description || 'No description provided.'}</p>
                                <button className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Plan Details</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Simple implementation */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-card w-full max-w-md rounded-xl p-6 border border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Plan Name</label>
                                <input name="planName" value={formData.planName} onChange={handleChange} required className="input-field" placeholder="e.g. Monthly Pro" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Duration (Months)</label>
                                    <input name="durationMonths" value={formData.durationMonths} type="number" min="1" onChange={handleChange} required className="input-field" placeholder="e.g. 1" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
                                    <input name="price" value={formData.price} type="number" onChange={handleChange} required className="input-field" placeholder="e.g. 1500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-24" placeholder="Features included in this plan..."></textarea>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">{editingPlanId ? 'Update Plan' : 'Create Plan'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Plans;
