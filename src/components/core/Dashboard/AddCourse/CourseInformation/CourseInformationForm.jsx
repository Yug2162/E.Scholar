import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../Common/IconBtn"
import Upload from "../Upload"
import ChipInput from "./ChipInput"
import RequirementsField from "./RequirementsField"

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { course, editCourse } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      const categories = await fetchCourseCategories()
      if (categories.length > 0) {
        setCourseCategories(categories)
      }
      setLoading(false)
    }
    if (editCourse) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseTags", course.tag)
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.category)
      setValue("courseRequirements", course.instructions)
      setValue("courseImage", course.thumbnail)
    }
    getCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseTags.toString() !== course.tag.toString() ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory._id !== course.category._id ||
      currentValues.courseRequirements.toString() !==
        course.instructions.toString() ||
      currentValues.courseImage !== course.thumbnail
    ) {
      return true
    }
    return false
  }

  const generateDescription = async () => {
    const title = getValues("courseTitle")
    const tags = getValues("courseTags")

    if (!title) {
      toast.error("Enter a course title first")
      return
    }

    const topics =
      Array.isArray(tags) && tags.length > 0 ? tags.join(", ") : title

    setGenerating(true)
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/course/generateDescription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseTitle: title, topics }),
        }
      )
      const data = await res.json()
      if (data.success) {
        setValue("courseShortDesc", data.description)
        toast.success("Description generated!")
      } else {
        toast.error("Generation failed")
      }
    } catch (err) {
      toast.error("Something went wrong")
    }
    setGenerating(false)
  }

  const onSubmit = async (data) => {
    if (editCourse) {
      if (isFormUpdated()) {
        const currentValues = getValues()
        const formData = new FormData()
        formData.append("courseId", course._id)
        if (currentValues.courseTitle !== course.courseName)
          formData.append("courseName", data.courseTitle)
        if (currentValues.courseShortDesc !== course.courseDescription)
          formData.append("courseDescription", data.courseShortDesc)
        if (currentValues.coursePrice !== course.price)
          formData.append("price", data.coursePrice)
        if (currentValues.courseTags.toString() !== course.tag.toString())
          formData.append("tag", JSON.stringify(data.courseTags))
        if (currentValues.courseBenefits !== course.whatYouWillLearn)
          formData.append("whatYouWillLearn", data.courseBenefits)
        if (currentValues.courseCategory._id !== course.category._id)
          formData.append("category", data.courseCategory)
        if (
          currentValues.courseRequirements.toString() !==
          course.instructions.toString()
        )
          formData.append(
            "instructions",
            JSON.stringify(data.courseRequirements)
          )
        if (currentValues.courseImage !== course.thumbnail)
          formData.append("thumbnailImage", data.courseImage)
        setLoading(true)
        const result = await editCourseDetails(formData, token)
        setLoading(false)
        if (result) {
          dispatch(setStep(2))
          dispatch(setCourse(result))
        }
      } else {
        toast.error("No changes made to the form")
      }
      return
    }

    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("category", data.courseCategory)
    formData.append("status", COURSE_STATUS.DRAFT)
    formData.append("instructions", JSON.stringify(data.courseRequirements))
    formData.append("thumbnailImage", data.courseImage)
    setLoading(true)
    const result = await addCourseDetails(formData, token)
    if (result) {
      dispatch(setStep(2))
      dispatch(setCourse(result))
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-[4px] border border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] p-6"
    >
      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-medium text-[#94a3b8]" htmlFor="courseTitle">
          Course Title <sup className="text-[#06b6d4]">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
            Course title is required
          </span>
        )}
      </div>

      {/* Course Short Description */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#94a3b8]" htmlFor="courseShortDesc">
            Course Short Description <sup className="text-[#06b6d4]">*</sup>
          </label>
          <div className="flex items-center gap-x-2">
  <button
    type="button"
    onClick={generateDescription}
    disabled={generating}
    className="flex items-center gap-x-1.5 rounded-[4px] border border-[rgba(6,182,212,0.3)] px-3 py-1 text-xs text-[#06b6d4] transition-all duration-150 hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {generating ? (
      <>
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#06b6d4] border-t-transparent" />
        Generating...
      </>
    ) : (
      "✨ AI Generate"
    )}
  </button>

  {getValues("courseShortDesc") && (
    <button
      type="button"
      onClick={generateDescription}
      disabled={generating}
      className="flex items-center gap-x-1 rounded-[4px] border border-[rgba(148,163,184,0.3)] px-3 py-1 text-xs text-[#94a3b8] transition-all duration-150 hover:border-[#94a3b8] hover:text-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ↻ Regenerate
    </button>
  )}
</div>
        </div>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description or use AI Generate above"
          {...register("courseShortDesc", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
            Course Description is required
          </span>
        )}
      </div>

      {/* Course Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-medium text-[#94a3b8]" htmlFor="coursePrice">
          Course Price <sup className="text-[#06b6d4]">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", {
              required: true,
              valueAsNumber: true,
              pattern: {
                value: /^(0|[1-9]\d*)(\.\d+)?$/,
              },
            })}
            className="form-style w-full !pl-12"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-[#94a3b8]" />
        </div>
        {errors.coursePrice && (
          <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
            Course Price is required
          </span>
        )}
      </div>

      {/* Course Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-medium text-[#94a3b8]" htmlFor="courseCategory">
          Course Category <sup className="text-[#06b6d4]">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          className="form-style w-full"
          style={{ backgroundColor: "#0c1a2e", color: "#f0f9ff" }}
        >
          <option value="" disabled style={{ backgroundColor: "#0c1a2e", color: "#94a3b8" }}>
            Choose a Category
          </option>
          {!loading &&
            courseCategories?.map((category, indx) => (
              <option
                key={indx}
                value={category?._id}
                style={{ backgroundColor: "#0c1a2e", color: "#f0f9ff" }}
              >
                {category?.name}
              </option>
            ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
            Course Category is required
          </span>
        )}
      </div>

      {/* Course Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

      {/* Course Thumbnail Image */}
      <Upload
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null}
      />

      {/* Benefits of the course */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-medium text-[#94a3b8]" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-[#06b6d4]">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits of the course"
          {...register("courseBenefits", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
            Benefits of the course is required
          </span>
        )}
      </div>

      {/* Requirements/Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />

      {/* Next Button */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className="flex cursor-pointer items-center gap-x-2 rounded-[4px] border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] py-[8px] px-[20px] text-sm transition-all duration-150"
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={!editCourse ? "Next" : "Save Changes"}
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}