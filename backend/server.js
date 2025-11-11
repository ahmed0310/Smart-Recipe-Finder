// server.js — Smart Recipe Finder backend

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const https = require("https");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Route 0: Generate recipes via Gemini (expects { ingredients, diet })
app.post("/generate", async (req, res) => {
  const { ingredients, diet } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
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
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  });

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const reqAi = https.request(options, (resp) => {
    let data = "";
    resp.on("data", (chunk) => (data += chunk));
    resp.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        // If Gemini returned an error object, surface it
        if (parsed?.error) {
          const message = parsed.error?.message || "Gemini API error";
          const type = parsed.error?.code;
          console.error("Gemini API error:", parsed.error);
          return res.status(502).json({ message, type });
        }
        const candidate = parsed?.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
          console.error("Gemini response missing content:", parsed);
          return res.status(502).json({ message: "No content received from AI" });
        }
        let content = candidate.content.parts[0].text;
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
        console.error("Gemini parse error:", e);
        res.status(500).json({ message: "AI response parse error", detail: String(e) });
      }
    });
  });
  reqAi.on("error", (err) => {
    console.error("Gemini request error:", err);
    res.status(502).json({ message: "AI request failed" });
  });
  reqAi.write(payload);
  reqAi.end();
});

// ✅ Route 1: Signup (create user)
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  console.log(`[DB LOG] /signup - Executing query: ${query}`);
  console.log(`[DB LOG] /signup - Parameters: [${name}, ${email}, ${password}]`);
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error(`[DB LOG] /signup - Error: ${err.message}`);
      console.error(`[DB LOG] /signup - Full error:`, err);
      res.status(500).json({ message: "Signup failed" });
    } else {
      console.log(`[DB LOG] /signup - Success: Inserted user with ID ${result.insertId}`);
      console.log(`[DB LOG] /signup - Affected rows: ${result.affectedRows}`);
      console.log(`New user signed up: ${name} (${email})`);
      res.status(200).json({ message: "User registered successfully" });
    }
  });
});

// ✅ Route 2: Login (verify user)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  console.log(`[DB LOG] /login - Executing query: ${query}`);
  console.log(`[DB LOG] /login - Parameters: [${email}, ${password}]`);
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(`[DB LOG] /login - Error: ${err.message}`);
      console.error(`[DB LOG] /login - Full error:`, err);
      res.status(500).json({ message: "Login error" });
    } else if (results.length > 0) {
      console.log(`[DB LOG] /login - Success: Found ${results.length} user(s)`);
      console.log(`[DB LOG] /login - User details: ID ${results[0].id}, Name: ${results[0].name}, Email: ${results[0].email}`);
      res.status(200).json({ message: "Login successful", user: results[0] });
    } else {
      console.log(`[DB LOG] /login - No matching user found`);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// ✅ Route 3: Save favourite recipe
app.post("/favourites", (req, res) => {
  const { user_id, recipe_title, recipe_text } = req.body;
  const query = "INSERT INTO favourites (user_id, recipe_title, recipe_text) VALUES (?, ?, ?)";
  console.log(`[DB LOG] /favourites POST - Executing query: ${query}`);
  console.log(`[DB LOG] /favourites POST - Parameters: [${user_id}, ${recipe_title}, ${recipe_text}]`);
  db.query(query, [user_id, recipe_title, recipe_text], (err, result) => {
    if (err) {
      console.error(`[DB LOG] /favourites POST - Error: ${err.message}`);
      console.error(`[DB LOG] /favourites POST - Full error:`, err);
      res.status(500).json({ message: "Failed to save recipe" });
    } else {
      console.log(`[DB LOG] /favourites POST - Success: Inserted favourite with ID ${result.insertId}`);
      console.log(`[DB LOG] /favourites POST - Affected rows: ${result.affectedRows}`);
      res.status(200).json({ message: "Recipe saved successfully", favourite_id: result.insertId });
    }
  });
});

// ✅ Route 4: Delete a favourite recipe
app.delete("/favourites/:favourite_id", (req, res) => {
  const { favourite_id } = req.params;
  const query = "DELETE FROM favourites WHERE id = ?";
  console.log(`[DB LOG] /favourites/:favourite_id DELETE - Executing query: ${query}`);
  console.log(`[DB LOG] /favourites/:favourite_id DELETE - Parameters: [${favourite_id}]`);
  db.query(query, [favourite_id], (err, result) => {
    if (err) {
      console.error(`[DB LOG] /favourites/:favourite_id DELETE - Error: ${err.message}`);
      console.error(`[DB LOG] /favourites/:favourite_id DELETE - Full error:`, err);
      res.status(500).json({ message: "Failed to delete favourite" });
    } else {
      console.log(`[DB LOG] /favourites/:favourite_id DELETE - Success: Deleted favourite with ID ${favourite_id}`);
      console.log(`[DB LOG] /favourites/:favourite_id DELETE - Affected rows: ${result.affectedRows}`);
      res.status(200).json({ message: "Favourite deleted successfully" });
    }
  });
});

// ✅ Route 5: Fetch user’s favourite recipes
app.get("/favourites/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = "SELECT * FROM favourites WHERE user_id = ?";
  console.log(`[DB LOG] /favourites/:user_id GET - Executing query: ${query}`);
  console.log(`[DB LOG] /favourites/:user_id GET - Parameters: [${user_id}]`);
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error(`[DB LOG] /favourites/:user_id GET - Error: ${err.message}`);
      console.error(`[DB LOG] /favourites/:user_id GET - Full error:`, err);
      res.status(500).json({ message: "Failed to fetch favourites" });
    } else {
      console.log(`[DB LOG] /favourites/:user_id GET - Success: Retrieved ${results.length} favourite(s)`);
      console.log(`[DB LOG] /favourites/:user_id GET - Results:`, results.map(r => ({ id: r.id, title: r.recipe_title })));
      res.status(200).json(results);
    }
  });
});

// ✅ Route 6: Contact form submission
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  const query = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
  console.log(`[DB LOG] /contact - Executing query: ${query}`);
  console.log(`[DB LOG] /contact - Parameters: [${name}, ${email}, ${message}]`);
  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error(`[DB LOG] /contact - Error: ${err.message}`);
      console.error(`[DB LOG] /contact - Full error:`, err);
      res.status(500).json({ message: "Failed to submit contact form" });
    } else {
      console.log(`[DB LOG] /contact - Success: Inserted contact with ID ${result.insertId}`);
      console.log(`[DB LOG] /contact - Affected rows: ${result.affectedRows}`);
      res.status(200).json({ message: "Message received successfully" });
    }
  });
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
