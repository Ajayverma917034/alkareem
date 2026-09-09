import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Building, File, User, Shield, Loader2, MapPin } from "lucide-react";
import { Input, Label, Select, Textarea } from "../components/FormFields";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";
import api from "../api/axiosInstance";
import { getErrorMessage } from "../utils";

/* ─── Constants ────────────────────────────────────────────────────────── */
const PLACE_TYPES = [
    "Masjid",
    "Mandir",
    "Church",
    "Gurudwara",
    "Temple",
    "Ashram",
    "Trust",
    "NGO",
    "School",
    "Society",
    "Other",
];

/* ─── Sub-components ───────────────────────────────────────────────────── */
function SectionHeader({ icon, number, title, subtitle, color = "emerald" }) {
    const colors = {
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        violet: "bg-violet-50 border-violet-200 text-violet-700",
        rose: "bg-rose-50 border-rose-200 text-rose-700",
        teal: "bg-teal-50 border-teal-200 text-teal-700",
    };
    return (
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-5">
            <div className="w-9 h-9 rounded-md flex items-center justify-center text-lg border bg-(--primary)/10 border-(--primary)/50 text-(--primary)">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <span className="mr-1">{number}.</span>
                    {title}
                    {subtitle && (
                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full border ${colors[color]}`}>
                            {subtitle}
                        </span>
                    )}
                </h3>
            </div>
        </div>
    );
}

/* ─── Success Screen ────────────────────────────────────────────────────── */
function SuccessScreen({ onReset, dignitaryId }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-10 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Your dignitary registration has been submitted successfully. You'll receive a notification when it's reviewed by admin.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">After Approval</p>
                    <p className="text-sm font-bold text-emerald-800">{dignitaryId || "DGN-YYYY-NNNN"}</p>
                    <p className="text-xs text-emerald-600">Your Dignitary ID will be generated</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-sm text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
                >
                    Submit another registration
                </button>
            </div>
        </div>
    );
}

/* ─── Main Form ─────────────────────────────────────────────────────────── */
const DignitaryRegistrationForm = ({ onLogout }) => {
    const { user: authUser } = useAuth();

    const fileRef = useRef(null);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dignitaryId, setDignitaryId] = useState("");
    const [isDeclared, setIsDeclared] = useState(false);

    const [form, setForm] = useState({
        // Personal (auto-filled)
        fullName: "",
        email: "",
        mobile: "",
        gender: "Male",
        pincode: "",
        city: "",
        state: "",
        country: "IN",
        // Dignitary / Org
        dignitaryName: "",
        placeType: "",
        otherPlaceType: "",
        fullAddress: "",
        placeCity: "",
        placeState: "",
        placeCountry: "IN",
        placePincode: "",
        // Role
        role: "",
    });

    /* ── Country / State / City lists ── */
    const countries = Country.getAllCountries();
    const userStates = form.country ? State.getStatesOfCountry(form.country) : [];
    const userCities = form.country && form.state ? City.getCitiesOfState(form.country, form.state) : [];
    const placeStates = form.placeCountry ? State.getStatesOfCountry(form.placeCountry) : [];
    const placeCities = form.placeCountry && form.placeState ? City.getCitiesOfState(form.placeCountry, form.placeState) : [];

    const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    /* ── Fetch profile and pre-fill ── */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);
                const { data } = await api.get("/auth/profile");
                if (data?.success) {
                    const u = data.user;

                    const matchedCountry = Country.getAllCountries().find(
                        (c) => c.name === u.country || c.isoCode === u.country
                    );
                    const countryIso = matchedCountry?.isoCode || "IN";

                    const matchedState = countryIso
                        ? State.getStatesOfCountry(countryIso).find(
                            (s) => s.name === u.state || s.isoCode === u.state
                        )
                        : null;
                    const stateIso = matchedState?.isoCode || "";

                    setForm((p) => ({
                        ...p,
                        fullName: u.name || "",
                        email: u.email || "",
                        mobile: u.phone || "",
                        gender: u.gender || "Male",
                        pincode: u.pincode || "",
                        country: countryIso,
                        state: stateIso,
                        city: u.city || "",
                    }));
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
                    pincode: authUser?.pincode || "",
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
        setFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]);
    };

    const handleFileChange = (e) => {
        setFiles((p) => [...p, ...Array.from(e.target.files)]);
    };

    const handleSubmit = async () => {
        if (
            !form.fullName ||
            !form.email ||
            !form.mobile ||
            !form.dignitaryName ||
            !form.placeType ||
            (form.placeType === "Other" && !form.otherPlaceType) ||
            !form.fullAddress ||
            !form.placeCity ||
            !form.placeState ||
            !form.placeCountry ||
            !form.placePincode ||
            !form.role ||
            files.length === 0
        ) {
            toast.error("Please fill in all required fields and upload documents.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            formData.append("fullName", form.fullName);
            formData.append("email", form.email);
            formData.append("mobile", form.mobile);
            formData.append("gender", form.gender);
            formData.append("pincode", form.pincode || "");
            formData.append("city", form.city || "");
            formData.append("state", form.state || "");
            formData.append("country", form.country || "");
            formData.append("dignitaryName", form.dignitaryName);
            formData.append("placeType", form.placeType === "Other" ? form.otherPlaceType : form.placeType);
            formData.append("fullAddress", form.fullAddress);
            formData.append("placeCity", form.placeCity);
            formData.append("placeState", form.placeState);
            formData.append("placeCountry", form.placeCountry);
            formData.append("placePincode", form.placePincode);
            formData.append("role", form.role);

            files.forEach((file) => formData.append("documents", file));

            const { data } = await api.post("/register-dignitary", formData);

            toast.success(data?.message || "Dignitary registration submitted successfully!");
            if (data?.dignitaryId) setDignitaryId(data.dignitaryId);
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
                onReset={() => { setSubmitted(false); onLogout(); }}
                dignitaryId={dignitaryId}
            />
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

                {/* ── Header ── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-(--primary) to-(--primary)/80 rounded-2xl shadow-lg p-6 text-white">
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                            <Building size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold">Dignitary Registration Form</h1>
                            <p className="text-white/70 text-sm mt-0.5">For Dignitary / Organization / Religious Places</p>
                        </div>
                    </div>
                </div>

                {/* ── Section 1: Personal Details ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={<User size={18} />}
                        number="1"
                        title="Personal Details"
                        subtitle="Auto-filled · Editable"
                        color="emerald"
                    />

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
                                placeholder="Auto-filled (Editable)"
                            />

                            <Input
                                label="Email"
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                                placeholder="Auto-filled (Editable)"
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

                            <Input
                                label="Pincode"
                                value={form.pincode}
                                maxLength={6}
                                onChange={(e) =>
                                    setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                                }
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Enter pincode"
                            />

                            <Select
                                label="Country"
                                value={form.country}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, country: e.target.value, state: "", city: "" }))
                                }
                            >
                                <option value="">Select Country</option>
                                {countries.map((c) => (
                                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                ))}
                            </Select>

                            <Select
                                label="State"
                                value={form.state}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, state: e.target.value, city: "" }))
                                }
                                disabled={!form.country}
                            >
                                <option value="">Select State</option>
                                {userStates.map((s) => (
                                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                ))}
                            </Select>

                            <Select
                                label="City"
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                disabled={!form.state}
                            >
                                <option value="">Select City</option>
                                {userCities.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>

                {/* ── Section 2: Dignitary / Org Details ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={<Building size={20} />}
                        number="2"
                        title="Dignitary / Organization Details"
                        color="blue"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Dignitary / Organization Name"
                            required
                            containerClassName="sm:col-span-2"
                            value={form.dignitaryName}
                            onChange={(e) => setField("dignitaryName", e.target.value)}
                            placeholder="Enter dignitary / organization name"
                        />

                        <Select
                            label="Place / Type"
                            required
                            value={form.placeType}
                            onChange={(e) => setField("placeType", e.target.value)}
                        >
                            <option value="">-- Select Place / Type --</option>
                            {PLACE_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>

                        {form.placeType === "Other" && (
                            <Input
                                label="Other (Please specify)"
                                required
                                value={form.otherPlaceType}
                                onChange={(e) => setField("otherPlaceType", e.target.value)}
                                placeholder="Enter other place / type"
                            />
                        )}

                        <Textarea
                            label="Full Address"
                            required
                            rows={3}
                            containerClassName="sm:col-span-2"
                            value={form.fullAddress}
                            onChange={(e) => setField("fullAddress", e.target.value)}
                            placeholder="Enter complete address"
                        />

                        <Select
                            label="Country"
                            required
                            value={form.placeCountry}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, placeCountry: e.target.value, placeState: "", placeCity: "" }))
                            }
                        >
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                            ))}
                        </Select>

                        <Select
                            label="State"
                            required
                            value={form.placeState}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, placeState: e.target.value, placeCity: "" }))
                            }
                            disabled={!form.placeCountry}
                        >
                            <option value="">Select State</option>
                            {placeStates.map((s) => (
                                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                            ))}
                        </Select>

                        <Select
                            label="City"
                            required
                            value={form.placeCity}
                            onChange={(e) => setField("placeCity", e.target.value)}
                            disabled={!form.placeState}
                        >
                            <option value="">Select City</option>
                            {placeCities.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </Select>

                        <Input
                            label="Pin Code"
                            required
                            value={form.placePincode}
                            maxLength={6}
                            onChange={(e) =>
                                setField("placePincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter pin code"
                        />
                    </div>
                </div>

                {/* ── Section 3: Role / Position ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={<Shield size={20} />}
                        number="3"
                        title="Dignitary Role / Position"
                        color="violet"
                    />
                    <div>
                        <Input
                            label="Your Role / Position in Dignitary"
                            required
                            value={form.role}
                            onChange={(e) => setField("role", e.target.value)}
                            placeholder="e.g. Imam, Pujari, Pastor, Manager, Trustee, President, Secretary, etc."
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Examples: Masjid, Mandir, Church, Gurudwara, Temple, Ashram, Trust, NGO, School, Society, Other
                        </p>
                    </div>
                </div>

                {/* ── Section 4: Documents ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={<File size={20} />}
                        number="4"
                        title="Documents (Upload in One PDF)"
                        color="amber"
                    />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 flex gap-2 items-start">
                        <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                        <div className="text-xs text-amber-700">
                            <p className="font-semibold mb-1">Required Documents:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>ID Proof (Aadhaar, PAN, etc.)</li>
                                <li>Address Proof</li>
                                <li>Dignitary / Organization Registration Document (if any)</li>
                                <li>Any Other Relevant Document</li>
                            </ul>
                            <p className="mt-2 font-semibold">Upload all documents in one PDF file (Max Size: 10MB)</p>
                        </div>
                    </div>

                    <div>
                        <Label>Upload PDF Only</Label>
                        <p className="text-xs text-gray-400 mb-3">All documents in one PDF file</p>
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
                            <p className="text-xs text-gray-400 mt-1">PDF only (Max. 10MB)</p>
                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                accept=".pdf"
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
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-sm flex-shrink-0">📄</span>
                                            <span className="text-xs text-gray-700 font-medium truncate">{f.name}</span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                                            className="text-red-400 hover:text-red-600 text-xs font-bold flex-shrink-0 ml-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 5: Declaration ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={<Shield size={20} />}
                        number="5"
                        title="Declaration"
                        color="rose"
                    />
                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <input
                            type="checkbox"
                            id="declaration"
                            checked={isDeclared}
                            onChange={(e) => setIsDeclared(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0"
                        />
                        <label htmlFor="declaration" className="text-xs text-gray-700 leading-relaxed cursor-pointer">
                            I hereby declare that all the information provided is true and correct to the best of my knowledge.
                            I agree to abide by the rules and policies of Alkareem TARBIYAT Education and Welfare Trust.
                        </label>
                    </div>
                </div>

                {/* ── Submit ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isDeclared}
                        className="w-full bg-(--primary)/95 hover:bg-(--primary) active:scale-[0.99] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Submitting Registration…
                            </>
                        ) : (
                            "Submit Registration"
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

export default DignitaryRegistrationForm;