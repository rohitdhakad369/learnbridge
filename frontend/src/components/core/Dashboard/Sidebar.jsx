import { useState } from "react"
import { VscChromeClose, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../Common/ConfirmationModal"
import SidebarLink from "./SidebarLink"

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  )
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirmationModal, setConfirmationModal] = useState(null)

  if (profileLoading || authLoading) {
    return (
      <div className="hidden h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800 lg:grid">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close dashboard menu"
        onClick={onClose}
        className={`fixed inset-x-0 bottom-0 top-14 z-30 bg-richblack-900/70 transition-all duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-[280px] max-w-[82vw] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 transition-transform duration-300 lg:static lg:h-full lg:min-w-[220px] lg:max-w-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-richblack-700 px-5 py-4 lg:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-richblack-100">
            Dashboard Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-richblack-700 bg-richblack-700 text-richblack-25"
            aria-label="Close dashboard menu"
          >
            <VscChromeClose className="text-lg" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6 lg:py-10">
          <div className="flex flex-col">
            {sidebarLinks.map((link) => {
              if (link.type && user?.accountType !== link.type) return null

              return (
                <SidebarLink
                  key={link.id}
                  link={link}
                  iconName={link.icon}
                  onClick={onClose}
                />
              )
            })}
          </div>

          <div className="mx-auto mb-6 mt-6 h-[1px] w-10/12 bg-richblack-700" />

          <div className="flex flex-col">
            <SidebarLink
              link={{ name: "Settings", path: "/dashboard/settings" }}
              iconName="VscSettingsGear"
              onClick={onClose}
            />
            <button
              onClick={() =>
                setConfirmationModal({
                  text1: "Are you sure?",
                  text2: "You will be logged out of your account.",
                  btn1Text: "Logout",
                  btn2Text: "Cancel",
                  btn1Handler: () => dispatch(logout(navigate)),
                  btn2Handler: () => setConfirmationModal(null),
                })
              }
              className="px-5 py-3 text-left text-sm font-medium text-richblack-300 transition-all duration-200 hover:bg-richblack-700/40 lg:px-8 lg:py-2"
            >
              <div className="flex items-center gap-x-2">
                <VscSignOut className="text-lg" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
