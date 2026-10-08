const axios = require("axios")

exports.askCourseDoubt = async (req, res) => {
  try {
    const { question, courseId } = req.body
    if (!question || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Question and courseId are required",
      })
    }

    const response = await axios.post(`${process.env.NETRA_AI_URL}/api/v1/course-doubt`, {
      question,
      session_id: courseId,
    })

    return res.status(200).json({
      success: true,
      answer: response.data.answer,
    })
  } catch (error) {
    console.log("COURSE_DOUBT ERROR:", error.message)
    return res.status(500).json({
      success: false,
      message: "Could not get an answer right now. Please try again.",
    })
  }
}