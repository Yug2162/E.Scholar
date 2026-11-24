// Instructor page: create / edit the final exam of a course
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import {
  deleteExam,
  getInstructorExam,
  saveExam,
} from "../../../services/operations/examAPI"
import ConfirmationModal from "../../Common/ConfirmationModal"
import IconBtn from "../../Common/IconBtn"

const MAX_OPTIONS = 6

const blankQuestion = () => ({
  key: Math.random().toString(36).slice(2),
  question: "",
  options: ["", "", "", ""],
  correctOption: null,
  marks: 1,
})

const DEFAULT_SETTINGS = {
  title: "Final Exam",
  description: "",
  durationMinutes: 30,
  passPercentage: 60,
  maxAttempts: 3,
}

// Mirrors the server rules so mistakes show up before saving
function validate(settings, questions) {
  if (!settings.title.trim()) return "Exam title is required"
  const d = Number(settings.durationMinutes)
  if (!Number.isInteger(d) || d < 1 || d > 300) return "Duration must be 1–300 minutes"
  const p = Number(settings.passPercentage)
  if (!(p >= 1 && p <= 100)) return "Pass percentage must be 1–100"
  const a = Number(settings.maxAttempts)
  if (!Number.isInteger(a) || a < 0 || a > 50) return "Max attempts must be 0–50"
  if (!questions.length) return "Add at least one question"
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const n = i + 1
    if (!q.question.trim()) return `Question ${n}: enter the question`
    if (q.options.length < 2) return `Question ${n}: add at least 2 options`
    if (q.options.some((o) => !o.trim())) return `Question ${n}: fill in every option`
    if (q.correctOption === null || q.correctOption >= q.options.length)
      return `Question ${n}: mark the correct option`
    const m = Number(q.marks)
    if (!Number.isInteger(m) || m < 1 || m > 100) return `Question ${n}: marks must be 1–100`
  }
  return null
}

