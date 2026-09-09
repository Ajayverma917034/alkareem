

const Btn = ({ children, onClick, loading, disabled }) => (
    <button
        onClick={onClick}
        disabled={loading || disabled}
        style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 15,
            cursor: loading || disabled ? "not-allowed" : "pointer",
            border: "none",
            background: loading || disabled ? "#1E40AF" : "#3B82F6",
            color: "#fff",
            transition: "all 0.2s",
        }}
    >
        {loading ? "Please wait…" : children}
    </button>
);

export default Btn;