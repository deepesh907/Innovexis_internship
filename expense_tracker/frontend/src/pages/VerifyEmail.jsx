import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            setMessage("Verification token missing.");
            return;
        }

        const verify = async () => {
            try {
                const res = await axios.get(`/api/verify-email?token=${encodeURIComponent(token)}`);
                setStatus("success");
                setMessage(res.data?.message || "Email verified successfully.");
            } catch (err) {
                const serverMsg = err?.response?.data?.error || "Verification failed";
                setStatus("error");
                setMessage(serverMsg);
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="relative w-full max-w-md">
                <div className="card text-center">
                    <h2 className="heading-2 mb-4">Email Verification</h2>
                    {status === "verifying" && <p className="text-muted">Verifying your email...</p>}
                    {status === "success" && <p className="badge-success">{message}</p>}
                    {status === "error" && <p className="alert alert-warning">{message}</p>}

                    <div className="mt-6">
                        <button className="btn btn-primary mr-2" onClick={() => navigate('/')}>Go to Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
