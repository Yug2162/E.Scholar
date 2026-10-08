import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"


function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  // console.log("Student already enrolled ", course?.studentsEnroled, user?._id)

  return (
    <>
      <div
        className={`flex flex-col gap-4 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-5 text-[#f0f9ff]`}
      >
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-[4px] border border-[rgba(6,182,212,0.15)] object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="space-x-3 pb-4 text-3xl font-bold text-[#06b6d4]">
            Rs. {CurrentPrice}
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="w-full border border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4] hover:text-[#060d1a] px-5 py-2.5 rounded-[4px] text-sm font-semibold transition-all duration-150"
              onClick={
                user && course?.studentsEnroled.includes(user?._id)
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
            >
              {user && course?.studentsEnroled.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button>
            {(!user || !course?.studentsEnroled.includes(user?._id)) && (
              <button
                onClick={handleAddToCart}
                className="w-full border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] py-2.5 rounded-[4px] transition-all duration-150"
              >
                Add to Cart
              </button>
            )}
          </div>
          <div>
            <p className="pb-3 pt-6 text-center text-sm text-[#94a3b8]">
              30-Day Money-Back Guarantee
            </p>
          </div>

          <div className={``}>
            <p className={`my-2 text-xl font-semibold text-[#f0f9ff]`}>
              This Course Includes :
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#94a3b8]">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className={`flex gap-2`} key={i}>
                    <BsFillCaretRightFill className="text-[#06b6d4]" />
                    <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-[#94a3b8] hover:text-[#06b6d4] text-xs underline transition-colors duration-150"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard