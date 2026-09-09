import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building, File, Handshake, HelpCircle, Home, Pin, Target, Search, Plus, CheckCircle2, X, Loader2 } from "lucide-react";
import { Input, Label, Select, Textarea } from "../components/FormFields";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";
import api from "../api/axiosInstance";
import { getErrorMessage } from "../utils";

/* ─── Constants ────────────────────────────────────────────────────────── */
const ROLES = [
    "Teaching / Tutoring",
    "Event Management",
    "Social Media Handling",
    "Community Outreach",
    "Healthcare Support",
    "Environmental Work",
    "Administrative Support",
    "Fundraising",
];

const OCCUPATIONS = [
    "Student",
    "Employed",
    "Self-Employed",
    "Homemaker",
    "Retired",
    "Unemployed",
];

/* ─── Debounce hook ─────────────────────────────────────────────────────── */
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* ─── Sub-components ───────────────────────────────────────────────────── */
function SectionHeader({ icon, number, title }) {
    return (
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-5">
            <div className="w-9 h-9 rounded-md flex items-center justify-center text-lg border bg-(--primary)/10 border-(--primary)/50 text-(--primary)">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <span className="mr-1">{number}.</span>
                    {title}
                </h3>
            </div>
        </div>
    );
}

/* ─── Success Screen ────────────────────────────────────────────────────── */
function SuccessScreen({ onReset }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-10 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Your volunteer application has been submitted successfully. You'll receive a notification when it's reviewed.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">After Approval</p>
                    <p className="text-sm font-bold text-emerald-800">VOL-2026-XXXX</p>
                    <p className="text-xs text-emerald-600">Your Volunteer ID will be generated</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-sm text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
                >
                    Submit another application
                </button>
            </div>
        </div>
    );
}

