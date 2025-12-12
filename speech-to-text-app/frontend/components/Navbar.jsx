"use client";
import Link from "next/link";

export default function Navbar() {
  const token = typeof window !== "undefined" ? localStorage.getItem("stt_token") : null;

  const handleLogout = () => {
    localStorage.removeItem("stt_token");
    localStorage.removeItem("stt_user");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-900 shadow-lg p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/">
        <h1 className="text-2xl font-bold text-indigo-500 hover:text-indigo-400 transition">Speech2Text</h1>
      </Link>
      <div className="space-x-4">
        {token ? (
          <>
            <Link href="/history" className="text-gray-200 hover:text-indigo-400 transition">History</Link>
            <button
              onClick={handleLogout}
              className="text-white bg-pink-500 px-3 py-1 rounded hover:bg-pink-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-200 hover:text-indigo-400 transition">Login</Link>
            <Link href="/signup" className="text-white bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-600 transition">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
