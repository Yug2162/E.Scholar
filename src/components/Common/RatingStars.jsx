import React, { useEffect, useState } from "react"
import {
  TiStarFullOutline,
  TiStarHalfOutline,
  TiStarOutline,
} from "react-icons/ti"

function RatingStars({ Review_Count, Star_Size }) {
  const [starCount, SetStarCount] = useState({
    full: 0,
    half: 0,
    empty: 0,
  })

  useEffect(() => {
    const wholeStars = Math.floor(Review_Count) || 0
    SetStarCount({
      full: wholeStars,
      half: Number.isInteger(Review_Count) ? 0 : 1,
      empty: Number.isInteger(Review_Count) ? 5 - wholeStars : 4 - wholeStars,
    })
  }, [Review_Count])
  return (
    <div className="flex gap-1">
      {[...new Array(starCount.full)].map((_, i) => {
        return <TiStarFullOutline key={i} size={Star_Size || 20} className="text-[#06b6d4]" />
      })}
      {[...new Array(starCount.half)].map((_, i) => {
        return <TiStarHalfOutline key={i} size={Star_Size || 20} className="text-[#06b6d4]" />
      })}
      {[...new Array(starCount.empty)].map((_, i) => {
        return <TiStarOutline key={i} size={Star_Size || 20} className="text-[rgba(6,182,212,0.2)]" />
      })}
    </div>
  )
}

export default RatingStars
