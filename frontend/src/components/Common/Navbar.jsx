import { useEffect, useState } from "react"
import {
  AiOutlineClose,
  AiOutlineMenu,
  AiOutlineShoppingCart,
} from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { logout } from "../../services/operations/authAPI"
import { apiConnector } from "../../services/apiConnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropdown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileCatalogOpen(false)
  }, [location.pathname])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const availableSubLinks =
    subLinks?.filter((subLink) => subLink?.courses?.length > 0) || []

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsMobileCatalogOpen(false)
  }

  return (
    <>
      <div
        className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
          location.pathname !== "/" ? "bg-richblack-800" : ""
        } transition-all duration-200`}
      >
        <div className="flex w-11/12 max-w-maxContent items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <img
              src={logo}
              alt="Logo"
              width={160}
              height={32}
              loading="lazy"
              className="w-[140px] sm:w-[160px]"
            />
          </Link>

          <nav className="hidden md:block">
            <ul className="flex gap-x-6 text-richblack-25">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[220px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : availableSubLinks.length ? (
                          availableSubLinks.map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                              key={i}
                            >
                              <p>{subLink.name}</p>
                            </Link>
                          ))
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link to={link?.path}>
                      <p
                        className={`${
                          matchRoute(link?.path)
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-x-4 md:flex">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Log in
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Sign up
                </button>
              </Link>
            )}
            {token !== null && <ProfileDropdown />}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-richblack-700 bg-richblack-800 text-richblack-100"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <AiOutlineMenu fontSize={24} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMobileMenu}
        className={`fixed inset-x-0 bottom-0 top-14 z-30 bg-richblack-900/70 transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-0 right-0 top-14 z-40 flex w-[290px] max-w-[84vw] flex-col border-l border-richblack-700 bg-richblack-800 transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-richblack-700 px-4 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-richblack-100">
              Navigation
            </p>
            {user && (
              <p className="mt-1 text-xs text-richblack-300">
                {user.firstName} {user.lastName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-richblack-700 bg-richblack-700 text-richblack-25"
          >
            <AiOutlineClose fontSize={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav>
            <ul className="space-y-2">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div className="rounded-xl border border-richblack-700 bg-richblack-700/30">
                      <button
                        type="button"
                        onClick={() =>
                          setIsMobileCatalogOpen((prevState) => !prevState)
                        }
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium ${
                          matchRoute("/catalog/:catalogName")
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        <span>{link.title}</span>
                        <BsChevronDown
                          className={`transition-transform duration-200 ${
                            isMobileCatalogOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {isMobileCatalogOpen && (
                        <div className="space-y-2 border-t border-richblack-700 px-3 py-3">
                          {loading ? (
                            <p className="px-2 text-sm text-richblack-300">
                              Loading...
                            </p>
                          ) : availableSubLinks.length ? (
                            availableSubLinks.map((subLink, i) => (
                              <Link
                                key={i}
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                onClick={closeMobileMenu}
                                className="block rounded-lg px-3 py-2 text-sm text-richblack-25 transition-all duration-200 hover:bg-richblack-700"
                              >
                                {subLink.name}
                              </Link>
                            ))
                          ) : (
                            <p className="px-2 text-sm text-richblack-300">
                              No Courses Found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link?.path}
                      onClick={closeMobileMenu}
                      className={`block rounded-xl border border-richblack-700 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        matchRoute(link?.path)
                          ? "border-yellow-100 bg-yellow-900/30 text-yellow-25"
                          : "bg-richblack-700/30 text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="my-5 h-px bg-richblack-700"></div>

          <div className="space-y-3">
            {token === null ? (
              <>
                <Link to="/login" onClick={closeMobileMenu} className="block">
                  <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-4 py-3 text-richblack-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className="block">
                  <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-4 py-3 text-richblack-100">
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard/my-profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl border border-richblack-700 bg-richblack-700/30 px-4 py-3 text-sm font-medium text-richblack-25"
                >
                  <VscDashboard className="text-lg" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    dispatch(logout(navigate))
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-richblack-700 bg-richblack-700/30 px-4 py-3 text-sm font-medium text-richblack-25"
                >
                  <VscSignOut className="text-lg" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
