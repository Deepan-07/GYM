import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const LoginPage = () => {
    const [role, setRole] = useState('owner');
    const [formData, setFormData] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // UX feature: auto-fill gym Name when client enters Gym ID and tabs out
    const handleGymIdBlur = async () => {
       if (role === 'client' && formData.gymId) {
          try {
             const res = await api.get(`/gym/public/${formData.gymId.toUpperCase()}`);
             setFormData(prev => ({ ...prev, gymId: formData.gymId.toUpperCase(), gymName: res.data.data.gymName }));
          } catch(e) {
             toast.error("Gym ID not found.");
             setFormData(prev => ({ ...prev, gymName: '' }));
          }
       }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let res;
            if (role === 'owner') {
                res = await api.post('/auth/gym/login', { ...formData });
                login(res.data.token, 'owner', res.data.data);
                navigate('/owner');
            } else if (role === 'client') {
                res = await api.post('/auth/client/login', { ...formData });
                login(res.data.token, 'client', res.data.data);
                navigate('/client');
            } else {
                res = await api.post('/auth/admin/login', { ...formData });
                login(res.data.token, 'superadmin', res.data.data);
                navigate('/admin');
            }
            toast.success("Welcome Back!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/80">
            <div className="max-w-md w-full space-y-8 backdrop-blur-md bg-dark/60 p-10 rounded-2xl border border-gray-800 shadow-2xl">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
                        <LogIn className="text-primary" size={36} /> Welcome Back
                    </h2>
                    <p className="mt-3 text-center text-sm text-gray-400">Log in to your portal</p>
                </div>

                <div className="flex bg-gray-900 rounded-lg p-1.5 border border-gray-800">
                    <button onClick={() => {setRole('owner'); setFormData({});}} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'owner' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Owner</button>
                    <button onClick={() => {setRole('client'); setFormData({});}} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'client' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Client</button>
                    <button onClick={() => {setRole('admin'); setFormData({});}} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Admin</button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        
                        {role === 'owner' && (
                            <>
                                <input name="gymId" value={formData.gymId || ''} placeholder="Gym ID (e.g. DNB-01)" onChange={handleChange} required className="input-field uppercase" />
                                <input name="gymName" value={formData.gymName || ''} placeholder="Gym Name" onChange={handleChange} required className="input-field" />
                                <input name="phone" value={formData.phone || ''} placeholder="Registered Phone" pattern="[0-9]{10}" onChange={handleChange} required className="input-field" />
                            </>
                        )}

                        {role === 'client' && (
                            <>
                                <input name="gymId" value={formData.gymId || ''} placeholder="Gym ID (e.g. DNB-01)" onChange={handleChange} onBlur={handleGymIdBlur} required className="input-field uppercase" />
                                <input name="gymName" value={formData.gymName || ''} placeholder="Gym Name" onChange={handleChange} required className={`input-field ${formData.gymId ? 'bg-gray-800/80 text-gray-400' : ''}`} readOnly />
                                <input name="clientId" value={formData.clientId || ''} placeholder="Client ID (e.g. DNB-0001)" onChange={handleChange} required className="input-field uppercase" />
                                <input name="mobileNo" value={formData.mobileNo || ''} placeholder="Mobile Number" pattern="[0-9]{10}" onChange={handleChange} required className="input-field" />
                            </>
                        )}

                        {role === 'admin' && (
                            <>
                                <input name="email" value={formData.email || ''} type="email" placeholder="Admin Email" onChange={handleChange} required className="input-field" />
                            </>
                        )}

                        <input name="password" value={formData.password || ''} type="password" placeholder="Password" onChange={handleChange} required className="input-field" />

                    </div>
                    <Button type="submit" className="w-full text-lg shadow-lg shadow-primary/20">Login to Platform</Button>
                </form>

                {role !== 'admin' && (
                    <div className="flex justify-between text-sm mt-6 pt-6 border-t border-gray-800">
                        <span className="text-gray-400">Don't have an account?</span>
                        <div className="flex gap-4">
                            <Link to="/register/gym" className="font-bold text-primary hover:text-emerald-400 transition-colors">Register Gym</Link>
                            <Link to="/register/client" className="font-bold text-primary hover:text-cyan-400 transition-colors">Register as Client</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
