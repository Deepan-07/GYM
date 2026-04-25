import React from 'react';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import Button from './Button';
import { calculateDaysLeft, formatDisplayDate } from '../utils/membership';

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  upcoming: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  expiring_soon: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  expired: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  overdue: 'bg-red-500/10 text-red-400 border border-red-500/20',
  pending: 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
};

const ClientCard = ({ client, onView, onDelete, onRenew, onReactivate, showRenew = false, showReactivate = false }) => {
  const name = client?.personalInfo?.name || 'Client';
  const avatarText = client?.avatar || name.charAt(0).toUpperCase();
  const status = client?.membership?.status || 'pending';
  const dynamicDaysLeft = calculateDaysLeft(client?.membership?.startDate, client?.membership?.endDate);
  // If the plan is upcoming, dynamicDaysLeft is a string "Starts in X days"
  // If it's active but we prefer dynamic over snapshot, use dynamicDaysLeft
  const daysLeft = dynamicDaysLeft !== null ? dynamicDaysLeft : (client?.membership?.daysLeft ?? '-');

  return (
    <div className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 hover:shadow-sm transition-all duration-200 px-4 py-3">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_2fr_1fr_1fr_1fr] gap-4 md:gap-2 items-center text-sm">
        
        {/* Client Info */}
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
            {avatarText}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{name}</h3>
            <p className="text-xs text-gray-400 truncate">{client?.clientId || 'Pending ID'}</p>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center md:block">
          <span className="w-24 md:hidden text-gray-500 text-xs font-semibold uppercase">Mobile: </span>
          <p className="text-white truncate">{client?.personalInfo?.mobileNo || '-'}</p>
        </div>

        {/* Plan */}
        <div className="flex items-center md:block">
          <span className="w-24 md:hidden text-gray-500 text-xs font-semibold uppercase">Plan: </span>
          <p className="text-white truncate">{client?.membership?.planName || 'N/A'}</p>
        </div>

        {/* Duration */}
        <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0">
          <span className="w-24 md:hidden text-gray-500 text-xs font-semibold uppercase">Duration: </span>
          <div className="flex flex-col">
            <p className="text-gray-300 text-xs text-nowrap">Start: {formatDisplayDate(client?.membership?.startDate)}</p>
            <p className="text-gray-300 text-xs text-nowrap">End: {formatDisplayDate(client?.membership?.endDate)}</p>
          </div>
        </div>

        {/* Days Left */}
        <div className="flex items-center md:block">
          <span className="w-24 md:hidden text-gray-500 text-xs font-semibold uppercase">Days Left: </span>
          <p className="text-white font-medium">{daysLeft}</p>
        </div>

        {/* Status */}
        <div className="flex items-center md:block">
          <span className="w-24 md:hidden text-gray-500 text-xs font-semibold uppercase">Status: </span>
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase whitespace-nowrap ${statusStyles[status] || statusStyles.pending}`}>
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-start md:justify-end shrink-0 mt-2 md:mt-0">
          <Button type="button" variant="secondary" onClick={() => onView?.(client)} className="!px-3 !py-1.5 text-xs">
            <Eye size={14} /> View
          </Button>

          {showReactivate ? (
            <Button type="button" variant="secondary" onClick={() => onReactivate?.(client)} className="!px-3 !py-1.5 text-xs text-emerald-400 border-emerald-500/20 hover:border-emerald-400 hover:text-emerald-300">
              <RefreshCw size={14} /> Reactivate
            </Button>
          ) : showRenew ? (
            <Button type="button" variant="secondary" onClick={() => onRenew?.(client)} className="!px-3 !py-1.5 text-xs border-red-500/20 hover:border-red-400">
              <RefreshCw size={14} /> Renew
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={() => onDelete?.(client)} className="!px-3 !py-1.5 text-xs text-red-400 border-red-500/20 hover:border-red-400 hover:text-red-300">
              <Trash2 size={14} /> Deactivate
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ClientCard;
