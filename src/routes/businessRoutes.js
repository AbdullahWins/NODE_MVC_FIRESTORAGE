const router = require("express").Router();
const {
  authorizeBusinessOrAdmin,
} = require("../middlewares/AuthorizeBusinessOrAdmin");

const {
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
} = require("../controllers/businessController");

router.get("/businesses/find/:id", authorizeBusinessOrAdmin, getOneBusiness);
router.get("/businesses/username/:username", getOneBusinessByUsername);
router.get("/businesses/all", authorizeBusinessOrAdmin, getAllBusinesses);
router.post("/businesses/register", RegisterBusiness);
router.post("/businesses/login", LoginBusiness);
router.post("/businesses/send-otp", sendPasswordResetOTP);
router.post("/businesses/validate-otp", validatePasswordResetOTP);
router.patch("/businesses/reset", updateBusinessPasswordByOTP);
router.patch(
  "/businesses/update/:id",
  authorizeBusinessOrAdmin,
  updateBusinessById
);
router.patch(
  "/businesses/upload",
  authorizeBusinessOrAdmin,
  uploadImageToBusiness
);
router.patch(
  "/businesses/resetpassword/:email",
  updateBusinessPasswordByOldPassword
);
router.delete(
  "/businesses/delete/:id",
  authorizeBusinessOrAdmin,
  deleteBusinessById
);

module.exports = router;
