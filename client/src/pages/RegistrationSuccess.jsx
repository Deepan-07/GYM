import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/Button';

const RegistrationSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const gymId = location.state?.gymId;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-slate-900 py-12 px-4">
            <div className="card w-full max-w-lg relative z-10 backdrop-blur-xl bg-card/80 border-primary/40 text-center py-10 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <CheckCircle size={80} className="text-emerald-500" />
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-4">Registration Successful!</h2>
                
                <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg inline-block my-6 shadow-inner w-full max-w-[300px]">
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-semibold">Your Gym ID is:</p>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' }} className="text-primary break-all">
                        {gymId || 'Error — ID not found'}
                    </div>
                </div>
                
                <p className="text-gray-300 font-medium mb-8">Save this ID — you and your clients will need it to log in.</p>
                
                <Button onClick={() => navigate('/owner/dashboard')} className="w-full text-lg py-3 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform">
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
