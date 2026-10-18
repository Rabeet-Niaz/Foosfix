import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Requests from "./pages/Requests.jsx";
import Submit from "./pages/Submit.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/submit" element={<Submit/>} />
    </Routes>
  );
}