import React from "react"
import ReactStars from "react-rating-stars-component"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, FreeMode, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"
import { FaStar } from "react-icons/fa"

const dummyReviews = [
  { user: { firstName: "Aryan", lastName: "Sharma", image: "" }, course: { courseName: "Learn HTML" }, review: "This course is absolutely amazing. Concepts are explained very clearly and the projects are super helpful.", rating: 4.8 },
  { user: { firstName: "Priya", lastName: "Verma", image: "" }, course: { courseName: "React JS Bootcamp" }, review: "Best React course I have taken. The instructor breaks down complex topics into simple understandable pieces.", rating: 5 },
  { user: { firstName: "Rohan", lastName: "Gupta", image: "" }, course: { courseName: "Node.js Backend" }, review: "Very practical course with real world projects. I got a job after completing this. Highly recommended.", rating: 4.7 },
  { user: { firstName: "Sneha", lastName: "Patel", image: "" }, course: { courseName: "CSS Mastery" }, review: "Loved the animations and layout sections. Finally understood Flexbox and Grid properly after this course.", rating: 4.5 },
  { user: { firstName: "Karan", lastName: "Mehta", image: "" }, course: { courseName: "DSA in JavaScript" }, review: "Crisp and to the point. Every topic is covered with examples and the coding exercises are well designed.", rating: 4.9 },
  { user: { firstName: "Aditi", lastName: "Singh", image: "" }, course: { courseName: "MongoDB Basics" }, review: "Great introduction to databases. The instructor explains schemas and queries in a very beginner friendly way.", rating: 4.6 },
  { user: { firstName: "Vikram", lastName: "Joshi", image: "" }, course: { courseName: "Fullstack MERN" }, review: "Completed the entire MERN stack course in 3 weeks. The project based approach made everything click instantly.", rating: 5 },
  { user: { firstName: "Nisha", lastName: "Rao", image: "" }, course: { courseName: "Python for Beginners" }, review: "Perfect for beginners. Step by step guidance and very supportive community. Will definitely take more courses.", rating: 4.8 },
]

function ReviewSlider() {
  const truncateWords = 15

  return (
    <div className="text-[#f0f9ff] w-full">
      <div className="my-[50px] h-[200px] w-full">
        <Swiper
          slidesPerView={4}
          spaceBetween={20}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {dummyReviews.map((review, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col gap-3 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-4 h-full">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/5.x/initials/svg?seed=${review.user.firstName} ${review.user.lastName}`}
                    alt=""
                    className="h-9 w-9 rounded-[4px] object-cover"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-semibold text-[#f0f9ff] text-sm">{`${review.user.firstName} ${review.user.lastName}`}</h1>
                    <h2 className="text-xs font-medium text-[#94a3b8]">{review.course.courseName}</h2>
                  </div>
                </div>
                <p className="text-sm text-[#94a3b8]">
                  {review.review.split(" ").length > truncateWords
                    ? `${review.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                    : review.review}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <h3 className="font-semibold text-[#06b6d4] text-sm">{review.rating.toFixed(1)}</h3>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={16}
                    edit={false}
                    activeColor="#06b6d4"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider


// import React, { useEffect, useState } from "react"
// import ReactStars from "react-rating-stars-component"
// // Import Swiper React components
// import { Swiper, SwiperSlide } from "swiper/react"
// import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// // Import Swiper styles
// import "swiper/css"
// import "swiper/css/free-mode"
// import "swiper/css/pagination"
// import "../../App.css"
// // Icons
// import { FaStar } from "react-icons/fa"
// // Import required modules


// // Get apiFunction and the endpoint
// import { apiConnector } from "../../services/apiConnector"
// import { ratingsEndpoints } from "../../services/apis"

// function ReviewSlider() {
//   const [reviews, setReviews] = useState([])
//   const truncateWords = 15

//   useEffect(() => {
//     ;(async () => {
//       const { data } = await apiConnector(
//         "GET",
//         ratingsEndpoints.REVIEWS_DETAILS_API
//       )
//       if (data?.success) {
//         setReviews(data?.data)
//       }
//     })()
//   }, [])

//   // console.log(reviews)

//   return (
//     <div className="text-[#f0f9ff]">
//       <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
//         <Swiper
//           slidesPerView={4}
//           spaceBetween={25}
//           loop={true}
//           freeMode={true}
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false,
//           }}
//           modules={[FreeMode, Pagination, Autoplay]}
//           className="w-[50vw] "
//         >
//           {reviews.map((review, i) => {
//             return (
//               <SwiperSlide key={i}>
//                 <div className="place-items-center flex flex-col gap-3 bg-[#0c1a2e] border border-[rgba(6,182,212,0.15)] rounded-[4px] p-4">
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={
//                         review?.user?.image
//                           ? review?.user?.image
//                           : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
//                       }
//                       alt=""
//                       className="h-9 w-9 rounded-[4px] object-cover"
//                     />
//                     <div className="flex flex-col">
//                       <h1 className="font-semibold text-[#f0f9ff]">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
//                       <h2 className="text-sm font-medium text-[#94a3b8]">
//                         {review?.course?.courseName}
//                       </h2>
//                     </div>
//                   </div>
//                   <p className="text-sm text-[#94a3b8]">
//                     {review?.review.split(" ").length > truncateWords
//                       ? `${review?.review
//                           .split(" ")
//                           .slice(0, truncateWords)
//                           .join(" ")} ...`
//                       : `${review?.review}`}
//                   </p>
//                   <div className="flex items-center gap-2 ">
//                     <h3 className="font-semibold text-[#06b6d4]">
//                       {review.rating.toFixed(1)}
//                     </h3>
//                     <ReactStars
//                       count={5}
//                       value={review.rating}
//                       size={20}
//                       edit={false}
//                       activeColor="#06b6d4"
//                       color="rgba(6,182,212,0.2)"
//                       emptyIcon={<FaStar className="text-[rgba(6,182,212,0.2)]" />}
//                       fullIcon={<FaStar className="text-[#06b6d4]" />}
//                     />
//                   </div>
//                 </div>
//               </SwiperSlide>
//             )
//           })}
         
//         </Swiper>
//       </div>
//     </div>
//   )
// }

// export default ReviewSlider