import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150 ${
        matchRoute(link.path)
          ? "text-[#06b6d4] bg-[rgba(6,182,212,0.08)] border-l-2 border-[#06b6d4] pl-[18px] font-semibold"
          : "text-[#94a3b8] hover:text-[#f0f9ff] hover:bg-[rgba(6,182,212,0.05)]"
      }`}
    >
      <Icon className="text-lg" />
      <span>{link.name}</span>
    </NavLink>
  )
}