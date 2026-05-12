import { useEffect, useState } from "react"
import { VscMenu } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { Outlet, useLocation } from "react-router-dom"

import Sidebar from "../components/core/Dashboard/Sidebar"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] bg-richblack-900 lg:h-[calc(100vh-3.5rem)]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-richblack-700 bg-richblack-800/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md border border-richblack-700 bg-richblack-700 text-richblack-25 transition-all duration-200 hover:border-richblack-500"
            aria-label="Open dashboard menu"
          >
            <VscMenu className="text-xl" />
          </button>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-richblack-100">
            Dashboard
          </p>
          <div className="h-10 w-10" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8 lg:w-11/12 lg:px-0 lg:py-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
