import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { verifyCertificate } from "../services/operations/certificateAPI"

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await verifyCertificate(certificateId)
      setResult(res)
      setLoading(false)
    })()
  }, [certificateId])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#060d1a] px-4">
      <div className="w-full max-w-md rounded-[8px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="spinner"></div>
          </div>
        ) : result?.success ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(6,182,212,0.1)] text-xl text-[#06b6d4]">
                ✓
              </span>
              <p className="text-lg font-bold text-[#f0f9ff]">Certificate Verified</p>
            </div>
            <div className="space-y-3 border-t border-[rgba(6,182,212,0.15)] pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Student</p>
                <p className="font-semibold text-[#f0f9ff]">{result.data.studentName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Course</p>
                <p className="font-semibold text-[#f0f9ff]">{result.data.courseName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Issued On</p>
                <p className="font-semibold text-[#f0f9ff]">{result.data.issuedDate}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#94a3b8]">Certificate ID</p>
                <p className="font-mono text-sm text-[#06b6d4]">{result.data.certificateId}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(248,113,113,0.1)] text-xl text-[#f87171]">
                ✕
              </span>
              <p className="text-lg font-bold text-[#f0f9ff]">Certificate Not Found</p>
            </div>
            <p className="text-sm text-[#94a3b8]">
              We couldn't verify a certificate with ID{" "}
              <span className="font-mono text-[#f0f9ff]">{certificateId}</span>. Please
              check the ID and try again.
            </p>
          </>
        )}
      </div>
    </div>
  )
}