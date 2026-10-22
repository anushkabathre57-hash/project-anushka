const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Home route
app.get("/", (req, res) => {
  res.send("Project Anushka AI backend is running!");
});

// AI CHATBOT
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

    const systemPrompt = `
You are Anushka AI, a helpful learning assistant for students worldwide.

Help students learn, study, develop skills, and prepare for their future.

CAPABILITIES:
1. Explain Maths, Physics, Chemistry, Biology, English, and other subjects step by step.
2. Create organized notes with headings, definitions, examples, and summaries.
3. Create MCQs with options A, B, C, D, correct answers, and explanations.
4. Create daily and weekly study plans.
5. Help with HTML, CSS, JavaScript, Python, and other programming topics.
6. Give career guidance for resumes, interviews, jobs, internships, and scholarships.
7. Reply in the language the student uses, using simple and friendly language.
8. Be honest when unsure. Never invent job openings, deadlines, or verified facts.
9. Do not claim to have searched the internet unless a search tool has actually been used.
10. Help students understand answers rather than just memorize them.

You are a student learning assistant. Be friendly, respectful, and encouraging.
`;

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
              content: systemPrompt
            },
            {
              role: "user",
              content: question.trim()
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", {
        status: response.status,
        error: data.error?.message || "Unknown API error"
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
    console.error("Chat error:", error.message);

    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

// YOUTUBE EDUCATIONAL VIDEO SEARCH
app.get("/api/videos", async (req, res) => {
  try {
    const query = req.query.q;

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        error: "Please enter a topic to search for videos."
      });
    }

    if (query.length > 200) {
      return res.status(400).json({
        error: "Please search using a shorter topic."
      });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: "YouTube search is not configured yet."
      });
    }

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "10",
      q: query.trim(),
      safeSearch: "strict",
      key: process.env.YOUTUBE_API_KEY
    });

    const youtubeResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/search?" + params.toString()
    );

    const data = await youtubeResponse.json();

    if (!youtubeResponse.ok) {
      console.error("YouTube API error:", {
        status: youtubeResponse.status,
        reason: data.error?.errors?.[0]?.reason || "Unknown API error"
      });

      return res.status(502).json({
        error: "Video search is temporarily unavailable. Please try again."
      });
    }

    const videos = (data.items || [])
      .filter(item => item.id?.videoId)
      .map(item => ({
        title: item.snippet?.title || "Untitled video",
        description: item.snippet?.description || "",
        channel: item.snippet?.channelTitle || "YouTube channel",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        videoId: item.id.videoId,
        url: "https://www.youtube.com/watch?v=" + item.id.videoId
      }));

    return res.json({
      query: query.trim(),
      total: videos.length,
      videos
    });

  } catch (error) {
    console.error("Video search error:", error.message);

    return res.status(500).json({
      error: "Could not search for videos. Please try again."
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Anushka AI server running on port " + PORT);
});
```
