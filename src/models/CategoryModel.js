const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");

const categorySchema = new mongoose.Schema({
  categoryName: String,
  categoryImage: String,
  categoryTags: [],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// Get all categories with products, sorted by category name
categorySchema.statics.getAllCategoriesWithProducts = async function () {
  try {
    const categoriesWithProducts = await this.aggregate([
      {
        $lookup: {
          from: "products", // Name of the 'Product' collection
          localField: "_id",
          foreignField: "productCategoryId",
          as: "products",
        },
      },
      {
        $project: {
          categoryName: 1,
          categoryImage: 1,
          categoryTags: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                _id: "$$product._id",
                productName: "$$product.productName",
                productDescription: "$$product.productDescription",
                productImage: "$$product.productImage",
                productPrice: "$$product.productPrice",
                productAddons: "$$product.productAddons",
                // Add other product fields as needed
              },
            },
          },
          createdAt: 1,
        },
      },
      {
        $sort: { categoryName: 1 },
      },
    ]);

    return categoriesWithProducts;
  } catch (error) {
    throw error;
  }
};

//create a new Category
categorySchema.statics.createNewCategory = async function (categoryData) {
  try {
    const newCategory = new this(categoryData);
    const savedCategory = await newCategory.save();
    return savedCategory;
  } catch (error) {
    throw error;
  }
};

//get all Category
categorySchema.statics.getAllCategories = async function () {
  try {
    const categories = await this.find();
    return categories;
  } catch (error) {
    throw error;
  }
};

//get single Category
categorySchema.statics.getCategoryById = async function (categoryId) {
  try {
    const category = await this.findById(categoryId);
    return category;
  } catch (error) {
    throw error;
  }
};

//update Category
categorySchema.statics.updateCategoryById = async function (
  categoryId,
  updatedData
) {
  try {
    const updatedCategory = await this.findByIdAndUpdate(
      (_id = categoryId),
      updatedData,
      //return the updated document
      { new: true }
    );
    return updatedCategory;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
categorySchema.statics.deleteCategoryById = async function (categoryId) {
  try {
    const deletedCategory = await this.findByIdAndRemove(categoryId);
    return deletedCategory;
  } catch (error) {
    throw error;
  }
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
