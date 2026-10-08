// server/models/Certificate.js
const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      default: () => `ESCHOLAR-${uuidv4().split("-")[0].toUpperCase()}`,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// One certificate per student per course — prevents duplicates
certificateSchema.index({ userId: 1, courseID: 1 }, { unique: true })

module.exports = mongoose.model("Certificate", certificateSchema)