const fs = require("fs");
const path = require("path");
const {
  nodemailerTransporter,
} = require("../../../config/emails/nodemailer.config");

const SendEmail = async (receiver, subject, code) => {
  try {
    // Read the HTML template file
    const emailTemplatePath = path.join(
      __dirname,
      "../../views/emails/ResetUserPassword.html"
    );
    const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    // Replace placeholders in the template
    const formattedEmail = emailTemplate.replace("{{code}}", code);

    const info = await nodemailerTransporter.sendMail({
      from: `"${process.env.SENDER_EMAIL_NAME}" <${process.env.SENDER_EMAIL_ID}>`,
      to: receiver,
      subject: subject,
      html: formattedEmail,
    });
    return info?.messageId;
  } catch (error) {
    return error?.message;
  }
};

module.exports = { SendEmail };
