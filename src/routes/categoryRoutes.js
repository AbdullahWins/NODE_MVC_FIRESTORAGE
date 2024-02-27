const router = require("express").Router();
const {
  authorizeUserOrAdminOrBusiness,
} = require("../middlewares/AuthorizeUserOrAdminOrBusiness");
const {
  authorizeBusinessOrAdmin,
} = require("../middlewares/AuthorizeBusinessOrAdmin");

const {
  getAllCategories,
  getAllCategoriesWithProducts,
  getOneCategory,
  addOneCategory,
  updateOneCategory,
  deleteOneCategoryById,
} = require("../controllers/categoryController");

router.get("/categories/all", getAllCategories);
router.get("/categories/all-with-products", getAllCategoriesWithProducts);
router.get("/categories/find/:id", getOneCategory);
router.post("/categories/add", authorizeUserOrAdminOrBusiness, addOneCategory);
router.patch(
  "/categories/update/:id",
  authorizeBusinessOrAdmin,
  updateOneCategory
);
router.delete(
  "/categories/delete/:id",
  authorizeBusinessOrAdmin,
  deleteOneCategoryById
);

module.exports = router;
