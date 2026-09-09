import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthCard from "../common/AuthCard";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import EyeIcon from "../common/EyeButton";
import Btn from "../common/Btn";
import Divider from "../common/Divider";

export const Register = () => {
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: ""
    });

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const set = (k) => (e) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const e = {};

        if (!form.name.trim()) e.name = "Name is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Valid email required";
        if (form.password.length < 6)
            e.password = "Minimum 6 characters";
        if (form.password !== form.confirm)
            e.confirm = "Passwords don't match";

        return e;
    };

    const handleSubmit = async () => {
        const e = validate();

        if (Object.keys(e).length) {
            setFieldErrors(e);
            toast.error("Please fix the errors in the form");
            return;
        }

        setFieldErrors({});

        const result = await register({
            name: form.name,
            email: form.email,
            password: form.password
        });

        if (result.success) {
            toast.success(result.message || "Account created successfully!");

            setTimeout(() => {
                navigate("/verify-otp");
            }, 1200);
        } else {
            toast.error(result.message || "Registration failed");
        }
    };

    return (
        <AuthCard
            title="Create your account"
            subtitle="Join All Kareem Tarbiyat and start growing"
        >
            {/* Removed Alert */}

            <Input
                label="Full Name"
                value={form.name}
                onChange={set("name")}
                placeholder="Your Name"
                error={fieldErrors.name}
            />

            <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                error={fieldErrors.email}
            />

            <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 6 characters"
                error={fieldErrors.password}
                rightEl={
                    <span onClick={() => setShowPass(p => !p)}>
                        <EyeIcon open={showPass} />
                    </span>
                }
            />

            <Input
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Repeat your password"
                error={fieldErrors.confirm}
                rightEl={
                    <span onClick={() => setShowConfirm(p => !p)}>
                        <EyeIcon open={showConfirm} />
                    </span>
                }
            />

            <Btn loading={loading} onClick={handleSubmit}>
                Create Account
            </Btn>

            <Divider text="already have an account?" />

            <div style={{ textAlign: "center" }}>
                <Link to="/login">
                    Sign in instead
                </Link>
            </div>
        </AuthCard>
    );
};