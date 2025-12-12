"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem("stt_token", res.data.token);
      localStorage.setItem("stt_user", JSON.stringify(res.data.user));
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex items-center justify-center pt-24 px-4">
        <div className="w-full max-w-md">
          {/* Login/Signup Tabs/Buttons at the top */}
          <div className="flex mb-6">
            <div className="flex-1 text-center">
              <button
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-t-lg"
                disabled
              >
                Login
              </button>
            </div>
            <div className="flex-1 text-center">
              <button
                onClick={() => router.push("/signup")}
                className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-t-lg hover:bg-gray-300 transition"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8 bg-white shadow-xl rounded-b-lg rounded-tr-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 text-center mb-6">Sign in to your account to continue</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Sign In
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Sign up here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}