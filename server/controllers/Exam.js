// server/controllers/Exam.js
// Final exam of a course: instructors build it, students take it once all
// lectures are complete. Grading and timing are done on the server only.
const mongoose = require("mongoose")
const Course = require("../models/Course")
const Exam = require("../models/Exam")
const ExamAttempt = require("../models/ExamAttempt")
const {
  allLecturesCompleted,
  tryIssueCertificate,
} = require("../utils/courseCompletion")

// Seconds accepted after the timer runs out (network delay on auto-submit)
const SUBMIT_GRACE_SECONDS = 30
const MAX_QUESTIONS = 100

const isId = (id) => mongoose.Types.ObjectId.isValid(id)

const totalMarksOf = (exam) =>
  exam.questions.reduce((acc, q) => acc + (q.marks || 1), 0)

// What a student may see of the exam before submitting (no answers!)
const publicQuestions = (exam) =>
  exam.questions.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    marks: q.marks,
  }))

const attemptSummary = (a) => ({
  _id: a._id,
  score: a.score,
  totalMarks: a.totalMarks,
  percentage: a.percentage,
  passed: a.passed,
  late: a.late,
  startedAt: a.startedAt,
  submittedAt: a.submittedAt,
})

// Close attempts whose time ran out without a submission (browser closed etc.)
async function closeExpiredAttempts(examId, userId, totalMarks) {
  const cutoff = new Date(Date.now() - SUBMIT_GRACE_SECONDS * 1000)
  await ExamAttempt.updateMany(
    { exam: examId, user: userId, submittedAt: null, expiresAt: { $lt: cutoff } },
    {
      $set: {
        submittedAt: new Date(),
        score: 0,
        totalMarks,
        percentage: 0,
        passed: false,
        late: true,
      },
    }
  )
}

async function loadOwnedCourse(courseId, userId) {
  if (!isId(courseId)) return null
  const course = await Course.findById(courseId)
  if (!course || course.instructor?.toString() !== userId.toString()) return null
  return course
}

const isEnrolled = (course, userId) =>
  (course.studentsEnroled || []).some((id) => id.toString() === userId.toString())

// Validate and clean the instructor's exam form. Returns { data } or { error }.
function parseExamInput(body) {
  const title = String(body.title || "").trim()
  const description = String(body.description || "").trim()
  const durationMinutes = Number(body.durationMinutes)
  const passPercentage = Number(body.passPercentage)
  const maxAttempts = Number(body.maxAttempts || 0)
  const questions = Array.isArray(body.questions) ? body.questions : null

  if (!title) return { error: "Exam title is required" }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 300)
    return { error: "Duration must be between 1 and 300 minutes" }
  if (!Number.isFinite(passPercentage) || passPercentage < 1 || passPercentage > 100)
    return { error: "Pass percentage must be between 1 and 100" }
  if (!Number.isInteger(maxAttempts) || maxAttempts < 0 || maxAttempts > 50)
    return { error: "Max attempts must be between 0 (unlimited) and 50" }
  if (!questions || questions.length === 0)
    return { error: "Add at least one question" }
  if (questions.length > MAX_QUESTIONS)
    return { error: `An exam can have at most ${MAX_QUESTIONS} questions` }

  const cleaned = []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] || {}
    const text = String(q.question || "").trim()
    const options = Array.isArray(q.options)
      ? q.options.map((o) => String(o ?? "").trim())
      : []
    const correctOption = Number(q.correctOption)
    const marks = q.marks === undefined || q.marks === "" ? 1 : Number(q.marks)
    const n = i + 1

    if (!text) return { error: `Question ${n}: text is required` }
    if (options.length < 2 || options.length > 6)
      return { error: `Question ${n}: needs between 2 and 6 options` }
    if (options.some((o) => !o)) return { error: `Question ${n}: options can't be empty` }
    if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length)
      return { error: `Question ${n}: choose the correct option` }
    if (!Number.isInteger(marks) || marks < 1 || marks > 100)
      return { error: `Question ${n}: marks must be between 1 and 100` }

    cleaned.push({ question: text, options, correctOption, marks })
  }

  return {
    data: { title, description, durationMinutes, passPercentage, maxAttempts, questions: cleaned },
  }
}

