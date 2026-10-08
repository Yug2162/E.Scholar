// server/scripts/backfillCertificates.js
//
// One-time backfill: finds every CourseProgress where the user has
// completed all subsections, but no Certificate document exists yet
// (e.g. because completion happened before the certificate-issuing
// logic existed, or during a broken deploy), and creates the missing
// Certificate records.
//
// Usage (from the server/ directory):
//   node scripts/backfillCertificates.js
//
// Safe to re-run — the unique (userId, courseID) index on Certificate
// prevents duplicates, and this script also checks before inserting.

const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const Certificate = require("../models/Certificate")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")

async function run() {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI
  if (!mongoUrl) {
    console.error("❌ No MONGODB_URL / MONGODB_URI found in environment. Aborting.")
    process.exit(1)
  }

  await mongoose.connect(mongoUrl)
  console.log("✅ Connected to MongoDB")

  const allProgress = await CourseProgress.find({})
  console.log(`Found ${allProgress.length} CourseProgress documents to check`)

  let created = 0
  let skippedIncomplete = 0
  let skippedAlreadyIssued = 0
  let skippedNoCourse = 0
  let errors = 0

  for (const progress of allProgress) {
    try {
      const course = await Course.findById(progress.courseID).populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })

      if (!course || !course.courseContent) {
        skippedNoCourse++
        continue
      }

      const totalSubsections = course.courseContent.reduce(
        (acc, section) => acc + (section.subSection?.length || 0),
        0
      )

      const isComplete =
        totalSubsections > 0 &&
        progress.completedVideos.length === totalSubsections

      if (!isComplete) {
        skippedIncomplete++
        continue
      }

      const existingCert = await Certificate.findOne({
        userId: progress.userId,
        courseID: progress.courseID,
      })

      if (existingCert) {
        skippedAlreadyIssued++
        continue
      }

      await Certificate.create({
        userId: progress.userId,
        courseID: progress.courseID,
      })
      created++
      console.log(
        `  ✔ Issued certificate for userId=${progress.userId} courseID=${progress.courseID}`
      )
    } catch (err) {
      // Duplicate-key errors can happen in rare race conditions; treat as already-issued
      if (err.code === 11000) {
        skippedAlreadyIssued++
      } else {
        errors++
        console.error(
          `  ✘ Error processing userId=${progress.userId} courseID=${progress.courseID}:`,
          err.message
        )
      }
    }
  }

  console.log("\n--- Backfill summary ---")
  console.log(`Certificates created:        ${created}`)
  console.log(`Already had a certificate:   ${skippedAlreadyIssued}`)
  console.log(`Not yet complete:            ${skippedIncomplete}`)
  console.log(`Missing/invalid course data: ${skippedNoCourse}`)
  console.log(`Errors:                      ${errors}`)

  await mongoose.disconnect()
  console.log("\n✅ Done. Disconnected from MongoDB.")
}

run().catch((err) => {
  console.error("Fatal error running backfill:", err)
  process.exit(1)
})