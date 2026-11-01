// server/controllers/Certificate.js
const Certificate = require("../models/Certificate")
const User = require("../models/User")
const Course = require("../models/Course")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

// Helper: load E.Scholar logo buffer and base64
function getLogoData() {
  const possiblePaths = [
    path.join(__dirname, "../assets/logo.png"),
    path.join(__dirname, "../../src/assets/Images/FinalLogo2.png"),
    path.join(__dirname, "../../src/assets/Logo/Logo-Full-Light.png"),
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return {
        path: p,
        buffer: fs.readFileSync(p),
        base64: fs.readFileSync(p).toString("base64"),
      }
    }
  }

  return { path: null, buffer: null, base64: null }
}

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
    console.error("CHECK_CERTIFICATE_ELIGIBILITY ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Launch a browser instance appropriate for the current environment
async function launchBrowser() {
  const commonArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
  ]

  // In production, try @sparticuz/chromium if running in a supported serverless environment
  if (process.env.NODE_ENV === "production") {
    try {
      const puppeteer = require("puppeteer-core")
      const chromium = require("@sparticuz/chromium")
      const execPath = await chromium.executablePath()
      if (execPath) {
        return await puppeteer.launch({
          args: chromium.args ? [...chromium.args, ...commonArgs] : commonArgs,
          defaultViewport: chromium.defaultViewport || { width: 1056, height: 816 },
          executablePath: execPath,
          headless: chromium.headless ?? true,
        })
      }
    } catch (err) {
      console.log("@sparticuz/chromium unavailable/failed:", err.message)
    }
  }

  // Next, try standard puppeteer (works locally or in Docker with Chrome)
  try {
    const puppeteer = require("puppeteer")
    return await puppeteer.launch({
      headless: true,
      args: commonArgs,
    })
  } catch (err) {
    console.log("Puppeteer launch error:", err.message)
    return null
  }
}

// Generate PDF using Puppeteer (Tier 1)
async function generateCertificatePuppeteer({ studentName, courseName, issuedDate, certificateId }) {
  let browser = null
  try {
    browser = await launchBrowser()
    if (!browser) {
      throw new Error("Headless browser could not be launched on this host")
    }

    const html = getCertificateHTML({
      studentName,
      courseName,
      issuedDate,
      certificateId,
    })

    const page = await browser.newPage()
    // Use domcontentloaded with a short timeout so external webfonts don't hang
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 10000 })

    const pdfBuffer = await page.pdf({
      width: "1056px",
      height: "816px",
      printBackground: true,
      pageRanges: "1",
    })

    await browser.close()
    return pdfBuffer
  } catch (error) {
    if (browser) {
      try {
        await browser.close()
      } catch (_) {}
    }
    throw error
  }
}

