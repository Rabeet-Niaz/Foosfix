import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Requests from "./pages/Requests.jsx";
import Submit from "./pages/Submit.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/submit" element={<Submit />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}