


const Input = ({ label, type = "text", value, onChange, placeholder, error, rightEl }) => (
    <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>
            {label}
        </label>
        <div style={{ position: "relative" }}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: rightEl ? "11px 44px 11px 14px" : "11px 14px",
                    background: "#0F172A",
                    border: `1.5px solid ${error ? "#EF4444" : "#1E293B"}`,
                    borderRadius: 10,
                    color: "#F1F5F9",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = error ? "#EF4444" : "#3B82F6"; }}
                onBlur={e => { e.target.style.borderColor = error ? "#EF4444" : "#1E293B"; }}
            />
            {rightEl && (
                <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
                    {rightEl}
                </div>
            )}
        </div>
        {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
);

export default Input;