// Shared rules for "has this student finished the course?"
// Used by lecture progress and by the final exam.
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")
const Certificate = require("../models/Certificate")
const Exam = require("../models/Exam")
const ExamAttempt = require("../models/ExamAttempt")

// Total number of lectures (sub-sections) in a course
async function countLectures(courseId) {
  const course = await Course.findById(courseId).populate("courseContent")
  if (!course || !course.courseContent) return 0
  return course.courseContent.reduce(
    (acc, section) => acc + (section.subSection?.length || 0),
    0
  )
}

// true when every lecture of the course is marked complete
async function allLecturesCompleted(userId, courseId) {
  const [total, progress] = await Promise.all([
    countLectures(courseId),
    CourseProgress.findOne({ courseID: courseId, userId }),
  ])
  if (!total || !progress) return false
  return progress.completedVideos.length >= total
}

// true when the course has no exam, or the student has passed it
async function examRequirementMet(userId, courseId) {
  const exam = await Exam.findOne({ course: courseId })
  if (!exam || !exam.questions.length) return true
  const passed = await ExamAttempt.exists({
    exam: exam._id,
    user: userId,
    passed: true,
  })
  return !!passed
}

// Issue the certificate if the student has met every requirement.
// Returns true when the student holds a certificate after the call.
async function tryIssueCertificate(userId, courseId) {
  if (!(await allLecturesCompleted(userId, courseId))) return false
  if (!(await examRequirementMet(userId, courseId))) return false

  const existing = await Certificate.findOne({ userId, courseID: courseId })
  if (!existing) {
    try {
      await Certificate.create({ userId, courseID: courseId })
    } catch (err) {
      // Duplicate key = issued by a parallel request; that's fine
      if (err.code !== 11000) throw err
    }
  }
  return true
}

module.exports = {
  countLectures,
  allLecturesCompleted,
  examRequirementMet,
  tryIssueCertificate,
}
