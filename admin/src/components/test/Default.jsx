const Img = ({ src, ...props }) => {
    return (
        <img
            src={src || "/default.jpg"}
            {...props}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default.jpg";
            }}
        />
    );
};

export default Img;