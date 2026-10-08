import { useState } from "react"

export default function InstructorChart({ courses }) {
  // Which metric is currently displayed
  const [currChart, setCurrChart] = useState("students")

  const metricKey =
    currChart === "students" ? "totalStudentsEnrolled" : "totalAmountGenerated"

  // Sort courses by the active metric, highest first, so the best performer
  // is always visually on top — more useful than a fixed pie slice order.
  const sortedCourses = [...courses].sort((a, b) => b[metricKey] - a[metricKey])

  const maxValue = Math.max(...sortedCourses.map((c) => c[metricKey]), 1)

  return (
    <div className="flex flex-1 flex-col gap-y-4 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-[#f0f9ff]">Course Performance</p>
        <div className="flex gap-1 rounded-[6px] bg-[#060d1a] p-1">
          <button
            onClick={() => setCurrChart("students")}
            className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              currChart === "students"
                ? "bg-[#06b6d4] text-[#06121f]"
                : "text-[#94a3b8] hover:text-[#f0f9ff]"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setCurrChart("income")}
            className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              currChart === "income"
                ? "bg-[#06b6d4] text-[#06121f]"
                : "text-[#94a3b8] hover:text-[#f0f9ff]"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-5 overflow-y-auto py-2">
        {sortedCourses.map((course, idx) => {
          const value = course[metricKey]
          const widthPct = Math.max((value / maxValue) * 100, 4)

          return (
            <div key={course._id || idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-[#f0f9ff]" title={course.courseName}>
                  {course.courseName}
                </p>
                <p className="shrink-0 text-sm font-bold text-[#06b6d4]">
                  {currChart === "students" ? value : `Rs. ${value.toLocaleString("en-IN")}`}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(6,182,212,0.08)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0891b2] to-[#06b6d4] transition-all duration-500 ease-out"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}