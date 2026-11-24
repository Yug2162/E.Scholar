import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"
import { examEndpoints } from "../apis"

const {
  INSTRUCTOR_EXAM_API,
  SAVE_EXAM_API,
  DELETE_EXAM_API,
  EXAM_STATUS_API,
  START_EXAM_API,
  SUBMIT_EXAM_API,
} = examEndpoints

const auth = (token) => ({ Authorization: `Bearer ${token}` })
const errorText = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong"

// ---------- Instructor ----------

// { courseName, exam | null }
export const getInstructorExam = async (courseId, token) => {
  try {
    const res = await apiConnector("GET", `${INSTRUCTOR_EXAM_API}/${courseId}`, null, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    return res.data.data
  } catch (error) {
    console.log("GET_INSTRUCTOR_EXAM ERROR............", error)
    toast.error(errorText(error))
    return null
  }
}

export const saveExam = async (data, token) => {
  const toastId = toast.loading("Saving exam...")
  try {
    const res = await apiConnector("POST", SAVE_EXAM_API, data, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    toast.success("Exam saved")
    return res.data.data
  } catch (error) {
    console.log("SAVE_EXAM ERROR............", error)
    toast.error(errorText(error))
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export const deleteExam = async (courseId, token) => {
  const toastId = toast.loading("Deleting exam...")
  try {
    const res = await apiConnector("DELETE", `${DELETE_EXAM_API}/${courseId}`, null, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    toast.success("Exam deleted")
    return true
  } catch (error) {
    console.log("DELETE_EXAM ERROR............", error)
    toast.error(errorText(error))
    return false
  } finally {
    toast.dismiss(toastId)
  }
}

// ---------- Student ----------

// Exam info + past attempts. `silent` skips the error toast (used by the sidebar).
export const getExamStatus = async (courseId, token, silent = false) => {
  try {
    const res = await apiConnector("GET", `${EXAM_STATUS_API}/${courseId}`, null, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    return res.data.data
  } catch (error) {
    console.log("GET_EXAM_STATUS ERROR............", error)
    if (!silent) toast.error(errorText(error))
    return null
  }
}

// { attemptId, expiresAt, serverTime, title, questions }
export const startExam = async (courseId, token) => {
  const toastId = toast.loading("Starting exam...")
  try {
    const res = await apiConnector("POST", START_EXAM_API, { courseId }, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    return res.data.data
  } catch (error) {
    console.log("START_EXAM ERROR............", error)
    toast.error(errorText(error))
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export const submitExam = async (attemptId, answers, token) => {
  const toastId = toast.loading("Submitting...")
  try {
    const res = await apiConnector("POST", SUBMIT_EXAM_API, { attemptId, answers }, auth(token))
    if (!res.data.success) throw new Error(res.data.message)
    return res.data.data
  } catch (error) {
    console.log("SUBMIT_EXAM ERROR............", error)
    toast.error(errorText(error))
    return null
  } finally {
    toast.dismiss(toastId)
  }
}
