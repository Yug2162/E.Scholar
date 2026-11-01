import { apiConnector } from "../apiConnector"
import { courseDoubtEndpoints } from "../apis"

const { COURSE_DOUBT_API } = courseDoubtEndpoints

export async function askCourseDoubt(question, courseId, context = {}) {
  try {
    const payload = {
      question,
      courseId,
      courseName: context.courseName,
      videoTitle: context.videoTitle,
      videoDescription: context.videoDescription,
      history: context.history || [],
    }

    const response = await apiConnector("POST", COURSE_DOUBT_API, payload)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to get answer")
    }

    return {
      success: true,
      answer: response.data.answer,
      netraUrl:
        response.data.netraUrl || "https://netra-agentic-ai.streamlit.app/",
      provider: response.data.provider,
    }
  } catch (error) {
    console.log("ASK_COURSE_DOUBT API ERROR............", error)
    return {
      success: false,
      answer:
        "Sorry, I couldn't get an answer right now. You can also explore answers directly on Netra Agentic AI.",
      netraUrl: "https://netra-agentic-ai.streamlit.app/",
    }
  }
}