// Controllers/CategoryController.js

const Category = require("../models/CategoryModel");
const { logger } = require("../services/loggers/Winston");
const { ValidObjectId } = require("../services/validators/ValidObjectId");
const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");

//get all Category using mongoose
const getAllCategories = async (req, res) => {
  try {
    //perform query on database
    const categories = await Category.getAllCategories();
    if (categories?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${categories?.length} categories`);
    return res.status(200).send(categories);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get all Categories with products using mongoose
const getAllCategoriesWithProducts = async (req, res) => {
  try {
    //perform query on database
    const categories = await Category.getAllCategoriesWithProducts();
    if (categories?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${categories?.length} categories`);
    return res.status(200).send(categories);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single Category using mongoose
const getOneCategory = async (req, res) => {
  try {
    const categoryId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(categoryId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const category = await Category.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).send({ message: "category not found" });
    } else {
      logger.log("info", JSON.stringify(category, null, 2));
      return res.status(200).send(category);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//add new category using mongoose
const addOneCategory = async (req, res) => {
  try {
    const { categoryName, categoryTags } = JSON.parse(req?.body?.data);
    const { files } = req;
    if (!categoryName || !categoryTags || files?.length === 0) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    //validate authority from middleware authentication
    const auth = req?.auth;
    if (!auth) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    //create new category object
    let updatedData = {
      categoryName,
      categoryTags,
    };

    if (files?.length > 0) {
      const folderName = "category";
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updatedData = { ...updatedData, categoryImage: fileUrl };
    }

    //add new Category
    const result = await Category.createNewCategory(updatedData);
    if (result === null) {
      logger.log("error", "Failed to add category!");
      return res.status(500).send({ message: "Failed to add category!" });
    }
    logger.log("info", `Added a new category: ${result}`);
    return res.status(201).send(result);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add category!" });
  }
};

// update One Category using mongoose
const updateOneCategory = async (req, res) => {
  try {
    const categoryId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { files } = req;
    //object id validation
    if (!ValidObjectId(categoryId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    let updatedData = { ...data };

    if (files?.length > 0) {
      const folderName = "category";
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updatedData = { ...updatedData, categoryImage: fileUrl };
    }

    const updatedCategory = await Category.updateCategoryById(
      categoryId,
      updatedData
    );
    // const updatedCategory = await Category.findOneAndUpdate(
    //   { _id: categoryId },
    //   {
    //     $set: updatedData,
    //   },
    //   { new: true } // To return the updated document
    // );

    if (updatedCategory === null) {
      return res.status(404).send({ message: "Category not found" });
    }
    logger.log("info", `Updated category: ${updatedCategory}`);
    if (!updatedCategory) {
      return res.status(500).json({ error: "Failed to update Category image" });
    }
    return res.json({ success: true, updatedCategory });
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to update Category image" });
  }
};

//delete one category
const deleteOneCategoryById = async (req, res) => {
  try {
    const categoryId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(categoryId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: categoryId,
    };
    //delete category
    const result = await Category.deleteOne(filter);
    if (result?.deletedCount === 0) {
      logger.log("error", `No category found with this id: ${categoryId}`);
      return res
        .status(404)
        .send({ message: "No category found with this id!" });
    } else {
      logger.log("info", `category deleted: ${categoryId}`);
      return res.status(200).send({
        message: `category deleted!`,
      });
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to delete category!" });
  }
};

module.exports = {
  getAllCategories,
  getAllCategoriesWithProducts,
  getOneCategory,
  addOneCategory,
  updateOneCategory,
  deleteOneCategoryById,
};
