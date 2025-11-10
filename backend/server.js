// server.js — Smart Recipe Finder backend

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const https = require("https");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Route 0: Generate recipes via OpenAI (expects { ingredients, diet })
app.post("/generate", async (req, res) => {
  const { ingredients, diet } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Missing OPENAI_API_KEY" });
  }
  if (!ingredients || !diet) {
    return res.status(400).json({ message: "ingredients and diet are required" });
  }

  const prompt = `
You are a recipe generator. Given ingredients and a diet preference, respond ONLY with a JSON array of 6-8 recipe objects. Each object must match this shape exactly (no extra fields):
{
  "recipe_title": string,
  "recipe_text": string,  // 3-6 concise steps in one paragraph
  "time": number,         // total minutes as integer
  "servings": number,     // integer
  "tags": string[]        // 2-4 short tags
}
Ensure the JSON is valid and parseable. Inputs:
ingredients: ${ingredients}
diet: ${diet}
`;

  const payload = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You format outputs as strict JSON with no commentary." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }
  };

  const reqAi = https.request(options, (resp) => {
    let data = "";
    resp.on("data", (chunk) => (data += chunk));
    resp.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        // If OpenAI returned an error object, surface it
        if (parsed?.error) {
          const message = parsed.error?.message || "OpenAI API error";
          const type = parsed.error?.type;
          console.error("OpenAI API error:", parsed.error);
          return res.status(502).json({ message, type });
        }
        const choice = parsed?.choices?.[0];
        if (!choice || !choice.message || !choice.message.content) {
          console.error("OpenAI response missing choices:", parsed);
          return res.status(502).json({ message: "No content received from AI" });
        }
        let content = choice.message.content;
        // Strip markdown code fences if present
        const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fencedMatch) content = fencedMatch[1];
        // Fallback: try to trim leading/trailing text to first/last bracket
        const firstIdx = content.indexOf('[');
        const lastIdx = content.lastIndexOf(']');
        if (firstIdx !== -1 && lastIdx !== -1) {
          content = content.slice(firstIdx, lastIdx + 1);
        }
        const json = JSON.parse(content);
        if (!Array.isArray(json)) throw new Error("Invalid JSON format");
        res.status(200).json(json);
      } catch (e) {
        console.error("OpenAI parse error:", e);
        res.status(500).json({ message: "AI response parse error", detail: String(e) });
      }
    });
  });
  reqAi.on("error", (err) => {
    console.error("OpenAI request error:", err);
    res.status(502).json({ message: "AI request failed" });
  });
  reqAi.write(payload);
  reqAi.end();
});

// ✅ Route 1: Signup (create user)
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Signup failed" });
    } else {
      res.status(200).json({ message: "User registered successfully" });
    }
  });
});

// ✅ Route 2: Login (verify user)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Login error" });
    } else if (results.length > 0) {
      res.status(200).json({ message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// ✅ Route 3: Save favourite recipe
app.post("/favourites", (req, res) => {
  const { user_id, recipe_title, recipe_text } = req.body;
  const query = "INSERT INTO favourites (user_id, recipe_title, recipe_text) VALUES (?, ?, ?)";
  db.query(query, [user_id, recipe_title, recipe_text], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save recipe" });
    } else {
      res.status(200).json({ message: "Recipe saved successfully" });
    }
  });
});

// ✅ Route 4: Fetch user’s favourite recipes
app.get("/favourites/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = "SELECT * FROM favourites WHERE user_id = ?";
  db.query(query, [user_id], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Failed to fetch favourites" });
    } else {
      res.status(200).json(results);
    }
  });
});

// ✅ Route 5: Contact form submission
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  const query = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit contact form" });
    } else {
      res.status(200).json({ message: "Message received successfully" });
    }
  });
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
