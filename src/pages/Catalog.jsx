import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"

// import CourseCard from "../components/Catalog/CourseCard"
// import CourseSlider from "../components/Catalog/CourseSlider"
import Footer from "../components/Common/Footer"
import CourseCard from "../components/core/Catalog/Course_Card"
import CourseSlider from "../components/core/Catalog/Course_Slider"
import { apiConnector } from "../services/apiConnector"
import { categories } from "../services/apis"
import { getCatalogPageData } from "../services/operations/pageAndComponntDatas"
import Error from "./Error"

function Catalog() {
  const { loading } = useSelector((state) => state.profile)
  const { catalogName } = useParams()
  const [active, setActive] = useState(1)
  const [catalogPageData, setCatalogPageData] = useState(null)
  const [categoryId, setCategoryId] = useState("")
  const [categoryNotFound, setCategoryNotFound] = useState(false)

  // Fetch All Categories
  useEffect(() => {
    setCategoryNotFound(false)
    setCategoryId("")
    setCatalogPageData(null)
    ;(async () => {
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        const matchedCategory = res?.data?.data?.find(
          (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        )

        if (!matchedCategory) {
          console.log(`No category found matching "${catalogName}"`)
          setCategoryNotFound(true)
          return
        }

        setCategoryId(matchedCategory._id)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
        setCategoryNotFound(true)
      }
    })()
  }, [catalogName])

  useEffect(() => {
    if (categoryId) {
      ;(async () => {
        try {
          const res = await getCatalogPageData(categoryId)
          setCatalogPageData(res)
        } catch (error) {
          console.log(error)
        }
      })()
    }
  }, [categoryId])

  // No matching category for this catalogName -> show Error page instead of spinning forever
  if (categoryNotFound) {
    return <Error />
  }

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#060d1a]">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!loading && !catalogPageData.success) {
    return <Error />
  }

  return (
    <>
      {/* Hero Section */}
      <div className=" box-content bg-[#0c1a2e] border-b border-[rgba(6,182,212,0.15)] px-4">
        <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
          <p className="text-sm text-[#94a3b8]">
            {`Home / Catalog / `}
            <span className="text-[#06b6d4]">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>
          <p className="text-3xl font-bold text-[#f0f9ff]">
            {catalogPageData?.data?.selectedCategory?.name}
          </p>
          <p className="max-w-[870px] text-[#94a3b8]">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* Section 1 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent bg-[#060d1a]">
        <div className="text-[#f0f9ff] font-semibold text-xl mb-4">Courses to get you started</div>
        <div className="my-4 flex border-b border-b-[rgba(6,182,212,0.15)] text-sm">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? "border-b-2 border-[#06b6d4] text-[#06b6d4] font-semibold"
                : "text-[#94a3b8] hover:text-[#f0f9ff]"
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Populer
          </p>
          <p
            className={`px-4 py-2 ${
              active === 2
                ? "border-b-2 border-[#06b6d4] text-[#06b6d4] font-semibold"
                : "text-[#94a3b8] hover:text-[#f0f9ff]"
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        <div>
          {catalogPageData?.data?.selectedCategory?.courses?.length > 0 ? (
            <CourseSlider
              Courses={catalogPageData?.data?.selectedCategory?.courses}
            />
          ) : (
            <p className="text-[#94a3b8]">No courses found in this category yet.</p>
          )}
        </div>
      </div>
      {/* Section 2 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent bg-[#060d1a]">
        <div className="text-[#f0f9ff] font-semibold text-xl mb-4">
          Top courses in {catalogPageData?.data?.differentCategory?.name}
        </div>
        <div className="py-8">
          {catalogPageData?.data?.differentCategory?.courses?.length > 0 ? (
            <CourseSlider
              Courses={catalogPageData?.data?.differentCategory?.courses}
            />
          ) : (
            <p className="text-[#94a3b8]">No courses found here yet.</p>
          )}
        </div>
      </div>

      {/* Section 3 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent bg-[#060d1a]">
        <div className="text-[#f0f9ff] font-semibold text-xl mb-4">Frequently Bought</div>
        <div className="py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {catalogPageData?.data?.mostSellingCourses
              ?.slice(0, 4)
              .map((course, i) => (
                <CourseCard course={course} key={i} Height={"h-[400px]"} />
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Catalog