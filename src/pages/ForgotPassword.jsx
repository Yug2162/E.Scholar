import { useState } from "react"
import { BiArrowBack } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { getPasswordResetToken } from "../services/operations/authAPI"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(getPasswordResetToken(email, setEmailSent))
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px]">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-[#f0f9ff]">
            {!emailSent ? "Reset your password" : "Check email"}
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-[#94a3b8]">
            {!emailSent
              ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
              : `We have sent the reset email to ${email}`}
          </p>
          <form onSubmit={handleOnSubmit}>
            {!emailSent && (
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-[#94a3b8]">
                  Email Address <sup className="text-[#06b6d4]">*</sup>
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="form-style w-full"
                />
              </label>
            )}
            <button
              type="submit"
              className="mt-6 w-full border border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4] hover:text-[#060d1a] py-2.5 px-[12px] rounded-[4px] font-semibold text-sm transition-all duration-150"
            >
              {!emailSent ? "Sumbit" : "Resend Email"}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/login">
              <p className="flex items-center gap-x-2 text-[#94a3b8] hover:text-[#06b6d4] text-sm transition-colors duration-150">
                <BiArrowBack /> Back To Login
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword