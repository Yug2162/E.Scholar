import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { certificateEndpoints } from "../apis"

const {
  CHECK_CERTIFICATE_API,
  DOWNLOAD_CERTIFICATE_API,
  VERIFY_CERTIFICATE_API,
} = certificateEndpoints

// Check if a certificate exists for this course
export async function checkCertificateEligibility(courseId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${CHECK_CERTIFICATE_API}/${courseId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    return response?.data
  } catch (error) {
    console.log("CHECK CERTIFICATE ERROR....", error)
    return { success: false, eligible: false }
  }
}

// Download the certificate PDF — handled separately from apiConnector
// because we need the raw blob, not JSON
export async function downloadCertificate(courseId, token, courseName = "Course") {
  const effectiveToken = token || localStorage.getItem("token")
  if (!effectiveToken) {
    toast.error("Please login to download your certificate")
    return
  }

  const toastId = toast.loading("Generating your certificate...")
  try {
    const response = await fetch(`${DOWNLOAD_CERTIFICATE_API}/${courseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
      },
    })

    if (!response.ok) {
      let errorMsg = "Could not generate certificate"
      try {
        const errorData = await response.json()
        if (errorData?.message) errorMsg = errorData.message
      } catch (_) {}
      throw new Error(errorMsg)
    }

    const blob = await response.blob()
    const safeBlob = new Blob([blob], { type: "application/pdf" })
    const url = window.URL.createObjectURL(safeBlob)
    const link = document.createElement("a")
    link.href = url
    const safeName = (courseName || "Course").replace(/[^a-zA-Z0-9_\-]/g, "_")
    link.download = `EScholar_Certificate_${safeName}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)

    toast.success("Certificate downloaded successfully!")
  } catch (error) {
    console.log("DOWNLOAD CERTIFICATE ERROR....", error)
    toast.error(error.message || "Could not download certificate")
  } finally {
    toast.dismiss(toastId)
  }
}

// Public — verify a certificate by ID (no auth)
export async function verifyCertificate(certificateId) {
  try {
    const response = await apiConnector(
      "GET",
      `${VERIFY_CERTIFICATE_API}/${certificateId}`
    )
    return response?.data
  } catch (error) {
    console.log("VERIFY CERTIFICATE ERROR....", error)
    return { success: false }
  }
}