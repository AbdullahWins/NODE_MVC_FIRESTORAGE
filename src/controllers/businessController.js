// controllers/businessController.js

const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");
const Business = require("../models/BusinessModel");
const { SendOTP } = require("../services/otp/SendOTP");
const { logger } = require("../services/loggers/Winston");
const {
  ValidatePasswordResetOTP,
} = require("../services/otp/ValidatePasswordResetOTP");
const {
  hashPassword,
  comparePasswords,
} = require("../services/encryptions/bcryptHandler");
const { ValidObjectId } = require("../services/validators/ValidObjectId");

//login using mongoose
const LoginBusiness = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email, password } = data;
    const result = await Business.login({ email, password });
    if (result?.error) {
      return res.status(401).json({ message: result?.error });
    } else {
      logger.log("info", `Business logged in: ${email}`);
      return res.json(result);
    }
  } catch (error) {
    logger.log("error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//register using mongoose
const RegisterBusiness = async (req, res) => {
  try {
    const { userName, name, email, password } = JSON.parse(req?.body?.data);
    //validate required fields
    if (!userName || !name || !email || !password) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    const lowerCaseUsername = userName.toLowerCase();
    const result = await Business.register({
      userName: lowerCaseUsername,
      name,
      email,
      password,
    });
    if (result?.error) {
      return res.status(401).json({ message: result?.error });
    } else {
      logger.log("info", `Business registered: ${email}`);
      return res.status(201).json(result);
    }
  } catch (error) {
    logger.log("error", `Error creating business: ${error?.message}`);
    return res.status(500).json({ error: error?.message });
  }
};

//get all Businesses using mongoose
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    logger.log("info", `Found ${businesses.length} businesses`);
    return res.json(businesses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get single Business by id using mongoose
const getOneBusiness = async (req, res) => {
  try {
    const businessId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(businessId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //get business using model
    const business = await Business.findOne({ _id: businessId });

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    } else {
      logger.log("info", JSON.stringify(business, null, 2));
      return res.send(business);
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Server Error" });
  }
};

// get single Business by username using mongoose
const getOneBusinessByUsername = async (req, res) => {
  try {
    const businessUsername = req?.params?.username;

    //get business using model
    const business = await Business.findOne({ userName: businessUsername });

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    } else {
      logger.log("info", JSON.stringify(business, null, 2));
      return res.send(business);
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Server Error" });
  }
};

// update one business using mongoose
const updateBusinessById = async (req, res) => {
  try {
    const id = req?.params?.id;
    //object id validation
    if (!ValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    const { files } = req;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { password, ...additionalData } = data;
    const folderName = "businesses";
    let updateData = {};

    if (files?.length > 0) {
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const logo = fileUrls[0];
      updateData = { ...updateData, logo };
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData = { ...updateData, password: hashedPassword };
    }

    if (Object.keys(additionalData).length > 0) {
      updateData = { ...updateData, ...additionalData };
    }
    logger.log("info", JSON.stringify(updateData, null, 2));
    const updatedBusiness = await Business.findOneAndUpdate(
      { _id: id },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );

    return res.json({
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    logger.log("error", `Error updating business: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//upload image
const uploadImageToBusiness = async (req, res) => {
  try {
    const { files } = req;
    const folderName = "businesses";
    const fileUrls = await uploadMultipleFiles(files, folderName);
    const imageUrl = fileUrls[0];
    logger.log("info", `Image uploaded: ${imageUrl}`);
    return res.json({ imageUrl });
  } catch (error) {
    logger.log("error", `Error uploading image: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// send password reset OTP to business using mongoose
const sendPasswordResetOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { email } = data;
    const result = await SendOTP({ email, Model: Business });
    if (result?.error) {
      return res.status(401).send({ message: result?.error });
    } else {
      return res.status(200).send({ message: result?.message });
    }
  } catch (error) {
    logger.log("error", error?.message);
    return res.status(500).send({ message: "Failed to send OTP" });
  }
};

// validate OTP using mongoose
const validatePasswordResetOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email } = data;
    const result = await ValidatePasswordResetOTP({
      email,
      otp,
      Model: Business,
    });
    console.log(result);
    if (result?.error) {
      return res.status(401).send({ message: result?.error });
    } else {
      return res.status(200).send({ message: result?.message });
    }
  } catch (err) {
    logger.log("error", err);
    return res
      .status(500)
      .send({ message: "Failed to reset business password" });
  }
};

// update one Business password by email OTP using mongoose
const updateBusinessPasswordByOTP = async (req, res) => {
  try {
    const data = JSON.parse(req?.body?.data);
    const { otp, email, newPassword } = data;

    const otpStatus = await ValidatePasswordResetOTP({
      email,
      otp,
      Model: Business,
    });
    if (otpStatus?.error) {
      logger.log("error", otpStatus?.error);
      return res.status(401).send({ message: otpStatus?.error });
    }
    let updateData = {};
    const hashedPassword = await hashPassword(newPassword);
    updateData = { password: hashedPassword };

    //update password using model
    const result = await Business.findOneAndUpdate(
      { email: email },
      {
        $set: updateData,
      },
      { new: true } // To return the updated document
    );
    logger.log("info", result);
    if (result?.modifiedCount === 0) {
      logger.log("info", `No modifications were made: ${email}`);
      return res.status(404).send({ message: "No modifications were made!" });
    } else {
      logger.log("info", `Password updated for business: ${email}`);
      return res.send({ message: "Password updated successfully!" });
    }
  } catch (err) {
    logger.log("error", err);
    return res
      .status(500)
      .send({ message: "Failed to reset business password" });
  }
};

// update one business password by OldPassword using mongoose
const updateBusinessPasswordByOldPassword = async (req, res) => {
  try {
    const email = req?.params?.email;
    const data = JSON.parse(req?.body?.data);
    const business = await Business.findOne({ email: email });
    const { oldPassword, newPassword } = data;

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const passwordMatch = await comparePasswords({
      inputPassword: oldPassword,
      hashedPassword: business?.password,
    });
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await Business.findOneAndUpdate(
      { email: email },
      {
        $set: { password: hashedPassword },
      },
      { new: true } // To return the updated document
    );
    return res.send({ message: result });
  } catch (err) {
    logger.log("error", err);
    return res
      .status(500)
      .send({ message: "Failed to update business password" });
  }
};

// delete one Business by id using mongoose
const deleteBusinessById = async (req, res) => {
  try {
    const id = req?.params?.id;
    //object id validation
    if (!ValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //delete using model
    const result = await Business.deleteOne({ _id: id });
    if (result?.deletedCount === 0) {
      logger.log("error", `No business found to delete with this id: ${id}`);
      return res.send({
        message: `No business found to delete with this id: ${id} `,
      });
    } else {
      logger.log("info", `business deleted: ${id}`);
      return res.send({
        message: `Business deleted successfully with id: ${id} `,
      });
    }
  } catch (err) {
    logger.log("error", err);
    return res.status(500).send({ message: "Failed to delete business" });
  }
};

module.exports = {
  getOneBusiness,
  getOneBusinessByUsername,
  getAllBusinesses,
  updateBusinessById,
  uploadImageToBusiness,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateBusinessPasswordByOTP,
  RegisterBusiness,
  LoginBusiness,
  updateBusinessPasswordByOldPassword,
  deleteBusinessById,
};
