const axios = require("axios")

exports.askCourseDoubt = async (req, res) => {
  try {
    const {
      question,
      courseId,
      courseName,
      videoTitle,
      videoDescription,
      history = [],
    } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      })
    }

    const netraUrl =
      process.env.NETRA_AI_URL || "https://netra-agentic-ai.streamlit.app/"
    let answer = null
    let providerUsed = "groq"

    // 1. Try custom Netra AI API if configured and reachable (skip Streamlit UI URLs)
    const isStreamlitApp =
      typeof netraUrl === "string" &&
      (netraUrl.includes("streamlit.app") || netraUrl.includes("share.streamlit.io"))

    if (!isStreamlitApp && process.env.NETRA_AI_URL) {
      try {
        const response = await axios.post(
          `${process.env.NETRA_AI_URL.replace(/\/+$/, "")}/api/v1/course-doubt`,
          {
            question,
            session_id: courseId || "video-tutorial",
            courseName,
            videoTitle,
            videoDescription,
          },
          { timeout: 3500 }
        )
        if (response.data && response.data.answer) {
          answer = response.data.answer
          providerUsed = "netra-agentic-api"
        }
      } catch (err) {
        console.log("NETRA_AI_URL API fallback triggered:", err.message)
      }
    }

    // 2. Fallback to Groq AI with Netra AI Tutor Persona
    if (!answer && process.env.GROQ_API_KEY) {
      const groqModels = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
      ]

      const systemPrompt = `You are Netra AI, an intelligent, empathetic, and expert AI tutor for the E.Scholar educational learning platform.
Students ask you questions to clear their doubts while watching video tutorials.

Tutorial Context:
${courseName ? `- Course: "${courseName}"` : "- Educational Course"}
${videoTitle ? `- Current Lecture: "${videoTitle}"` : ""}
${videoDescription ? `- Lecture Summary: "${videoDescription}"` : ""}

Guidelines:
1. Explain concepts clearly, patiently, and in an engaging pedagogical style.
2. Structure your answer using clean Markdown with headings, bullet points, and numbered steps.
3. If the topic involves programming or technical concepts, provide concise, correct, and well-commented code snippets.
4. Keep the explanation direct and focused on the student's doubt.
5. Emphasize key takeaways and practical tips to master the topic.
6. Provide an encouraging closing tip or follow-up suggestion.
7. Mention that for deep agentic reasoning or complex research, students can also launch Netra Agentic AI at ${netraUrl} .`

      // Format previous history if provided (up to last 6 messages)
      const formattedHistory = Array.isArray(history)
        ? history.slice(-6).map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: String(msg.content || ""),
          }))
        : []

      const messages = [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: question },
      ]

      for (const model of groqModels) {
        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model,
                messages,
                max_tokens: 750,
                temperature: 0.7,
              }),
            }
          )

          const data = await response.json()
          if (response.ok && data?.choices?.[0]?.message?.content) {
            answer = data.choices[0].message.content.trim()
            providerUsed = `groq (${model})`
            break
          }
        } catch (err) {
          console.log(`Groq model ${model} failed:`, err.message)
        }
      }
    }

    // 3. Graceful fallback if AI is momentarily unreachable
    if (!answer) {
      answer = `Thank you for asking! I'm temporarily unable to process the question right now.

You can directly consult **Netra Agentic AI** to clear this doubt in depth:
👉 **[Open Netra Agentic AI](${netraUrl})**

Please feel free to re-ask in a moment!`
    }

    return res.status(200).json({
      success: true,
      answer,
      netraUrl,
      provider: providerUsed,
    })
  } catch (error) {
    console.log("COURSE_DOUBT ERROR:", error.message)
    const netraUrl =
      process.env.NETRA_AI_URL || "https://netra-agentic-ai.streamlit.app/"
    return res.status(500).json({
      success: false,
      message: "Could not get an answer right now. Please try again.",
      netraUrl,
    })
  }
}