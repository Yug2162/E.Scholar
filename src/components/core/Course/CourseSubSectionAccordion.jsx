import React, { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import { HiOutlineVideoCamera } from "react-icons/hi"

function CourseSubSectionAccordion({ subSec }) {
  return (
    <div>
      <div className="flex justify-between py-2 px-4 text-[#94a3b8] text-sm hover:text-[#f0f9ff] transition-colors duration-150">
        <div className={`flex items-center gap-2`}>
          <span className="text-[#06b6d4] text-xs">
            <HiOutlineVideoCamera />
          </span>
          <p>{subSec?.title}</p>
        </div>
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion