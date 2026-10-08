import React, { useEffect, useState } from "react"
// Icons
import { FaRegStar, FaStar } from "react-icons/fa"
import ReactStars from "react-rating-stars-component"
import { Link } from "react-router-dom"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../Common/RatingStars"

function Course_Card({ course, Height }) {
  // const avgReviewCount = GetAvgRating(course.ratingAndReviews)
  // console.log(course.ratingAndReviews)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])
  // console.log("count............", avgReviewCount)

  return (
    <>
      <Link to={`/courses/${course._id}`}>
        <div className="bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] hover:border-[#06b6d4] transition-all duration-200 overflow-hidden">
          <div className="">
            <img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full object-cover `}
            />
          </div>
          <div className="flex flex-col gap-2 px-3 py-3">
            <p className="text-sm font-semibold text-[#f0f9ff]">{course?.courseName}</p>
            <p className="text-xs text-[#94a3b8]">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[#06b6d4] font-bold text-xs">{avgReviewCount || 0}</span>
            
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-[#94a3b8] text-xs">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <p className="text-[#06b6d4] font-bold pb-3">Rs. {course?.price}</p>
          </div>
        </div>
      </Link>
    </>
  )
}

export default Course_Card