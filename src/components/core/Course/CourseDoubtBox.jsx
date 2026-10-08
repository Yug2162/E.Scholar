import { useState } from "react"
import { HiOutlineSparkles } from "react-icons/hi2"
import { askCourseDoubt } from "../../../services/operations/courseDoubtAPI"

export default function CourseDoubtBox({ courseId }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [asked, setAsked] = useState(false)

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    setLoading(true)
    setAsked(true)
    const result = await askCourseDoubt(question, courseId)
    setAnswer(result)
    setLoading(false)
  }

  return (
    <div className="my-8 border border-[rgba(6,182,212,0.15)] rounded-[4px] p-8">
      <p className="flex items-center gap-2 text-3xl font-semibold text-[#f0f9ff]">
        <HiOutlineSparkles className="text-[#06b6d4]" />
        Ask a Doubt
      </p>
      <p className="mt-2 text-sm text-[#94a3b8]">
        Ask a question about this course and get an instant AI-generated answer.
      </p>

      <form onSubmit={handleAsk} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What will I learn in section 2?"
          className="flex-1 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] px-4 py-3 text-[#f0f9ff] placeholder:text-[#64748b] outline-none focus:border-[#06b6d4]"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-[4px] border border-[#06b6d4] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#06b6d4] transition-all duration-150 hover:bg-[#06b6d4] hover:text-[#060d1a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {asked && (
        <div className="mt-5 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-5">
          {loading ? (
            <p className="text-sm text-[#94a3b8]">Getting your answer...</p>
          ) : (
            <p className="whitespace-pre-wrap text-[#e2e8f0]">{answer}</p>
          )}
        </div>
      )}
    </div>
  )
}