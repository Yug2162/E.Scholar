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
export async function downloadCertificate(courseId, token, courseName) {
  const toastId = toast.loading("Generating your certificate...")
  try {
    const response = await fetch(
      `${DOWNLOAD_CERTIFICATE_API}/${courseId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      throw new Error("Could not generate certificate")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `EScholar_Certificate_${courseName.replace(/\s+/g, "_")}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success("Certificate downloaded!")
  } catch (error) {
    console.log("DOWNLOAD CERTIFICATE ERROR....", error)
    toast.error("Could not download certificate")
  }
  toast.dismiss(toastId)
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