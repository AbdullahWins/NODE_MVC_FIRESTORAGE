const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Admin = require("../models/AdminModel");
const Business = require("../models/BusinessModel");
const { logger } = require("../services/loggers/Winston");

const authorizeUserOrAdminOrBusiness = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const id = user?.id;
    const query = { _id: id };

    const findUserByModel = async (Model, role) => {
      const doc = await Model.findOne(query);
      if (doc) {
        logger.log("info", `${doc?.email} is accessing the API!`);
        req.auth = { ...doc, role };
        return true;
      }
      return false;
    };

    if (await findUserByModel(User, "user")) {
      logger.log("info", `User is accessing the API!`);
      next();
    } else if (await findUserByModel(Business, "business")) {
      logger.log("info", `Business is accessing the API!`);
      next();
    } else if (await findUserByModel(Admin, "admin")) {
      logger.log("info", `Adminis accessing the API!`);
      next();
    } else {
      return res.status(401).json({
        message:
          "No valid user, business, or admin exists with the given token!",
      });
    }
  });
};

module.exports = { authorizeUserOrAdminOrBusiness };
