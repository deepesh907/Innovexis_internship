import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setUserId }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        email: ""
    });

    const [isSignup, setIsSignup] = useState(false);
    const [message, setMessage] = useState("");
    const [verificationLink, setVerificationLink] = useState(null); // frontend route (/verify-email?token=...)
    const [backendVerifyUrl, setBackendVerifyUrl] = useState(null); // backend API url (/api/verify-email?token=...)
    const [verificationMessage, setVerificationMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const loginUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/login",
                form
            );

            setUserId(res.data.user_id);
            navigate("/dashboard");

        } catch (err) {
            const serverMsg = err?.response?.data?.error || "Login failed. Check your credentials.";
            setMessage(`❌ ${serverMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const signupUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Client-side validation
        if (!form.username || form.username.trim().length < 3) {
            setMessage('❌ Username must be at least 3 characters');
            setIsLoading(false);
            return;
        }
        if (!form.password || form.password.length < 6) {
            setMessage('❌ Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }
        if (form.email && !/^([^@\s]+)@([^@\s]+)\.([^@\s]+)$/.test(form.email)) {
            setMessage('❌ Invalid email format');
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:5000/api/register",
                form
            );

            const data = res.data || {};
            setMessage("✅ Signup successful! Check verification status.");
            // If backend returned a verification link (demo), show it
            if (data.verification_link) {
                try {
                    // extract token from backend link and create a frontend link
                    const url = new URL(data.verification_link);
                    const token = url.searchParams.get("token");
                    if (token) {
                        setVerificationLink(`/verify-email?token=${encodeURIComponent(token)}`);
                        setBackendVerifyUrl(`/api/verify-email?token=${encodeURIComponent(token)}`);
                        setVerificationMessage("Please verify your email by clicking the link below.");
                    } else {
                        // fallback: show the returned link if token not parsed
                        setVerificationLink(data.verification_link);
                        setBackendVerifyUrl(data.verification_link);
                        setVerificationMessage("Please verify your email by clicking the link below.");
                    }
                } catch (e) {
                    setVerificationLink(data.verification_link);
                    setBackendVerifyUrl(data.verification_link);
                    setVerificationMessage("Please verify your email by clicking the link below.");
                }
            }

            setForm({ username: "", password: "", email: "" });
            setTimeout(() => setIsSignup(false), 2000);

        } catch (err) {
            const serverMsg = err?.response?.data?.error || "Signup failed. User may already exist.";
            setMessage(`❌ ${serverMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async () => {
        if (!backendVerifyUrl) return;
        setIsLoading(true);
        setVerificationMessage("");
        try {
            const res = await axios.get(backendVerifyUrl);
            setVerificationMessage(res.data?.message || "Email verified");
            setMessage("✅ Email verified. You can now login.");
            setVerificationLink(null);
            setBackendVerifyUrl(null);
        } catch (err) {
            const serverMsg = err?.response?.data?.error || 'Verification failed';
            setVerificationMessage(`❌ ${serverMsg}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
            {/* Background Elements */}
            <div className="bg-circle top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply animate-pulse"></div>
            <div className="bg-circle bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply animate-pulse"></div>

            {/* Main Form */}
            <div className="relative w-full max-w-md login-wrapper">
                <form onSubmit={isSignup ? signupUser : loginUser} className="card">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="heading-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                            💰 ExpenseTracker
                        </h1>
                        <h2 className="heading-3 text-gray-800 mb-2">
                            {isSignup ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {isSignup
                                ? "Join us to manage your expenses efficiently"
                                : "Sign in to continue to your dashboard"}
                        </p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-warning'} mb-6`}>
                            {message}
                        </div>
                    )}

                    {/* Form Inputs */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input
                                name="username"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={handleChange}
                                className="input"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {isSignup && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="input"
                                    required={isSignup}
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                className="input"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full mb-4 font-semibold text-white"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? (isSignup ? "Creating Account..." : "Signing in...")
                            : (isSignup ? "Create Account" : "Sign In")}
                    </button>

                    {/* Toggle Link */}
                    <div className="text-center border-t pt-6">
                        <p className="text-gray-700 text-sm mb-3">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setMessage("");
                                setForm({ username: "", password: "", email: "" });
                                setVerificationLink(null);
                                setVerificationMessage("");
                            }}
                            className="text-indigo-600 font-bold hover:text-purple-600 transition text-sm"
                        >
                            {isSignup ? "Sign In Instead" : "Create New Account"}
                        </button>
                    </div>
                </form>

                {/* Verification panel (demo) */}
                {verificationLink && (
                    <div className="card mt-4 p-4 text-center">
                        <p className="text-sm text-gray-700 mb-3">{verificationMessage}</p>
                        <a href={verificationLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-words">
                            Open verification link
                        </a>
                        <div className="mt-3">
                            <button onClick={verifyEmail} className="btn btn-secondary mt-2">Verify Email Now</button>
                        </div>
                        {verificationMessage && (
                            <div className="mt-3">
                                <p className="text-sm">{verificationMessage}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Text */}
                <p className="text-white/80 text-center mt-8 text-sm">
                    🔒 Your financial data is secure and encrypted
                </p>
            </div>
        </div>
    );
}