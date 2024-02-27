const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const {
  nodemailerTransporter,
} = require("../../../config/emails/nodemailer.config");
// const createPDFFromDocument = require("../pdf/createPDFFromDocument");

// Function to send email with the invoice
const sendInvoiceEmail = async ({ data, subject }) => {
  try {
    // Read EJS template file
    const templatePath = path.join(__dirname, "../../views/emails/Invoice.ejs");
    const templateString = fs.readFileSync(templatePath, "utf-8");

    // Render EJS template
    const renderedEmail = ejs.render(templateString, {
      invoice: data,
    });

    // const pdfDoc = await createPDFFromDocument(renderedEmail);

    // Email options
    const mailOptions = {
      from: `"${process.env.SENDER_EMAIL_NAME}" <${process.env.SENDER_EMAIL_ID}>`,
      to: data.clientEmail,
      subject: subject,
      // attachments: [
      //   {
      //     filename: "invoice.pdf",
      //     content: pdfDoc,
      //     contentType: "application/pdf",
      //   },
      // ],
      html: renderedEmail,
    };

    // Send email with the invoice
    const info = await nodemailerTransporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

module.exports = { sendInvoiceEmail };
