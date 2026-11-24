const mongoose = require("mongoose")

// One sitting of a final exam by a student
const examAttemptSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date },
    // chosen option index per question, -1 = not answered
    answers: [{ type: Number }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    // submitted after the time limit (plus grace) — counted as failed
    late: { type: Boolean, default: false },
  },
  { timestamps: true }
)

examAttemptSchema.index({ exam: 1, user: 1 })

module.exports = mongoose.model("ExamAttempt", examAttemptSchema)
