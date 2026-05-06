import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Search, Filter, Plus, X, ChevronDown, Check } from 'lucide-react';
import Button from '../../components/Button';
import ClientForm from '../../components/ClientForm';
import ClientCard from '../../components/ClientCard';
import ClientDetail from './ClientDetail';

// ─── Status options config ───────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'Active', label: 'Active', dot: 'bg-emerald-500' },
  { value: 'Upcoming', label: 'Upcoming', dot: 'bg-blue-500' },
  { value: 'Expired', label: 'Expired', dot: 'bg-gray-500' },
];

// ─── Custom Dropdown (replaces native <select> for Dark-theme compatibility) ──
const CustomDropdown = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const isFiltered = value !== 'All' && value !== options[0]?.value;

  return (
    <div ref={ref} className="relative min-w-[160px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all cursor-pointer
          ${isFiltered
            ? 'bg-primary/10 border-primary/50 text-primary'
            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
          }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${selected.dot}`} />}
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors
                ${opt.value === value
                  ? 'bg-primary/15 text-primary'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <span className="flex items-center gap-2">
                {opt.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />}
                {opt.label}
              </span>
              {opt.value === value && <Check size={13} className="shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Filter badge chip ────────────────────────────────────────────────────────
const FilterBadge = ({ label, onClear }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/40">
    {label}
    <button onClick={onClear} className="hover:text-white transition-colors leading-none">
      <X size={11} />
    </button>
  </span>
);

// ─── Main Inactive Clients Page ──────────────────────────────────────────────────
const InactiveClients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Get status from URL if present
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'All';

  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterPlan, setFilterPlan] = useState('All');

  // Sync filter with URL changes
  useEffect(() => {
    const s = new URLSearchParams(location.search).get('status');
    if (s) setFilterStatus(s);
  }, [location.search]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [viewClientId, setViewClientId] = useState(null);

  // Fetch plans once (for the plan filter dropdown)
  useEffect(() => {
    api.get('/plan')
      .then(res => setPlans(res.data.data || []))
      .catch(() => { });
  }, []);

  // Build plan options dynamically from fetched plans
  const planOptions = [
    { value: 'All', label: 'All Plans' },
    ...plans.map(p => ({ value: p.name, label: p.name }))
  ];

  // Fetch clients whenever either filter changes
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterPlan !== 'All') params.append('planName', filterPlan);
      const res = await api.get(`/client/inactive?${params.toString()}`);
      setClients(res.data.data || []);
    } catch {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlan]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Modal helpers
  const closeAddModal = (force = false) => {
    if (!force && isFormDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
    }
    setShowAddModal(false);
    setFormInstanceKey(k => k + 1);
    setIsFormDirty(false);
  };

  const handleReactivate = async (id) => {
    if (window.confirm('Are you sure you want to reactivate this client?')) {
      try {
        await api.put(`/client/${id}/reactivate`);
        toast.success('Client reactivated');
        fetchClients();
      } catch {
        toast.error('Failed to reactivate');
      }
    }
  };

  // Client-side search on top of server-side status+plan filter
  const filteredClients = clients.filter(c =>
    c.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.clientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.personalInfo.mobileNo.includes(searchTerm)
  );

  const hasStatusFilter = filterStatus !== 'All';
  const hasPlanFilter = filterPlan !== 'All';
  const activeFilterCount = (hasStatusFilter ? 1 : 0) + (hasPlanFilter ? 1 : 0);

  const clearAll = () => { setFilterStatus('All'); setFilterPlan('All'); };

  return (
    <div className="flex bg-dark h-screen overflow-hidden">
      <></>
      <div className="flex-1 overflow-y-auto p-8 pt-10">

        {/* ── Page Header ── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Inactive Clients</h1>
            <p className="text-gray-400 mt-1">Manage deactivated gym members.</p>
          </div>
        </div>

        {/* ── Search + Filter Bar ── */}
        <div className="card mb-3 flex flex-col gap-3 bg-gray-900 border-gray-800">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                type="text"
                placeholder="Search by name, ID or phone..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Filter size={15} className="text-gray-500" />

              {/* Status */}
              <CustomDropdown
                value={filterStatus}
                onChange={setFilterStatus}
                options={STATUS_OPTIONS}
                placeholder="All Status"
              />

              {/* Plan */}
              <CustomDropdown
                value={filterPlan}
                onChange={setFilterPlan}
                options={planOptions}
                placeholder="All Plans"
              />

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-2 whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ── Active filter badges ── */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-800/60">
              <span className="text-xs text-gray-500">Filtering by:</span>
              {hasStatusFilter && (
                <FilterBadge
                  label={`Status: ${STATUS_OPTIONS.find(o => o.value === filterStatus)?.label}`}
                  onClear={() => setFilterStatus('All')}
                />
              )}
              {hasPlanFilter && (
                <FilterBadge
                  label={`Plan: ${filterPlan}`}
                  onClear={() => setFilterPlan('All')}
                />
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-500 mb-4 px-1">
          {loading ? 'Loading...' : `${filteredClients.length} client${filteredClients.length !== 1 ? 's' : ''} found`}
        </p>

        {/* ── Client list ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card bg-gray-900 border-gray-800 text-center py-16 text-gray-400">
            <Filter size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clients found</p>
            <p className="text-sm mt-1 text-gray-600">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="card p-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_2fr_1fr_1fr_1fr] gap-2 px-4 py-4 bg-gray-900/80 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <div>Client Info</div>
              <div>Mobile No</div>
              <div>Plan</div>
              <div>Duration</div>
              <div>Days Left</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="flex flex-col">
              {filteredClients.map(client => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onView={(c) => setViewClientId(c._id)}
                  showReactivate={true}
                  onReactivate={selected => handleReactivate(selected._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {viewClientId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="relative bg-gray-900 border border-gray-700/50 rounded-xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                        <h2 className="text-lg font-bold text-white">Client Details</h2>
                        <button onClick={() => setViewClientId(null)} className="text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <ClientDetail clientId={viewClientId} onClose={() => setViewClientId(null)} />
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default InactiveClients;
