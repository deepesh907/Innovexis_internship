import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const handleSetUserId = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login setUserId={handleSetUserId} />} />
        <Route
          path="/dashboard"
          element={
            userId ? (
              <Dashboard user_id={userId} onLogout={handleLogout} />
            ) : (
              <Login setUserId={handleSetUserId} />
            )
          }
        />
        <Route
          path="/"
          element={
            userId ? (
              <Dashboard user_id={userId} onLogout={handleLogout} />
            ) : (
              <Login setUserId={handleSetUserId} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
