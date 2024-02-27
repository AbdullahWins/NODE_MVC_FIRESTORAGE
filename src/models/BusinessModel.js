// models/businessModel.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const bcrypt = require("bcrypt");
const { InitiateToken } = require("../services/tokens/InitiateToken");

const businessSchema = new mongoose.Schema({
  name: String,
  userName: String,
  logo: String,
  coverImage: String,
  email: String,
  phone: String,
  password: String,
  description: String,
  contactEmail: String,
  primaryColor: String,
  secondaryColor: String,
  font: String,
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// static method for login
businessSchema.statics.login = async function ({ email, password }) {
  try {
    const business = await this.findOne({ email }).exec();

    if (!business) {
      return { error: "business not found" };
    }

    const passwordMatch = await bcrypt.compare(password, business.password);

    if (!passwordMatch) {
      return { error: "Invalid password" };
    }

    const token = InitiateToken(business._id);
    return { business, token };
  } catch (error) {
    return { error: "Internal server error" };
  }
};

// static method for registration
businessSchema.statics.register = async function ({
  userName,
  name,
  email,
  password,
}) {
  try {
    //check if the business already exists
    const existingBusinessCheck = await this.findOne({ email }).exec();
    if (existingBusinessCheck) {
      return { error: "business already exists" };
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create a new business instance
    const newBusiness = new this({
      userName,
      name,
      email,
      password: hashedPassword,
    });

    //save the business to the database
    await newBusiness.save();

    //generate token
    const token = InitiateToken(newBusiness._id);

    return {
      message: "business created successfully",
      token,
      business: newBusiness,
    };
  } catch (error) {
    return { error: "Internal server error" };
  }
};

const Business = mongoose.model("business", businessSchema);

module.exports = Business;
