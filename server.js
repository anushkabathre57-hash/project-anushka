```javascript
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
    const question = req.body.question;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Please enter a question."
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
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are Anushka AI, a helpful assistant for students. Answer clearly and simply."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(502).json({
        error: "AI service could not answer right now. Please try again."
      });
    }

    res.json({
      answer: data.choices?.[0]?.message?.content || "No answer received."
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Anushka AI server running on port " + PORT);
});
```
