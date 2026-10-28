
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Project Anushka server is running!");
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const question = req.body?.question;

    if (!question || typeof question !== "string") {
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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are Anushka AI, a helpful assistant for students worldwide. Explain in simple language and help with study, jobs, scholarships, courses, and careers."
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
        error: "AI service could not answer right now."
      });
    }

    res.json({
      answer: data.choices?.[0]?.message?.content ||
        "Sorry, please try again."
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

app.get("/api/videos", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Please enter a video search topic."
      });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: "Video search is not configured yet."
      });
    }

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "10",
      q: query,
      key: process.env.YOUTUBE_API_KEY
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return res.status(502).json({
        error: "Video search failed. Please try again."
      });
    }

    const items = (data.items || []).map((video) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.medium?.url ||
        video.snippet.thumbnails?.default?.url || "",
      channelTitle: video.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`
    }));

    res.json({ items });
  } catch (error) {
    console.error("Video search error:", error.message);
    res.status(500).json({
      error: "Something went wrong while searching videos."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Project Anushka server running on port ${PORT}`);
});
