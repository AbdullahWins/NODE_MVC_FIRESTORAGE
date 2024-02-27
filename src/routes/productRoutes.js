const router = require("express").Router();
const {
  authorizeUserOrAdminOrBusiness,
} = require("../middlewares/AuthorizeUserOrAdminOrBusiness");
const {
  authorizeBusinessOrAdmin,
} = require("../middlewares/AuthorizeBusinessOrAdmin");

const {
  getAllProducts,
  getAllProductsPaginated,
  getOneProduct,
  addOneProduct,
  updateOneProduct,
  deleteOneProductById,
} = require("../controllers/productController");

router.get("/products/all", getAllProducts);
router.get("/products/all/paginated", getAllProductsPaginated);
router.get("/products/find/:id", getOneProduct);
router.post("/products/add", authorizeUserOrAdminOrBusiness, addOneProduct);
router.patch(
  "/products/update/:id",
  authorizeBusinessOrAdmin,
  updateOneProduct
);
router.delete(
  "/products/delete/:id",
  authorizeBusinessOrAdmin,
  deleteOneProductById
);

module.exports = router;
