// Local demo of E.Scholar on a throwaway in-memory MongoDB with sample data.
// Nothing touches your real database, and all data is gone when you stop it.
//
//   cd server
//   node scripts/demoLocal.js
//
// Then run the frontend (`npm start` in the project root) with
// REACT_APP_BASE_URL=http://localhost:4000/api/v1 in the root .env
//
// Demo accounts (password Demo@123):
//   teacher@demo.local  Instructor, owns "Demo Course"
//   student@demo.local  Student, enrolled in "Demo Course"
const path = require("path")
const SERVER = path.join(__dirname, "..")

process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(SERVER, "node_modules/.cache/mongodb-memory-server")

;(async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server")
  const mongo = await MongoMemoryServer.create()

  // Safe local settings, applied before the app loads
  Object.assign(process.env, {
    MONGODB_URL: mongo.getUri("escholar-demo"),
    NODE_ENV: "development",
    PORT: "4000",
    JWT_SECRET: "demo-secret",
    FRONTEND_URL: "http://localhost:3000",
    CLOUD_NAME: "demo",
    API_KEY: "x",
    API_SECRET: "x",
  })

  const mongoose = require("mongoose")
  const bcrypt = require("bcryptjs")
  require(path.join(SERVER, "index.js")) // connects and listens on 4000
  await new Promise((ok) => mongoose.connection.once("open", ok))

  const m = (n) => require(path.join(SERVER, "models", n))
  const User = m("User")
  const Profile = m("Profile")
  const Category = m("Category")
  const Course = m("Course")
  const Section = m("Section")
  const SubSection = m("Subsection")
  const CourseProgress = m("CourseProgress")

  const password = await bcrypt.hash("Demo@123", 10)
  const mkUser = async (firstName, email, accountType) =>
    User.create({
      firstName,
      lastName: "Demo",
      email,
      password,
      accountType,
      approved: true,
      active: true,
      additionalDetails: (await Profile.create({}))._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}`,
    })

  const teacher = await mkUser("Teacher", "teacher@demo.local", "Instructor")
  const student = await mkUser("Student", "student@demo.local", "Student")
  const cat = await Category.create({ name: "Web Development", description: "demo" })

  // Public Cloudinary demo videos (durations match the real files)
  const lectures = await SubSection.create([
    {
      title: "Lecture 1: Elephants",
      description: "52 second demo video",
      timeDuration: "52.519186",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    },
    {
      title: "Lecture 2: Dog",
      description: "13 second demo video",
      timeDuration: "13.4134",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    },
  ])
  const section = await Section.create({
    sectionName: "Getting Started",
    subSection: lectures.map((l) => l._id),
  })
  const course = await Course.create({
    courseName: "Demo Course",
    courseDescription: "Course used to test the exam and no-skip features",
    instructor: teacher._id,
    whatYouWillLearn: "Testing",
    courseContent: [section._id],
    price: 0,
    thumbnail: "https://res.cloudinary.com/demo/image/upload/w_640,h_360,c_fill/sample.jpg",
    tag: ["demo"],
    category: cat._id,
    studentsEnroled: [student._id],
    instructions: ["none"],
    status: "Published",
  })
  cat.courses = [course._id]
  await cat.save()
  const progress = await CourseProgress.create({
    courseID: course._id,
    userId: student._id,
    completedVideos: [],
  })
  await User.updateOne({ _id: teacher._id }, { $push: { courses: course._id } })
  await User.updateOne(
    { _id: student._id },
    { $push: { courses: course._id, courseProgress: progress._id } }
  )

  console.log("\n=== DEMO READY ===")
  console.log("Frontend: http://localhost:3000")
  console.log("Instructor: teacher@demo.local / Demo@123")
  console.log("Student:    student@demo.local / Demo@123")
  console.log("Press Ctrl+C to stop (all demo data is deleted)\n")
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
