//imports
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const path = require("path");
dotenv.config();

//module imports
const routes = require("./routes/main/mainRouter.js");
const { initializeCors } = require("../config/cors/cors.config.js");
const { initializeServer } = require("../config/server/server.config.js");
const { initializeMulter } = require("../config/multer/multer.config.js");

//middlewares
app.use(express.urlencoded({ extended: true }));
//cors
initializeCors(app);
//multer
initializeMulter(app);

//routes
app.use(routes);
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//server
initializeServer(app);
