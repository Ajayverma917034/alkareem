const Divider = ({ text }) => (
    <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
        <span style={{ color: "#475569", fontSize: 12, padding: "0 12px" }}>{text}</span>
        <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
    </div>
);

export default Divider;