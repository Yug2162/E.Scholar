import { FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleDeleteAccount() {
    try {
      dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <div className="my-10 flex flex-row gap-x-5 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-[4px] p-5">
        <div className="flex aspect-square h-14 w-14 items-center justify-center rounded-[4px] bg-[rgba(239,68,68,0.1)]">
          <FiTrash2 className="text-3xl text-[#ef4444]" />
        </div>
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-[#ef4444]">
            Delete Account
          </h2>
          <div className="w-3/5 text-[#94a3b8] text-sm">
            <p>Would you like to delete account?</p>
            <p>
              This account may contain Paid Courses. Deleting your account is
              permanent and will remove all the contain associated with it.
            </p>
          </div>
          <button
            type="button"
            className="w-fit cursor-pointer border border-[#ef4444] text-[#ef4444] bg-transparent hover:bg-[#ef4444] hover:text-[#060d1a] px-4 py-2 rounded-[4px] text-sm transition-all duration-150"
            onClick={handleDeleteAccount}
          >
            I want to delete my account.
          </button>
        </div>
      </div>
    </>
  )
}