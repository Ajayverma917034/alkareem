import logo from "../assets/logo.png";

const AuthCard = ({ children, title, subtitle }) => (
    <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }} className="w-100 h-25 p-2">
                    <img src={logo} alt="All Kareem Tarbiyat Logo" className="w-full h-full object-contain" />
                </div>
                <h1 style={{ color: "#F8FAFC", fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                    {title}
                </h1>
                <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>{subtitle}</p>
            </div>
            <div style={{
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: 16,
                padding: "28px 28px",
            }}>
                {children}
            </div>
        </div>
    </div>
);


export default AuthCard;