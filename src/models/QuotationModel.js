const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const productAddonSchema = new mongoose.Schema({
  addonName: {
    type: String,
    required: true,
  },
  addonPrice: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  productAddons: {
    type: [productAddonSchema],
    default: [],
  },
});

const quotationSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  clientNumber: {
    type: String,
    required: true,
  },
  campaignName: {
    type: String,
    required: true,
  },
  products: {
    type: [productSchema],
    default: [],
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//create a new quotation
quotationSchema.statics.createNewQuotation = async function (quotationData) {
  try {
    const newQuotation = new this(quotationData);
    const savedQuotation = await newQuotation.save();
    return savedQuotation;
  } catch (error) {
    throw error;
  }
};

//get all quotation
quotationSchema.statics.getAllQuotations = async function () {
  try {
    const quotations = await this.find();
    return quotations;
  } catch (error) {
    throw error;
  }
};

//get all quotation with pagination
quotationSchema.statics.getAllQuotationsPaginated = async function (
  page = 1,
  limit = 5
) {
  try {
    const skip = (page - 1) * limit;
    const quotations = await this.find().skip(skip).limit(limit);
    return quotations;
  } catch (error) {
    throw error;
  }
};

// Get quotations grouped by category
quotationSchema.statics.getQuotationsByCategory = async function () {
  try {
    const quotationsByCategory = await this.aggregate([
      {
        $group: {
          _id: "$quotationCategory",
          quotations: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          categoryName: "$_id",
          quotations: 1,
          _id: 0,
        },
      },
    ]);

    return quotationsByCategory;
  } catch (error) {
    throw error;
  }
};

//get single quotation
quotationSchema.statics.getQuotationById = async function (quotationId) {
  try {
    const quotation = await this.findById(quotationId);
    return quotation;
  } catch (error) {
    throw error;
  }
};

//update quotation
quotationSchema.statics.updateQuotationById = async function (
  quotationId,
  updatedData
) {
  try {
    const updatedQuotation = await this.findByIdAndUpdate(
      (_id = quotationId),
      updatedData,
      //return the updated document
      { new: true }
    );
    return updatedQuotation;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
quotationSchema.statics.deleteQuotationById = async function (quotationId) {
  try {
    const deletedQuotation = await this.findByIdAndRemove(quotationId);
    return deletedQuotation;
  } catch (error) {
    throw error;
  }
};

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
