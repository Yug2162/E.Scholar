import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { RxCross2 } from "react-icons/rx"
import ReactStars from "react-rating-stars-component"
import { useSelector } from "react-redux"

import { createRating } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../Common/IconBtn"

export default function CourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { courseEntireData } = useSelector((state) => state.viewCourse)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    setValue("courseExperience", "")
    setValue("courseRating", 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating)
  }

  const onSubmit = async (data) => {
    await createRating(
      {
        courseId: courseEntireData._id,
        rating: data.courseRating,
        review: data.courseExperience,
      },
      token
    )
    setReviewModal(false)
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-[rgba(6,13,26,0.9)] backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e]">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-[4px] bg-[#060d1a] border-b border-[rgba(6,182,212,0.15)] p-5">
          <p className="text-xl font-semibold text-[#f0f9ff]">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-[#94a3b8] hover:text-[#f0f9ff] transition-colors duration-150" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className="aspect-square w-[50px] rounded-[4px] object-cover border border-[rgba(6,182,212,0.15)]"
            />
            <div>
              <p className="font-semibold text-[#f0f9ff]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-[#94a3b8]">Posting Publicly</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            <ReactStars
              count={5}
              onChange={ratingChanged}
              size={24}
              activeColor="#06b6d4"
            />
            <div className="flex w-11/12 flex-col space-y-2 mt-4">
              <label
                className="text-xs font-medium text-[#94a3b8]"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-[#06b6d4]">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Add Your Experience"
                {...register("courseExperience", { required: true })}
                className="form-style resize-x-none min-h-[130px] w-full"
              />
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
                  Please Add Your Experience
                </span>
              )}
            </div>
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className="flex cursor-pointer items-center gap-x-2 rounded-[4px] border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] py-[8px] px-[20px] text-sm transition-all duration-150"
              >
                Cancel
              </button>
              <IconBtn text="Save" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}