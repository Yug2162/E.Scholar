// server/scripts/debugProgress.js
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")

async function run() {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI
  await mongoose.connect(mongoUrl)
  console.log("Connected to MongoDB")

  const userId = "6a2fd2cfab0cd0b61f574958"
  const courseId = "6a315132ca1cdd14a867cd18"

  const progress = await CourseProgress.findOne({ userId, courseID: courseId })
  const course = await Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  })

  const totalSubsections = course.courseContent.reduce(
    (acc, section) => acc + (section.subSection?.length || 0), 0
  )

  console.log("completedVideos:", progress?.completedVideos)
  console.log("completedVideos.length:", progress?.completedVideos.length)
  console.log("totalSubsections (live):", totalSubsections)

  course.courseContent.forEach((section, i) => {
    console.log(`Section ${i} (${section._id}):`, section.subSection.map(s => s._id.toString()))
  })

  await mongoose.disconnect()
}

run()