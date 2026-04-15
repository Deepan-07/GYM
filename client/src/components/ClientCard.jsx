import React from 'react';
import { Eye, RefreshCw, Trash2 } from 'lucide-react';
import Button from './Button';
import { calculateDaysLeft, formatDisplayDate } from '../utils/membership';

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  expiring_soon: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  expired: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  red_tag: 'bg-red-500/10 text-red-400 border border-red-500/20',
  pending: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
};

const ClientCard = ({ client, onView, onDelete, onRenew, showRenew = false }) => {
  const name = client?.personalInfo?.name || 'Client';
  const avatarText = client?.avatar || name.charAt(0).toUpperCase();
  const durationText = client?.membership?.durationDays ? `${client.membership.durationDays} Days` : 'N/A';
  const status = client?.membership?.status || 'pending';
  const dynamicDaysLeft = calculateDaysLeft(client?.membership?.endDate);
  const daysLeft = dynamicDaysLeft ?? client?.membership?.daysLeft ?? '-';

  return (
    <div className="card bg-gray-900 border-gray-800 hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-4 xl:min-w-[240px]">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-lg font-bold shrink-0">
            {avatarText}
          </div>

          <div className="space-y-1 min-w-0">
            <div>
              <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
              <p className="text-sm text-gray-400 break-words">{client?.clientId || 'Pending ID'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 flex-1 text-sm">
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">Mobile</p>
            <p className="text-white">{client?.personalInfo?.mobileNo || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">Plan</p>
            <p className="text-white">{client?.membership?.planName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">Start</p>
            <p className="text-white">{formatDisplayDate(client?.membership?.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">{showRenew ? 'Expired On' : 'End'}</p>
            <p className="text-white">{formatDisplayDate(client?.membership?.endDate)}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">Days Left</p>
            <p className="text-white">{daysLeft}</p>
          </div>
          <div className="flex items-end">
            <div className="w-full">
              <p className="text-gray-500 uppercase tracking-wide text-[11px] mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase w-fit ${statusStyles[status] || statusStyles.pending}`}>
                {status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end shrink-0">
          <Button type="button" variant="secondary" onClick={() => onView?.(client)} className="!px-3 !py-2 text-sm">
            <Eye size={15} /> View
          </Button>

          {showRenew ? (
            <Button type="button" variant="secondary" onClick={() => onRenew?.(client)} className="!px-3 !py-2 text-sm border-red-500/20 hover:border-red-400">
              <RefreshCw size={15} /> Renew
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={() => onDelete?.(client)} className="!px-3 !py-2 text-sm border-red-500/20 hover:border-red-400 text-red-300">
              <Trash2 size={15} /> Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
