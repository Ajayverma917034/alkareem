import { useState, useRef, useEffect } from "react";

/* ─── Logo ──────────────────────────────────────────────────────────── */
const Logo = ({ organization, orgTagline }) => (
    <div className="flex items-center gap-2">
        <div className="relative w-7 h-7">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
        </div>
        <div>
            <div className="text-navy font-black text-sm leading-none tracking-wider" style={{ color: "#1a2744" }}>
                {(organization || "").split(" ")[0].toUpperCase()}
            </div>
            <div className="text-gray-500 text-[8px] leading-none tracking-widest uppercase">
                {orgTagline}
            </div>
        </div>
    </div>
);

/* ─── Barcode ───────────────────────────────────────────────────────── */
const Barcode = ({ value }) => (
    <div className="flex flex-col items-center">
        <div className="flex gap-px h-8">
            {Array.from({ length: 42 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-800"
                    style={{
                        width: i % 3 === 0 ? "2px" : "1px",
                        height: i % 5 === 0 ? "100%" : i % 2 === 0 ? "80%" : "60%",
                        opacity: 0.85,
                    }}
                />
            ))}
        </div>
        <span className="text-[7px] text-gray-500 tracking-[0.2em] mt-1 font-mono">{value}</span>
    </div>
);

/* ─── Photo ─────────────────────────────────────────────────────────── */
const PhotoPlaceholder = ({ photo, name }) => (
    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white ">
        {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: "#d1d5db" }}>
                <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="80" fill="#cbd5e1" />
                    <circle cx="40" cy="30" r="16" fill="#94a3b8" />
                    <ellipse cx="40" cy="68" rx="28" ry="20" fill="#94a3b8" />
                </svg>
            </div>
        )}
    </div>
);

/* ─── Wave SVG ──────────────────────────────────────────────────────── */
const WaveShape = ({ side = "front" }) => {
    if (side === "front") {
        return (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 H320 V120 Q220 160 160 140 Q80 120 0 150 Z" fill="#1a2744" />
                <path d="M0 500 H320 V360 Q260 340 200 360 Q120 385 0 355 Z" fill="#1a2744" />
                <path d="M220 0 H320 V80 Q280 100 220 70 Z" fill="#e53935" opacity="0.9" />
                <path d="M0 420 Q60 400 120 420 V500 H0 Z" fill="#e53935" opacity="0.9" />
            </svg>
        );
    }
    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 H320 V90 Q240 130 160 110 Q80 90 0 120 Z" fill="#1a2744" />
            <path d="M0 500 H320 V400 Q240 380 160 400 Q80 420 0 400 Z" fill="#1a2744" />
            <path d="M260 0 H320 V60 Q280 80 250 55 Z" fill="#e53935" opacity="0.9" />
            <path d="M0 440 Q50 420 100 440 V500 H0 Z" fill="#e53935" opacity="0.9" />
        </svg>
    );
};

