import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2, FiEye } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"

import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { formatDate } from "../../../../services/formatDate"
import {
  deleteCourse,
  fetchInstructorCourses,
} from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../Common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId: courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
  }

  const openClassroom = (courseId) => {
    navigate(`/view-course/${courseId}`)
  }

  const editCourse = (courseId) => {
    navigate(`/dashboard/edit-course/${courseId}`)
  }

  const renderStatus = (course) => {
    if (course.status === COURSE_STATUS.DRAFT) {
      return (
        <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
          <HiClock size={14} />
          Drafted
        </p>
      )
    }

    return (
      <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
          <FaCheck size={8} />
        </span>
        Published
      </p>
    )
  }

  const renderActions = (course) => (
    <>
      <button
        disabled={loading}
        onClick={() => openClassroom(course._id)}
        title="Open Classroom"
        className="rounded-md border border-richblack-700 p-2 transition-all duration-200 hover:scale-105 hover:text-yellow-50"
      >
        <FiEye size={18} />
      </button>
      <button
        disabled={loading}
        onClick={() => editCourse(course._id)}
        title="Edit"
        className="rounded-md border border-richblack-700 p-2 transition-all duration-200 hover:scale-105 hover:text-caribbeangreen-300"
      >
        <FiEdit2 size={18} />
      </button>
      <button
        disabled={loading}
        onClick={() => {
          setConfirmationModal({
            text1: "Do you want to delete this course?",
            text2: "All the data related to this course will be deleted",
            btn1Text: !loading ? "Delete" : "Loading...",
            btn2Text: "Cancel",
            btn1Handler: !loading
              ? () => handleCourseDelete(course._id)
              : () => {},
            btn2Handler: !loading
              ? () => setConfirmationModal(null)
              : () => {},
          })
        }}
        title="Delete"
        className="rounded-md border border-richblack-700 p-2 transition-all duration-200 hover:scale-105 hover:text-[#ff0000]"
      >
        <RiDeleteBin6Line size={18} />
      </button>
    </>
  )

  return (
    <>
      {courses?.length === 0 ? (
        <div className="rounded-xl border border-richblack-800 bg-richblack-800 px-6 py-10 text-center text-xl font-medium text-richblack-100 sm:text-2xl">
          No courses found
        </div>
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {courses?.map((course) => (
              <div
                key={course._id}
                className="rounded-xl border border-richblack-800 bg-richblack-800 p-4 sm:p-5"
              >
                <img
                  src={course?.thumbnail}
                  alt={course?.courseName}
                  className="h-[180px] w-full rounded-lg object-cover"
                />
                <div className="mt-4 space-y-3">
                  <p className="text-lg font-semibold text-richblack-5">
                    {course.courseName}
                  </p>
                  <p className="text-sm text-richblack-300">
                    {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                      ? course.courseDescription
                          .split(" ")
                          .slice(0, TRUNCATE_LENGTH)
                          .join(" ") + "..."
                      : course.courseDescription}
                  </p>
                  <p className="text-xs text-white">
                    Created: {formatDate(course.createdAt)}
                  </p>
                  {renderStatus(course)}
                  <div className="grid gap-3 rounded-lg bg-richblack-700/40 p-3 text-sm text-richblack-100 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-richblack-300">
                        Duration
                      </p>
                      <p className="mt-1">2hr 30min</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-richblack-300">
                        Price
                      </p>
                      <p className="mt-1">Rs. {course.price}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {renderActions(course)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table className="rounded-xl border border-richblack-800">
              <Thead>
                <Tr className="flex gap-x-10 rounded-t-md border-b border-b-richblack-800 px-6 py-2">
                  <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
                    Courses
                  </Th>
                  <Th className="text-left text-sm font-medium uppercase text-richblack-100">
                    Duration
                  </Th>
                  <Th className="text-left text-sm font-medium uppercase text-richblack-100">
                    Price
                  </Th>
                  <Th className="text-left text-sm font-medium uppercase text-richblack-100">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses?.map((course) => (
                  <Tr
                    key={course._id}
                    className="flex gap-x-10 border-b border-richblack-800 px-6 py-8"
                  >
                    <Td className="flex flex-1 gap-x-4">
                      <img
                        src={course?.thumbnail}
                        alt={course?.courseName}
                        className="h-[148px] w-[220px] rounded-lg object-cover"
                      />
                      <div className="flex flex-col justify-between">
                        <p className="text-lg font-semibold text-richblack-5">
                          {course.courseName}
                        </p>
                        <p className="text-xs text-richblack-300">
                          {course.courseDescription.split(" ").length >
                          TRUNCATE_LENGTH
                            ? course.courseDescription
                                .split(" ")
                                .slice(0, TRUNCATE_LENGTH)
                                .join(" ") + "..."
                            : course.courseDescription}
                        </p>
                        <p className="text-[12px] text-white">
                          Created: {formatDate(course.createdAt)}
                        </p>
                        {renderStatus(course)}
                      </div>
                    </Td>
                    <Td className="text-sm font-medium text-richblack-100">
                      2hr 30min
                    </Td>
                    <Td className="text-sm font-medium text-richblack-100">
                      Rs. {course.price}
                    </Td>
                    <Td className="text-sm font-medium text-richblack-100">
                      <div className="flex flex-wrap gap-2">
                        {renderActions(course)}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </>
      )}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
