const { logger } = require("../../src/services/loggers/Winston");
const connectToDatabase = require("../databases/mongoose.config");
const port = process.env.SERVER_PORT || 5000;

//starting the server
async function initializeServer(app) {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();

    app.get("/", (req, res) => {
      logger.log("info", "welcome to the server!");
      res.send("welcome to the server!");
    });

    app.listen(port, () => {
      logger.log("info", `Server is running on port: ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = { initializeServer };
