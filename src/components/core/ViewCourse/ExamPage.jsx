// Student page: final exam of a course (intro → timed exam → result)
import { useCallback, useEffect, useRef, useState } from "react"
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiXCircle,
} from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import { downloadCertificate } from "../../../services/operations/certificateAPI"
import {
  getExamStatus,
  startExam,
  submitExam,
} from "../../../services/operations/examAPI"
import { setExamInfo } from "../../../slices/viewCourseSlice"
import ConfirmationModal from "../../Common/ConfirmationModal"
import IconBtn from "../../Common/IconBtn"

const card =
  "rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6"

const formatClock = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = m.toString().padStart(2, "0")
  const ss = s.toString().padStart(2, "0")
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// Answers are kept in sessionStorage so a page refresh doesn't lose them
const storageKey = (attemptId) => `exam-answers-${attemptId}`
const loadAnswers = (attemptId, count) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey(attemptId)))
    if (Array.isArray(saved) && saved.length === count) return saved
  } catch (e) {}
  return Array(count).fill(-1)
}
const storeAnswers = (attemptId, answers) => {
  try {
    sessionStorage.setItem(storageKey(attemptId), JSON.stringify(answers))
  } catch (e) {}
}
const clearAnswers = (attemptId) => {
  try {
    sessionStorage.removeItem(storageKey(attemptId))
  } catch (e) {}
}

