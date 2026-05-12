import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"

import { removeFromCart } from "../../../../slices/cartSlice"

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()

  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, indx) => (
        <div
          key={course._id}
          className={`flex w-full flex-col gap-5 rounded-xl border border-richblack-700 bg-richblack-800 p-4 sm:p-5 ${
            indx !== 0 && "mt-4"
          }`}
        >
          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <img
              src={course?.thumbnail}
              alt={course?.courseName}
              className="h-[180px] w-full rounded-lg object-cover sm:h-[148px] sm:max-w-[220px]"
            />
            <div className="flex flex-col space-y-1">
              <p className="text-lg font-medium text-richblack-5">
                {course?.courseName}
              </p>
              <p className="text-sm text-richblack-300">
                {course?.category?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-yellow-5">4.5</span>
                <ReactStars
                  count={5}
                  value={course?.ratingAndReviews?.length}
                  size={20}
                  edit={false}
                  activeColor="#ffd700"
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
                <span className="text-richblack-400">
                  {course?.ratingAndReviews?.length} Ratings
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => dispatch(removeFromCart(course._id))}
              className="flex w-full items-center justify-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 px-[12px] py-3 text-pink-200 sm:w-auto"
            >
              <RiDeleteBin6Line />
              <span>Remove</span>
            </button>
            <p className="text-2xl font-medium text-yellow-100 sm:text-3xl">
              Rs. {course?.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
