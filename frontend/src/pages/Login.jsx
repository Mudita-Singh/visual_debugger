import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Direct backend URL
const BACKEND_URL = "http://Visual-debugger-backend-env-2.eba-6fwipzcc.ap-south-1.elasticbeanstalk.com";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // --------------------
  // Login with username/password
  // --------------------
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Logged in as ${data.user.username}`);
        navigate("/home");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Check console for details.");
    }
  };

  // --------------------
  // Signup
  // --------------------
  const handleSignup = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Account created for ${data.user.username}`);
        setIsSignup(false);
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed. Check console for details.");
    }
  };

  // --------------------
  // Cognito Hosted UI Login
  // --------------------
  const handleHostedLogin = () => {
    window.location.href = `${BACKEND_URL}/hosted-login`;
  };

  // --------------------
  // Guest Login
  // --------------------
  const handleGuest = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/guest-login`, {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      alert("Logged in as Guest");
      navigate("/home");
    } else {
      alert(data.error || "Guest login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Guest login failed");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-[400px] text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded bg-slate-700 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded bg-slate-700 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button
            onClick={handleSignup}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg mb-4"
          >
            Create Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mb-4"
          >
            Login
          </button>
        )}

        <div className="flex items-center gap-2 my-4">
          <hr className="flex-1 border-slate-600" />
          <span className="text-slate-400 text-sm">or</span>
          <hr className="flex-1 border-slate-600" />
        </div>

        <button
          onClick={handleHostedLogin}
          className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg mb-3"
        >
          Sign in with Google (Hosted UI)
        </button>
        <button
          onClick={handleGuest}
          className="w-full bg-slate-600 hover:bg-slate-700 py-2 rounded-lg"
        >
          Continue as Guest
        </button>

        <p className="text-center text-slate-400 mt-4 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-400 hover:underline"
          >
            {isSignup ? "Login" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
