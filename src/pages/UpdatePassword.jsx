import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { BiArrowBack } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { resetPassword } from "../services/operations/authAPI"

function UpdatePassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { loading } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    const token = location.pathname.split("/").at(-1)
    dispatch(resetPassword(password, confirmPassword, token, navigate))
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px]">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-[#f0f9ff]">
            Choose new password
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-[#94a3b8]">
            Almost done. Enter your new password and youre all set.
          </p>
          <form onSubmit={handleOnSubmit}>
            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-[#94a3b8]">
                New Password <sup className="text-[#06b6d4]">*</sup>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter Password"
                className="form-style w-full !pr-10"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-150"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
            </label>
            <label className="relative mt-3 block">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-[#94a3b8]">
                Confirm New Password <sup className="text-[#06b6d4]">*</sup>
              </p>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm Password"
                className="form-style w-full !pr-10"
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-150"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
            </label>

            <button
              type="submit"
              className="mt-6 w-full border border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4] hover:text-[#060d1a] py-2.5 px-[12px] rounded-[4px] font-semibold text-sm transition-all duration-150"
            >
              Reset Password
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

export default UpdatePassword