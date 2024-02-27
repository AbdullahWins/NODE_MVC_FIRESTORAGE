const router = require("express").Router();
const {
  authorizeUserOrAdminOrBusiness,
} = require("../middlewares/AuthorizeUserOrAdminOrBusiness");
const {
  authorizeBusinessOrAdmin,
} = require("../middlewares/AuthorizeBusinessOrAdmin");

const {
  getAllQuotations,
  getAllQuotationsPaginated,
  getOneQuotation,
  addOneQuotation,
  // addOneQuotationAndSendPdf,
  updateOneQuotation,
  deleteOneQuotationById,
} = require("../controllers/quotationController");

router.get("/quotations/all", authorizeBusinessOrAdmin, getAllQuotations);
router.get(
  "/quotations/all/paginated",
  authorizeBusinessOrAdmin,
  getAllQuotationsPaginated
);
router.get(
  "/quotations/find/:id",
  authorizeUserOrAdminOrBusiness,
  getOneQuotation
);
router.post("/quotations/add", addOneQuotation);
// router.post("/quotations/getpdf", addOneQuotationAndSendPdf);
router.patch(
  "/quotations/update/:id",
  authorizeBusinessOrAdmin,
  updateOneQuotation
);
router.delete(
  "/quotations/delete/:id",
  authorizeBusinessOrAdmin,
  deleteOneQuotationById
);

module.exports = router;
