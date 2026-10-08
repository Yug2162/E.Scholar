import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/IconBtn"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    // console.log("password Data - ", data)
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitPasswordForm)}>
        <div className="my-10 flex flex-col gap-y-6 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-6">
          <h2 className="text-lg font-semibold text-[#f0f9ff] pb-3 border-b border-[rgba(6,182,212,0.15)] mb-5">Password</h2>
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="oldPassword" className="text-[#94a3b8] text-xs font-medium mb-1 block">
                Current Password
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter Current Password"
                className="form-style"
                {...register("oldPassword", { required: true })}
              />
              <span
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-150"
              >
                {showOldPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
              {errors.oldPassword && (
                <span className="-mt-1 text-[12px] text-[#06b6d4]">
                  Please enter your Current Password.
                </span>
              )}
            </div>
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="newPassword" className="text-[#94a3b8] text-xs font-medium mb-1 block">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter New Password"
                className="form-style"
                {...register("newPassword", { required: true })}
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-150"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
              {errors.newPassword && (
                <span className="-mt-1 text-[12px] text-[#06b6d4]">
                  Please enter your New Password.
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              navigate("/dashboard/my-profile")
            }}
            className="border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] px-5 py-2.5 rounded-[4px] text-sm transition-all duration-150"
          >
            Cancel
          </button>
          <IconBtn type="submit" text="Update" />
        </div>
      </form>
    </>
  )
}