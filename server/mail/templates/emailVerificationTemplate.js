const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#060d1a; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#060d1a; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#0c1a2e; border:1px solid rgba(6,182,212,0.15); border-radius:4px; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size:22px; font-weight:bold; color:#f0f9ff; letter-spacing:1px;">E.<span style="color:#06b6d4;">SCHOLAR</span></span>

            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:18px; font-weight:bold; color:#f0f9ff; padding-bottom:16px;">
              OTP Verification
            </td>
          </tr>
          <tr>
            <td style="font-size:15px; color:#94a3b8; line-height:1.6;">
              <p style="margin:0 0 12px;">Dear User,</p>
              <p style="margin:0 0 20px;">
                Thank you for registering with E.Scholar. Use the OTP below to verify your account:
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <div style="display:inline-block; background-color:#060d1a; border:1px solid #06b6d4; border-radius:4px; padding: 16px 40px;">
                <span style="font-size:32px; font-weight:bold; color:#06b6d4; letter-spacing:4px;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="font-size:14px; color:#94a3b8; line-height:1.6; padding-top:16px;">
              <p style="margin:0 0 8px;">This OTP is valid for <span style="color:#f0f9ff; font-weight:bold;">5 minutes</span>.</p>
              <p style="margin:0;">If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:13px; color:#64748b; padding-top: 24px; border-top: 1px solid rgba(6,182,212,0.08); margin-top:24px;">
              Need help? Contact us at
              <a href="mailto:e.scholar.014@gmail.com" style="color:#06b6d4; text-decoration:none;">e.scholar.014@gmail.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = otpTemplate;