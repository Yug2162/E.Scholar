const mongoose = require("mongoose")

// One multiple-choice question
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: {
    type: [{ type: String, trim: true }],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 6,
      message: "Each question needs between 2 and 6 options",
    },
  },
  // index into `options` — never sent to students before they submit
  correctOption: { type: Number, required: true, min: 0 },
  marks: { type: Number, default: 1, min: 1 },
})

// The final exam of a course (one exam per course)
const examSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 300 },
    passPercentage: { type: Number, required: true, min: 1, max: 100 },
    // 0 = unlimited attempts
    maxAttempts: { type: Number, default: 0, min: 0 },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Exam", examSchema)
