const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");

async function createPDFFromDocumentAndSaveToFileSystem(document) {
  // Compile the EJS template
  const templatePath = path.join(__dirname, "../../views/emails/Invoice.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = ejs.compile(template);

  // Render the EJS template with the provided data
  const html = compiledTemplate({ invoice: document });

  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Draw HTML content onto the page
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lines = page.drawText(html, {
      x: 50,
      y: height - 50,
      font: await pdfDoc.embedFont("Helvetica"),
      size: fontSize,
      color: rgb(0, 0, 0), // black color
    });

    // Serialize the PDF to a buffer
    const pdfBytes = await pdfDoc.save();

    // Save PDF to file system
    fs.writeFileSync("invoice.pdf", pdfBytes);

    return "Invoice PDF created successfully";
  } catch (error) {
    throw error;
  }
}

module.exports = createPDFFromDocumentAndSaveToFileSystem;
