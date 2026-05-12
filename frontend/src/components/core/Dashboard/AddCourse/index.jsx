import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  return (
    <div className="flex w-full flex-col gap-8 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="mb-8 text-2xl font-medium text-richblack-5 sm:mb-10 sm:text-3xl">
          Add Course
        </h1>
        <div className="flex-1">
          <RenderSteps />
        </div>
      </div>

      <div className="w-full rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 xl:sticky xl:top-10 xl:max-w-[380px]">
        <p className="mb-8 text-lg text-richblack-5">Course Upload Tips</p>
        <ul className="ml-5 list-item list-disc space-y-4 text-xs text-richblack-5">
          <li>Set the Course Price option or make it free.</li>
          <li>Standard size for the course thumbnail is 1024x576.</li>
          <li>Video section controls the course overview video.</li>
          <li>Course Builder is where you create and organize a course.</li>
          <li>
            Add topics in the Course Builder section to create lessons,
            quizzes, and assignments.
          </li>
          <li>
            Information from the Additional Data section shows up on the course
            single page.
          </li>
          <li>Make announcements to notify any important updates.</li>
          <li>Notes can be shared with all enrolled students at once.</li>
        </ul>
      </div>
    </div>
  )
}
