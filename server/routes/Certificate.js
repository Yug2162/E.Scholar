// server/routes/Certificate.js
const express = require("express")
const router = express.Router()

const { auth, isStudent } = require("../middleware/auth")
const {
  checkCertificateEligibility,
  downloadCertificate,
  verifyCertificate,
} = require("../controllers/Certificate")

// Check if student is eligible / certificate exists for a course
router.get("/check/:courseId", auth, isStudent, checkCertificateEligibility)

// Download the certificate PDF
router.get("/download/:courseId", auth, isStudent, downloadCertificate)

// Public verification — no auth required
router.get("/verify/:certificateId", verifyCertificate)

module.exports = router