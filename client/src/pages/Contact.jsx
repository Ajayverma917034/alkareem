// src/pages/Contact.jsx
// Install dependency: npm i sonner

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Send, User, Mail, Phone, BookOpen, MessageSquare, ChevronDown, CheckCircle } from 'lucide-react';
import api from '../api/axiosInstance';

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUERY_OPTIONS = [
    { value: '', label: 'Select a query type' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'dignitory', label: 'Dignitory' },
    { value: 'donation', label: 'Donation' },
    { value: 'membership', label: 'Membership' },
    { value: 'other', label: 'Other' },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
    return (
        <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
                {!required && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-400 ml-0.5">{hint}</p>}
        </div>
    );
}

// ─── Input with icon ──────────────────────────────────────────────────────────

function IconInput({ icon: Icon, error, ...props }) {
    return (
        <div className={[
            'flex items-center h-12 border-2 rounded-lg px-3 gap-2.5 bg-white transition-colors duration-150',
            error
                ? 'border-red-300 focus-within:border-red-400'
                : 'border-gray-200 focus-within:border-(--primary)',
        ].join(' ')}>
            <Icon size={16} className="text-gray-400 shrink-0" />
            <input
                {...props}
                className="flex-1 outline-none text-sm text-gray-900 bg-transparent placeholder-gray-300 disabled:cursor-not-allowed"
            />
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    queryType: '',
    message: '',
};

export default function Contact() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const set = (key) => (e) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email))
            errs.email = 'Enter a valid email.';
        if (!form.phone.replace(/\D/g, '')) errs.phone = 'Phone number is required.';
        else if (form.phone.replace(/\D/g, '').length !== 10)
            errs.phone = 'Enter a valid 10-digit number.';
        if (!form.subject.trim()) errs.subject = 'Subject is required.';
        if (!form.queryType) errs.queryType = 'Please select a query type.';
        if (!form.message.trim()) errs.message = 'Message is required.';
        else if (form.message.trim().length < 20) errs.message = 'Message must be at least 20 characters.';
        return errs;
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            toast.error('Please fix the errors before submitting.');
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await api.post('/contact', {
                name: form.name.trim(),
                email: form.email.trim() || null,
                phone: form.phone.replace(/\D/g, ''),
                subject: form.subject.trim(),
                queryType: form.queryType,
                message: form.message.trim(),
            });
            toast.success('Message sent! We\'ll get back to you soon.');
            setSubmitted(true);
        } catch (err) {
            toast.error(err.userMessage || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (raw) => {
        const d = raw.replace(/\D/g, '').slice(0, 10);
        if (d.length <= 5) return d;
        return `${d.slice(0, 5)} ${d.slice(5)}`;
    };

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-4 py-10">
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl px-6 sm:px-10 py-14 flex flex-col items-center text-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Thank you for reaching out, <span className="font-semibold text-gray-700">{form.name}</span>.
                            Our team will get back to you within 24–48 hours.
                        </p>
                    </div>
                    <button
                        onClick={() => { setForm(INITIAL); setSubmitted(false); }}
                        className="mt-2 text-sm font-semibold text-(--primary) underline underline-offset-2 hover:opacity-75 transition-opacity"
                    >
                        Send another message
                    </button>
                </div>
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[calc(100vh-150px)] flex items-start justify-center bg-white px-4 py-10">
            <div className="w-full max-w-2xl">

                {/* Page header */}
                <div className="mb-8 text-center">
                    <img src="/logo.png" className="w-20 h-fit mx-auto mb-5" alt="Logo" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Get in Touch</h1>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Have a question or want to get involved? Fill out the form below
                        and we'll respond as soon as possible.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-xl px-5 sm:px-10 py-8 sm:py-10">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Row 1 — Name + Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <Field label="Full Name" required>
                                <IconInput
                                    icon={User}
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={set('name')}
                                    disabled={loading}
                                    error={errors.name}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-0.5 ml-0.5">{errors.name}</p>
                                )}
                            </Field>

                            <Field label="Phone Number" required hint="10-digit Indian mobile number">
                                <div className={[
                                    'flex items-center h-12 border-2 rounded-lg px-3 gap-2.5 bg-white transition-colors duration-150',
                                    errors.phone
                                        ? 'border-red-300 focus-within:border-red-400'
                                        : 'border-gray-200 focus-within:border-(--primary)',
                                ].join(' ')}>
                                    <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 shrink-0 h-6">
                                        <span className="text-base leading-none">🇮🇳</span>
                                        <span className="text-xs font-semibold text-gray-500">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={formatPhone(form.phone)}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        disabled={loading}
                                        className="flex-1 outline-none text-sm text-gray-900 bg-transparent placeholder-gray-300 tracking-wide disabled:cursor-not-allowed"
                                    />
                                    {form.phone.replace(/\D/g, '').length === 10 && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    )}
                                </div>
                                {errors.phone && (
                                    <p className="text-xs text-red-500 mt-0.5 ml-0.5">{errors.phone}</p>
                                )}
                            </Field>

                        </div>

                        {/* Row 2 — Email */}
                        <Field label="Email Address">
                            <IconInput
                                icon={Mail}
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={set('email')}
                                disabled={loading}
                                error={errors.email}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-0.5 ml-0.5">{errors.email}</p>
                            )}
                        </Field>

                        {/* Row 3 — Subject + Query type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <Field label="Subject" required>
                                <IconInput
                                    icon={BookOpen}
                                    type="text"
                                    placeholder="e.g. Donation inquiry"
                                    value={form.subject}
                                    onChange={set('subject')}
                                    disabled={loading}
                                    error={errors.subject}
                                />
                                {errors.subject && (
                                    <p className="text-xs text-red-500 mt-0.5 ml-0.5">{errors.subject}</p>
                                )}
                            </Field>

                            <Field label="Query Type" required>
                                <div className={[
                                    'relative flex items-center h-12 border-2 rounded-lg px-3 bg-white transition-colors duration-150',
                                    errors.queryType
                                        ? 'border-red-300 focus-within:border-red-400'
                                        : 'border-gray-200 focus-within:border-(--primary)',
                                ].join(' ')}>
                                    <select
                                        value={form.queryType}
                                        onChange={set('queryType')}
                                        disabled={loading}
                                        className="flex-1 outline-none text-sm bg-transparent appearance-none disabled:cursor-not-allowed pr-6
                                                   text-gray-900 [&>option:first-child]:text-gray-400"
                                    >
                                        {QUERY_OPTIONS.map(({ value, label }) => (
                                            <option key={value} value={value} disabled={value === ''}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.queryType && (
                                    <p className="text-xs text-red-500 mt-0.5 ml-0.5">{errors.queryType}</p>
                                )}
                            </Field>

                        </div>

                        {/* Row 4 — Message */}
                        <Field label="Message" required hint="Minimum 20 characters">
                            <div className={[
                                'flex items-start border-2 rounded-lg px-3 py-3 gap-2.5 bg-white transition-colors duration-150',
                                errors.message
                                    ? 'border-red-300 focus-within:border-red-400'
                                    : 'border-gray-200 focus-within:border-(--primary)',
                            ].join(' ')}>
                                <MessageSquare size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <textarea
                                    rows={5}
                                    placeholder="Tell us how we can help you…"
                                    value={form.message}
                                    onChange={set('message')}
                                    disabled={loading}
                                    className="flex-1 outline-none text-sm text-gray-900 bg-transparent placeholder-gray-300 resize-none disabled:cursor-not-allowed leading-relaxed"
                                />
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                {errors.message
                                    ? <p className="text-xs text-red-500 ml-0.5">{errors.message}</p>
                                    : <span />
                                }
                                <span className={`text-xs ml-auto ${form.message.length < 20 ? 'text-gray-400' : 'text-emerald-500'}`}>
                                    {form.message.length} / 20+
                                </span>
                            </div>
                        </Field>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-(--primary)/90 hover:bg-(--primary) text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-slate-300 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer mt-2"
                        >
                            {loading
                                ? <><Spinner /><span>Sending…</span></>
                                : <><span>Send Message</span><Send size={15} /></>
                            }
                        </button>

                        {/* Fine print */}
                        <p className="text-center text-xs text-gray-400">
                            By submitting, you agree to our{' '}
                            <a href="/terms" className="text-(--primary) underline underline-offset-2">Terms</a>
                            {' '}and{' '}
                            <a href="/privacy" className="text-(--primary) underline underline-offset-2">Privacy Policy</a>.
                        </p>

                    </form>
                </div>

            </div>
        </div>
    );
}