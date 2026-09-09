import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Input from "../common/Input";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../common/AuthCard";
import EyeIcon from "../common/EyeButton";
import Btn from "../common/Btn";

export const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);

    const set = (k) => (e) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.email || !form.password) {
            toast.error("Please fill all fields");
            return;
        }

        const result = await login(form);

        if (result.success) {
            toast.success("Logged in successfully!");
            navigate("/dashboard");
        } else {
            toast.error(result.message || "Login failed");
        }
    };

    return (
        <AuthCard title="Welcome back" subtitle="">

            <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="admin@example.com"
            />

            <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Your password"
                rightEl={
                    <span onClick={() => setShowPass(p => !p)}>
                        <EyeIcon open={showPass} />
                    </span>
                }
            />

            <div style={{ textAlign: "right", marginBottom: 20, marginTop: -8 }}>
                <Link to="/forgot-password" className="text-white">
                    Forgot password?
                </Link>
            </div>

            <Btn loading={loading} onClick={handleSubmit}>
                Sign In
            </Btn>

            {/* <Divider text="don't have an account?" /> */}

            {/*  <div style={{ textAlign: "center" }}>
                <Link to="/register">
                    Create one now
                </Link>
            </div>
            */}
        </AuthCard>
    );
};