// Controllers/QuotationController.js

const Quotation = require("../models/QuotationModel");
const { logger } = require("../services/loggers/Winston");
const { ValidObjectId } = require("../services/validators/ValidObjectId");
const { sendInvoiceEmail } = require("../services/invoices/sendInvoiceEmail");
const {
  sendInvoiceAlertToBusiness,
} = require("../services/invoices/sendInvoiceAlertToBusiness");
// const createPDFFromDocumentAndSendToFrontend = require("../services/pdf/createPDFFromDocumentAndSendToFrontend");

//get all Quotation using mongoose
const getAllQuotations = async (req, res) => {
  try {
    //perform query on database
    const quotations = await Quotation.getAllQuotations();
    if (quotations?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${quotations?.length} quotations`);
    return res.status(200).send(quotations);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get all Quotation using mongoose with pagination
const getAllQuotationsPaginated = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 5;
    const quotations = await Quotation.getAllQuotationsPaginated(page, limit);
    if (quotations.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${quotations.length} quotations`);
    return res.status(200).send(quotations);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single Quotation using mongoose
const getOneQuotation = async (req, res) => {
  try {
    const quotationId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(quotationId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const quotation = await Quotation.getQuotationById(quotationId);
    if (!quotation) {
      return res.status(404).send({ message: "quotation not found" });
    } else {
      logger.log("info", JSON.stringify(quotation, null, 2));
      return res.status(200).send(quotation);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//add new quotation using mongoose
const addOneQuotation = async (req, res) => {
  try {
    const { clientName, clientEmail, clientNumber, campaignName, products } =
      JSON.parse(req?.body?.data);
    if (
      !clientName ||
      !clientEmail ||
      !clientNumber ||
      !campaignName ||
      !products
    ) {
      return res.status(400).send({
        clientName,
        clientEmail,
        clientNumber,
        campaignName,
        products,
      });
    }

    // Validate data types and provide custom error messages
    if (
      typeof clientName !== "string" ||
      typeof clientEmail !== "string" ||
      typeof clientNumber !== "string" ||
      typeof campaignName !== "string" ||
      !Array.isArray(products)
    ) {
      return res.status(400).send({ message: "Incorrect data type" });
    }

    //validate authority from middleware authentication
    // const auth = req?.auth;
    // if (!auth) {
    //   return res.status(401).send({ message: "Unauthorized" });
    // }
    // Validate products array
    if (!Array?.isArray(products) || products?.length === 0) {
      return res.status(400).send({ message: "Products array is required" });
    }

    //create new quotation object
    let updatedData = {
      clientName,
      clientEmail,
      clientNumber,
      campaignName,
      products,
    };

    //add new quotation
    const result = await Quotation.createNewQuotation(updatedData);
    console.log(result);
    await sendInvoiceEmail({ data: result, subject: "Quotation Alert!" });
    await sendInvoiceAlertToBusiness({
      data: result,
      subject: "New Quotation Recieved!",
    });
    if (result === null) {
      logger.log("error", "Failed to add quotation!");
      return res.status(500).send({ message: "Failed to add quotation!" });
    }
    logger.log("info", `Added a new quotation: ${result}`);
    return res.status(201).send(result);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add quotation!" });
  }
};

//add new quotation and send pdf stream using mongoose
// const addOneQuotationAndSendPdf = async (req, res) => {
//   try {
//     const { clientName, clientEmail, clientNumber, campaignName, products } =
//       JSON.parse(req?.body?.data);
//     if (
//       !clientName ||
//       !clientEmail ||
//       !clientNumber ||
//       !campaignName ||
//       !products
//     ) {
//       return res.status(400).send({
//         clientName,
//         clientEmail,
//         clientNumber,
//         campaignName,
//         products,
//       });
//     }

//     // Validate data types and provide custom error messages
//     if (
//       typeof clientName !== "string" ||
//       typeof clientEmail !== "string" ||
//       typeof clientNumber !== "string" ||
//       typeof campaignName !== "string" ||
//       !Array.isArray(products)
//     ) {
//       return res.status(400).send({ message: "Incorrect data type" });
//     }

//     //validate authority from middleware authentication
//     // const auth = req?.auth;
//     // if (!auth) {
//     //   return res.status(401).send({ message: "Unauthorized" });
//     // }
//     // Validate products array
//     if (!Array?.isArray(products) || products?.length === 0) {
//       return res.status(400).send({ message: "Products array is required" });
//     }

//     //create new quotation object
//     let updatedData = {
//       clientName,
//       clientEmail,
//       clientNumber,
//       campaignName,
//       products,
//     };

//     //add new quotation
//     const result = await Quotation.createNewQuotation(updatedData);
//     console.log(result);
//     await sendInvoiceEmail({ data: result, subject: "Quotation Alert!" });
//     const prfStream = await createPDFFromDocumentAndSendToFrontend(result);
//     if (prfStream) {
//       return res.status(200).send({ pdf: prfStream });
//     }
//     if (result === null) {
//       logger.log("error", "Failed to add quotation!");
//       return res.status(500).send({ message: "Failed to add quotation!" });
//     }
//     logger.log("info", `Added a new quotation: ${result}`);
//     return res.status(201).send(result);
//   } catch (error) {
//     logger.log("error", `Error: ${error?.message}`);
//     return res.status(500).send({ message: "Failed to add quotation!" });
//   }
// };

// update One quotation using mongoose
const updateOneQuotation = async (req, res) => {
  try {
    const quotationId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    //object id validation
    if (!ValidObjectId(quotationId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    const updatedData = { ...data };

    const updatedQuotation = await Quotation.updateQuotationById(
      quotationId,
      updatedData
    );

    if (updatedQuotation === null) {
      return res.status(404).send({ message: "Quotation not found" });
    }
    logger.log("info", `Updated quotation: ${updatedQuotation}`);
    if (!updatedQuotation) {
      return res
        .status(500)
        .json({ error: "Failed to update quotation image" });
    }
    return res.json({ success: true, updatedQuotation });
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res
      .status(500)
      .send({ message: "Failed to update quotation image" });
  }
};

//delete one quotation
const deleteOneQuotationById = async (req, res) => {
  try {
    const quotationId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(quotationId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: quotationId,
    };
    //delete quotation
    const result = await Quotation.deleteOne(filter);
    if (result?.deletedCount === 0) {
      logger.log("error", `No quotation found with this id: ${quotationId}`);
      return res
        .status(404)
        .send({ message: "No quotation found with this id!" });
    } else {
      logger.log("info", `quotation deleted: ${quotationId}`);
      return res.status(200).send({
        message: `quotation deleted!`,
      });
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to delete quotation!" });
  }
};

module.exports = {
  getAllQuotations,
  getAllQuotationsPaginated,
  getOneQuotation,
  addOneQuotation,
  // addOneQuotationAndSendPdf,
  updateOneQuotation,
  deleteOneQuotationById,
};
