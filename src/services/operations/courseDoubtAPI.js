import { apiConnector } from "../apiConnector"
import { courseDoubtEndpoints } from "../apis"

const { COURSE_DOUBT_API } = courseDoubtEndpoints

export async function askCourseDoubt(question, courseId) {
  try {
    const response = await apiConnector("POST", COURSE_DOUBT_API, {
      question,
      courseId,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.answer
  } catch (error) {
    console.log("ASK_COURSE_DOUBT API ERROR............", error)
    return "Sorry, I couldn't get an answer right now. Please try again in a moment."
  }
}