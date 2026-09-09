import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    Plus, Pencil, Trash2, X, Check, Loader2,
    LayoutGrid, Eye, EyeOff,
    Palette, Tag, List, Calendar,
    Sparkles, ChevronDown, Search, Filter,
    BarChart3, Crown, ArrowUpDown
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ACCENT_COLORS = [
    { value: '#3B82F6', name: 'Blue' },
    { value: '#22C55E', name: 'Green' },
    { value: '#F97316', name: 'Orange' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#EAB308', name: 'Yellow' },
    { value: '#EF4444', name: 'Red' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#F59E0B', name: 'Amber' }
];

const BILLING_PERIODS = [
    { value: 'monthly', label: 'Monthly', suffix: '/ mo' },
    { value: 'quarterly', label: 'Quarterly', suffix: '/ 3 mo' },
    { value: 'yearly', label: 'Yearly', suffix: '/ yr' }
];

const DEFAULT_FORM = {
    name: '',
    price: '',
    billingPeriod: 'monthly',
    billingLabel: '/ mo',
    annualEquivalent: '',
    accentColor: '#8B5CF6',
    buttonColor: '#8B5CF6',
    badge: '',
    badgeColor: '#22C55E',
    isMostPopular: false,
    features: [''],
    order: 0,
    isActive: true
};

/* ─── Modal ─────────────────────────────────────────────────────────────── */
function PlanModal({ plan, onClose, onSave }) {
    const [form, setForm] = useState(plan ? {
        ...plan,
        features: plan.features.length ? plan.features : [''],
        badge: plan.badge || '',
        badgeColor: plan.badgeColor || '#22C55E'
    } : { ...DEFAULT_FORM });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Plan name is required';
        if (!form.price || form.price <= 0) e.price = 'Valid price is required';
        if (!form.billingPeriod) e.billingPeriod = 'Billing period is required';
        if (!form.features.filter(f => f.trim()).length) e.features = 'At least one feature is required';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleFeatureChange = (i, val) => {
        const f = [...form.features];
        f[i] = val;
        setForm({ ...form, features: f });
        if (errors.features) setErrors({ ...errors, features: null });
    };

    const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
    const removeFeature = i => {
        if (form.features.length > 1)
            setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });
    };

    const handleBillingChange = period => {
        const sel = BILLING_PERIODS.find(p => p.value === period);
        setForm({ ...form, billingPeriod: period, billingLabel: sel.suffix });
        if (errors.billingPeriod) setErrors({ ...errors, billingPeriod: null });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) { toast.error('Please fix the errors before submitting'); return; }
        setSaving(true);
        const payload = {
            ...form,
            price: Number(form.price),
            order: Number(form.order),
            features: form.features.filter(f => f.trim()),
            badge: form.badge.trim() || null,
            badgeColor: form.badge.trim() ? form.badgeColor : null
        };
        try {
            if (plan?._id) {
                const { data } = await axiosInstance.put(`/plans/${plan._id}`, payload);
                onSave(data, 'update');
            } else {
                const { data } = await axiosInstance.post('/plans', payload);
                onSave(data, 'create');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const inputBase = `w-full px-3 py-2 rounded-lg bg-[var(--color-bg-soft,#f4f4f5)] border text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all`;
    const inputOk = `border-gray-200 focus:border-[var(--primary)]`;
    const inputErr = `border-red-300 focus:border-red-500`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-3xl mb-8 rounded-2xl overflow-hidden bg-white shadow-2xl">
                {/* accent bar */}
                <div className="h-1" style={{ background: 'var(--primary)' }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-gray-900">
                                {plan ? 'Edit plan' : 'Create new plan'}
                            </h2>
                            <p className="text-[11px] text-gray-400 mt-px">
                                {plan ? 'Update plan details and features' : 'Configure your subscription offering'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto">

                    {/* ── Basic Info ── */}
                    <section className="space-y-3">
                        <SectionLabel icon={<LayoutGrid className="w-3.5 h-3.5" />} title="Basic information" />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Plan name" required error={errors.name}>
                                <input
                                    value={form.name}
                                    onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }}
                                    placeholder="e.g. Professional"
                                    className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                                />
                            </Field>
                            <Field label="Price (₹)" required error={errors.price}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-medium">₹</span>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={form.price}
                                        onChange={e => { setForm({ ...form, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: null }); }}
                                        placeholder="999"
                                        className={`${inputBase} pl-7 ${errors.price ? inputErr : inputOk}`}
                                    />
                                </div>
                            </Field>
                        </div>
                    </section>

                    {/* ── Billing ── */}
                    <section className="space-y-3">
                        <SectionLabel icon={<Calendar className="w-3.5 h-3.5" />} title="Billing configuration" />
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-2">
                                Billing period <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {BILLING_PERIODS.map(p => (
                                    <button
                                        key={p.value} type="button"
                                        onClick={() => handleBillingChange(p.value)}
                                        className={`relative px-3 py-3 rounded-lg border text-left transition-all ${form.billingPeriod === p.value
                                            ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                                            : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        {form.billingPeriod === p.value && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </span>
                                        )}
                                        <p className={`text-[12px] font-semibold ${form.billingPeriod === p.value ? 'text-[var(--primary)]' : 'text-gray-700'}`}>{p.label}</p>
                                        <p className={`text-[10px] mt-0.5 ${form.billingPeriod === p.value ? 'text-[color-mix(in_srgb,var(--primary)_80%,black)]' : 'text-gray-400'}`}>{p.suffix}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Field label="Annual equivalent" hint="Show yearly savings or comparison">
                            <input
                                value={form.annualEquivalent}
                                onChange={e => setForm({ ...form, annualEquivalent: e.target.value })}
                                placeholder="e.g. ₹11,988/year (Save 20%)"
                                className={`${inputBase} ${inputOk}`}
                            />
                        </Field>
                    </section>

                    {/* ── Design ── */}
                    <section className="space-y-3">
                        <SectionLabel icon={<Palette className="w-3.5 h-3.5" />} title="Design & branding" />
                        <div className="grid grid-cols-2 gap-5">
                            <ColorPicker label="Accent color" value={form.accentColor} onChange={v => setForm({ ...form, accentColor: v })} />
                            <ColorPicker label="Button color" value={form.buttonColor} onChange={v => setForm({ ...form, buttonColor: v })} />
                        </div>
                    </section>

                    {/* ── Badge ── */}
                    <section className="space-y-3">
                        <SectionLabel icon={<Tag className="w-3.5 h-3.5" />} title="Badge" optional />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Badge text">
                                <input
                                    value={form.badge}
                                    onChange={e => setForm({ ...form, badge: e.target.value })}
                                    placeholder="e.g. Most Popular"
                                    className={`${inputBase} ${inputOk}`}
                                />
                            </Field>
                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-2">Badge color</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {ACCENT_COLORS.slice(0, 6).map(c => (
                                        <button
                                            key={c.value} type="button"
                                            onClick={() => setForm({ ...form, badgeColor: c.value })}
                                            className="w-7 h-7 rounded-md transition-all hover:scale-110"
                                            style={{
                                                background: c.value,
                                                boxShadow: form.badgeColor === c.value ? `0 0 0 2px white, 0 0 0 3.5px ${c.value}` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        {form.badge && (
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Preview</p>
                                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                    style={{ background: `${form.badgeColor}18`, color: form.badgeColor, border: `1px solid ${form.badgeColor}35` }}>
                                    {form.badge}
                                </span>
                            </div>
                        )}
                    </section>

                    {/* ── Features ── */}
                    <section className="space-y-3">
                        <SectionLabel icon={<List className="w-3.5 h-3.5" />} title="Features" required />
                        <div className="space-y-2">
                            {form.features.map((feat, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input
                                        value={feat}
                                        onChange={e => handleFeatureChange(i, e.target.value)}
                                        placeholder={`Feature ${i + 1}`}
                                        className={`flex-1 ${inputBase} ${inputOk}`}
                                    />
                                    {form.features.length > 1 && (
                                        <button type="button" onClick={() => removeFeature(i)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addFeature}
                                className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-1.5 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)]"
                                style={{ color: 'var(--primary)' }}>
                                <Plus className="w-3.5 h-3.5" /> Add feature
                            </button>
                        </div>
                        {errors.features && <ErrMsg>{errors.features}</ErrMsg>}
                    </section>

                    {/* ── Settings ── */}
                    <section className="space-y-3 pt-1 border-t border-gray-100">
                        <SectionLabel icon={<BarChart3 className="w-3.5 h-3.5" />} title="Plan settings" />
                        <div className="flex flex-wrap items-center gap-5">
                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Display order</label>
                                <input
                                    type="number" min="0"
                                    value={form.order}
                                    onChange={e => setForm({ ...form, order: e.target.value })}
                                    className={`w-20 text-center ${inputBase} ${inputOk}`}
                                />
                            </div>
                            <Toggle
                                label="Most popular"
                                checked={form.isMostPopular}
                                onChange={() => setForm({ ...form, isMostPopular: !form.isMostPopular })}
                                icon={<Crown className="w-2.5 h-2.5" />}
                                color="var(--primary)"
                            />
                            <Toggle
                                label="Active plan"
                                checked={form.isActive}
                                onChange={() => setForm({ ...form, isActive: !form.isActive })}
                                icon={<Check className="w-2.5 h-2.5" />}
                                color="#22C55E"
                            />
                        </div>
                    </section>

                    {/* ── Buttons ── */}
                    <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 font-medium transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2.5 rounded-lg text-[13px] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                            style={{ background: 'var(--primary)' }}>
                            {saving
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : <><Check className="w-4 h-4" />{plan ? 'Update plan' : 'Create plan'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Small helpers ──────────────────────────────────────────────────────── */
function SectionLabel({ icon, title, optional, required }) {
    return (
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-gray-100">
            <span style={{ color: 'var(--primary)' }}>{icon}</span>
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
            {optional && <span className="text-[10px] text-gray-400 normal-case">(optional)</span>}
            {required && <span className="text-red-500 text-[11px]">*</span>}
        </div>
    );
}

function Field({ label, required, error, hint, children }) {
    return (
        <div>
            {label && (
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            {children}
            {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
            {error && <ErrMsg>{error}</ErrMsg>}
        </div>
    );
}

function ErrMsg({ children }) {
    return <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 inline-block" />{children}</p>;
}

function ColorPicker({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-2">{label}</label>
            <div className="flex gap-1.5 flex-wrap">
                {ACCENT_COLORS.slice(0, 8).map(c => (
                    <button key={c.value} type="button" onClick={() => onChange(c.value)} title={c.name}
                        className="w-7 h-7 rounded-md transition-all hover:scale-110 relative"
                        style={{
                            background: c.value,
                            boxShadow: value === c.value ? `0 0 0 2px white, 0 0 0 3.5px ${c.value}` : 'none'
                        }}>
                        {value === c.value && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />}
                    </button>
                ))}
                <label className="relative w-7 h-7 rounded-md cursor-pointer border border-dashed border-gray-300 hover:border-[var(--primary)] transition-all overflow-hidden flex items-center justify-center">
                    <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Palette className="w-3.5 h-3.5 text-gray-400" />
                </label>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange, icon, color }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div
                className="relative w-10 h-5 rounded-full transition-all cursor-pointer"
                style={{ background: checked ? color : '#E5E7EB' }}
                onClick={onChange}
            >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}>
                    {checked && <span className="absolute inset-0 flex items-center justify-center" style={{ color }}>{icon}</span>}
                </div>
            </div>
            <span className="text-[12px] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
        </label>
    );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBilling, setFilterBilling] = useState('all');
    const [sortBy, setSortBy] = useState('order');

    useEffect(() => { fetchPlans(); }, []);

    async function fetchPlans() {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/plans/all');
            setPlans(data.sort((a, b) => a.order - b.order));
        } catch { toast.error('Failed to load plans'); }
        finally { setLoading(false); }
    }

    const handleSave = (saved, type) => {
        if (type === 'create') {
            setPlans(prev => [...prev, saved].sort((a, b) => a.order - b.order));
            toast.success('Plan created successfully!');
        } else {
            setPlans(prev => prev.map(p => p._id === saved._id ? saved : p));
            toast.success('Plan updated successfully!');
        }
        setModal(null);
    };

    const handleDelete = async id => {
        if (!confirm('Delete this plan permanently? This action cannot be undone.')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/plans/${id}`);
            setPlans(prev => prev.filter(p => p._id !== id));
            toast.success('Plan deleted');
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
        finally { setDeletingId(null); }
    };

    const handleToggleActive = async plan => {
        setTogglingId(plan._id);
        try {
            const { data } = await axiosInstance.put(`/plans/${plan._id}`, { ...plan, isActive: !plan.isActive });
            setPlans(prev => prev.map(p => p._id === data._id ? data : p));
            toast.success(data.isActive ? 'Plan activated' : 'Plan deactivated');
        } catch { toast.error('Toggle failed'); }
        finally { setTogglingId(null); }
    };

    const handleDuplicate = plan => {
        setModal({ ...plan, name: `${plan.name} (Copy)`, order: plans.length, _id: undefined });
    };

    const filtered = plans
        .filter(p => {
            const ms = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const mst = filterStatus === 'all' ||
                (filterStatus === 'active' && p.isActive) ||
                (filterStatus === 'inactive' && !p.isActive) ||
                (filterStatus === 'popular' && p.isMostPopular);
            const mb = filterBilling === 'all' || p.billingPeriod === filterBilling;
            return ms && mst && mb;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'subscribers') return (b.subscriberCount || 0) - (a.subscriberCount || 0);
            return a.order - b.order;
        });

    const hasFilters = searchTerm || filterStatus !== 'all' || filterBilling !== 'all';

    const selectCls = `appearance-none pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-200 text-[12px] text-gray-600 font-medium outline-none cursor-pointer focus:border-[var(--primary)] transition-all`;

    return (
        <>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                            <Crown className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Subscription plans</h1>
                            <p className="text-[11px] text-gray-400">Manage and configure your pricing plans</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal('create')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] text-white font-medium transition-all hover:opacity-90"
                        style={{ background: 'var(--primary)' }}>
                        <Plus className="w-3.5 h-3.5" />
                        Create new plan
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-5 flex flex-col lg:flex-row gap-2.5">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search plans…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="popular">Popular</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Billing */}
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={filterBilling} onChange={e => setFilterBilling(e.target.value)} className={selectCls}>
                            <option value="all">All periods</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectCls}>
                            <option value="order">Order</option>
                            <option value="name">Name</option>
                            <option value="price-asc">Price (low)</option>
                            <option value="price-desc">Price (high)</option>
                            <option value="subscribers">Subscribers</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Filter result count */}
                {hasFilters && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] text-gray-400">
                            <span className="font-semibold text-gray-600">{filtered.length}</span> plan{filtered.length !== 1 ? 's' : ''} found
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterBilling('all'); }}
                            className="text-[11px] font-medium transition-colors hover:opacity-70"
                            style={{ color: 'var(--primary)' }}>
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                        <p className="text-[12px] text-gray-400">Loading plans…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'color-mix(in srgb, var(--primary) 10%, white)' }}>
                            <LayoutGrid className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 className="text-[14px] font-semibold text-gray-800 mb-1">
                            {hasFilters ? 'No plans match your filters' : 'No plans yet'}
                        </h3>
                        <p className="text-[12px] text-gray-400 mb-5 max-w-xs mx-auto">
                            {hasFilters ? 'Try adjusting your search or filters.' : 'Get started by creating your first subscription plan.'}
                        </p>
                        {!hasFilters && (
                            <button onClick={() => setModal('create')}
                                className="px-4 py-2 rounded-lg text-[12px] text-white font-medium inline-flex items-center gap-1.5"
                                style={{ background: 'var(--primary)' }}>
                                <Plus className="w-3.5 h-3.5" /> Create first plan
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map(plan => (
                            <PlanCard
                                key={plan._id}
                                plan={plan}
                                deletingId={deletingId}
                                togglingId={togglingId}
                                onEdit={() => setModal(plan)}
                                onToggle={() => handleToggleActive(plan)}
                                onDuplicate={() => handleDuplicate(plan)}
                                onDelete={() => handleDelete(plan._id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {modal !== null && (
                <PlanModal
                    plan={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </>
    );
}

/* ─── Plan Card ──────────────────────────────────────────────────────────── */
function PlanCard({ plan, deletingId, togglingId, onEdit, onToggle, onDuplicate, onDelete }) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-white border transition-all duration-200 hover:shadow-md ${!plan.isActive ? 'opacity-55' : 'hover:-translate-y-0.5'}`}
            style={{ borderColor: `${plan.accentColor}35` }}
        >
            {/* top bar */}
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${plan.accentColor}, ${plan.buttonColor})` }} />

            <div className="p-4">
                {/* Head */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${plan.accentColor}14` }}>
                            <div className="w-3.5 h-3.5 rounded-full" style={{ background: plan.accentColor }} />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-gray-900 leading-tight">{plan.name}</p>
                            <p className="text-[10px] text-gray-400 capitalize mt-0.5">{plan.billingPeriod}</p>
                        </div>
                    </div>
                    {plan.isMostPopular && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100">
                            <Crown className="w-3 h-3 text-amber-600" />
                        </div>
                    )}
                </div>

                {/* Badge */}
                {plan.badge && (
                    <div className="mb-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: `${plan.badgeColor}16`, color: plan.badgeColor, border: `1px solid ${plan.badgeColor}30` }}>
                            {plan.badge}
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[20px] font-semibold text-gray-900">₹{plan.price.toLocaleString()}</span>
                        <span className="text-[11px] text-gray-400">{plan.billingLabel}</span>
                    </div>
                    {plan.annualEquivalent && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{plan.annualEquivalent}</p>
                    )}
                </div>

                {/* Features */}
                <div className="mb-3">
                    <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Features</p>
                    <div className="space-y-1">
                        {plan.features.slice(0, 3).map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11.5px] text-gray-600">
                                <Check className="w-3 h-3 flex-shrink-0 mt-px" style={{ color: plan.accentColor }} />
                                <span className="line-clamp-1">{f}</span>
                            </div>
                        ))}
                        {plan.features.length > 3 && (
                            <p className="text-[10px] text-gray-400 ml-4.5 pl-px">+{plan.features.length - 3} more</p>
                        )}
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <div>
                        <p className="text-[9.5px] text-gray-400">Subscribers</p>
                        <p className="text-[13px] font-semibold text-gray-800">{plan.subscriberCount || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9.5px] text-gray-400">Order</p>
                        <p className="text-[13px] font-semibold text-gray-800">#{plan.order}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${plan.isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                    <button onClick={onEdit}
                        className="flex-1 px-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5">
                        <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <ActionBtn onClick={onToggle} loading={togglingId === plan._id} title={plan.isActive ? 'Deactivate' : 'Activate'}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-600">
                        {plan.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </ActionBtn>
                    <ActionBtn onClick={onDuplicate} title="Duplicate"
                        className="hover:bg-gray-100 text-gray-400"
                        style={{ background: 'color-mix(in srgb, var(--primary) 7%, white)', color: 'var(--primary)' }}>
                        <Plus className="w-3.5 h-3.5" />
                    </ActionBtn>
                    <ActionBtn onClick={onDelete} loading={deletingId === plan._id} title="Delete"
                        className="bg-red-50 hover:bg-red-100 text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                    </ActionBtn>
                </div>
            </div>
        </div>
    );
}

function ActionBtn({ onClick, loading, title, className, style, children }) {
    return (
        <button onClick={onClick} disabled={loading} title={title}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50 ${className}`}
            style={style}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : children}
        </button>
    );
}