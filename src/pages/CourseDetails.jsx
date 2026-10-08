import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import ReactMarkdown from "react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/Common/ConfirmationModal"
import Footer from "../components/Common/Footer"
import RatingStars from "../components/Common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import CourseDoubtBox from "../components/core/Course/CourseDoubtBox"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { BuyCourse } from "../services/operations/studentFeaturesAPI"
import GetAvgRating from "../utils/avgRating"
import Error from "./Error"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Getting courseId from url parameter
  const { courseId } = useParams()
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    ;(async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        // console.log("course details res: ", res)
        setResponse(res)
      } catch (error) {
        console.log("Could not fetch Course Details")
      }
    })()
  }, [courseId])

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])
  // console.log("avgReviewCount: ", avgReviewCount)

  // // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e !== id)
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!response.success) {
    return <Error />
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnroled,
    createdAt,
  } = response.data?.courseDetails

  const handleBuyCourse = () => {
    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  if (paymentLoading) {
    // console.log("payment loading")
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative w-full bg-[#0c1a2e] border-b border-[rgba(6,182,212,0.15)]`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            <div className="relative block max-h-[30rem] lg:hidden">
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full border border-[rgba(6,182,212,0.15)] rounded-[4px]"
              />
            </div>
            <div
              className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-[#f0f9ff]`}
            >
              <div>
                <p className="text-2xl font-bold text-[#f0f9ff] sm:text-[42px]">
                  {courseName}
                </p>
              </div>
              <p className={`text-[#94a3b8]`}>{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-[#06b6d4] font-bold">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span className="text-[#94a3b8] text-sm">{`(${ratingAndReviews.length} reviews)`}</span>
                <span className="text-[#94a3b8] text-sm">{`${studentsEnroled.length} students enrolled`}</span>
              </div>
              <div>
                <p className="text-[#06b6d4]">
                  Created By {`${instructor.firstName} ${instructor.lastName}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-5 text-lg text-[#94a3b8]">
                <p className="flex items-center gap-2">
                  {" "}
                  <BiInfoCircle /> Created at {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  {" "}
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 border-y border-[rgba(6,182,212,0.15)] py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-[#06b6d4]">
                Rs. {price}
              </p>
              <button
                className="border border-[#06b6d4] text-[#06b6d4] bg-transparent hover:bg-[#06b6d4] hover:text-[#060d1a] px-5 py-2.5 rounded-[4px] text-sm font-semibold transition-all duration-150"
                onClick={handleBuyCourse}
              >
                Buy Now
              </button>
              <button className="border border-[rgba(6,182,212,0.15)] text-[#94a3b8] bg-transparent hover:border-[#06b6d4] hover:text-[#06b6d4] px-5 py-2.5 rounded-[4px] text-sm transition-all duration-150">
                Add to Cart
              </button>
            </div>
          </div>
          {/* Courses Card */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto box-content px-4 text-start text-[#f0f9ff] lg:w-[1260px] bg-[#060d1a]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What will you learn section */}
          <div className="my-8 border border-[rgba(6,182,212,0.15)] rounded-[4px] p-8">
            <p className="text-3xl font-semibold text-[#f0f9ff]">What you'll learn</p>
            <div className="mt-5 text-[#94a3b8]">
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold text-[#f0f9ff]">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2 text-[#94a3b8] text-sm">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  <span>{response.data?.totalDuration} total length</span>
                </div>
                <div>
                  <button
                    className="text-[#06b6d4] hover:text-[#67e8f9] transition-colors duration-150"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>
            <CourseDoubtBox courseId={courseId} />


            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold text-[#f0f9ff]">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-[4px] object-cover border border-[rgba(6,182,212,0.15)]"
                />
                <p className="text-lg text-[#06b6d4]">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>
              <p className="text-[#94a3b8]">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails