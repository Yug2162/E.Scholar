const mongoose = require("mongoose")

// How far a student has really watched one lecture.
// `maxWatched` only ever grows, and the server limits how fast it can grow
// (see controllers/courseProgress.js), so skipping ahead can't be faked.
const watchProgressSchema = new mongoose.Schema(
  {
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      required: true,
    },
    maxWatched: { type: Number, default: 0 }, // seconds
    lastUpdate: { type: Date, default: Date.now },
  },
  { _id: false }
)

const courseProgress = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  watchProgress: [watchProgressSchema],
})

module.exports = mongoose.model("courseProgress", courseProgress)
