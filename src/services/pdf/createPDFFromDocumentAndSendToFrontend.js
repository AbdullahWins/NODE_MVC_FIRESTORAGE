const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const pdf = require("html-pdf");

async function createPDFFromDocumentAndSendToFrontend(document) {
  // Compile the EJS template
  const templatePath = path.join(__dirname, "../../views/emails/Invoice.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = ejs.compile(template);

  // Render the EJS template with the provided data
  const html = compiledTemplate({ invoice: document });

  try {
    // Generate PDF from HTML
    const options = {
      format: "Letter",
      border: {
        top: "1in",
        right: "1in",
        bottom: "1in",
        left: "1in",
      },
    };

    return new Promise((resolve, reject) => {
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          // Convert PDF buffer to base64 data URI
          const dataURI = `data:application/pdf;base64,${buffer.toString(
            "base64"
          )}`;
          resolve(dataURI);
        }
      });
    });
  } catch (error) {
    throw error;
  }
}

module.exports = createPDFFromDocumentAndSendToFrontend;