/* ─── Dignitary Search Component ────────────────────────────────────────── */
function DignitarySearch({ selected, onSelect, onClear }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searched, setSearched] = useState(false);
    const containerRef = useRef(null);
    const debouncedQuery = useDebounce(query, 400);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Fetch dignitaries from API */
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([]);
            setShowDropdown(false);
            setSearched(false);
            return;
        }

        const fetchDignitaries = async () => {
            setIsLoading(true);
            setSearched(false);
            try {
                const { data } = await api.get("/web/dignitaries/search", {
                    params: { q: debouncedQuery },
                });
                setResults(data?.dignitaries || []);
                setShowDropdown(true);
                setSearched(true);
            } catch (err) {
                toast.error("Failed to search dignitaries");
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDignitaries();
    }, [debouncedQuery]);

    const handleSelect = (d) => {
        onSelect(d);
        setQuery("");
        setShowDropdown(false);
        setResults([]);
    };

    const handleClear = () => {
        onClear();
        setQuery("");
        setResults([]);
        setShowDropdown(false);
        setSearched(false);
    };

    /* If a dignitary is already selected, show the selected card */
    if (selected) {
        return (
            <div className="sm:col-span-2">
                <Label>Selected Dignitary</Label>
                <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-800 truncate">{selected.dignitaryName}</p>
                        <p className="text-xs text-emerald-600 truncate">{selected.dignitaryId} • {selected.placeType} • {selected.placeCity || selected.placeState}</p>
                    </div>
                    <button
                        onClick={handleClear}
                        className="w-7 h-7 rounded-full bg-emerald-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                        title="Remove selection"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:col-span-2" ref={containerRef}>
            <Label>Search Dignitary (By Name / ID)</Label>
            <div className="relative">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setShowDropdown(true)}
                        placeholder="Type name or dignitary ID to search approved dignitaries…"
                        className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-200 focus:border-(--primary) rounded-xl outline-none transition-colors bg-white"
                    />
                    {isLoading && (
                        <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                    )}
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-full mt-1.5 overflow-hidden">
                        {results.length > 0 ? (
                            <>
                                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                                    <p className="text-xs text-gray-500 font-semibold">{results.length} dignitar{results.length === 1 ? "y" : "ies"} found</p>
                                </div>
                                <div className="max-h-56 overflow-y-auto">
                                    {results.map((d) => (
                                        <button
                                            key={d._id}
                                            onClick={() => handleSelect(d)}
                                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-100 last:border-0 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{d.dignitaryName}</p>
                                                    <p className="text-xs text-gray-400 truncate">{d.dignitaryId} • {d.placeType}{d.placeCity ? ` • ${d.placeCity}` : ""}</p>
                                                </div>
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Approved</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : searched ? (
                            <div className="px-4 py-5 text-center">
                                <p className="text-sm text-gray-500 mb-3">No approved dignitaries found for <span className="font-semibold">"{query}"</span></p>
                                <button
                                    onClick={() => navigate("/add-dignitary")}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) hover:underline"
                                >
                                    <Plus size={15} /> Add New Dignitary
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Only approved dignitaries are shown. Type at least 2 characters to search.</p>
        </div>
    );
}

/* ─── Main Application Form ─────────────────────────────────────────────── */
const VolunteerForm = ({ onLogout }) => {
    const { user: authUser } = useAuth();

    const fileRef = useRef(null);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [selectedDignitary, setSelectedDignitary] = useState(null);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        mobile: "",
        gender: "Male",
        occupation: "Student",
        pincode: "",
        address: "",
        state: "",
        city: "",
        country: "",
        role: "",
        roleDesc: "",
        contribution: "",
    });

    /* ── Derive country/state/city lists from isoCode stored in form ── */
    const countries = Country.getAllCountries();
    const states = form.country ? State.getStatesOfCountry(form.country) : [];
    const cities = form.country && form.state ? City.getCitiesOfState(form.country, form.state) : [];

    const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    /* ── Fetch profile and pre-fill form ── */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);
                const { data } = await api.get("/auth/profile");
                if (data?.success) {
                    const u = data.user;

                    // Resolve country isoCode (stored as name or isoCode)
                    const matchedCountry = Country.getAllCountries().find(
                        (c) => c.name === u.country || c.isoCode === u.country
                    );
                    const countryIso = matchedCountry?.isoCode || "";

                    // Resolve state isoCode
                    const matchedState = countryIso
                        ? State.getStatesOfCountry(countryIso).find(
                            (s) => s.name === u.state || s.isoCode === u.state
                        )
                        : null;
                    const stateIso = matchedState?.isoCode || "";

                    setForm({
                        fullName: u.name || "",
                        email: u.email || "",
                        mobile: u.phone || "",
                        gender: u.gender || "Male",
                        occupation: u.occupation || "Student",
                        pincode: u.pincode || "",
                        address: u.address || "",
                        country: countryIso,
                        state: stateIso,
                        city: u.city || "",
                        role: "",
                        roleDesc: "",
                        contribution: "",
                    });
                }
            } catch (err) {
                console.error(err);
                // fallback to authUser context
                setForm((p) => ({
                    ...p,
                    fullName: authUser?.name || "",
                    email: authUser?.email || "",
                    mobile: authUser?.phone || "",
                    gender: authUser?.gender || "Male",
                    occupation: authUser?.occupation || "Student",
                    pincode: authUser?.pincode || "",
                    address: authUser?.address || "",
                }));
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files);
        setFiles((p) => [...p, ...dropped]);
    };

    const handleFileChange = (e) => {
        const picked = Array.from(e.target.files);
        setFiles((p) => [...p, ...picked]);
    };

    const handleSubmit = async () => {
        if (!form.fullName || !form.email || !form.role || !form.contribution) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            /* User Details */
            formData.append("fullName", form.fullName || "");
            formData.append("email", form.email || "");
            formData.append("mobile", form.mobile || "");
            formData.append("gender", form.gender || "");
            formData.append("occupation", form.occupation || "");
            formData.append("pincode", form.pincode || "");
            formData.append("address", form.address || "");
            formData.append("country", form.country || "");
            formData.append("state", form.state || "");
            formData.append("city", form.city || "");

            /* Volunteer Details */
            formData.append("role", form.role || "");
            formData.append("roleDesc", form.roleDesc || "");
            formData.append("contribution", form.contribution || "");

            /* Dignitary */
            formData.append("dignitaryId", selectedDignitary?._id || "");
            formData.append("dignitaryCode", selectedDignitary?.dignitaryId || "");
            formData.append("dignitaryName", selectedDignitary?.dignitaryName || "");

            /* Files */
            files.forEach((file) => {
                formData.append("documents", file);
            });

            const { data } = await api.post("/request-volunteer", formData);

            toast.success(data?.message || "Application submitted successfully!");
            setSubmitted(true);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted)
        return (
            <SuccessScreen
                onReset={() => {
                    setSubmitted(false);
                    onLogout();
                }}
            />
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6 gap-6 space-y-5">

                {/* ── Header ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-(--primary) to-(--primary)/80 rounded-2xl shadow-lg p-6 text-white">
                    {/* Decorative blobs */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                            <Handshake size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold">Volunteer Registration Form</h1>
                            <p className="text-white/70 text-sm mt-0.5">Join us and make a difference in the community</p>
                        </div>
                    </div>
                </div>

                {/* ── Section 1: User Details ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader icon={<Home size={18} />} number="1" title="Auto-Filled User Details" />

                    {profileLoading ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Loading your profile…</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                required
                                value={form.fullName}
                                onChange={(e) => setField("fullName", e.target.value)}
                            />

                            <Input
                                label="Email"
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                            />

                            <Input
                                label="Mobile Number"
                                required
                                readOnly
                                value={`+91 ${form.mobile}`}
                                className="cursor-not-allowed bg-gray-100!"
                            />

                            <Select
                                label="Gender"
                                required
                                value={form.gender}
                                onChange={(e) => setField("gender", e.target.value)}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                                <option>Prefer not to say</option>
                            </Select>

                            <Select
                                label="Occupation"
                                required
                                value={form.occupation}
                                onChange={(e) => setField("occupation", e.target.value)}
                            >
                                {OCCUPATIONS.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </Select>

                            <Input
                                label="Pincode"
                                required
                                value={form.pincode}
                                maxLength={6}
                                onChange={(e) =>
                                    setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />

                            <Textarea
                                label="Address"
                                required
                                rows={2}
                                containerClassName="sm:col-span-2"
                                value={form.address}
                                onChange={(e) => setField("address", e.target.value)}
                            />

                            <Select
                                label="Country"
                                required
                                value={form.country}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, country: e.target.value, state: "", city: "" }))
                                }
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </Select>

                            <Select
                                label="State"
                                required
                                value={form.state}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, state: e.target.value, city: "" }))
                                }
                                disabled={!form.country}
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </option>
                                ))}
                            </Select>

                            <Select
                                label="City"
                                required
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                disabled={!form.state}
                            >
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>

                {/* ── Section 2: Dignitary ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader icon={<Building size={20} />} number="2" title="Dignitary" />

                    <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-2.5 mb-5 flex gap-2 items-start">
                        <span className="text-violet-500 text-sm mt-0.5">ℹ️</span>
                        <p className="text-xs text-violet-700">
                            Search and select an approved dignitary. The dignitary field is read-only — selection is required to fill the details.
                            If not found, you can add a new dignitary.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DignitarySearch
                            selected={selectedDignitary}
                            onSelect={setSelectedDignitary}
                            onClear={() => setSelectedDignitary(null)}
                        />

                        {selectedDignitary && (
                            <>
                                <Input
                                    label="Dignitary ID"
                                    readOnly
                                    value={selectedDignitary.dignitaryId || ""}
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                                <Input
                                    label="Place / Institution"
                                    readOnly
                                    value={selectedDignitary.placeType || ""}
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                                <Input
                                    label="Location"
                                    readOnly
                                    value={[selectedDignitary.placeCity, selectedDignitary.placeState, selectedDignitary.placeCountry].filter(Boolean).join(", ")}
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* ── Section 3: Role & Responsibilities ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader icon={<Target size={20} />} number="3" title="Role & Responsibilities" />
                    <div className="space-y-4">
                        <Select
                            label="I want to work as a Volunteer for (Select Role)"
                            required
                            value={form.role}
                            onChange={(e) => setField("role", e.target.value)}
                        >
                            <option value="">Select your role</option>
                            {ROLES.map((r) => (
                                <option key={r}>{r}</option>
                            ))}
                        </Select>

                        <Textarea
                            label="Briefly describe the role / work you will do"
                            required
                            value={form.roleDesc}
                            onChange={(e) => setField("roleDesc", e.target.value)}
                            placeholder="e.g. Teaching, Event Management, Social Media Handling etc."
                        />
                    </div>
                </div>

                {/* ── Section 4: Contribution ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader icon={<Handshake size={20} />} number="4" title="How Will You Contribute?" />
                    <Textarea
                        label="Write how you can contribute to our organization and the community"
                        required
                        rows={4}
                        value={form.contribution}
                        onChange={(e) => setField("contribution", e.target.value)}
                        placeholder="Share your skills, experience and how you can help us achieve our mission..."
                    />
                </div>

                {/* ── Section 5: Documents ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader icon={<File size={20} />} number="5" title="Additional Documents / Photos" />
                    <div>
                        <Label>Upload Documents / Photos</Label>
                        <p className="text-xs text-gray-400 mb-3">You can upload multiple files</p>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragging
                                ? "border-(--primary) bg-(--primary)/5"
                                : "border-gray-200 hover:border-(--primary)/50 hover:bg-(--primary)/5"
                                }`}
                        >
                            <div className="text-3xl mb-2">☁️</div>
                            <p className="text-sm font-semibold text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (Max. 5MB each)</p>
                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{f.name.endsWith(".pdf") ? "📄" : "🖼️"}</span>
                                            <span className="text-xs text-gray-700 font-medium">{f.name}</span>
                                            <span className="text-xs text-gray-400">({(f.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                                            className="text-red-400 hover:text-red-600 text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Submit ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-(--primary)/95 hover:bg-(--primary) active:scale-[0.99] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Submitting…
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <span>🔒</span> You can edit all the details before submitting the form.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VolunteerForm;