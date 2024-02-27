// Controllers/productController.js

const Product = require("../models/ProductModel");
const { logger } = require("../services/loggers/Winston");
const { ValidObjectId } = require("../services/validators/ValidObjectId");
const { uploadMultipleFiles } = require("../services/uploaders/fileUploader");

//get all product using mongoose
const getAllProducts = async (req, res) => {
  try {
    //perform query on database
    const products = await Product.getAllProducts();
    if (products?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${products?.length} products`);
    return res.status(200).send(products);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get all product using mongoose with pagination
const getAllProductsPaginated = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 5;
    const products = await Product.getAllProductsPaginated(page, limit);
    if (products.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${products.length} products`);
    return res.status(200).send(products);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single product using mongoose
const getOneProduct = async (req, res) => {
  try {
    const productId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(productId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).send({ message: "product not found" });
    } else {
      logger.log("info", JSON.stringify(product, null, 2));
      return res.status(200).send(product);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//add new product using mongoose
const addOneProduct = async (req, res) => {
  try {
    const {
      productName,
      productCategoryId,
      productPrice,
      productDescription,
      productAddons,
    } = JSON.parse(req?.body?.data);
    const { files } = req;
    if (
      !productName ||
      !productCategoryId ||
      !productPrice ||
      !productDescription ||
      !productAddons ||
      files?.length === 0
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Validate data types and provide custom error messages
    if (
      typeof productName !== "string" ||
      typeof productCategoryId !== "string" ||
      typeof productPrice !== "number" ||
      typeof productDescription !== "string" ||
      !Array.isArray(productAddons)
    ) {
      return res.status(400).send({ message: "Incorrect data type" });
    }

    //validate authority from middleware authentication
    const auth = req?.auth;
    if (!auth) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    // Validate productAddons array
    if (!Array?.isArray(productAddons) || productAddons?.length === 0) {
      return res
        .status(400)
        .send({ message: "Product addons array is required" });
    }
    // Check if every addon in the array has addonName and addonPrice
    if (!productAddons?.every((addon) => addon.addonName && addon.addonPrice)) {
      return res
        .status(400)
        .send({ message: "Each addon must have addonName and addonPrice" });
    }

    //create new product object
    let updatedData = {
      productName,
      productCategoryId,
      productPrice,
      productDescription,
      productAddons,
    };

    if (files?.length > 0) {
      const folderName = "product";
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updatedData = { ...updatedData, productImage: fileUrl };
    }

    //add new product
    const result = await Product.createNewProduct(updatedData);
    console.log(result);
    if (result === null) {
      logger.log("error", "Failed to add product!");
      return res.status(500).send({ message: "Failed to add product!" });
    }
    logger.log("info", `Added a new product: ${result}`);
    return res.status(201).send(result);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add product!" });
  }
};

// update One product using mongoose
const updateOneProduct = async (req, res) => {
  try {
    const productId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    const { files } = req;
    //object id validation
    if (!ValidObjectId(productId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    let updatedData = { ...data };

    if (files?.length > 0) {
      const folderName = "product";
      const fileUrls = await uploadMultipleFiles(files, folderName);
      const fileUrl = fileUrls[0];
      updatedData = { ...updatedData, productImage: fileUrl };
    }

    const updatedProduct = await Product.updateProductById(
      productId,
      updatedData
    );

    if (updatedProduct === null) {
      return res.status(404).send({ message: "Product not found" });
    }
    logger.log("info", `Updated product: ${updatedProduct}`);
    if (!updatedProduct) {
      return res.status(500).json({ error: "Failed to update product image" });
    }
    return res.json({ success: true, updatedProduct });
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to update product image" });
  }
};

//delete one product
const deleteOneProductById = async (req, res) => {
  try {
    const productId = req?.params?.id;
    //object id validation
    if (!ValidObjectId(productId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: productId,
    };
    //delete product
    const result = await Product.deleteOne(filter);
    if (result?.deletedCount === 0) {
      logger.log("error", `No product found with this id: ${productId}`);
      return res
        .status(404)
        .send({ message: "No product found with this id!" });
    } else {
      logger.log("info", `product deleted: ${productId}`);
      return res.status(200).send({
        message: `product deleted!`,
      });
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to delete product!" });
  }
};

module.exports = {
  getAllProducts,
  getAllProductsPaginated,
  getOneProduct,
  addOneProduct,
  updateOneProduct,
  deleteOneProductById,
};
