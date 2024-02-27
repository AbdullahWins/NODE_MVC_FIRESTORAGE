const router = require("express").Router();

// Import routes
const adminRoutes = require("../adminRoutes");
const businessRoutes = require("../businessRoutes");
const userRoutes = require("../userRoutes");
const categoryRoutes = require("../categoryRoutes");
const productRoutes = require("../productRoutes");
const quotationRoutes = require("../quotationRoutes");

// Routes
router.use(adminRoutes);
router.use(businessRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use(quotationRoutes);

module.exports = router;