export default function ExamPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { courseEntireData, courseSectionData } = useSelector(
    (state) => state.viewCourse
  )

  // "loading" | "intro" | "taking" | "result"
  const [view, setView] = useState("loading")
  const [status, setStatus] = useState(null)
  const [attempt, setAttempt] = useState(null) // { attemptId, expiresAt, questions, title }
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)

  const clockOffsetRef = useRef(0) // server time − local time
  const submittingRef = useRef(false)
  const answersRef = useRef([])
  answersRef.current = answers

  const refreshStatus = useCallback(async () => {
    const data = await getExamStatus(courseId, token)
    setStatus(data)
    dispatch(setExamInfo(data))
    return data
  }, [courseId, token, dispatch])

  useEffect(() => {
    ;(async () => {
      await refreshStatus()
      setView("intro")
    })()
  }, [refreshStatus])

  // ---------- start / resume ----------
  const handleStart = async () => {
    setBusy(true)
    const data = await startExam(courseId, token)
    setBusy(false)
    if (!data) return
    clockOffsetRef.current = new Date(data.serverTime).getTime() - Date.now()
    submittingRef.current = false
    setAttempt(data)
    setAnswers(loadAnswers(data.attemptId, data.questions.length))
    setCurrent(0)
    setView("taking")
  }

  const choose = (qi, oi) => {
    setAnswers((prev) => {
      const next = prev.map((a, i) => (i === qi ? oi : a))
      storeAnswers(attempt.attemptId, next)
      return next
    })
  }

  // ---------- submit ----------
  const doSubmit = useCallback(async () => {
    if (!attempt || submittingRef.current) return
    submittingRef.current = true
    setBusy(true)
    setConfirmationModal(null)
    const res = await submitExam(attempt.attemptId, answersRef.current, token)
    setBusy(false)
    if (!res) {
      submittingRef.current = false
      return
    }
    clearAnswers(attempt.attemptId)
    setResult(res)
    setView("result")
    refreshStatus()
  }, [attempt, token, refreshStatus])

  // ---------- timer (auto-submits at zero) ----------
  useEffect(() => {
    if (view !== "taking" || !attempt) return
    const expires = new Date(attempt.expiresAt).getTime()
    const tick = () => {
      const left = expires - (Date.now() + clockOffsetRef.current)
      setRemaining(left)
      if (left <= 0) doSubmit()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [view, attempt, doSubmit])

  // Warn before leaving the page in the middle of the exam
  useEffect(() => {
    if (view !== "taking") return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [view])

  const askSubmit = () => {
    const unanswered = answers.filter((a) => a === -1).length
    setConfirmationModal({
      text1: "Submit your exam?",
      text2: unanswered
        ? `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. You can't change answers after submitting.`
        : "You can't change answers after submitting.",
      btn1Text: "Submit",
      btn2Text: "Keep working",
      btn1Handler: doSubmit,
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const firstLectureUrl = () => {
    const sec = courseSectionData?.[0]
    const sub = sec?.subSection?.[0]
    return sec && sub
      ? `/view-course/${courseId}/section/${sec._id}/sub-section/${sub._id}`
      : "/dashboard/enrolled-courses"
  }

  // =================== RENDER ===================

  if (view === "loading") {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  // ---------- No exam ----------
  if (view === "intro" && !status?.hasExam) {
    return (
      <div className={`${card} mx-auto mt-10 max-w-[700px] text-center text-[#94a3b8]`}>
        <p className="text-lg font-semibold text-[#f0f9ff]">No final exam</p>
        <p className="mt-2 text-sm">This course doesn't have a final exam.</p>
        <IconBtn
          text="Back to lectures"
          customClasses="mx-auto mt-6"
          onclick={() => navigate(firstLectureUrl())}
        />
      </div>
    )
  }

  // ---------- Intro ----------
  if (view === "intro") {
    const { exam, attempts, attemptsLeft, lecturesCompleted, passed, activeAttempt, canStart } =
      status
    return (
      <div className="mx-auto max-w-[800px] py-8 text-[#f0f9ff]">
        <p className="text-sm text-[#94a3b8]">{courseEntireData?.courseName}</p>
        <h1 className="mt-1 text-3xl font-bold">{exam.title}</h1>

        <div className={`${card} mt-6`}>
          {exam.description && (
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-[#94a3b8]">
              {exam.description}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Questions", exam.questionCount],
              ["Total marks", exam.totalMarks],
              ["Time limit", `${exam.durationMinutes} min`],
              ["Pass mark", `${exam.passPercentage}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[4px] border border-[rgba(6,182,212,0.1)] bg-[#060d1a] p-3"
              >
                <p className="text-xs text-[#94a3b8]">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#94a3b8]">
            {exam.maxAttempts > 0
              ? `Attempts left: ${attemptsLeft} of ${exam.maxAttempts}`
              : "Unlimited attempts"}{" "}
            · The exam submits itself when the time runs out.
          </p>

          <div className="mt-6">
            {passed ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 font-semibold text-[#22d3ee]">
                  <FiCheckCircle /> You passed this exam
                </span>
                <IconBtn
                  text="Download Certificate"
                  onclick={() =>
                    downloadCertificate(courseId, token, courseEntireData?.courseName)
                  }
                />
              </div>
            ) : !lecturesCompleted ? (
              <p className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <FiLock className="text-[#06b6d4]" /> Complete all lectures to unlock
                the exam.
              </p>
            ) : activeAttempt ? (
              <IconBtn disabled={busy} text="Resume Exam" onclick={handleStart} />
            ) : canStart ? (
              <IconBtn disabled={busy} text="Start Exam" onclick={handleStart} />
            ) : (
              <p className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <FiAlertTriangle className="text-[#f59e0b]" /> No attempts left.
                Contact your instructor.
              </p>
            )}
          </div>
        </div>

        {attempts.length > 0 && (
          <div className={`${card} mt-6`}>
            <p className="mb-3 font-semibold">Previous attempts</p>
            <div className="flex flex-col divide-y divide-[rgba(6,182,212,0.08)] text-sm">
              {attempts.map((a, i) => (
                <div key={a._id} className="flex items-center justify-between py-2">
                  <span className="text-[#94a3b8]">
                    #{attempts.length - i} ·{" "}
                    {new Date(a.submittedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="flex items-center gap-3">
                    <span>
                      {a.score}/{a.totalMarks} ({a.percentage}%)
                    </span>
                    {a.passed ? (
                      <span className="text-[#22d3ee]">Passed</span>
                    ) : (
                      <span className="text-[#f87171]">{a.late ? "Timed out" : "Failed"}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------- Taking the exam ----------
  if (view === "taking" && attempt) {
    const q = attempt.questions[current]
    const answeredCount = answers.filter((a) => a !== -1).length
    const lowTime = remaining < 60 * 1000
    return (
      <div className="mx-auto max-w-[900px] py-6 text-[#f0f9ff]">
        {/* Header with timer */}
        <div className="sticky top-0 z-10 -mx-2 mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#060d1a]/95 px-2 py-3 backdrop-blur">
          <div>
            <p className="text-lg font-semibold">{attempt.title}</p>
            <p className="text-xs text-[#94a3b8]">
              Answered {answeredCount} of {attempt.questions.length}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-[4px] border px-4 py-2 font-mono text-lg ${
              lowTime
                ? "animate-pulse border-[#f87171] text-[#f87171]"
                : "border-[rgba(6,182,212,0.3)] text-[#06b6d4]"
            }`}
          >
            <FiClock /> {formatClock(remaining)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
          {/* Question */}
          <div className={card}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#06b6d4]">
              Question {current + 1} of {attempt.questions.length} · {q.marks} mark
              {q.marks > 1 && "s"}
            </p>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{q.question}</p>

            <div className="mt-6 flex flex-col gap-3">
              {q.options.map((opt, oi) => {
                const selected = answers[current] === oi
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => choose(current, oi)}
                    className={`flex items-center gap-3 rounded-[4px] border px-4 py-3 text-left text-sm transition-all duration-150 ${
                      selected
                        ? "border-[#06b6d4] bg-[rgba(6,182,212,0.12)] text-[#f0f9ff]"
                        : "border-[rgba(6,182,212,0.15)] text-[#94a3b8] hover:border-[rgba(6,182,212,0.4)] hover:text-[#f0f9ff]"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                        selected
                          ? "border-[#06b6d4] bg-[#06b6d4] text-[#060d1a]"
                          : "border-[rgba(6,182,212,0.3)]"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="blackButton disabled:opacity-30"
              >
                Previous
              </button>
              {current < attempt.questions.length - 1 ? (
                <IconBtn text="Next" onclick={() => setCurrent((c) => c + 1)} />
              ) : (
                <IconBtn disabled={busy} text="Submit Exam" onclick={askSubmit} />
              )}
            </div>
          </div>

          {/* Question navigator */}
          <div className={`${card} h-fit !p-4`}>
            <p className="mb-3 text-xs font-semibold text-[#94a3b8]">Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {attempt.questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-8 rounded-[4px] border text-xs font-semibold ${
                    i === current
                      ? "border-[#06b6d4] text-[#06b6d4]"
                      : answers[i] !== -1
                      ? "border-transparent bg-[#06b6d4] text-[#060d1a]"
                      : "border-[rgba(6,182,212,0.2)] text-[#94a3b8]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={askSubmit}
              className="mt-4 w-full rounded-[4px] border border-[#06b6d4] py-2 text-xs font-semibold text-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#060d1a]"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
      </div>
    )
  }

  // ---------- Result ----------
  if (view === "result" && result) {
    const questions = attempt?.questions || []
    return (
      <div className="mx-auto max-w-[800px] py-8 text-[#f0f9ff]">
        <div className={`${card} text-center`}>
          {result.passed ? (
            <FiCheckCircle className="mx-auto text-5xl text-[#22d3ee]" />
          ) : (
            <FiXCircle className="mx-auto text-5xl text-[#f87171]" />
          )}
          <h1 className="mt-4 text-2xl font-bold">
            {result.passed
              ? "Congratulations, you passed!"
              : result.late
              ? "Time ran out"
              : "You didn't pass this time"}
          </h1>
          <p className="mt-2 text-4xl font-bold text-[#06b6d4]">{result.percentage}%</p>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Score {result.score} / {result.totalMarks} · Pass mark {result.passPercentage}%
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {result.certificateIssued && (
              <IconBtn
                text="Download Certificate"
                onclick={() =>
                  downloadCertificate(courseId, token, courseEntireData?.courseName)
                }
              />
            )}
            {!result.passed && status?.canStart && (
              <IconBtn text="Try Again" onclick={() => setView("intro")} />
            )}
            <button className="blackButton" onClick={() => setView("intro")}>
              Exam overview
            </button>
          </div>
        </div>

        {/* Review */}
        <div className={`${card} mt-6`}>
          <p className="mb-4 font-semibold">Review</p>
          {!result.passed && (
            <p className="mb-4 text-xs text-[#94a3b8]">
              Correct answers are shown once you pass the exam.
            </p>
          )}
          <div className="flex flex-col gap-4">
            {questions.map((q, i) => {
              const r = result.review?.[i] || {}
              return (
                <div
                  key={q._id}
                  className="rounded-[4px] border border-[rgba(6,182,212,0.1)] bg-[#060d1a] p-4"
                >
                  <div className="flex items-start gap-3">
                    {r.correct ? (
                      <FiCheckCircle className="mt-1 shrink-0 text-[#22d3ee]" />
                    ) : (
                      <FiXCircle className="mt-1 shrink-0 text-[#f87171]" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {i + 1}. {q.question}
                      </p>
                      <p className="mt-2 text-xs text-[#94a3b8]">
                        Your answer:{" "}
                        <span className={r.correct ? "text-[#22d3ee]" : "text-[#f87171]"}>
                          {r.yourAnswer >= 0 ? q.options[r.yourAnswer] : "Not answered"}
                        </span>
                      </p>
                      {!r.correct && r.correctOption !== undefined && (
                        <p className="mt-1 text-xs text-[#94a3b8]">
                          Correct answer:{" "}
                          <span className="text-[#22d3ee]">{q.options[r.correctOption]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
