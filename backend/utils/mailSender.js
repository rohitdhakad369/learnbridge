const nodemailer = require("nodemailer")

const createTransporter = () => {
  const mailPort = Number(process.env.MAIL_PORT || 587)
  const secure =
    process.env.MAIL_SECURE === undefined
      ? mailPort === 465
      : process.env.MAIL_SECURE === "true"

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Mail credentials are not configured")
  }

  if (!process.env.MAIL_HOST && !process.env.MAIL_SERVICE) {
    throw new Error("Mail host or mail service is not configured")
  }

  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || undefined,
    host: process.env.MAIL_HOST || undefined,
    port: mailPort,
    secure,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT || 15000),
  })
}

const mailSender = async (email, title, body) => {
  try {
    const transporter = createTransporter()
    const info = await transporter.sendMail({
      from: `"Learnbridge📒" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log(`Mail sent to ${email}: ${info.response}`)
    return info
  } catch (error) {
    console.error(`Mail send failed for ${email}: ${error.message}`)
    throw error
  }
}

module.exports = mailSender
