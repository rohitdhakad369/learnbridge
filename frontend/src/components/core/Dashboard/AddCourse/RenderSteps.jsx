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
      <div className="mb-10 overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-[320px] items-start">
          {steps.map((item, index) => (
            <div key={item.id} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center">
                <button
                  className={`grid aspect-square w-[34px] cursor-default place-items-center rounded-full border-[1px] ${
                    step === item.id
                      ? "border-yellow-50 bg-yellow-900 text-yellow-50"
                      : "border-richblack-700 bg-richblack-800 text-richblack-300"
                  } ${step > item.id && "bg-yellow-50 text-yellow-50"}`}
                >
                  {step > item.id ? (
                    <FaCheck className="font-bold text-richblack-900" />
                  ) : (
                    item.id
                  )}
                </button>

                <p
                  className={`mt-3 text-center text-xs sm:text-sm ${
                    step >= item.id ? "text-richblack-5" : "text-richblack-500"
                  }`}
                >
                  {item.title}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`mt-[17px] h-px flex-1 border-b-2 border-dashed ${
                    step > item.id ? "border-yellow-50" : "border-richblack-500"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  )
}
