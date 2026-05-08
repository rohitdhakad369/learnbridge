
import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/free-mode"

import { FaStar } from "react-icons/fa"
import { Autoplay, FreeMode } from "swiper"

import { apiConnector } from "../../services/apiConnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success && data?.data?.length > 0) {
          setReviews(data.data)
        }
      } catch (error) {
        console.log("Review API Error", error)
      }
    })()
  }, [])

  if (!reviews.length) return null

  return (
    <section className="w-full bg-richblack-900 py-16">
      <div className="mx-auto w-full max-w-maxContent px-4 text-white">
        <h2 className="mb-3 text-center text-3xl font-bold text-richblack-5">
          Reviews from other learners
        </h2>
        <p className="mb-12 text-center text-richblack-300">
          What Our Students Say
        </p>

        <Swiper
          slidesPerView={1}
          spaceBetween={24}
          loop={true}
          freeMode={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          modules={[FreeMode, Autoplay]}
          className="min-h-[300px] w-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide
              key={i}
              className="flex items-center justify-center"
            >
              <div className="flex h-[260px] w-[280px] flex-col rounded-xl border border-richblack-700 bg-richblack-800 p-5 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-50 hover:shadow-[0_10px_40px_rgba(255,215,0,0.15)]">

                {/* User Info */}
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={
                      review?.user?.image
                        ? review.user.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                    }
                    alt="user"
                    className="h-12 w-12 rounded-full border border-yellow-50 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-richblack-5">
                      {review?.user?.firstName} {review?.user?.lastName}
                    </p>
                    <p className="text-xs text-richblack-400">
                      {review?.course?.courseName}
                    </p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="mb-4 text-sm text-richblack-200">
                  {review?.review.split(" ").length > truncateWords
                    ? `${review.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")}...`
                    : review.review}
                </p>

                {/* Rating */}
                <div className="mt-auto flex items-center gap-2">
                  <span className="text-sm font-semibold text-yellow-100">
                    {review.rating.toFixed(1)}
                  </span>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={18}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default ReviewSlider

