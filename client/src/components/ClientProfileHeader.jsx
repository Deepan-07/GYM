import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';

const statusConfig = {
    active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Active' },
    expired: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Expired' },
    overdue: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Overdue' },
    pending: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Pending' },
    upcoming: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Upcoming' },
    expiring_soon: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Expiring Soon' },
};

const ClientProfileHeader = ({ client, compact = false }) => {
    if (!client) return null;

    const status = client.membership?.status || 'pending';
    const currentStatus = statusConfig[status] || statusConfig.pending;
    const name = client.personalInfo?.name || 'Unknown';
    const avatar = client.avatar;

    if (compact) {
        return (
            <div className="bg-[#121620] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group relative overflow-hidden shadow-lg">
                <div className="flex gap-5 items-center">
                    {/* Avatar - Rounded Square style from image */}
                    <div className="w-16 h-16 rounded-xl bg-gray-800/80 text-primary flex items-center justify-center text-3xl font-bold border border-gray-700/50 shrink-0">
                        {avatar && avatar.length > 1 ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            name.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <h4 className="font-black text-white text-xl lowercase leading-none tracking-tight group-hover:text-primary transition-colors truncate">{name}</h4>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-opacity-10 shrink-0 ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                                {currentStatus.label}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400">
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                <Clock size={14} className="text-primary/70 shrink-0" />
                                <span className="uppercase opacity-40 text-[9px] tracking-widest">ID:</span>
                                <span className="text-gray-200">{client.clientId || 'PENDING'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                <Phone size={14} className="text-primary/70 shrink-0" />
                                <span className="text-gray-200">{client.personalInfo?.mobileNo}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                <Mail size={14} className="text-primary/70 shrink-0" />
                                <span className="text-gray-200 truncate max-w-[150px]">{client.personalInfo?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-gray-900 border-gray-800 mb-8 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold border border-primary/20 shadow-inner overflow-hidden shrink-0">
                    {avatar && avatar.length > 1 ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name.charAt(0).toUpperCase()
                    )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none truncate">
                            {name}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                            {currentStatus.label}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Clock size={16} className="text-primary/60" />
                            <span>ID: <span className="text-gray-200 font-medium">{client.clientId || 'NOT ASSIGNED'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Phone size={16} className="text-primary/60" />
                            <span className="text-gray-200 font-medium">{client.personalInfo?.mobileNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Mail size={16} className="text-primary/60" />
                            <span className="text-gray-200 font-medium">{client.personalInfo?.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientProfileHeader;
