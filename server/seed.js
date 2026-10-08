/**
 * One-off seed script for the StudyNotion-style backend.
 *
 * WHERE TO PUT THIS FILE:
 *   Place it in your `server` folder, next to your `models` and `config`
 *   folders (same level as index.js).
 *
 * HOW TO RUN:
 *   cd server
 *   node seed.js
 */

require("dotenv").config()
const mongoose = require("mongoose")

let bcrypt
try {
  bcrypt = require("bcrypt")
} catch (e) {
  bcrypt = require("bcryptjs")
}

const Category = require("./models/Category")
const User = require("./models/User")
const Course = require("./models/Course")

let Profile
try {
  Profile = require("./models/Profile")
} catch (e) {
  const profileSchema = new mongoose.Schema({
    gender: { type: String },
    dateOfBirth: { type: String },
    about: { type: String },
    contactNumber: { type: Number },
  })
  Profile = mongoose.model("Profile", profileSchema)
}

const CATEGORIES = [
  {
    name: "Web Development",
    description: "Frontend and backend web development courses covering HTML, CSS, JavaScript, React, Node.js and more.",
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
  },
  {
    name: "Data Science",
    description: "Data analysis, machine learning, and statistics courses using Python, Pandas, NumPy and more.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    name: "Mobile Development",
    description: "iOS, Android, and cross-platform app development using Kotlin, Swift, and Flutter.",
    thumbnail: "https://images.unsplash.com/photo-1512941937938-a273f596c7e5?w=600&q=80",
  },
  {
    name: "Cloud Computing",
    description: "AWS, Azure, GCP, and DevOps courses for modern cloud infrastructure.",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
  },
]

const INSTRUCTOR = {
  firstName: "Demo",
  lastName: "Instructor",
  email: "demo.instructor@example.com",
  password: "Password123!",
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URL)
  console.log("Connected to DB.")

  // 1. Create categories
  const categoryDocs = []
  for (const cat of CATEGORIES) {
    let existing = await Category.findOne({ name: cat.name })
    if (!existing) {
      existing = await Category.create({
        name: cat.name,
        description: cat.description,
      })
      console.log(`Created category: ${cat.name}`)
    } else {
      console.log(`Category already exists: ${cat.name}`)
    }
    // attach thumbnail temporarily for course creation below
    existing.thumbnail = cat.thumbnail
    categoryDocs.push(existing)
  }

  // 2. Create demo instructor
  let instructor = await User.findOne({ email: INSTRUCTOR.email })
  if (!instructor) {
    const profile = await Profile.create({})
    const hashedPassword = await bcrypt.hash(INSTRUCTOR.password, 10)
    instructor = await User.create({
      firstName: INSTRUCTOR.firstName,
      lastName: INSTRUCTOR.lastName,
      email: INSTRUCTOR.email,
      password: hashedPassword,
      accountType: "Instructor",
      additionalDetails: profile._id,
    })
    console.log(`Created instructor: ${INSTRUCTOR.email} / ${INSTRUCTOR.password}`)
  } else {
    console.log(`Instructor already exists: ${INSTRUCTOR.email}`)
  }

  // 3. Create one published course per category
  for (const cat of categoryDocs) {
    const existingCourse = await Course.findOne({ category: cat._id })
    if (existingCourse) {
      console.log(`Course already exists for category: ${cat.name}`)
      continue
    }

    const course = await Course.create({
      courseName: `Intro to ${cat.name}`,
      courseDescription: `A beginner-friendly introduction to ${cat.name}.`,
      instructor: instructor._id,
      whatYouWillLearn: `The fundamentals of ${cat.name}.`,
      price: 499,
      thumbnail: cat.thumbnail,
      tag: [cat.name],
      category: cat._id,
      instructions: ["Have a laptop ready", "Basic computer literacy"],
      status: "Published",
    })

    // sync both sides of the relation
    await Category.findByIdAndUpdate(cat._id, {
      $push: { courses: course._id },
    })

    await User.findByIdAndUpdate(instructor._id, {
      $push: { courses: course._id },
    })

    console.log(`Created course: ${course.courseName}`)
  }

  console.log("\nDone seeding ✅  Refresh your Catalog page.")
  await mongoose.connection.close()
  process.exit(0)
}

main().catch((err) => {
  console.error("Seed script failed:", err)
  process.exit(1)
})