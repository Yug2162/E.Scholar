import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { useLocation } from "react-router-dom"
import { BigPlayButton, Player } from "video-react"
import { RiRobot2Line } from "react-icons/ri"
import { HiOutlineSparkles, HiSparkles } from "react-icons/hi2"
import { FiExternalLink } from "react-icons/fi"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"
import VideoDoubtSection from "./VideoDoubtSection"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  const netraAiUrl = "https://netra-agentic-ai.streamlit.app/"

  useEffect(() => {
    ;(async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        setVideoData(filteredVideoData[0])
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)
    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)
    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)
    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)
    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  const scrollToDoubtSection = () => {
    const el = document.getElementById("netra-ai-qna")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      const input = el.querySelector("input")
      if (input) input.focus()
    }
  }

  return (
    <div className="relative pb-16 flex flex-col gap-5 text-[#f0f9ff]">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-[4px] object-cover border border-[rgba(6,182,212,0.15)]"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    playerRef?.current?.seek(0)
                    setVideoEnded(false)
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] px-5 py-2 rounded-[4px] text-sm transition-all duration-150"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] px-5 py-2 rounded-[4px] text-sm transition-all duration-150"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      {/* Video Details Header & Netra AI Quick Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-[#f0f9ff]">
            {videoData?.title}
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollToDoubtSection}
              className="flex items-center gap-1.5 rounded-md border border-[#06b6d4] bg-[rgba(6,182,212,0.08)] px-3.5 py-2 text-xs font-semibold text-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#060d1a] transition-all shadow-md shadow-[rgba(6,182,212,0.15)]"
            >
              <HiOutlineSparkles size={15} />
              <span>Ask Netra AI</span>
            </button>
            <a
              href={netraAiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-[rgba(6,182,212,0.2)] bg-[#0c1a2e] px-3.5 py-2 text-xs font-semibold text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#f0f9ff] transition-all"
            >
              <span>Netra Agentic AI</span>
              <FiExternalLink size={13} />
            </a>
          </div>
        </div>

        <p className="pt-1 pb-2 text-sm text-[#94a3b8] leading-relaxed">
          {videoData?.description}
        </p>
      </div>

      {/* Dedicated Netra AI Doubt Section for Video Tutorials */}
      <VideoDoubtSection
        courseId={courseId}
        courseEntireData={courseEntireData}
        videoData={videoData}
        sectionId={sectionId}
        subSectionId={subSectionId}
      />

      {/* Floating Quick Action Button for Instant Doubt Clearing */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={scrollToDoubtSection}
          className="group flex items-center gap-2.5 rounded-full border border-[rgba(6,182,212,0.35)] bg-gradient-to-r from-[#0c1a2e] to-[#060d1a] px-4 py-2.5 text-xs font-semibold text-[#f0f9ff] shadow-xl shadow-[rgba(6,182,212,0.25)] backdrop-blur-md transition-all hover:scale-105 hover:border-[#06b6d4]"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#06b6d4]"></span>
          </span>
          <RiRobot2Line size={16} className="text-[#06b6d4]" />
          <span>Ask Netra AI Doubt</span>
        </button>
      </div>
    </div>
  )
}

export default VideoDetails