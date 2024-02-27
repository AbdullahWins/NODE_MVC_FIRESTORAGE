const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const pdf = require("html-pdf");

async function createPDFFromDocument(document) {
  // Render the EJS template with the provided data
  const html = document;

  try {
    // Generate PDF from HTML
    const options = { format: "Letter" };
    return new Promise((resolve, reject) => {
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  } catch (error) {
    throw error;
  }
}

module.exports = createPDFFromDocument;
