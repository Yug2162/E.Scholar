exports.courseEnrollmentEmail = (courseName, name) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Course Registration Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#060d1a; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#060d1a; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#0c1a2e; border:1px solid rgba(6,182,212,0.15); border-radius:4px; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="https://schlor.vercel.app">
              <span style="font-size:22px; font-weight:bold; color:#f0f9ff; letter-spacing:1px;">E.<span style="color:#06b6d4;">SCHOLAR</span></span>

              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:18px; font-weight:bold; color:#f0f9ff; padding-bottom:16px;">
              Course Registration Confirmation
            </td>
          </tr>
          <tr>
            <td style="font-size:15px; color:#94a3b8; line-height:1.6;">
              <p style="margin:0 0 12px;">Dear ${name},</p>
              <p style="margin:0 0 12px;">
                You have successfully registered for the course
                <span style="color:#06b6d4; font-weight:bold;">"${courseName}"</span>.
                We're excited to have you as a participant!
              </p>
              <p style="margin:0 0 12px;">
                Log in to your learning dashboard to access the course materials and start your learning journey.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px 0;">
              <a href="http://localhost:3000/dashboard/enrolled-courses"
                 style="display:inline-block; background-color:#06b6d4; color:#060d1a; text-decoration:none; font-weight:bold; font-size:15px; padding:12px 28px; border-radius:4px;">
                Go to Dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:13px; color:#64748b; padding-top: 24px; border-top: 1px solid rgba(6,182,212,0.08);">
              If you have any questions, reach out at
              <a href="mailto:e.scholar.014@gmail.com" style="color:#06b6d4; text-decoration:none;">e.scholar.014@gmail.com</a>.
              We're here to help!
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};