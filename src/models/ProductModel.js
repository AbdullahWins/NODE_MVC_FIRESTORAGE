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
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productImage: String,
  productDescription: String,
  productPrice: {
    type: Number,
    required: true,
  },
  activeStatus: {
    type: Boolean,
    default: true,
  },
  productAddons: {
    type: [productAddonSchema],
    default: [],
  },
  productCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category model
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

//create a new product
productSchema.statics.createNewProduct = async function (productData) {
  try {
    const newProduct = new this(productData);
    const savedProduct = await newProduct.save();
    return savedProduct;
  } catch (error) {
    throw error;
  }
};

//get all product
productSchema.statics.getAllProducts = async function () {
  try {
    const products = await this.find();
    return products;
  } catch (error) {
    throw error;
  }
};

//get all product with pagination
productSchema.statics.getAllProductsPaginated = async function (
  page = 1,
  limit = 5
) {
  try {
    const skip = (page - 1) * limit;
    const products = await this.find().skip(skip).limit(limit);
    return products;
  } catch (error) {
    throw error;
  }
};

// Get products grouped by category
productSchema.statics.getProductsByCategory = async function () {
  try {
    const productsByCategory = await this.aggregate([
      {
        $group: {
          _id: "$productCategory",
          products: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          categoryName: "$_id",
          products: 1,
          _id: 0,
        },
      },
    ]);

    return productsByCategory;
  } catch (error) {
    throw error;
  }
};

//get single product
productSchema.statics.getProductById = async function (productId) {
  try {
    const product = await this.findById(productId);
    return product;
  } catch (error) {
    throw error;
  }
};

//update product
productSchema.statics.updateProductById = async function (
  productId,
  updatedData
) {
  try {
    const updatedProduct = await this.findByIdAndUpdate(
      (_id = productId),
      updatedData,
      //return the updated document
      { new: true }
    );
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
productSchema.statics.deleteProductById = async function (productId) {
  try {
    const deletedProduct = await this.findByIdAndRemove(productId);
    return deletedProduct;
  } catch (error) {
    throw error;
  }
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
