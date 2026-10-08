exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#060d1a; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#060d1a; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color:#0c1a2e; border:1px solid rgba(6,182,212,0.15); border-radius:4px; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="https://scholr.vercel.app">
                <span style="font-size:22px; font-weight:bold; color:#f0f9ff; letter-spacing:1px;">E.<span style="color:#06b6d4;">SCHOLAR</span></span>
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:18px; font-weight:bold; color:#f0f9ff; padding-bottom:16px;">
              Payment Successful 🎉
            </td>
          </tr>
          <tr>
            <td style="font-size:15px; color:#94a3b8; line-height:1.6;">
              <p style="margin:0 0 12px;">Dear ${name},</p>
              <p style="margin:0 0 12px;">
                Thank you for your purchase! We have successfully received your payment of <span style="color:#06b6d4; font-weight:bold;">₹${amount}</span>.
              </p>
              <p style="margin:0 0 12px;">
                You can now access your enrolled courses from your dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 0;">
              <a href="https://scholr.vercel.app/dashboard/enrolled-courses" 
                style="background-color:#06b6d4; color:#060d1a; padding:12px 32px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:15px;">
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