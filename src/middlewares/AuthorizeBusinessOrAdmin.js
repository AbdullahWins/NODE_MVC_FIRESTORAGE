//middleware to verify JWT
const jwt = require("jsonwebtoken");
const Business = require("../models/BusinessModel");
const Admin = require("../models/AdminModel");
const { logger } = require("../services/loggers/Winston");

const authorizeBusinessOrAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, async (err, auth) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    const id = auth?.id;
    const query = { _id: id };
    const doc = await Business.findOne(query);
    if (!doc) {
      const doc = await Admin.findOne(query);
      if (!doc) {
        return res.status(401).json({
          message: "No valid business or admin exists with the given token!",
        });
      }
      logger.log("info", `Admin: ${doc?.email} is accessing the API!`);
      req.auth = { ...doc, role: "admin" };
    } else {
      logger.log("info", `Business: ${doc?.email} is accessing the API!`);
      req.auth = { ...doc, role: "business" };
    }
    next();
  });
};

module.exports = { authorizeBusinessOrAdmin };
