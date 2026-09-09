import { useState, useEffect, useRef } from 'react';
import {
    User, Mail, Edit2, Save, X,
    MapPin, Hash, Camera, Shield, BadgeCheck,
    ChevronDown, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Country, State, City } from 'country-state-city';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

// ─── Static sub-components (outside Profile) — prevents remount on each keystroke ──

const Section = ({ title, icon: Icon, children, cols = 2 }) => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        </div>
        <div className={`px-6 py-5 grid grid-cols-1 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-5`}>
            {children}
        </div>
    </div>
);

const ReadField = ({ label, value, locked, fullWidth }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl w-full min-h-[40px] flex items-center">
                {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
            {locked && <Shield className="w-4 h-4 text-gray-300 flex-shrink-0" title="Cannot be changed" />}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, type = 'text', maxLength, inputMode, placeholder, error, fullWidth }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            inputMode={inputMode}
            placeholder={placeholder}
            className={`w-full text-sm px-4 py-2.5 border-2 rounded-xl outline-none transition-colors bg-white
                ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, error, fullWidth }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={`w-full text-sm px-4 py-2.5 border-2 rounded-xl outline-none transition-colors bg-white appearance-none
                    ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
            >
                <option value="">{placeholder || 'Select…'}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const TextareaField = ({ label, value, onChange, error, fullWidth }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            rows={2}
            className={`w-full text-sm px-4 py-2.5 border-2 rounded-xl outline-none transition-colors bg-white resize-none
                ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

// ─── Validation ───────────────────────────────────────────────────────────────

const validate = (form) => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = 'Enter a valid email address';
    if (form.pincode && form.pincode.length !== 6)
        errs.pincode = 'Pincode must be exactly 6 digits';
    return errs;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile() {
    const { syncUser } = useAuth();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', email: '', gender: '', occupation: '',
        address: '', pincode: '', countryCode: '', stateCode: '', city: '',
    });

    // Derived lists
    const countryList = Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name }));
    const stateList = formData.countryCode
        ? State.getStatesOfCountry(formData.countryCode).map((s) => ({ value: s.isoCode, label: s.name }))
        : [];
    const cityList = formData.countryCode && formData.stateCode
        ? City.getCitiesOfState(formData.countryCode, formData.stateCode).map((c) => ({ value: c.name, label: c.name }))
        : [];

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            if (data?.success) {
                const u = data.user;
                setUser(u);

                const matchedCountry = Country.getAllCountries().find(
                    (c) => c.name === u.country || c.isoCode === u.country
                );
                const countryIso = matchedCountry?.isoCode || '';
                const matchedState = countryIso
                    ? State.getStatesOfCountry(countryIso).find(
                        (s) => s.name === u.state || s.isoCode === u.state
                    )
                    : null;

                setFormData({
                    name: u.name || '',
                    email: u.email || '',
                    gender: u.gender || '',
                    occupation: u.occupation || '',
                    address: u.address || '',
                    pincode: u.pincode || '',
                    countryCode: countryIso,
                    stateCode: matchedState?.isoCode || '',
                    city: u.city || '',
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile');
        }
    };

    const field = (key, val) => {
        setFormData((p) => {
            const next = { ...p, [key]: val };
            if (key === 'countryCode') { next.stateCode = ''; next.city = ''; }
            if (key === 'stateCode') { next.city = ''; }
            return next;
        });
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const handleSave = async () => {
        const errs = validate(formData);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try {
            setSaving(true);
            const countryName = Country.getCountryByCode(formData.countryCode)?.name || formData.countryCode;
            const stateName = formData.stateCode
                ? State.getStateByCodeAndCountry(formData.stateCode, formData.countryCode)?.name || formData.stateCode
                : '';

            const { data } = await api.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                gender: formData.gender,
                occupation: formData.occupation,
                address: formData.address,
                pincode: formData.pincode,
                country: countryName,
                state: stateName,
                city: formData.city,
            });

            if (data?.success) {
                await syncUser();
                setUser(data.user);
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                setErrors({});
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => { fetchProfile(); setIsEditing(false); setErrors({}); };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
        try {
            setImageUploading(true);
            const fd = new FormData();
            fd.append('profileImage', file);
            const { data } = await api.put('/auth/profile/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data?.success) {
                setUser((prev) => ({ ...prev, profileImage: data.profileImage }));
                await syncUser();
                toast.success('Profile picture updated!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Image upload failed');
        } finally {
            setImageUploading(false);
            e.target.value = '';
        }
    };

    const formatPhone = (phone, code) => (!phone ? '—' : `${code || '+91'} ${phone}`);
    const formatDate = (d) => (!d ? '—' : new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
    const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading profile…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-5 pb-10">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0 self-start sm:self-auto">
                            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                                {imageUploading
                                    ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                    : user.profileImage
                                        ? <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        : <span className="text-2xl font-bold text-blue-600">{initials}</span>
                                }
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imageUploading}
                                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
                                title="Change photo"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>

                        {/* Name / phone / IDs */}
                        <div className="flex-1 min-w-0 sm:mb-2">
                            <h1 className="text-xl font-bold text-gray-900 truncate">{user.name || 'Your Name'}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{formatPhone(user.phone, user.countryCode)}</p>

                            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
                                <Hash className="w-3 h-3" /> {user.clientId}
                            </span>
                        </div>

                        {/* Edit / Save / Cancel */}
                        <div className="flex gap-2 sm:mb-2 sm:flex-shrink-0">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors whitespace-nowrap"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Personal Information ──────────────────────────────────────── */}
            <Section title="Personal Information" icon={User}>
                {isEditing ? (
                    <>
                        <InputField label="Full Name *" value={formData.name}
                            onChange={(e) => field('name', e.target.value)}
                            placeholder="Your full name" error={errors.name} />

                        <ReadField label="Phone Number" value={formatPhone(user.phone, user.countryCode)} locked />

                        <InputField label="Email Address" value={formData.email}
                            onChange={(e) => field('email', e.target.value)}
                            type="email" placeholder="you@example.com" error={errors.email} />

                        <SelectField label="Gender" value={formData.gender}
                            onChange={(e) => field('gender', e.target.value)}
                            options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
                            placeholder="Select gender" />

                        <InputField label="Occupation" value={formData.occupation}
                            onChange={(e) => field('occupation', e.target.value)}
                            placeholder="e.g. Engineer, Teacher…" />

                        <ReadField label="Member Since" value={formatDate(user.createdAt)} locked />
                    </>
                ) : (
                    <>
                        <ReadField label="Full Name" value={user.name} />
                        <ReadField label="Phone Number" value={formatPhone(user.phone, user.countryCode)} locked />
                        <ReadField label="Email Address" value={user.email} />
                        <ReadField label="Gender" value={user.gender} />
                        <ReadField label="Occupation" value={user.occupation} />
                        <ReadField label="Member Since" value={formatDate(user.createdAt)} locked />
                    </>
                )}
            </Section>

            {/* ── Address ──────────────────────────────────────────────────── */}
            <Section title="Address" icon={MapPin}>
                {isEditing ? (
                    <>
                        <TextareaField label="Full Address" value={formData.address}
                            onChange={(e) => field('address', e.target.value)}
                            error={errors.address} fullWidth />

                        <InputField label="Pincode (6 digits)" value={formData.pincode}
                            onChange={(e) => field('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            inputMode="numeric" maxLength={6} placeholder="000000" error={errors.pincode} />

                        <SelectField label="Country" value={formData.countryCode}
                            onChange={(e) => field('countryCode', e.target.value)}
                            options={countryList} placeholder="Select country" />

                        <SelectField label="State" value={formData.stateCode}
                            onChange={(e) => field('stateCode', e.target.value)}
                            options={stateList}
                            placeholder={formData.countryCode ? 'Select state' : 'Select country first'} />

                        <SelectField label="City" value={formData.city}
                            onChange={(e) => field('city', e.target.value)}
                            options={cityList}
                            placeholder={formData.stateCode ? 'Select city' : 'Select state first'} />
                    </>
                ) : (
                    <>
                        <ReadField label="Full Address" value={user.address} fullWidth />
                        <ReadField label="Pincode" value={user.pincode} />
                        <ReadField label="Country" value={user.country} />
                        <ReadField label="State" value={user.state} />
                        <ReadField label="City" value={user.city} />
                    </>
                )}
            </Section>

            {/* ── Account (always read-only) ────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-sm">Account</h2>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</p>
                        <span className="inline-block text-sm font-semibold px-3 py-1.5 rounded-xl capitalize bg-blue-50 text-blue-700">
                            {user.role || 'Donator'}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl
                            ${user.isPhoneVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            <BadgeCheck className="w-4 h-4" />
                            {user.isPhoneVerified ? 'Verified' : 'Not Verified'}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Login</p>
                        <p className="text-sm text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl">
                            {formatDate(user.lastLoginAt)}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}