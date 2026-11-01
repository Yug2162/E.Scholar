import React, { useState, useEffect, useRef } from "react"
import { HiOutlineSparkles, HiSparkles } from "react-icons/hi2"
import { FiSend, FiExternalLink, FiCopy, FiCheck, FiTrash2, FiMaximize2, FiMinimize2, FiLayers } from "react-icons/fi"
import { RiRobot2Line, RiQuestionAnswerLine } from "react-icons/ri"
import { BsArrowRight, BsChatDots } from "react-icons/bs"
import ReactMarkdown from "react-markdown"
import copy from "copy-to-clipboard"
import toast from "react-hot-toast"
import { askCourseDoubt } from "../../../services/operations/courseDoubtAPI"

export default function VideoDoubtSection({
  courseId,
  courseEntireData,
  videoData,
}) {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [netraUrl, setNetraUrl] = useState("https://netra-agentic-ai.streamlit.app/")
  const [messages, setMessages] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [activeView, setActiveView] = useState("chat") // "chat" | "workspace"
  const [isExpanded, setIsExpanded] = useState(false)
  const chatBottomRef = useRef(null)
  const inputRef = useRef(null)

  const currentLectureTitle = videoData?.title || "Video Lecture"
  const currentCourseName = courseEntireData?.courseName || "Course"

  // Initialize or reset welcome message when video changes
  useEffect(() => {
    const welcomeMsg = {
      id: `welcome-${videoData?._id || "default"}`,
      role: "assistant",
      content: `👋 **Hi there! I'm Netra AI, your dedicated video tutorial doubt solver.**\n\nI'm here to help you understand **"${currentLectureTitle}"** from **${currentCourseName}**.\n\nAsk me anything about this lecture — whether you need a concept clarified, step-by-step code guidance, or practical examples!\n\nYou can also launch the full [Netra Agentic AI](${netraUrl}) workspace anytime for deep autonomous learning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([welcomeMsg])
  }, [videoData?._id, currentLectureTitle, currentCourseName, netraUrl])

  useEffect(() => {
    if (messages.length > 1) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  // Suggested prompt chips tailored to current video
  const suggestedPrompts = [
    `💡 Explain "${currentLectureTitle}" in simple terms`,
    `📝 Summarize key takeaways of this video`,
    `💻 Show a practical code example for this lecture`,
    `❓ Common interview questions on this topic`,
  ]

  const handleSend = async (queryToSend) => {
    const query = (typeof queryToSend === "string" ? queryToSend : question).trim()
    if (!query || loading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const historyContext = messages
        .filter((m) => !m.id.startsWith("welcome"))
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }))

      const result = await askCourseDoubt(query, courseId, {
        courseName: currentCourseName,
        videoTitle: currentLectureTitle,
        videoDescription: videoData?.description || "",
        history: historyContext,
      })

      if (result?.netraUrl) {
        setNetraUrl(result.netraUrl)
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result?.answer || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: result?.provider || "netra-ai",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error("Error asking doubt:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an issue. You can clear your doubt directly on **[Netra Agentic AI](${netraUrl})**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    copy(text)
    setCopiedId(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenNetraWithQuestion = (queryText) => {
    if (queryText) {
      copy(queryText)
      toast.success("Question copied to clipboard! Paste it into Netra AI.")
    }
    window.open(netraUrl, "_blank", "noopener,noreferrer")
  }

  const handleClearChat = () => {
    const welcomeMsg = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      content: `Chat cleared! Ask any doubt about **"${currentLectureTitle}"**, or jump into [Netra Agentic AI](${netraUrl}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([welcomeMsg])
    toast.success("Doubt thread reset")
  }

  return (
    <div
      id="netra-ai-qna"
      className={`mt-8 overflow-hidden rounded-xl border border-[rgba(6,182,212,0.25)] bg-[#0c1a2e]/85 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-[999] mt-0 bg-[#060d1a]" : "relative"
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(6,182,212,0.18)] bg-gradient-to-r from-[#060d1a] via-[#09182d] to-[#060d1a] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0284c7] text-[#060d1a] shadow-lg shadow-[rgba(6,182,212,0.25)]">
            <RiRobot2Line size={24} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#06b6d4]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#f0f9ff] tracking-wide flex items-center gap-1.5">
                Netra AI <span className="text-[#06b6d4]">Q&A</span>
              </h2>
              <span className="rounded-full border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] px-2.5 py-0.5 text-[11px] font-medium text-[#22d3ee]">
                Agentic Tutor
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] truncate max-w-md">
              Clearing doubts for: <span className="text-[#e2e8f0] font-medium">{currentLectureTitle}</span>
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex rounded-md bg-[#060d1a]/80 p-1 border border-[rgba(6,182,212,0.15)]">
            <button
              type="button"
              onClick={() => setActiveView("chat")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                activeView === "chat"
                  ? "bg-[#06b6d4] text-[#060d1a] shadow-md shadow-[rgba(6,182,212,0.25)]"
                  : "text-[#94a3b8] hover:text-[#f0f9ff]"
              }`}
            >
              <BsChatDots size={13} />
              AI Doubt Solver
            </button>
            <button
              type="button"
              onClick={() => setActiveView("workspace")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                activeView === "workspace"
                  ? "bg-[#06b6d4] text-[#060d1a] shadow-md shadow-[rgba(6,182,212,0.25)]"
                  : "text-[#94a3b8] hover:text-[#f0f9ff]"
              }`}
            >
              <FiLayers size={13} />
              Netra AI Workspace
            </button>
          </div>

          {/* External Link */}
          <a
            href={netraUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Launch Netra Agentic AI in full browser"
            className="flex items-center gap-1.5 rounded-md border border-[rgba(6,182,212,0.25)] bg-[rgba(6,182,212,0.08)] px-3 py-1.5 text-xs font-semibold text-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#060d1a] transition-all duration-150"
          >
            <span>Open Netra AI</span>
            <FiExternalLink size={13} />
          </a>

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
            className="rounded-md border border-[rgba(6,182,212,0.15)] p-2 text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#06b6d4] transition-all"
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === "chat" ? (
        <div className="flex flex-col">
          {/* Quick Suggested Prompt Chips */}
          <div className="border-b border-[rgba(6,182,212,0.1)] bg-[#060d1a]/50 px-6 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
              <span className="shrink-0 flex items-center gap-1 font-medium text-[#64748b]">
                <HiOutlineSparkles className="text-[#06b6d4]" />
                Suggested:
              </span>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 rounded-full border border-[rgba(6,182,212,0.2)] bg-[#0c1a2e] px-3 py-1 text-xs text-[#94a3b8] hover:border-[#06b6d4] hover:text-[#22d3ee] hover:bg-[rgba(6,182,212,0.08)] transition-all disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div
            className={`flex flex-col gap-4 overflow-y-auto p-6 scrollbar-thin ${
              isExpanded ? "h-[calc(100vh-250px)]" : "max-h-[500px] min-h-[320px]"
            }`}
          >
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant"
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0284c7] text-[#060d1a] shadow-md">
                      <RiRobot2Line size={18} />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] rounded-xl px-5 py-3.5 text-sm transition-all ${
                      isAssistant
                        ? "border border-[rgba(6,182,212,0.2)] bg-[#091526]/90 text-[#e2e8f0] shadow-md"
                        : "border border-[rgba(6,182,212,0.4)] bg-[#06334f] text-[#f0f9ff]"
                    }`}
                  >
                    {/* Header inside bubble */}
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-[11px] text-[#64748b]">
                      <span className="font-semibold text-[#06b6d4]">
                        {isAssistant ? "Netra AI Tutor" : "Your Doubt"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Body */}
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed break-words">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const codeString = String(children).replace(/\n$/, "")
                            if (inline) {
                              return (
                                <code
                                  className="rounded bg-[#0c1a2e] px-1.5 py-0.5 font-mono text-xs text-[#22d3ee] border border-[rgba(6,182,212,0.2)]"
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            }
                            return (
                              <div className="relative my-3 rounded-lg border border-[rgba(6,182,212,0.2)] bg-[#060d1a] overflow-hidden">
                                <div className="flex items-center justify-between bg-[#0c1a2e] px-3 py-1.5 text-[11px] text-[#94a3b8] border-b border-[rgba(6,182,212,0.15)]">
                                  <span>Code Snippet</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(codeString, `code-${codeString.slice(0, 10)}`)}
                                    className="flex items-center gap-1 text-[#06b6d4] hover:text-[#22d3ee]"
                                  >
                                    <FiCopy size={11} /> Copy
                                  </button>
                                </div>
                                <pre className="p-3 text-xs font-mono text-[#e2e8f0] overflow-x-auto">
                                  <code>{codeString}</code>
                                </pre>
                              </div>
                            )
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                          h1: ({ children }) => <h1 className="text-base font-bold text-[#f0f9ff] my-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-[#f0f9ff] my-1.5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-semibold text-[#06b6d4] my-1">{children}</h3>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#06b6d4] underline hover:text-[#22d3ee]"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Action Bar on AI message */}
                    {isAssistant && !msg.id.startsWith("welcome") && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[rgba(6,182,212,0.12)] pt-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 text-[#94a3b8] hover:text-[#06b6d4] transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <FiCheck size={12} className="text-[#10b981]" />
                              <span className="text-[#10b981]">Copied</span>
                            </>
                          ) : (
                            <>
                              <FiCopy size={12} />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenNetraWithQuestion(msg.content)}
                          className="flex items-center gap-1 text-[#94a3b8] hover:text-[#06b6d4] transition-colors ml-auto"
                        >
                          <FiExternalLink size={12} />
                          <span>Explore in Netra Agentic AI</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0284c7] text-[#060d1a] shadow-md animate-pulse">
                  <RiRobot2Line size={18} />
                </div>
                <div className="rounded-xl border border-[rgba(6,182,212,0.25)] bg-[#091526]/90 px-5 py-4 text-sm text-[#94a3b8] shadow-md flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#06b6d4] animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-[#22d3ee] animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-[#67e8f9] animate-bounce"></div>
                  </div>
                  <span>Netra AI is analyzing your tutorial doubt...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Box Footer */}
          <div className="border-t border-[rgba(6,182,212,0.18)] bg-[#060d1a]/80 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask Netra AI any doubt about "${currentLectureTitle}"...`}
                  disabled={loading}
                  className="w-full rounded-lg border border-[rgba(6,182,212,0.25)] bg-[#0c1a2e] px-4 py-3 pr-10 text-sm text-[#f0f9ff] placeholder:text-[#64748b] outline-none transition-all focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                />
                {question && (
                  <button
                    type="button"
                    onClick={() => setQuestion("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-[#f0f9ff]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-5 py-3 text-sm font-semibold text-[#060d1a] shadow-lg shadow-[rgba(6,182,212,0.25)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Ask Netra</span>
                <FiSend size={15} />
              </button>

              {messages.length > 2 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear doubt conversation"
                  className="rounded-lg border border-[rgba(6,182,212,0.2)] bg-[#0c1a2e] p-3 text-[#94a3b8] hover:border-[#ef4444] hover:text-[#ef4444] transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </form>

            <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
              <span className="flex items-center gap-1">
                <HiSparkles className="text-[#06b6d4]" />
                Direct AI tutor with video tutorial context
              </span>
              <a
                href={netraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#06b6d4] hover:underline"
              >
                Visit Netra Agentic AI Workspace ({netraUrl}) ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Embedded Netra AI Workspace Tab */
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-[rgba(6,182,212,0.15)] bg-[#060d1a] px-6 py-2.5 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
              <span>Live Netra Agentic AI Streamlit Application</span>
            </div>
            <a
              href={netraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-[#06b6d4] hover:underline"
            >
              Open in Full Window <FiExternalLink size={12} />
            </a>
          </div>

          <div
            className={`w-full bg-[#060d1a] relative ${
              isExpanded ? "h-[calc(100vh-170px)]" : "h-[580px]"
            }`}
          >
            <iframe
              src={netraUrl}
              title="Netra Agentic AI Workspace"
              className="h-full w-full border-0"
              allow="camera; microphone; clipboard-read; clipboard-write;"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </div>

          <div className="border-t border-[rgba(6,182,212,0.15)] bg-[#091422] p-3 text-center text-xs text-[#94a3b8]">
            Need full screen or experiencing browser frame restrictions?{" "}
            <a
              href={netraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#06b6d4] hover:underline"
            >
              Click here to launch Netra Agentic AI in a separate tab
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
