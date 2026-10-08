import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../Common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  return (
    <>
      <h1 className="mb-14 text-3xl font-bold text-[#f0f9ff] pb-4 border-b border-[rgba(6,182,212,0.15)]">
        My Profile
      </h1>
      <div className="flex items-center justify-between rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-8 px-12">
        <div className="flex items-center gap-x-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-[4px] object-cover border-2 border-[rgba(6,182,212,0.3)]"
          />
          <div className="space-y-1">
            <p className="text-xl font-bold text-[#f0f9ff]">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-sm text-[#94a3b8]">{user?.email}</p>
          </div>
        </div>
        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>
      <div className="my-10 flex flex-col gap-y-10 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-[#f0f9ff]">About</p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? "text-[#f0f9ff]"
              : "text-[#94a3b8]"
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>
      <div className="my-10 flex flex-col gap-y-10 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-8 px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-[#f0f9ff]">
            Personal Details
          </p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <div className="flex max-w-[500px] justify-between">
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">First Name</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {user?.firstName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">Email</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">Gender</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {user?.additionalDetails?.gender ?? "Add Gender"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">Last Name</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {user?.lastName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">Phone Number</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-[#94a3b8]">Date Of Birth</p>
              <p className="text-sm font-medium text-[#f0f9ff]">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ??
                  "Add Date Of Birth"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}