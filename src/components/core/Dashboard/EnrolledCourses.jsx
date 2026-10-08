import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import { downloadCertificate } from "../../../services/operations/certificateAPI"

export default function EnrolledCourses() {
  const { token: reduxToken } = useSelector((state) => state.auth)
  const token = reduxToken || localStorage.getItem("token")
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getUserEnrolledCourses(token)
        const filterPublishCourse = res.filter((ele) => ele.status !== "Draft")
        setEnrolledCourses(filterPublishCourse)
      } catch (error) {
        console.log("Could not fetch enrolled courses.")
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalCourses = enrolledCourses?.length || 0
  const completedCourses =
    enrolledCourses?.filter((c) => (c.progressPercentage || 0) === 100).length || 0
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          enrolledCourses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) /
            totalCourses
        )
      : 0

  return (
    <>
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-[#f0f9ff]">Enrolled Courses</h1>
        <p className="text-sm font-medium text-[#94a3b8]">
          Track your learning progress across all courses
        </p>
      </div>

      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <div className="mt-20 rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6 py-20">
          <p className="text-center text-2xl font-bold text-[#f0f9ff]">
            You have not enrolled in any course yet.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#06b6d4]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Enrolled Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">{totalCourses}</p>
            </div>
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0891b2]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">{completedCourses}</p>
            </div>
            <div className="relative overflow-hidden rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#67e8f9]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                Average Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-[#f0f9ff]">{avgProgress}%</p>
            </div>
          </div>

          {/* Course rows */}
          <div className="text-[#f0f9ff]">
            <div className="flex rounded-t-[6px] bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] text-[#94a3b8] text-xs font-semibold uppercase tracking-widest">
              <p className="w-[45%] px-5 py-3">Course Name</p>
              <p className="w-1/4 px-2 py-3">Duration</p>
              <p className="flex-1 px-2 py-3">Progress</p>
            </div>
            {enrolledCourses.map((course, i, arr) => {
              const progress = course.progressPercentage || 0
              const isComplete = progress === 100
              return (
                <div
                  className={`flex items-center bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] border-t-0 hover:border-[#06b6d4] transition-all duration-200 ${
                    i === arr.length - 1 ? "rounded-b-[6px]" : "rounded-none"
                  }`}
                  key={i}
                >
                  <div
                    className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                    onClick={() => {
                      navigate(
                        `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                      )
                    }}
                  >
                    <img
                      src={course.thumbnail}
                      alt="course_img"
                      className="h-14 w-14 rounded-[6px] object-cover border border-[rgba(6,182,212,0.15)]"
                    />
                    <div className="flex max-w-xs flex-col gap-1">
                      <p className="font-semibold text-[#f0f9ff] text-sm">
                        {course.courseName}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        {course.courseDescription.length > 50
                          ? `${course.courseDescription.slice(0, 50)}...`
                          : course.courseDescription}
                      </p>
                      {isComplete && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-[rgba(6,182,212,0.1)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#06b6d4]">
                            Completed
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadCertificate(course._id, token, course.courseName)
                            }}
                            className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8] underline hover:text-[#06b6d4] transition-colors duration-150"
                          >
                            Download Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-1/4 px-2 py-3 text-[#94a3b8] text-sm">
                    {course?.totalDuration}
                  </div>
                  <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                    <p className="text-xs text-[#94a3b8]">Progress: {progress}%</p>
                    <ProgressBar
                      completed={progress}
                      height="6px"
                      isLabelVisible={false}
                      bgColor={isComplete ? "#22d3ee" : "#06b6d4"}
                      baseBgColor="rgba(6,182,212,0.1)"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}