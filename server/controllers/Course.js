const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const axios = require("axios")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body

    // Safe parse — handle missing/undefined gracefully
    const tag = _tag ? JSON.parse(_tag) : []
    const instructions = _instructions ? JSON.parse(_instructions) : []

    // Get thumbnail from files if present
    const thumbnailImage = req.files?.thumbnailImage || null

    // Check required fields
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }

    if (!status || status === undefined) {
      status = "Draft"
    }

    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId)
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    // Handle category — optional in tests
    let categoryId = null
    if (category) {
      const categoryDetails = await Category.findById(category)
      if (!categoryDetails) {
        return res.status(404).json({
          success: false,
          message: "Category Details Not Found",
        })
      }
      categoryId = categoryDetails._id

      // Add course to category later after creation
    }

    // Upload thumbnail if provided, else use placeholder
    let thumbnailUrl = "https://placeholder.com/default-thumbnail.jpg"
    if (thumbnailImage) {
      const uploaded = await uploadImageToCloudinary(
        thumbnailImage,
        process.env.FOLDER_NAME
      )
      thumbnailUrl = uploaded.secure_url
    }

    // Create the course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryId,
      thumbnail: thumbnailUrl,
      status,
      instructions,
    })

    // Index course content for AI doubt-solving (non-blocking — failure here should not break course creation)
    try {
      const contentToIndex = `${courseName}\n\n${courseDescription}\n\n${whatYouWillLearn}`
      await axios.post(`${process.env.NETRA_AI_URL}/api/v1/index-course`, {
        course_id: newCourse._id.toString(),
        content: contentToIndex,
      })
    } catch (indexError) {
      console.log("Course indexing failed (non-blocking):", indexError.message)
    }

    // Add course to instructor's profile
    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    )

    // Add course to category if provided
    if (categoryId) {
      const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        { $push: { courses: newCourse._id } },
        { new: true }
      )
      console.log(":-> ", categoryDetails2)
    }

    return res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })  
  }
}
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url    
    }

    // Update only the fields that are present in the request body
for (const key in updates) {
  if (Object.prototype.hasOwnProperty.call(updates, key)) {
    if (key === "tag" || key === "instructions") {
      course[key] = JSON.parse(updates[key])
    } else {
      course[key] = updates[key]
    }
  }
}
    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}


exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

  

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

 

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
exports.generateCourseDescription = async (req, res) => {
  try {
    const { courseTitle, topics } = req.body

    if (!courseTitle || !topics) {
      return res.status(400).json({
        success: false,
        message: "courseTitle and topics are required",
      })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are an expert EdTech copywriter. Write professional, engaging course descriptions in 3-4 sentences. Be concise, highlight outcomes, and sound human — not robotic.",
          },
          {
            role: "user",
            content: `Write a course description for a course titled "${courseTitle}". Topics covered: ${topics}. Do not include any heading, prefix, or label — just the description paragraph.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API error")
    }

    const description = data.choices[0].message.content.trim()

    return res.status(200).json({ success: true, description })
  } catch (error) {
    console.error("Groq error:", error.message)
    return res.status(500).json({ success: false, message: "Failed to generate description" })
  }
}