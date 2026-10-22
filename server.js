const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Project Anushka AI backend is running!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const question = req.body?.question;

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "AI service is not configured yet."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "You are Anushka AI, a helpful assistant for students worldwide. Answer clearly and simply. Help with studies, notes, career guidance, skills, and learning. Reply in the language the student uses."
            },
            {
              role: "user",
              content: question.trim()
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", {
        status: response.status,
        error: data.error?.message || "Unknown API error",
        code: data.error?.code
      });

      return res.status(502).json({
        error: "AI service could not answer right now. Please try again."
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "The AI did not return an answer. Please try again."
      });
    }

    return res.json({ answer });

  } catch (error) {
    console.error("Server error:", error.message);

    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Anushka AI server running on port " + PORT);
});
