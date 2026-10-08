import { useSelector } from "react-redux"

import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)
  const { paymentLoading } = useSelector((state) => state.course)

  if (paymentLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner"></div>
      </div>
    )

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-[#f0f9ff]">Cart</h1>
      <p className="border-b border-b-[rgba(6,182,212,0.15)] pb-2 font-semibold text-[#94a3b8]">
        {totalItems} Courses in Cart
      </p>
      {total > 0 ? (
        <div className="mt-8 flex flex-col-reverse items-start gap-x-10 gap-y-6 lg:flex-row">
          <RenderCartCourses />
          <RenderTotalAmount />
        </div>
      ) : (
        <p className="mt-14 text-center text-3xl text-[#94a3b8]">
          Your cart is empty
        </p>
      )}
    </>
  )
}