// ======================= Instructor =======================

// GET /exam/instructor/:courseId — full exam including answers
exports.getExamForInstructor = async (req, res) => {
  try {
    const course = await loadOwnedCourse(req.params.courseId, req.user.id)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }
    const exam = await Exam.findOne({ course: course._id })
    return res.status(200).json({
      success: true,
      data: { courseName: course.courseName, exam: exam || null },
    })
  } catch (error) {
    console.error("GET_EXAM_INSTRUCTOR ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /exam/save — create or replace the exam of a course
exports.saveExam = async (req, res) => {
  try {
    const course = await loadOwnedCourse(req.body.courseId, req.user.id)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    const { data, error } = parseExamInput(req.body)
    if (error) return res.status(400).json({ success: false, message: error })

    const exam = await Exam.findOneAndUpdate(
      { course: course._id },
      { ...data, course: course._id, createdBy: req.user.id },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, message: "Exam saved", data: exam })
  } catch (error) {
    console.error("SAVE_EXAM ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /exam/:courseId — remove the exam and its attempts
exports.deleteExam = async (req, res) => {
  try {
    const course = await loadOwnedCourse(req.params.courseId, req.user.id)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }
    const exam = await Exam.findOneAndDelete({ course: course._id })
    if (exam) await ExamAttempt.deleteMany({ exam: exam._id })
    return res.status(200).json({ success: true, message: "Exam deleted" })
  } catch (error) {
    console.error("DELETE_EXAM ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ======================= Student =======================

// GET /exam/status/:courseId — exam info, past attempts, whether it can be started
exports.getExamStatus = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    if (!isId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" })
    }

    const course = await Course.findById(courseId)
    if (!course || !isEnrolled(course, userId)) {
      return res
        .status(403)
        .json({ success: false, message: "You are not enrolled in this course" })
    }

    const exam = await Exam.findOne({ course: courseId })
    if (!exam || !exam.questions.length) {
      return res.status(200).json({ success: true, data: { hasExam: false } })
    }

    const totalMarks = totalMarksOf(exam)
    await closeExpiredAttempts(exam._id, userId, totalMarks)

    const [attempts, lecturesCompleted] = await Promise.all([
      ExamAttempt.find({ exam: exam._id, user: userId }).sort({ startedAt: -1 }),
      allLecturesCompleted(userId, courseId),
    ])

    const finished = attempts.filter((a) => a.submittedAt)
    const active = attempts.find((a) => !a.submittedAt)
    const passed = finished.some((a) => a.passed)
    const attemptsLeft =
      exam.maxAttempts > 0 ? Math.max(0, exam.maxAttempts - finished.length) : null

    return res.status(200).json({
      success: true,
      data: {
        hasExam: true,
        exam: {
          title: exam.title,
          description: exam.description,
          durationMinutes: exam.durationMinutes,
          passPercentage: exam.passPercentage,
          maxAttempts: exam.maxAttempts,
          questionCount: exam.questions.length,
          totalMarks,
        },
        lecturesCompleted,
        passed,
        attempts: finished.map(attemptSummary),
        attemptsLeft,
        activeAttempt: active
          ? { _id: active._id, expiresAt: active.expiresAt }
          : null,
        canStart:
          lecturesCompleted && !passed && (attemptsLeft === null || attemptsLeft > 0),
      },
    })
  } catch (error) {
    console.error("GET_EXAM_STATUS ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /exam/start { courseId } — begin (or resume) an attempt
exports.startExam = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    if (!isId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course id" })
    }

    const course = await Course.findById(courseId)
    if (!course || !isEnrolled(course, userId)) {
      return res
        .status(403)
        .json({ success: false, message: "You are not enrolled in this course" })
    }

    const exam = await Exam.findOne({ course: courseId })
    if (!exam || !exam.questions.length) {
      return res.status(404).json({ success: false, message: "This course has no exam" })
    }

    if (!(await allLecturesCompleted(userId, courseId))) {
      return res.status(403).json({
        success: false,
        message: "Complete all lectures before taking the exam",
      })
    }

    const totalMarks = totalMarksOf(exam)
    await closeExpiredAttempts(exam._id, userId, totalMarks)

    // Resume an attempt that is still running (e.g. after a page refresh)
    const active = await ExamAttempt.findOne({
      exam: exam._id,
      user: userId,
      submittedAt: null,
    })
    if (active) {
      return res.status(200).json({
        success: true,
        data: {
          attemptId: active._id,
          expiresAt: active.expiresAt,
          serverTime: new Date(),
          title: exam.title,
          questions: publicQuestions(exam),
        },
      })
    }

    const finished = await ExamAttempt.find({
      exam: exam._id,
      user: userId,
      submittedAt: { $ne: null },
    })
    if (finished.some((a) => a.passed)) {
      return res.status(400).json({ success: false, message: "You have already passed this exam" })
    }
    if (exam.maxAttempts > 0 && finished.length >= exam.maxAttempts) {
      return res.status(403).json({ success: false, message: "No attempts left for this exam" })
    }

    const now = new Date()
    const attempt = await ExamAttempt.create({
      exam: exam._id,
      course: courseId,
      user: userId,
      startedAt: now,
      expiresAt: new Date(now.getTime() + exam.durationMinutes * 60 * 1000),
      totalMarks,
    })

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        expiresAt: attempt.expiresAt,
        serverTime: now,
        title: exam.title,
        questions: publicQuestions(exam),
      },
    })
  } catch (error) {
    console.error("START_EXAM ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /exam/submit { attemptId, answers: [optionIndex | -1, ...] }
exports.submitExam = async (req, res) => {
  try {
    const { attemptId } = req.body
    const userId = req.user.id
    if (!isId(attemptId)) {
      return res.status(400).json({ success: false, message: "Invalid attempt id" })
    }

    const attempt = await ExamAttempt.findOne({ _id: attemptId, user: userId })
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" })
    }
    if (attempt.submittedAt) {
      return res.status(400).json({ success: false, message: "This attempt was already submitted" })
    }

    const exam = await Exam.findById(attempt.exam)
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam no longer exists" })
    }

    const raw = Array.isArray(req.body.answers) ? req.body.answers : []
    const answers = exam.questions.map((q, i) => {
      const a = Number(raw[i])
      return Number.isInteger(a) && a >= 0 && a < q.options.length ? a : -1
    })

    let score = 0
    const review = exam.questions.map((q, i) => {
      const correct = answers[i] === q.correctOption
      if (correct) score += q.marks || 1
      return { questionId: q._id, yourAnswer: answers[i], correct }
    })

    const now = new Date()
    const late = now.getTime() > attempt.expiresAt.getTime() + SUBMIT_GRACE_SECONDS * 1000
    const totalMarks = totalMarksOf(exam)
    const percentage = totalMarks ? Math.round((score / totalMarks) * 10000) / 100 : 0
    const passed = !late && percentage >= exam.passPercentage

    // Atomic "submit once" — guards against double submits
    const saved = await ExamAttempt.findOneAndUpdate(
      { _id: attempt._id, submittedAt: null },
      {
        $set: { answers, score, totalMarks, percentage, passed, late, submittedAt: now },
      },
      { returnDocument: "after" }
    )
    if (!saved) {
      return res.status(400).json({ success: false, message: "This attempt was already submitted" })
    }

    const certificateIssued = passed
      ? await tryIssueCertificate(userId, attempt.course)
      : false

    return res.status(200).json({
      success: true,
      data: {
        ...attemptSummary(saved),
        passPercentage: exam.passPercentage,
        certificateIssued,
        // Correct answers are only revealed after passing, so they can't be
        // collected from a failed attempt and reused on the next one.
        review: review.map((r, i) =>
          passed ? { ...r, correctOption: exam.questions[i].correctOption } : r
        ),
      },
    })
  } catch (error) {
    console.error("SUBMIT_EXAM ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports._internals = { parseExamInput, SUBMIT_GRACE_SECONDS }
