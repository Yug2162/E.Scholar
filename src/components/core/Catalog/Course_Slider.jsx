import React, { useEffect, useState } from "react"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

import { FreeMode, Pagination } from "swiper/modules"
// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
// import "../../.."
// Import required modules

// import { getAllCourses } from "../../services/operations/courseDetailsAPI"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          modules={[FreeMode, Pagination]}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[30rem] bg-[#060d1a]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-[#f0f9ff]">No Course Found</p>
      )}
    </>
  )
}

export default Course_Slider