/* ─── Front Card ─────────────────────────────────────────────────────── */
const FrontCard = ({ data }) => (
    <div
        className="relative w-72 overflow-hidden shadow-2xl select-none"
        style={{ height: "450px", backgroundColor: "#f8fafc" }}
    >
        <WaveShape side="front" />

        {/* Lanyard hole */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
            <div className="w-8 h-4 bg-gray-300 rounded-b-full flex items-center justify-center">
                <div className="w-3 h-2.5 rounded-full bg-gray-500" />
            </div>
        </div>

        <div className="relative z-10 flex flex-col h-full px-5 pt-8">
            <div className="flex items-center gap-2 mt-1">
                <Logo organization={data.organization} orgTagline={data.orgTagline} />
            </div>

            <div className="flex justify-center mt-5">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500 blur-sm opacity-30 scale-110" />
                    <PhotoPlaceholder photo={data.photo} name={data.name} />
                </div>
            </div>

            <div className="text-center mt-4">
                <h2 className="text-xl font-black tracking-wide" style={{ color: "#1a2744", fontFamily: "'Georgia', serif" }}>
                    {(data.name || "").toUpperCase()}
                </h2>
                <p className="text-xs text-red-600 font-semibold tracking-widest uppercase mt-0.5">{data.role}</p>
            </div>

            <div className="flex items-center gap-2 mt-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID No :</span>
                <span className="text-sm font-black tracking-widest" style={{ color: "#1a2744" }}>{data.id}</span>
            </div>

            <div className="mt-3 space-y-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: "#1a2744" }}>
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-red-400 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    </span>
                    <span className="text-[10px] text-gray-100 leading-tight">{data.email}</span>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-red-400 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    </span>
                    <span className="text-[10px] text-gray-100">{data.mobile}</span>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-red-400 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-[10px] text-gray-100 leading-tight">{data.address}</span>
                </div>
            </div>

            <div className="mt-auto pb-5">
                <Barcode value={data.barcode} />
            </div>
        </div>
    </div>
);

/* ─── Back Card ──────────────────────────────────────────────────────── */
const BackCard = ({ data }) => (
    <div
        className="relative w-72 overflow-hidden shadow-2xl select-none"
        style={{ height: "450px", backgroundColor: "#f8fafc" }}
    >
        <WaveShape side="back" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
            <div className="w-8 h-4 bg-gray-300 rounded-b-full flex items-center justify-center">
                <div className="w-3 h-2.5 rounded-full bg-gray-500" />
            </div>
        </div>

        <div className="relative z-10 flex flex-col h-full px-5 pt-8">
            <div className="h-8" />

            <div className="bg-white rounded-xl shadow-sm p-3.5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2 h-2 rounded-sm bg-red-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-red-600">Terms and Conditions</span>
                </div>
                <ul className="space-y-2">
                    {(data.terms || []).map((term, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                            <p className="text-[9.5px] text-gray-600 leading-relaxed">{term}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4 flex flex-col gap-1 items-end pr-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-semibold">Joined :</span>
                    <span className="text-[10px] font-bold" style={{ color: "#1a2744" }}>{data.joinedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-semibold">Expires :</span>
                    <span className="text-[10px] font-bold text-red-600">{data.expiryDate}</span>
                </div>
            </div>

            <div className="mt-5 border-gray-300 pt-3 mx-2">

                <div className="h-px bg-gray-400 mt-2" />
                <p className="text-[9px] text-gray-500 mt-1 tracking-widest uppercase">Authorised Signature</p>
            </div>

            <div className="mt-auto mb-6 flex justify-center">
                <Logo organization={data.organization} orgTagline={data.orgTagline} />
            </div>
        </div>
    </div>
);

/* ─── html2canvas loader (singleton) ────────────────────────────────── */
let html2canvasPromise = null;
function loadHtml2Canvas() {
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
        if (window.html2canvas) { resolve(window.html2canvas); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        s.onload = () => resolve(window.html2canvas);
        s.onerror = reject;
        document.head.appendChild(s);
    });
    return html2canvasPromise;
}

/* ─── Main export: popup modal ───────────────────────────────────────── */
/* ─── Main export: popup modal ───────────────────────────────────────── */
export default function VolunteerIDCard({ volunteer, onClose }) {
    const [flipped, setFlipped] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const frontElRef = useRef(null);
    const backElRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const data = {
        id: volunteer?.volunteerId || "—",
        name: volunteer?.fullName || "—",
        role: volunteer?.role || "Volunteer",
        address: [volunteer?.address, volunteer?.city, volunteer?.state, volunteer?.country, volunteer?.pincode]
            .filter(Boolean).join(", ") || "—",
        mobile: volunteer?.mobile || "—",
        email: volunteer?.email || "—",
        photo: volunteer?.photo || null,
        joinedDate: volunteer?.adminApprovedAt
            ? new Date(volunteer.adminApprovedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " / ")
            : "—",
        expiryDate: (() => {
            const date = new Date();

            date.setFullYear(date.getFullYear() + 1);

            return date
                .toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, " / ");
        })(),
        organization: "HelpForward NGO",
        orgTagline: "Together We Rise",
        barcode: (volunteer?.volunteerId || "0000000000000000").replace(/[^0-9]/g, "").padEnd(16, "0"),
        terms: [
            "Volunteers must adhere to the organization's code of conduct and maintain professional behaviour at all times.",
            "This card is non-transferable and must be surrendered upon termination of service.",
            "Any misuse of this credential may result in immediate revocation and legal action.",
        ],
    };

    const downloadCard = async (side) => {
        setDownloading(side);

        try {
            const { toPng } = await import("html-to-image");

            const container = document.createElement("div");

            container.style.cssText = `
            position: fixed;
            top: 0;
            left: -9999px;
            z-index: 9999;
        `;

            document.body.appendChild(container);

            const { createRoot } = await import("react-dom/client");

            const root = createRoot(container);

            await new Promise((resolve) => {
                root.render(
                    side === "front"
                        ? <FrontCard data={data} />
                        : <BackCard data={data} />
                );

                requestAnimationFrame(() =>
                    requestAnimationFrame(resolve)
                );
            });

            const cardEl = container.firstChild;

            const dataUrl = await toPng(cardEl, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: "#f8fafc",
            });

            root.unmount();

            document.body.removeChild(container);

            const link = document.createElement("a");

            link.download = `volunteer-id-${data.id}-${side}.png`;

            link.href = dataUrl;

            link.click();

        } catch (e) {
            console.error("Download failed:", e);
        } finally {
            setDownloading(null);
        }
    };
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg flex flex-col items-center"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-full flex justify-end mb-3 absolute top-4 right-4">
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all mt-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Georgia', serif" }}>
                            VOLUNTEER ID CARD
                        </h1>
                        <p className="text-xs text-white/60 mt-1 tracking-widest uppercase">{data.name}</p>
                    </div>

                    {/* Card with flip */}
                    <div className="relative" style={{ perspective: "1000px" }}>
                        <div
                            className="relative transition-transform duration-700 ease-in-out"
                            style={{
                                transformStyle: "preserve-3d",
                                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                        >
                            <div ref={frontElRef} style={{ backfaceVisibility: "hidden" }}>
                                <FrontCard data={data} />
                            </div>
                            <div
                                ref={backElRef}
                                className="absolute inset-0"
                                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            >
                                <BackCard data={data} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setFlipped(!flipped)}
                        className="mt-8 px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                        style={{ background: "linear-gradient(135deg, #1a2744, #e53935)" }}
                    >
                        {flipped ? "← View Front" : "View Back →"}
                    </button>
                    <p className="text-xs text-white/50 mt-2 tracking-wide">Click to flip the card</p>

                    <div className="mt-6 flex gap-3 flex-wrap justify-center">
                        <button
                            onClick={() => downloadCard("front")}
                            disabled={!!downloading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d3f6b 100%)" }}
                        >
                            {downloading === "front" ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Generating…</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" /></svg>Download Front</>
                            )}
                        </button>

                        <button
                            onClick={() => downloadCard("back")}
                            disabled={!!downloading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)" }}
                        >
                            {downloading === "back" ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Generating…</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" /></svg>Download Back</>
                            )}
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-white/70 tracking-wide uppercase">Super HD · Print Ready · 3× Resolution</span>
                    </div>
                </div>
            </div>
            {/* No hidden render targets needed anymore */}
        </>
    );
}