const axios = require("axios")

const mailSender = async (email, title, body) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "E.Scholar", email: process.env.MAIL_SENDER_EMAIL || "e.scholar.014@gmail.com" },
        to: [{ email: email }],
        subject: title,
        htmlContent: body,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    )
    console.log("MAIL SENT:", response.data)
    return response.data
  } catch (error) {
    console.log("MAIL ERROR:", error.message)
    return error.message
  }
}

module.exports = mailSender