import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login } from "./pages/Login";
import { VerifyOtpPage } from "./pages/VerifyOtp";
import { ForgotPasswordPage } from "./pages/ForgetPass";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardPage from "./components/dashboard/DashboardDetails";
import DashboardLayout from "./layouts/DashboardLayout";

import Plans from "./pages/Plans";
import Volunteer from "./pages/Volunteer";
import DignitariesPage from "./pages/Digniataries";
import Donations from "./pages/Donations";
import Subscriptions from "./pages/Subscriptions";
import Users from "./pages/Users";
import ContactsPage from "./pages/Contacts";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/plan" element={<Plans />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/digniataries" element={<DignitariesPage />} />
            <Route path="/dontations" element={<Donations />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/users" element={<Users />} />
            <Route path="/contacts" element={<ContactsPage />} />

          </Route>

          {/* fallback route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}