// Generate PDF using Pure Node.js PDFKit (Tier 2 - Zero external browser dependency, 100% reliable online)
function generateCertificatePDFKit({ studentName, courseName, issuedDate, certificateId }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [1056, 816],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      })

      const chunks = []
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      const { path: logoPath } = getLogoData()

      // 1. Classic Creamy Parchment Background
      doc.rect(0, 0, 1056, 816).fill("#fcfbf7")

      // 2. Subtle Watermark Logo Centered in Background
      if (logoPath && fs.existsSync(logoPath)) {
        doc.save()
        doc.opacity(0.065)
        const watermarkWidth = 460
        const watermarkHeight = 195
        doc.image(logoPath, (1056 - watermarkWidth) / 2, (816 - watermarkHeight) / 2, {
          width: watermarkWidth,
        })
        doc.restore()
      }

      // 3. Classic Multi-line Framing Borders
      // Outer primary border (Deep Navy)
      doc.lineWidth(2.5).strokeColor("#0c1a2e").rect(24, 24, 1008, 768).stroke()

      // Middle gold/teal pinstripe
      doc.lineWidth(1).strokeColor("#0891b2").rect(32, 32, 992, 752).stroke()

      // Inner delicate hairline border
      doc.lineWidth(0.8).strokeColor("#0c1a2e").rect(42, 42, 972, 732).stroke()

      // 4. Classic Ornamental Corner Flourishes
      const cornerSize = 30
      doc.lineWidth(2).strokeColor("#0c1a2e")
      // Top-Left
      doc.moveTo(52, 52 + cornerSize).lineTo(52, 52).lineTo(52 + cornerSize, 52).stroke()
      // Top-Right
      doc.moveTo(1004 - cornerSize, 52).lineTo(1004, 52).lineTo(1004, 52 + cornerSize).stroke()
      // Bottom-Left
      doc.moveTo(52, 764 - cornerSize).lineTo(52, 764).lineTo(52 + cornerSize, 764).stroke()
      // Bottom-Right
      doc.moveTo(1004 - cornerSize, 764).lineTo(1004, 764).lineTo(1004, 764 - cornerSize).stroke()

      // Small accent corner diamond dots
      const drawDiamond = (cx, cy) => {
        doc.save()
        doc.fillColor("#0891b2")
        doc.moveTo(cx, cy - 4).lineTo(cx + 4, cy).lineTo(cx, cy + 4).lineTo(cx - 4, cy).closePath().fill()
        doc.restore()
      }
      drawDiamond(52, 52)
      drawDiamond(1004, 52)
      drawDiamond(52, 764)
      drawDiamond(1004, 764)

      // 5. Official E.Scholar App Logo in Header
      if (logoPath && fs.existsSync(logoPath)) {
        const headerLogoWidth = 150
        doc.image(logoPath, (1056 - headerLogoWidth) / 2, 56, { width: headerLogoWidth })
      } else {
        doc.fillColor("#0c1a2e").fontSize(26).font("Helvetica-Bold")
          .text("E.", 458, 65, { continued: true })
        doc.fillColor("#06b6d4")
          .text("S", { continued: true })
        doc.fillColor("#0c1a2e")
          .text("CHOLAR")
      }

      // Subtitle
      doc.fillColor("#64748b").fontSize(10).font("Helvetica")
        .text("CERTIFICATE OF COMPLETION", 0, 126, { align: "center", characterSpacing: 4 })

      // 6. Certificate Title
      doc.fillColor("#0c1a2e").fontSize(32).font("Helvetica-Bold")
        .text("Certificate of Achievement", 0, 162, { align: "center" })

      // Center ornamental divider flourish
      doc.lineWidth(1).strokeColor("#0891b2")
        .moveTo(428, 198).lineTo(518, 198).stroke()
      drawDiamond(528, 198)
      doc.moveTo(538, 198).lineTo(628, 198).stroke()

      // 7. Subline
      doc.fillColor("#475569").fontSize(13).font("Helvetica")
        .text("This certificate is proudly presented to", 0, 208, { align: "center" })

      // 8. Student Name (Dynamic Underline to prevent awkward fixed widths)
      const cleanStudentName = studentName || "Student Name"
      doc.fillColor("#0891b2").fontSize(36).font("Helvetica-Bold")
        .text(cleanStudentName, 0, 238, { align: "center" })

      // Dynamic underline centered exactly on student name
      const nameWidth = doc.widthOfString(cleanStudentName)
      const nameX = (1056 - nameWidth) / 2
      const underlineY = 282
      doc.lineWidth(1.8).strokeColor("#0891b2")
        .moveTo(nameX - 25, underlineY).lineTo(nameX + nameWidth + 25, underlineY).stroke()
      drawDiamond(nameX - 25, underlineY)
      drawDiamond(nameX + nameWidth + 25, underlineY)

      // 9. Completion Text
      doc.fillColor("#475569").fontSize(13).font("Helvetica")
        .text(
          "for successfully completing all course requirements and demonstrating proficiency in",
          160,
          310,
          { align: "center", width: 736 }
        )

      // 10. Course Name in Classic Centered Plaque
      const cleanCourse = courseName || "Course Name"
      doc.fontSize(22).font("Helvetica-Bold")
      const courseTextWidth = doc.widthOfString(cleanCourse)
      const courseBoxWidth = Math.min(Math.max(courseTextWidth + 80, 260), 780)
      const courseBoxX = (1056 - courseBoxWidth) / 2
      const courseBoxY = 352
      const courseBoxH = 46

      // Elegant tinted box with classic border
      doc.rect(courseBoxX, courseBoxY, courseBoxWidth, courseBoxH)
        .fillAndStroke("#f2f8f9", "#0891b2")

      // Classic side brackets
      doc.lineWidth(3).strokeColor("#0c1a2e")
        .moveTo(courseBoxX, courseBoxY).lineTo(courseBoxX, courseBoxY + courseBoxH).stroke()
      doc.moveTo(courseBoxX + courseBoxWidth, courseBoxY).lineTo(courseBoxX + courseBoxWidth, courseBoxY + courseBoxH).stroke()

      doc.fillColor("#0c1a2e").fontSize(21).font("Helvetica-Bold")
        .text(cleanCourse, courseBoxX, courseBoxY + 12, { width: courseBoxWidth, align: "center" })

      // 11. Footer Elements (Signatures, Date, Official Seal)
      const footY = 566

      // Left: Date Issued
      doc.fillColor("#0c1a2e").fontSize(12).font("Helvetica-Bold")
        .text(issuedDate, 140, footY, { width: 190, align: "center" })
      doc.lineWidth(1).strokeColor("#94a3b8")
        .moveTo(140, footY + 20).lineTo(330, footY + 20).stroke()
      doc.fillColor("#94a3b8").fontSize(9).font("Helvetica")
        .text("DATE OF ISSUANCE", 140, footY + 26, { width: 190, align: "center", characterSpacing: 1 })

      // Center: Official Classic E.Scholar Seal
      const sealX = 528
      const sealY = footY + 10
      doc.circle(sealX, sealY, 38).fillAndStroke("#0c1a2e", "#0891b2")
      doc.circle(sealX, sealY, 33).lineWidth(1).strokeColor("#67e8f9").stroke()

      // Starburst decorative ticks around seal rim
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8
        const r1 = 34
        const r2 = 36.5
        doc.lineWidth(1).strokeColor("#67e8f9")
          .moveTo(sealX + Math.cos(angle) * r1, sealY + Math.sin(angle) * r1)
          .lineTo(sealX + Math.cos(angle) * r2, sealY + Math.sin(angle) * r2)
          .stroke()
      }

      // Checkmark in seal
      doc.lineWidth(2.5).strokeColor("#67e8f9")
        .moveTo(sealX - 11, sealY)
        .lineTo(sealX - 3, sealY + 8)
        .lineTo(sealX + 11, sealY - 7)
        .stroke()

      // Right: Authorized Signature
      doc.fillColor("#0c1a2e").fontSize(13).font("Helvetica-Bold")
        .text("E.Scholar Academic Board", 726, footY, { width: 200, align: "center" })
      doc.lineWidth(1).strokeColor("#94a3b8")
        .moveTo(726, footY + 20).lineTo(926, footY + 20).stroke()
      doc.fillColor("#94a3b8").fontSize(9).font("Helvetica")
        .text("AUTHORIZED SIGNATURE", 726, footY + 26, { width: 200, align: "center", characterSpacing: 1 })

      // 12. Verification & Certificate ID at bottom (FIXED: Separate lines, NO overlap)
      doc.fillColor("#0891b2").fontSize(10).font("Helvetica-Bold")
        .text(`Certificate ID: ${certificateId}`, 0, 715, { align: "center", width: 1056 })

      doc.fillColor("#64748b").fontSize(9).font("Helvetica")
        .text(`Verify authenticity online at: https://escholar.vercel.app/verify-certificate/${certificateId}`, 0, 732, { align: "center", width: 1056 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

// Generate and stream the certificate PDF on-demand
exports.downloadCertificate = async (req, res) => {
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

    let pdfBuffer = null

    // Attempt 1: Try Puppeteer rendering (works locally or on rich hosts)
    try {
      pdfBuffer = await generateCertificatePuppeteer({
        studentName,
        courseName: course.courseName,
        issuedDate,
        certificateId: certificate.certificateId,
      })
    } catch (puppeteerError) {
      console.log(
        "Puppeteer rendering unavailable/failed in this environment. Falling back to native PDFKit generator:",
        puppeteerError.message
      )
      pdfBuffer = null
    }

    // Attempt 2: Fallback to Native PDFKit generator (100% reliable online on any cloud server)
    if (!pdfBuffer) {
      pdfBuffer = await generateCertificatePDFKit({
        studentName,
        courseName: course.courseName,
        issuedDate,
        certificateId: certificate.certificateId,
      })
    }

    const safeFilename = `EScholar_Certificate_${course.courseName
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .slice(0, 50)}.pdf`

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Content-Length": pdfBuffer.length,
      "Access-Control-Expose-Headers": "Content-Disposition",
      "Cache-Control": "no-cache",
    })

    return res.send(pdfBuffer)
  } catch (error) {
    console.error("DOWNLOAD_CERTIFICATE ERROR:", error)
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
    console.error("VERIFY_CERTIFICATE ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// HTML template for the certificate — classic academic design with E.Scholar app logo watermark
function getCertificateHTML({ studentName, courseName, issuedDate, certificateId }) {
  const { base64: logoBase64 } = getLogoData()
  const logoDataUri = logoBase64 ? `data:image/png;base64,${logoBase64}` : null

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
    background: #fcfbf7;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    z-index: 0;
    pointer-events: none;
    opacity: 0.065;
  }
  .watermark img {
    width: 100%;
    height: auto;
  }

  /* Multi-tier classic framing borders */
  .border-outer {
    position: absolute;
    top: 24px; left: 24px; right: 24px; bottom: 24px;
    border: 2.5px solid #0c1a2e;
    border-radius: 4px;
  }

  .border-middle {
    position: absolute;
    top: 32px; left: 32px; right: 32px; bottom: 32px;
    border: 1px solid #0891b2;
    border-radius: 3px;
  }

  .border-inner {
    position: absolute;
    top: 42px; left: 42px; right: 42px; bottom: 42px;
    border: 0.8px solid #0c1a2e;
    border-radius: 2px;
  }

  .corner {
    position: absolute;
    width: 32px;
    height: 32px;
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
    padding: 60px 100px;
    height: 100%;
  }

  .logo-img {
    height: 48px;
    object-fit: contain;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 22px;
    font-weight: 500;
  }

  .cert-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 700;
    color: #0c1a2e;
    margin-bottom: 4px;
  }

  .divider-flourish {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .divider-line {
    width: 80px;
    height: 1px;
    background: #0891b2;
  }
  .divider-dot {
    width: 6px;
    height: 6px;
    background: #0891b2;
    transform: rotate(45deg);
  }

  .cert-subline {
    font-size: 13px;
    color: #475569;
    margin-bottom: 16px;
  }

  .student-name-wrap {
    margin-bottom: 18px;
    display: inline-block;
  }

  .student-name {
    font-family: 'Playfair Display', serif;
    font-size: 38px;
    font-weight: 700;
    color: #0891b2;
    padding: 0 16px 8px;
    border-bottom: 2px solid #0891b2;
    display: inline-block;
  }

  .completion-text {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
    max-width: 680px;
    margin-bottom: 6px;
  }

  .course-name-wrap {
    position: relative;
    margin: 14px 0 28px;
    padding: 10px 32px;
    background: #f2f8f9;
    border: 1px solid #0891b2;
    border-radius: 3px;
    display: inline-block;
  }
  .course-name-wrap::before {
    content: "";
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 3.5px;
    background: #0c1a2e;
  }
  .course-name-wrap::after {
    content: "";
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 3.5px;
    background: #0c1a2e;
  }
  .course-name {
    font-family: 'Playfair Display', serif;
    font-size: 21px;
    font-weight: 700;
    color: #0c1a2e;
  }

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 760px;
    margin-top: 6px;
  }

  .footer-col { text-align: center; width: 190px; }

  .footer-line {
    width: 170px;
    border-top: 1px solid #94a3b8;
    margin: 0 auto 6px;
  }

  .footer-label {
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
  }

  .footer-value {
    font-size: 12.5px;
    font-weight: 600;
    color: #0c1a2e;
    margin-bottom: 6px;
  }

  .seal {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #0c1a2e;
    border: 3px solid #0891b2;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 0 3px #fcfbf7, 0 0 0 4px rgba(8,145,178,0.4);
  }
  .seal-check { width: 30px; height: 30px; }

  /* Separate, clearly spaced verification block at the bottom */
  .cert-id-block {
    position: absolute;
    bottom: 48px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .cert-id-line {
    font-size: 10.5px;
    font-weight: 700;
    color: #0891b2;
    letter-spacing: 0.5px;
  }
  .cert-verify-line {
    font-size: 9px;
    color: #64748b;
  }
</style>
</head>
<body>
  ${
    logoDataUri
      ? `<div class="watermark"><img src="${logoDataUri}" alt="Watermark" /></div>`
      : `<div class="watermark"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="50" width="140" height="90" rx="10" fill="none" stroke="#0c1a2e" stroke-width="4"/><line x1="10" y1="155" x2="190" y2="155" stroke="#0c1a2e" stroke-width="4" stroke-linecap="round"/></svg></div>`
  }

  <div class="border-outer"></div>
  <div class="border-middle"></div>
  <div class="border-inner"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>

  <div class="content">
    ${
      logoDataUri
        ? `<img src="${logoDataUri}" class="logo-img" alt="E.Scholar" />`
        : `<div class="logo-text" style="font-weight:700;font-size:24px;color:#0c1a2e;margin-bottom:4px;">E.<span style="color:#06b6d4;">S</span>CHOLAR</div>`
    }
    <div class="subtitle">Certificate of Completion</div>

    <div class="cert-title">Certificate of Achievement</div>
    <div class="divider-flourish">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <div class="cert-subline">This certificate is proudly presented to</div>

    <div class="student-name-wrap">
      <div class="student-name">${studentName}</div>
    </div>

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
        <div class="footer-label">Date of Issuance</div>
      </div>

      <div class="seal">
        <svg class="seal-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 13l4 4L19 7" stroke="#67e8f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="footer-col">
        <div class="footer-value" style="font-family: 'Playfair Display', serif; font-style: italic;">E.Scholar Academic Board</div>
        <div class="footer-line"></div>
        <div class="footer-label">Authorized Signature</div>
      </div>
    </div>
  </div>

  <!-- Separate, non-overlapping verification footer -->
  <div class="cert-id-block">
    <div class="cert-id-line">Certificate ID: ${certificateId}</div>
    <div class="cert-verify-line">Verify authenticity online at: https://escholar.vercel.app/verify-certificate/${certificateId}</div>
  </div>
</body>
</html>
  `
}