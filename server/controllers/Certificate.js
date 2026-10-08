// server/controllers/certificate.js
const Certificate = require("../models/Certificate")
const User = require("../models/User")
const Course = require("../models/Course")

// Check if a certificate exists for this user + course
// Used by the frontend to decide whether to show the Download button
exports.checkCertificateEligibility = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id

    const certificate = await Certificate.findOne({
      userId,
      courseID: courseId,
    })

    return res.status(200).json({
      success: true,
      eligible: !!certificate,
      certificateId: certificate?.certificateId || null,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Launch a browser instance appropriate for the current environment
async function launchBrowser() {
  if (process.env.NODE_ENV === "production") {
    const puppeteer = require("puppeteer-core")
    const chromium = require("@sparticuz/chromium")
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  } else {
    const puppeteer = require("puppeteer")
    return puppeteer.launch({
      headless: true,
    })
  }
}

// Generate and stream the certificate PDF on-demand
exports.downloadCertificate = async (req, res) => {
  let browser = null
  try {
    const { courseId } = req.params
    const userId = req.user.id

    const certificate = await Certificate.findOne({
      userId,
      courseID: courseId,
    })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found. Complete the course first.",
      })
    }

    const user = await User.findById(userId)
    const course = await Course.findById(courseId)

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        message: "User or course not found",
      })
    }

    const studentName = `${user.firstName} ${user.lastName}`
    const issuedDate = new Date(certificate.issuedDate).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long", year: "numeric" }
    )

    const html = getCertificateHTML({
      studentName,
      courseName: course.courseName,
      issuedDate,
      certificateId: certificate.certificateId,
    })

    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      width: "1056px",
      height: "816px",
      printBackground: true,
      pageRanges: "1",
    })

    await browser.close()
    browser = null

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=EScholar_Certificate_${course.courseName.replace(
        /\s+/g,
        "_"
      )}.pdf`,
    })
    return res.send(pdfBuffer)
  } catch (error) {
    console.error(error)
    if (browser) await browser.close()
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Public endpoint — no auth — for verifying a certificate by its ID
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findOne({ certificateId })
      .populate("userId", "firstName lastName")
      .populate("courseID", "courseName")

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found. Please check the ID and try again.",
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        studentName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
        courseName: certificate.courseID.courseName,
        issuedDate: new Date(certificate.issuedDate).toLocaleDateString(
          "en-IN",
          { day: "numeric", month: "long", year: "numeric" }
        ),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// HTML template for the certificate — navy/cyan two-tone, E.Scholar brand
function getCertificateHTML({ studentName, courseName, issuedDate, certificateId }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1056px;
    height: 816px;
    background: #fdfaf3;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .texture {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(circle, #0c1a2e 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.04;
  }

.watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    height: 480px;
    z-index: 0;
    pointer-events: none;
  }
  .watermark svg {
    width: 100%;
    height: 100%;
    opacity: 0.035;
  }

  .border-outer {
    position: absolute;
    top: 24px; left: 24px; right: 24px; bottom: 24px;
    border: 3px solid #06b6d4;
    border-radius: 4px;
  }

  .border-inner {
    position: absolute;
    top: 40px; left: 40px; right: 40px; bottom: 40px;
    border: 1px solid #0c1a2e;
    border-radius: 2px;
  }

  .corner {
    position: absolute;
    width: 36px;
    height: 36px;
    border: 2px solid #0c1a2e;
  }
  .corner-tl { top: 52px; left: 52px; border-right: none; border-bottom: none; }
  .corner-tr { top: 52px; right: 52px; border-left: none; border-bottom: none; }
  .corner-bl { bottom: 52px; left: 52px; border-right: none; border-top: none; }
  .corner-br { bottom: 52px; right: 52px; border-left: none; border-top: none; }

  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 70px 110px;
    height: 100%;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .logo-icon { width: 30px; height: 30px; }

  .logo-text {
    font-weight: 700;
    font-size: 24px;
    letter-spacing: 2px;
    color: #0c1a2e;
  }
  .logo-text .accent { color: #06b6d4; }

  .subtitle {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 30px;
  }

  .cert-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: #0c1a2e;
    margin-bottom: 6px;
  }

  .cert-subline {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 26px;
  }

  .student-name {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 700;
    color: #06b6d4;
    border-bottom: 2px solid #06b6d4;
    padding-bottom: 10px;
    margin-bottom: 24px;
    min-width: 480px;
  }

  .completion-text {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    max-width: 580px;
    margin-bottom: 4px;
  }

  .course-name-wrap {
    position: relative;
    margin: 16px 0 34px;
    padding: 10px 28px;
  }
  .course-name-wrap::before {
    content: "";
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 3px;
    background: #06b6d4;
  }
  .course-name-wrap::after {
    content: "";
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 3px;
    background: #06b6d4;
  }
  .course-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: #0c1a2e;
  }

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 720px;
    margin-top: 8px;
  }

  .footer-col { text-align: center; width: 180px; }

  .footer-line {
    width: 160px;
    border-top: 1px solid #94a3b8;
    margin-bottom: 6px;
  }

  .footer-label {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .footer-value {
    font-size: 13px;
    font-weight: 600;
    color: #0c1a2e;
    margin-bottom: 6px;
  }

  .seal {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0c1a2e, #1e3a5f);
    border: 3px solid #06b6d4;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 0 4px #fdfaf3, 0 0 0 5px rgba(6,182,212,0.3);
  }
  .seal-check { width: 32px; height: 32px; }

  .cert-id {
    position: absolute;
    bottom: 56px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 10px;
    letter-spacing: 1px;
    color: #94a3b8;
    z-index: 1;
  }
  .cert-id span { font-weight: 700; color: #0891b2; }
</style>
</head>
<body>
  <div class="texture"></div>

<div class="watermark">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="50" width="140" height="90" rx="10" fill="none" stroke="#0c1a2e" stroke-width="4"/>
      <line x1="10" y1="155" x2="190" y2="155" stroke="#0c1a2e" stroke-width="4" stroke-linecap="round"/>
    </svg>
  </div>

  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>

  <div class="content">
    <div class="logo-row">
      <svg class="logo-icon" viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="40" height="26" rx="3" fill="none" stroke="#06b6d4" stroke-width="3"/>
        <text x="10" y="23" font-family="monospace" font-size="13" font-weight="700" fill="#06b6d4">&lt;/&gt;</text>
        <line x1="0" y1="35" x2="48" y2="35" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <div class="logo-text">E.<span class="accent">S</span>CHOLAR</div>
    </div>
    <div class="subtitle">Certificate of Completion</div>

    <div class="cert-title">Certificate of Achievement</div>
    <div class="cert-subline">This certificate is proudly presented to</div>

    <div class="student-name">${studentName}</div>

    <div class="completion-text">
      for successfully completing all course requirements and demonstrating
      proficiency in
    </div>
    <div class="course-name-wrap">
      <div class="course-name">${courseName}</div>
    </div>

    <div class="footer-row">
      <div class="footer-col">
        <div class="footer-value">${issuedDate}</div>
        <div class="footer-line"></div>
        <div class="footer-label">Date Issued</div>
      </div>

      <div class="seal">
        <svg class="seal-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 13l4 4L19 7" stroke="#67e8f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="footer-col">
        <div class="footer-value" style="font-family: 'Playfair Display', serif; font-style: italic;">E.Scholar Team</div>
        <div class="footer-line"></div>
        <div class="footer-label">Authorized Signature</div>
      </div>
    </div>
  </div>
  <div class="cert-id">Certificate ID: <span>${certificateId}</span> &nbsp;·&nbsp; Verify at escholar.vercel.app/verify-certificate/${certificateId}</div>
</body>
</html>
  `
}