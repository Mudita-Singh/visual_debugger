// index.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require('./db');
const jwt = require("jsonwebtoken");


dotenv.config();
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);


const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors({ 
  origin: [
    "https://d3o3tfr2klaci.cloudfront.net", // your frontend
    "http://localhost:3000", // optional for local testing
    "http://localhost:5174" // local vite backend
  ], 
  credentials: true 
}));

app.use(session({
  secret: 'some secret',          // Keep your secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                 // ✅ cookie only sent over HTTPS
    sameSite: "lax"              // ✅ allow cross-site requests
  }
}));


// --------------------
// Cognito Config
// --------------------
const COGNITO_DOMAIN = "https://ap-south-1ibmxucwpv.auth.ap-south-1.amazoncognito.com";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

// --------------------
// Cognito Hosted UI Login
// --------------------
app.get("/hosted-login", (req, res) => {
  const loginUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(loginUrl);
});


// --------------------
// Cognito Callback
// --------------------
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code in query params");

  try {
    const tokenResponse = await axios({
      method: "POST",
      url: `${COGNITO_DOMAIN}/oauth2/token`,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`).toString("base64")
      },
      data: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      }).toString()
    });

    const tokens = tokenResponse.data;
    console.log("Cognito tokens received:", tokens);

    // Save tokens in session
    req.session.userInfo = {
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };

    // ✅ Save session to DB (important for EB)
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Failed to save session");
      }
      // Redirect to frontend after successful login
      res.redirect(REDIRECT_URI);
    });

  } catch (err) {
    console.error("Cognito callback error:", err.response?.data || err.message);
    res.status(500).send("Login failed. Check console for details.");
  }
});


// --------------------
// Logout Route
// --------------------
app.post('/logout', (req, res) => {
  req.session.destroy();
  const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${REDIRECT_URI}`;
  res.redirect(logoutUrl);
});

// --------------------
// Auth Middleware
// --------------------
const checkAuth = (req, res, next) => {
  req.isAuthenticated = !!req.session.userInfo;
  next();
  
};

app.get("/api/db-test", async (req, res) => {
  const connectDB = require("./db");
  try {
    const conn = await connectDB();
    await conn.execute("SELECT 1"); // simple query
    res.json({ status: "Database connected successfully" });
    await conn.end();
  } catch (err) {
    res.status(500).json({ status: "Database connection failed", error: err.message });
  }
});

// --------------------
// Guest Login Route
// --------------------
app.get("/api/guest-login", (req, res) => {
  req.session.userInfo = {
    username: "Guest",
    email: "guest@example.com",
    role: "guest",
  };
  res.json({ status: "Guest session created", user: req.session.userInfo });
});



// --------------------
// Session check route with guest fallback
// --------------------
app.get("/api/session", (req, res) => {
  if (req.session.userInfo && req.session.userInfo.idToken) {
    try {
      // Decode the ID token from Cognito
      const decoded = jwt.decode(req.session.userInfo.idToken);

      // Extract username and email from the token
      const username = decoded['cognito:username'] || decoded['email'] || "Unknown";
      const email = decoded.email || "unknown@example.com";

      res.json({ user: { username, email, role: "user" } });
    } catch (err) {
      console.error("Error decoding ID token:", err);

      // Fallback to guest session if token decoding fails
      req.session.userInfo = {
        username: "Guest",
        email: "guest@example.com",
        role: "guest"
      };
      res.json({ user: req.session.userInfo });
    }
  } else {
    // If no session exists, create a guest session
    req.session.userInfo = {
      username: "Guest",
      email: "guest@example.com",
      role: "guest"
    };
    res.json({ user: req.session.userInfo });
  }
});


// --------------------
// Users API (add this here)
// --------------------
app.get("/api/users", async (req, res) => {
  try {
    const conn = await connectDB();
    const [rows] = await conn.execute("SELECT * FROM users"); // Fetch all rows
    res.json(rows);
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const conn = await connectDB();
    const [result] = await conn.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    res.json({ status: "User added", id: result.insertId });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function seedUsers() {
  try {
    const conn = await connectDB();

    // Check if table is empty
    const [rows] = await conn.execute("SELECT COUNT(*) as count FROM users");
    if (rows[0].count === 0) {
      console.log("Seeding users table...");

      // Insert sample users
      const sampleUsers = [
        ["jasman", "jasman@example.com"],
        ["alice", "alice@example.com"],
        ["bob", "bob@example.com"]
      ];

      for (const [username, email] of sampleUsers) {
        await conn.execute(
          "INSERT INTO users (username, email) VALUES (?, ?)",
          [username, email]
        );
      }

      console.log("Users table seeded!");
    }

    await conn.end();
  } catch (err) {
    console.error("Error seeding users table:", err.message);
  }
}


// --------------------
// Google AI Endpoints (No Auth)
// --------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/api/status", (req, res) => {
  res.json({ status: "Backend is running", time: new Date().toISOString() });
});

app.post("/api/explain", async (req, res) => {
  const { code, language } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Explain this ${language} code in very simple terms for a beginner:\n\n${code}`;
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    res.json({ explanation });
  } catch (error) {
    console.error("Gemini API error (explain):", error);
    res.status(500).json({ error: "Failed to get AI explanation" });
  }
});

app.post("/api/flowchart", async (req, res) => {
  const { code, language } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Analyze this ${language} code and create a clean logical flowchart in JSON format.
Return ONLY a JSON array, where each element has: 
{id, label, type (start|end|input|output|process|decision), next: [ids of next steps]}.
Ensure at least one "start" and one "end" are present.
Do NOT include any text outside JSON.

Code:
${code}
    `;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const steps = raw.match(/\[.*\]/s) ? JSON.parse(raw.match(/\[.*\]/s)[0]) : [];

    const shapeStyles = {
      start: { borderRadius: "50px", background: "#E8F5E9", border: "2px solid #66BB6A", color: "#2E7D32" },
      end: { borderRadius: "50px", background: "#FFEBEE", border: "2px solid #EF5350", color: "#B71C1C" },
      input: { clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)", background: "#FFF3E0", border: "2px solid #FB8C00", color: "#E65100" },
      output: { clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)", background: "#E1F5FE", border: "2px solid #039BE5", color: "#01579B" },
      decision: { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", background: "#F3E5F5", border: "2px solid #AB47BC", color: "#6A1B9A" },
      process: { background: "#E3F2FD", border: "2px solid #42A5F5", color: "#1565C0" },
    };

    const nodes = steps.map((s, i) => ({
      id: s.id.toString(),
      data: { label: s.label },
      position: { x: 0, y: i * 180 },
      style: { padding: "10px 20px", fontWeight: "600", ...shapeStyles[s.type || "process"] },
    }));

    const edges = steps.flatMap((s) =>
      (s.next || []).map((n) => ({ id: `${s.id}-${n}`, source: s.id.toString(), target: n.toString(), animated: true, style: { stroke: "#42A5F5", strokeWidth: 2 } }))
    );

    res.json({ nodes, edges });
  } catch (error) {
    console.error("Gemini API error (flowchart):", error);
    res.status(500).json({ error: "Failed to generate flowchart" });
  }
});

app.post("/api/callstack", async (req, res) => {
  const { code, language } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Analyze this ${language} code and return ONLY a JSON array of the function or method names 
in the order they would be executed (call stack). 
Do NOT include any text outside JSON.

Code:
${code}
    `;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const stack = raw.match(/\[.*\]/s) ? JSON.parse(raw.match(/\[.*\]/s)[0]) : [];
    res.json({ stack });
  } catch (error) {
    console.error("Gemini API error (callstack):", error);
    res.status(500).json({ error: "Failed to generate call stack" });
  }
});


// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 8080;   // EB expects 8080
const HOST = "0.0.0.0";                  // 👈 allow external traffic
seedUsers();

app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
});

// --------------------
// Root Route (added for EB)
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});