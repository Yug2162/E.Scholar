// server/controllers/courseProgress.js
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const { tryIssueCertificate } = require("../utils/courseCompletion")

// ---- Anti-skip settings ----
// Watched time may grow at most this many times faster than real time
// (a little slack for network delays; playback speed is locked to 1x).
const MAX_WATCH_SPEED = 1.25
// Extra seconds allowed on top of that (buffering, first save, clock drift)
const WATCH_GRACE_SECONDS = 15

const getDuration = (subsection) => {
  const d = parseFloat(subsection?.timeDuration)
  return Number.isFinite(d) && d > 0 ? d : null
}

// A lecture counts as fully watched when the student reached the last
// few seconds of it (videos often end a moment before `duration`).
const isFullyWatched = (maxWatched, duration) => {
  if (!duration) return true // unknown length: can't check, don't block
  return maxWatched >= Math.min(duration - 3, duration * 0.95)
}

const findWatchEntry = (courseProgress, subsectionId) =>
  courseProgress.watchProgress.find(
    (w) => w.subSection.toString() === subsectionId.toString()
  )

// POST /course/updateWatchProgress  { courseId, subsectionId, currentTime }
// Saves how far the student has watched. The saved value can only grow as
// fast as the video can actually play, so jumping ahead is rejected.
exports.updateWatchProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const currentTime = Number(req.body.currentTime)
  const userId = req.user.id

  try {
    if (!courseId || !subsectionId || !Number.isFinite(currentTime)) {
      return res
        .status(400)
        .json({ success: false, message: "courseId, subsectionId and currentTime are required" })
    }

    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ success: false, message: "Invalid subsection" })
    }

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    })
    if (!courseProgress) {
      return res
        .status(404)
        .json({ success: false, message: "You are not enrolled in this course" })
    }

    const now = new Date()
    let entry = findWatchEntry(courseProgress, subsectionId)
    if (!entry) {
      courseProgress.watchProgress.push({
        subSection: subsectionId,
        maxWatched: 0,
        lastUpdate: now,
      })
      entry = courseProgress.watchProgress[courseProgress.watchProgress.length - 1]
    }

    const elapsed = Math.max(0, (now - new Date(entry.lastUpdate)) / 1000)
    let allowed = entry.maxWatched + elapsed * MAX_WATCH_SPEED + WATCH_GRACE_SECONDS
    const duration = getDuration(subsection)
    if (duration) allowed = Math.min(allowed, duration)

    const accepted = Math.max(entry.maxWatched, Math.min(Math.max(0, currentTime), allowed))
    entry.maxWatched = accepted
    entry.lastUpdate = now
    await courseProgress.save()

    return res.status(200).json({
      success: true,
      maxWatched: accepted,
      // true when the client claimed more than it could have watched
      clamped: currentTime > allowed,
    })
  } catch (error) {
    console.error("UPDATE_WATCH_PROGRESS ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// POST /course/updateCourseProgress  { courseId, subsectionId }
// Marks a lecture complete — only allowed once it has been watched to the end.
exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" })
    }

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress Does Not Exist",
      })
    }

    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({ error: "Subsection already completed" })
    }

    const entry = findWatchEntry(courseProgress, subsectionId)
    if (!isFullyWatched(entry?.maxWatched || 0, getDuration(subsection))) {
      return res.status(400).json({
        error: "Please watch the full lecture before marking it complete",
      })
    }

    courseProgress.completedVideos.push(subsectionId)
    await courseProgress.save()

    // Certificate is issued once all lectures are done (and the final exam
    // is passed, if the course has one).
    const certificateIssued = await tryIssueCertificate(userId, courseId)

    return res.status(200).json({
      message: "Course progress updated",
      certificateIssued,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Exported for tests
exports._internals = { isFullyWatched, MAX_WATCH_SPEED, WATCH_GRACE_SECONDS }
