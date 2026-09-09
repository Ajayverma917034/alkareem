import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FullScreenLoader from "../../common/Loader";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div><FullScreenLoader /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    return children;
};

export default ProtectedRoute;