// server/controllers/courseProgress.js
const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const Certificate = require("../models/Certificate")

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress Does Not Exist",
      })
    } else {
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({ error: "Subsection already completed" })
      }
      courseProgress.completedVideos.push(subsectionId)
    }

    await courseProgress.save()

    // ---- Certificate auto-eligibility check ----
    // Count total subsections in this course to compare against completedVideos
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    })

    let totalSubsections = 0
    if (course && course.courseContent) {
      totalSubsections = course.courseContent.reduce(
        (acc, section) => acc + (section.subSection?.length || 0),
        0
      )
    }

    let certificateIssued = false

    if (
      totalSubsections > 0 &&
      courseProgress.completedVideos.length === totalSubsections
    ) {
      // Course fully completed — issue a certificate if one doesn't exist yet
      const existingCert = await Certificate.findOne({
        userId,
        courseID: courseId,
      })

      if (!existingCert) {
        await Certificate.create({ userId, courseID: courseId })
      }
      certificateIssued = true
    }

    return res.status(200).json({
      message: "Course progress updated",
      certificateIssued,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}