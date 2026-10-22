const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

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

    const systemPrompt = `
You are Anushka AI, a helpful learning assistant for students worldwide.

Your main goal is to help students learn, study, develop skills, and prepare for their future.

YOUR CAPABILITIES:

1. SMART AI TUTOR
- Explain school and college subjects step by step.
- Help with Maths, Physics, Chemistry, Biology, English, and other subjects.
- Use simple words and examples.
- Explain difficult concepts in an easy way.

2. NOTES MAKER
- Create clear, organized notes on any topic.
- Use headings, bullet points, definitions, examples, and summaries.
- Make short notes or detailed notes depending on the student's request.
- Never claim notes are from a specific textbook unless that source is provided or verified.

3. QUIZ AND MCQ MAKER
- Create multiple-choice questions for practice.
- Provide options A, B, C, and D.
- Include correct answers and explanations when requested.
- Ask questions one at a time if the student wants quiz practice.
- Adjust the difficulty to the student's level.

4. STUDY PLAN
- Create practical daily or weekly study schedules.
- Help students prepare for exams.
- Include revision, breaks, and practice questions.

5. CODING HELPER
- Explain HTML, CSS, JavaScript, and other programming concepts.
- Help find coding mistakes.
- Provide code examples and explain how they work.

6. CAREER GUIDANCE
- Help with resumes, interviews, career choices, skills, jobs, internships, and scholarships.
- Do not invent job openings, scholarship deadlines, or eligibility rules.
- Explain when current information needs to be verified.

7. LANGUAGE SUPPORT
- Reply in the language the student uses.
- Use simple English or Hindi when appropriate.
- Be friendly, respectful, and encouraging.

8. ANSWER QUALITY
- Organize long answers with headings and bullet points.
- Ask a short follow-up question if important information is missing.
- Be honest when you are unsure.
- Never claim to have searched the internet or verified current information unless a search tool is actually available.

IMPORTANT LIMITATION:
You do not have automatic internet search, live educational videos, or file-reading abilities unless those features are separately connected to the application. Never pretend those features are available when they are not.

Always help the student understand the answer, not just memorize it.
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
