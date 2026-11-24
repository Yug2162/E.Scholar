// server/routes/Exam.js
const express = require("express")
const router = express.Router()

const { auth, isInstructor, isStudent } = require("../middleware/auth")
const {
  getExamForInstructor,
  saveExam,
  deleteExam,
  getExamStatus,
  startExam,
  submitExam,
} = require("../controllers/Exam")

// Instructor — build and manage the final exam of their own course
router.get("/instructor/:courseId", auth, isInstructor, getExamForInstructor)
router.post("/save", auth, isInstructor, saveExam)
router.delete("/:courseId", auth, isInstructor, deleteExam)

// Student — take the exam
router.get("/status/:courseId", auth, isStudent, getExamStatus)
router.post("/start", auth, isStudent, startExam)
router.post("/submit", auth, isStudent, submitExam)

module.exports = router
