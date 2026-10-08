import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import IconBtn from "../../Common/IconBtn"

export default function VideoDetailsSidebar({ setReviewModal }) {
  const [activeStatus, setActiveStatus] = useState("")
  const [videoBarActive, setVideoBarActive] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { sectionId, subSectionId } = useParams()
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse)

  useEffect(() => {
    ;(() => {
      if (!courseSectionData.length) return
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId)
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
      setVideoBarActive(activeSubSectionId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, courseEntireData, location.pathname])

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r border-r-[rgba(6,182,212,0.15)] bg-[#0c1a2e]">
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-[rgba(6,182,212,0.15)] py-5 text-lg font-bold text-[#f0f9ff]">
          <div className="flex w-full items-center justify-between">
            <div
              onClick={() => navigate(`/dashboard/enrolled-courses`)}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-transparent text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#06b6d4] transition-all duration-150 cursor-pointer"
              title="back"
            >
              <IoIosArrowBack size={20} />
            </div>
            <IconBtn
              text="Add Review"
              customClasses="ml-auto"
              onclick={() => setReviewModal(true)}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#f0f9ff]">{courseEntireData?.courseName}</p>
            <p className="text-sm font-semibold text-[#94a3b8]">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          {courseSectionData.map((course, index) => (
            <div
              className="mt-2 cursor-pointer text-sm text-[#94a3b8]"
              onClick={() => setActiveStatus(course?._id)}
              key={index}
            >
              {/* Section */}
              <div className="flex flex-row justify-between bg-[#060d1a] border-y border-[rgba(6,182,212,0.08)] px-5 py-4">
                <div className="w-[70%] font-semibold text-[#f0f9ff]">
                  {course?.sectionName}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      activeStatus === course?.sectionName
                        ? "rotate-0"
                        : "rotate-180"
                    } transition-all duration-500 text-[#06b6d4]`}
                  >
                    <BsChevronDown />
                  </span>
                </div>
              </div>

              {/* Sub Sections */}
              {activeStatus === course?._id && (
                <div className="transition-[height] duration-500 ease-in-out">
                  {course.subSection.map((topic, i) => (
                    <div
                      className={`flex gap-3 px-5 py-2 ${
                        videoBarActive === topic._id
                          ? "bg-[rgba(6,182,212,0.08)] border-l-2 border-[#06b6d4] pl-[18px] text-[#06b6d4] font-medium"
                          : "text-[#94a3b8] hover:bg-[rgba(6,182,212,0.05)] hover:text-[#f0f9ff]"
                      } transition-all duration-150`}
                      key={i}
                      onClick={() => {
                        navigate(
                          `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
                        )
                        setVideoBarActive(topic._id)
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={completedLectures.includes(topic?._id)}
                        onChange={() => {}}
                        className="accent-[#06b6d4]"
                      />
                      {topic.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}