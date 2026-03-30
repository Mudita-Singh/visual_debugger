import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger";
import Callback from "./pages/callback"; // <-- Import callback page

function Nav() {
  return (
    <nav className="bg-gray-800 p-3 text-white flex gap-4">
      <Link to="/" className="hover:underline">Login</Link>
      <Link to="/home" className="hover:underline">Home</Link>
      <Link to="/debugger" className="hover:underline">Debugger</Link>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Nav />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/debugger" element={<Debugger />} />
        <Route path="/callback" element={<Callback />} /> {/* <-- Add this */}
      </Routes>
    </div>
  );
}
