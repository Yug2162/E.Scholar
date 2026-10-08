import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      console.log(instructorApiData)
      if (instructorApiData.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [])

  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  )

  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  )

  return (
    <div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#f0f9ff]">
          Hi {user?.firstName} 👋
        </h1>
        <p className="font-medium text-[#94a3b8] text-sm">
          Here's how your courses are performing
        </p>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : courses.length > 0 ? (
        <div>
          {/* Stat cards row */}
          <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#06b6d4]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Total Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">
                {courses.length}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0891b2]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">
                {totalStudents}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#67e8f9]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Total Income
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">
                Rs. {totalAmount?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Performance chart */}
          <div className="flex h-[420px]">
            {totalAmount > 0 || totalStudents > 0 ? (
              <InstructorChart courses={instructorData} />
            ) : (
              <div className="flex-1 rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
                <p className="text-lg font-bold text-[#f0f9ff]">Course Performance</p>
                <p className="mt-4 text-xl font-medium text-[#94a3b8]">
                  Not enough data to visualize yet
                </p>
              </div>
            )}
          </div>

          {/* Course list */}
          <div className="mt-6 rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-[#f0f9ff]">Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className="text-xs font-semibold text-[#06b6d4] hover:text-[#67e8f9] transition-colors duration-150">
                  View All
                </p>
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#060d1a] transition-all duration-200 hover:border-[#06b6d4]"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[160px] w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-[#f0f9ff]">
                      {course.courseName}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#94a3b8]">
                      <span>{course.studentsEnroled.length} students</span>
                      <span className="text-[#06b6d4]">Rs. {course.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6 py-20">
          <p className="text-center text-2xl font-bold text-[#f0f9ff]">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="mt-1 text-center text-lg font-semibold text-[#06b6d4] hover:text-[#67e8f9] transition-colors duration-150">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}