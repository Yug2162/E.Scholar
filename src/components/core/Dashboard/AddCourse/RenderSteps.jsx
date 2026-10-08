import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course)

  const steps = [
    {
      id: 1,
      title: "Course Information",
    },
    {
      id: 2,
      title: "Course Builder",
    },
    {
      id: 3,
      title: "Publish",
    },
  ]

  return (
    <>
      <div className="relative mb-2 flex w-full justify-center">
        {steps.map((item) => (
          <>
            <div
              className="flex flex-col items-center"
              key={item.id}
            >
              <button
                className={`grid cursor-default aspect-square w-[34px] place-items-center rounded-[4px] border ${
                  step === item.id
                    ? "border-[#06b6d4] bg-[#06b6d4] text-[#060d1a] font-bold"
                    : "border-[rgba(6,182,212,0.15)] bg-[#0c1a2e] text-[#94a3b8]"
                } ${step > item.id && "border-[#06b6d4] bg-transparent text-[#06b6d4]"} `}
              >
                {step > item.id ? (
                  <FaCheck className="font-bold text-[#06b6d4]" />
                ) : (
                  item.id
                )}
              </button>
            </div>
            {item.id !== steps.length && (
              <>
                <div
                  className={`h-[calc(34px/2)] w-[33%] border-dashed border-b-2 ${
                    step > item.id ? "border-[#06b6d4]" : "border-[rgba(6,182,212,0.15)]"
                  } `}
                ></div>
              </>
            )}
          </>
        ))}
      </div>

      <div className="relative mb-16 flex w-full select-none justify-between">
        {steps.map((item) => (
          <>
            <div
              className="flex min-w-[130px] flex-col items-center gap-y-2"
              key={item.id}
            >
              <p
                className={`text-sm ${
                  step >= item.id ? "text-[#06b6d4]" : "text-[#94a3b8]"
                }`}
              >
                {item.title}
              </p>
            </div>
          </>
        ))}
      </div>
      {/* Render specific component based on current step */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  )
}