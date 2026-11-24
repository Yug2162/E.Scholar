import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  BigPlayButton,
  ControlBar,
  PlaybackRateMenuButton,
  Player,
} from "video-react"
import { FiLock } from "react-icons/fi"
import { RiRobot2Line } from "react-icons/ri"
import { HiOutlineSparkles, HiSparkles } from "react-icons/hi2"
import { FiExternalLink } from "react-icons/fi"

import {
  markLectureAsComplete,
  saveWatchProgress,
} from "../../../services/operations/courseDetailsAPI"
import {
  updateCompletedLectures,
  updateWatchProgress,
} from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"
import VideoDoubtSection from "./VideoDoubtSection"

// ---- No-skip settings ----
// How far past the furthest watched point the playhead may be (seconds).
// Normal playback moves ~0.25s between updates, a seek jumps much further.
const SEEK_TOLERANCE = 1.5
// How often watched progress is saved to the server (ms)
const SAVE_INTERVAL = 10000

const formatTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) sec = 0
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const {
    courseSectionData,
    courseEntireData,
    completedLectures,
    totalNoOfLectures,
    watchProgress,
    examInfo,
  } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  // ---- No-skip state ----
  // A lecture that is already completed can be scrubbed freely.
  const isUnlocked = completedLectures.includes(subSectionId)
  const unlockedRef = useRef(isUnlocked)
  unlockedRef.current = isUnlocked
  const maxWatchedRef = useRef(0) // furthest point reached (seconds)
  const lastSavedRef = useRef(0) // last value sent to the server
  const resumedRef = useRef(false) // jumped to the saved position yet?
  const lastWarnRef = useRef(0)
  const [watched, setWatched] = useState({ max: 0, duration: 0 })

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

  // Send the furthest watched point to the server (only if it moved)
  const persistProgress = async (force = false) => {
    const seconds = maxWatchedRef.current
    if (!token || !subSectionId || unlockedRef.current) return
    if (!force && seconds <= lastSavedRef.current + 1) return
    lastSavedRef.current = seconds
    const accepted = await saveWatchProgress(
      { courseId, subsectionId: subSectionId, currentTime: seconds },
      token
    )
    if (accepted !== null) {
      // The server limits how fast progress can grow; follow its value
      if (accepted < maxWatchedRef.current) maxWatchedRef.current = accepted
      lastSavedRef.current = accepted
      dispatch(updateWatchProgress({ subSectionId, seconds: accepted }))
    }
  }

  // New lecture: start from the progress saved on the server
  useEffect(() => {
    maxWatchedRef.current = watchProgress?.[subSectionId] || 0
    lastSavedRef.current = maxWatchedRef.current
    resumedRef.current = false
    setWatched({ max: maxWatchedRef.current, duration: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subSectionId])

  // Saved progress can arrive after the page opened (course data loads
  // async): pick it up and continue from there
  useEffect(() => {
    const saved = watchProgress?.[subSectionId] || 0
    if (saved > maxWatchedRef.current) {
      maxWatchedRef.current = saved
      lastSavedRef.current = Math.max(lastSavedRef.current, saved)
      resumedRef.current = false
      setWatched((w) => ({ ...w, max: Math.floor(saved) }))
    }
  }, [watchProgress, subSectionId])

  // Watch the player and pull the playhead back if it jumps ahead
  useEffect(() => {
    const player = playerRef.current
    if (!player || !videoData?.videoUrl) return

    const unsubscribe = player.subscribeToStateChange((state) => {
      const { currentTime, duration, seeking, paused, playbackRate } = state

      if (unlockedRef.current) {
        if (duration) setWatched((w) => (w.duration === duration ? w : { ...w, duration }))
        return
      }

      // Speed is locked to 1x
      if (playbackRate && playbackRate !== 1 && player.video?.video) {
        player.video.video.playbackRate = 1
      }

      // First time the video is ready: continue where the student left off
      if (!resumedRef.current && duration > 0) {
        resumedRef.current = true
        const resumeAt = maxWatchedRef.current
        if (resumeAt > 1 && resumeAt < duration - 2) player.seek(resumeAt)
      }

      if (currentTime > maxWatchedRef.current + SEEK_TOLERANCE) {
        // Tried to skip ahead: go back to the furthest watched point
        player.seek(maxWatchedRef.current)
        const now = Date.now()
        if (now - lastWarnRef.current > 3000) {
          lastWarnRef.current = now
          toast("You can't skip ahead in this lecture", { icon: "\uD83D\uDD12", id: "no-skip" })
        }
        return
      }

      if (!seeking && !paused && currentTime > maxWatchedRef.current) {
        maxWatchedRef.current = currentTime
      }

      setWatched((w) => {
        const max = Math.floor(maxWatchedRef.current)
        const d = duration || 0
        return w.max === max && w.duration === d ? w : { max, duration: d }
      })
    })

    const timer = setInterval(() => persistProgress(), SAVE_INTERVAL)
    const onLeave = () => persistProgress()
    window.addEventListener("beforeunload", onLeave)

    return () => {
      unsubscribe && unsubscribe()
      clearInterval(timer)
      window.removeEventListener("beforeunload", onLeave)
      persistProgress() // save when switching lecture / leaving the page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoData?.videoUrl, subSectionId])

  const handleVideoEnded = () => {
    const player = playerRef.current
    const duration = player?.getState()?.player?.duration
    if (!unlockedRef.current && duration) {
      maxWatchedRef.current = Math.max(maxWatchedRef.current, duration)
      persistProgress(true)
    }
    setVideoEnded(true)
  }

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
    // Make sure the server knows the video was watched to the end
    await persistProgress(true)
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
          onEnded={handleVideoEnded}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Speed menu is hidden until the lecture has been completed */}
          {isUnlocked ? (
            <ControlBar />
          ) : (
            <ControlBar>
              <PlaybackRateMenuButton disabled />
            </ControlBar>
          )}
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
                {isLastVideo() &&
                  examInfo?.hasExam &&
                  completedLectures.length >= totalNoOfLectures && (
                    <button
                      disabled={loading}
                      onClick={() => navigate(`/view-course/${courseId}/exam`)}
                      className="border border-[#06b6d4] bg-[#06b6d4] text-[#060d1a] font-semibold px-5 py-2 rounded-[4px] text-sm hover:bg-[#22d3ee] transition-all duration-150"
                    >
                      {examInfo?.passed ? "View Final Exam" : "Take Final Exam"}
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

      {/* No-skip notice */}
      {videoData?.videoUrl && !isUnlocked && (
        <div className="-mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] px-4 py-2 text-xs text-[#94a3b8]">
          <span className="flex items-center gap-2">
            <FiLock className="text-[#06b6d4]" />
            Skipping ahead is disabled. Watch the full lecture to complete it.
          </span>
          {watched.duration > 0 && (
            <span className="font-mono text-[#f0f9ff]">
              Watched {formatTime(watched.max)} / {formatTime(watched.duration)}
            </span>
          )}
        </div>
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