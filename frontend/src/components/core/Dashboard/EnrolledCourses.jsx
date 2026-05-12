import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getUserEnrolledCourses(token)
        const filterPublishCourse = res.filter((ele) => ele.status !== "Draft")
        setEnrolledCourses(filterPublishCourse)
      } catch (error) {
        console.log("Could not fetch enrolled courses.")
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCourse = (course) => {
    navigate(
      `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
    )
  }

  return (
    <>
      <div className="text-2xl text-richblack-50 sm:text-3xl">
        Enrolled Courses
      </div>

      {!enrolledCourses ? (
        <div className="grid min-h-[50vh] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          <div className="space-y-4 md:hidden">
            {enrolledCourses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800"
              >
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="h-44 w-full object-cover"
                />
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-richblack-5">
                      {course.courseName}
                    </p>
                    <p className="text-sm text-richblack-300">
                      {course.courseDescription.length > 110
                        ? `${course.courseDescription.slice(0, 110)}...`
                        : course.courseDescription}
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-lg bg-richblack-700/40 p-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-richblack-300">
                        Duration
                      </p>
                      <p className="mt-1 text-sm font-medium text-richblack-5">
                        {course?.totalDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-richblack-300">
                        Progress
                      </p>
                      <p className="mt-1 text-sm font-medium text-richblack-5">
                        {course.progressPercentage || 0}%
                      </p>
                      <div className="mt-2">
                        <ProgressBar
                          completed={course.progressPercentage || 0}
                          height="8px"
                          isLabelVisible={false}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCourse(course)}
                    className="w-full rounded-md bg-yellow-50 px-4 py-3 text-sm font-semibold text-richblack-900"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-richblack-700 md:block">
            <div className="flex bg-richblack-500">
              <p className="w-[45%] px-5 py-3">Course Name</p>
              <p className="w-1/4 px-2 py-3">Duration</p>
              <p className="flex-1 px-2 py-3">Progress</p>
            </div>

            {enrolledCourses.map((course, i, arr) => (
              <div
                className={`flex items-center border-t border-richblack-700 ${
                  i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                }`}
                key={course._id}
              >
                <div
                  className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                  onClick={() => openCourse(course)}
                >
                  <img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="text-xs text-richblack-300">
                      {course.courseDescription.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription}
                    </p>
                  </div>
                </div>
                <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>
                <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                  <p>Progress: {course.progressPercentage || 0}%</p>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
