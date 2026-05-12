import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../Common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const personalDetails = [
    { label: "First Name", value: user?.firstName },
    { label: "Last Name", value: user?.lastName },
    { label: "Email", value: user?.email },
    {
      label: "Phone Number",
      value: user?.additionalDetails?.contactNumber ?? "Add Contact Number",
    },
    {
      label: "Gender",
      value: user?.additionalDetails?.gender ?? "Add Gender",
    },
    {
      label: "Date Of Birth",
      value: user?.additionalDetails?.dateOfBirth
        ? formattedDate(user?.additionalDetails?.dateOfBirth)
        : "Add Date Of Birth",
    },
  ]

  return (
    <>
      <h1 className="mb-8 text-2xl font-medium text-richblack-5 sm:mb-10 sm:text-3xl">
        My Profile
      </h1>

      <div className="flex flex-col gap-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 sm:px-10">
        <div className="flex items-center gap-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-richblack-5">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="break-words text-sm text-richblack-300">
              {user?.email}
            </p>
          </div>
        </div>
        <IconBtn
          text="Edit"
          customClasses="w-full justify-center sm:w-auto"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      <div className="my-8 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-5 sm:my-10 sm:gap-y-8 sm:p-8 sm:px-10">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-richblack-5">About</p>
          <IconBtn
            text="Edit"
            customClasses="w-full justify-center sm:w-auto"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`text-sm font-medium ${
            user?.additionalDetails?.about
              ? "text-richblack-5"
              : "text-richblack-400"
          }`}
        >
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>

      <div className="my-8 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-5 sm:my-10 sm:gap-y-8 sm:p-8 sm:px-10">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-richblack-5">
            Personal Details
          </p>
          <IconBtn
            text="Edit"
            customClasses="w-full justify-center sm:w-auto"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {personalDetails.map((detail) => (
            <div key={detail.label}>
              <p className="mb-2 text-sm text-richblack-600">{detail.label}</p>
              <p className="break-words text-sm font-medium text-richblack-5">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
