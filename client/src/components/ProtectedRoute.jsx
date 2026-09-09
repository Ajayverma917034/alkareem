import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        toast.error("Please login first");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;