export default function ExamBuilder() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseName, setCourseName] = useState("")
  const [hasSavedExam, setHasSavedExam] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [questions, setQuestions] = useState([blankQuestion()])
  const [confirmationModal, setConfirmationModal] = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const data = await getInstructorExam(courseId, token)
      if (data) {
        setCourseName(data.courseName)
        if (data.exam) {
          const e = data.exam
          setHasSavedExam(true)
          setSettings({
            title: e.title,
            description: e.description || "",
            durationMinutes: e.durationMinutes,
            passPercentage: e.passPercentage,
            maxAttempts: e.maxAttempts,
          })
          setQuestions(
            e.questions.map((q) => ({
              key: q._id,
              question: q.question,
              options: [...q.options],
              correctOption: q.correctOption,
              marks: q.marks,
            }))
          )
        }
      }
      setLoading(false)
    })()
  }, [courseId, token])

  // ---------- question helpers ----------
  const updateQuestion = (qi, patch) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)))

  const updateOption = (qi, oi, value) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
          : q
      )
    )

  const addOption = (qi) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi && q.options.length < MAX_OPTIONS
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    )

  const removeOption = (qi, oi) =>
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q
        let correct = q.correctOption
        if (correct === oi) correct = null
        else if (correct !== null && correct > oi) correct -= 1
        return {
          ...q,
          options: q.options.filter((_, j) => j !== oi),
          correctOption: correct,
        }
      })
    )

  const moveQuestion = (qi, dir) =>
    setQuestions((qs) => {
      const to = qi + dir
      if (to < 0 || to >= qs.length) return qs
      const copy = [...qs]
      ;[copy[qi], copy[to]] = [copy[to], copy[qi]]
      return copy
    })

  const removeQuestion = (qi) =>
    setQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== qi) : qs))

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0)

  // ---------- save / delete ----------
  const handleSave = async () => {
    const error = validate(settings, questions)
    if (error) {
      toast.error(error)
      return
    }
    setSaving(true)
    const saved = await saveExam(
      {
        courseId,
        title: settings.title.trim(),
        description: settings.description.trim(),
        durationMinutes: Number(settings.durationMinutes),
        passPercentage: Number(settings.passPercentage),
        maxAttempts: Number(settings.maxAttempts),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctOption: q.correctOption,
          marks: Number(q.marks),
        })),
      },
      token
    )
    if (saved) setHasSavedExam(true)
    setSaving(false)
  }

  const handleDelete = async () => {
    setSaving(true)
    const ok = await deleteExam(courseId, token)
    if (ok) {
      setHasSavedExam(false)
      setSettings(DEFAULT_SETTINGS)
      setQuestions([blankQuestion()])
    }
    setSaving(false)
    setConfirmationModal(null)
  }

  if (loading) {
    return (
      <div className="grid min-h-[300px] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] pb-16 text-[#f0f9ff]">
      <button
        onClick={() => navigate("/dashboard/my-courses")}
        className="mb-4 flex items-center gap-1 text-sm text-[#94a3b8] hover:text-[#06b6d4]"
      >
        <IoIosArrowBack /> Back to My Courses
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Final Exam</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            {courseName}
            {hasSavedExam ? " · exam is live for students" : " · no exam yet"}
          </p>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Students can take the exam after completing every lecture. The
          certificate is issued only after they pass it.
        </p>
      </div>

      {/* Settings */}
      <div className="rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="lable-style">
              Exam title <sup className="text-[#06b6d4]">*</sup>
            </span>
            <input
              className="form-style w-full"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="e.g. Final Exam"
            />
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="lable-style">Instructions (optional)</span>
            <textarea
              className="form-style min-h-[90px] w-full resize-y"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Anything students should know before they start"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="lable-style">Time limit (minutes)</span>
            <input
              type="number"
              min={1}
              max={300}
              className="form-style w-full"
              value={settings.durationMinutes}
              onChange={(e) => setSettings({ ...settings, durationMinutes: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="lable-style">Pass mark (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              className="form-style w-full"
              value={settings.passPercentage}
              onChange={(e) => setSettings({ ...settings, passPercentage: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="lable-style">Max attempts (0 = unlimited)</span>
            <input
              type="number"
              min={0}
              max={50}
              className="form-style w-full"
              value={settings.maxAttempts}
              onChange={(e) => setSettings({ ...settings, maxAttempts: e.target.value })}
            />
          </label>
          <div className="flex flex-col justify-end gap-1 text-sm text-[#94a3b8]">
            <span>
              {questions.length} question{questions.length !== 1 && "s"} ·{" "}
              {totalMarks} mark{totalMarks !== 1 && "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="mt-6 flex flex-col gap-4">
        {questions.map((q, qi) => (
          <div
            key={q.key}
            className="rounded-[6px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#06b6d4]">Question {qi + 1}</p>
              <div className="flex items-center gap-1 text-[#94a3b8]">
                <button
                  type="button"
                  title="Move up"
                  disabled={qi === 0}
                  onClick={() => moveQuestion(qi, -1)}
                  className="rounded p-1.5 hover:text-[#06b6d4] disabled:opacity-30"
                >
                  <FiArrowUp />
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={qi === questions.length - 1}
                  onClick={() => moveQuestion(qi, 1)}
                  className="rounded p-1.5 hover:text-[#06b6d4] disabled:opacity-30"
                >
                  <FiArrowDown />
                </button>
                <button
                  type="button"
                  title="Delete question"
                  disabled={questions.length === 1}
                  onClick={() => removeQuestion(qi)}
                  className="rounded p-1.5 hover:text-[#ff4d4f] disabled:opacity-30"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <textarea
              className="form-style min-h-[70px] w-full resize-y"
              placeholder="Type the question"
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            />

            <p className="mb-2 mt-4 text-xs text-[#94a3b8]">
              Options: select the radio button next to the correct answer
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${q.key}`}
                    checked={q.correctOption === oi}
                    onChange={() => updateQuestion(qi, { correctOption: oi })}
                    className="h-4 w-4 accent-[#06b6d4]"
                    title="Correct answer"
                  />
                  <input
                    className={`form-style w-full !py-2 ${
                      q.correctOption === oi ? "!border-[#06b6d4]" : ""
                    }`}
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                  <button
                    type="button"
                    title="Remove option"
                    disabled={q.options.length <= 2}
                    onClick={() => removeOption(qi, oi)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#ff4d4f] disabled:opacity-30"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={q.options.length >= MAX_OPTIONS}
                onClick={() => addOption(qi)}
                className="flex items-center gap-1 text-xs font-semibold text-[#06b6d4] hover:underline disabled:opacity-30"
              >
                <FiPlus /> Add option
              </button>
              <label className="flex items-center gap-2 text-xs text-[#94a3b8]">
                Marks
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={q.marks}
                  onChange={(e) => updateQuestion(qi, { marks: e.target.value })}
                  className="form-style w-20 !py-1 text-center"
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}
          className="flex items-center justify-center gap-2 rounded-[6px] border border-dashed border-[rgba(6,182,212,0.35)] py-4 text-sm font-semibold text-[#06b6d4] hover:bg-[rgba(6,182,212,0.05)]"
        >
          <FiPlus /> Add question
        </button>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {hasSavedExam ? (
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              setConfirmationModal({
                text1: "Delete this exam?",
                text2: "All student attempts will be deleted too.",
                btn1Text: "Delete",
                btn2Text: "Cancel",
                btn1Handler: handleDelete,
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="text-sm font-semibold text-[#94a3b8] hover:text-[#ff4d4f]"
          >
            Delete exam
          </button>
        ) : (
          <span />
        )}
        <IconBtn
          disabled={saving}
          onclick={handleSave}
          text={saving ? "Saving..." : hasSavedExam ? "Save Changes" : "Publish Exam"}
        />
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}
