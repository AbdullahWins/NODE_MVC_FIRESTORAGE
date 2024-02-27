//cors config
const cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://inventorymanagement.netlify.app",
    "https://msosmangani.xyz",
    "https://store.msosmangani.xyz",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

//with configuration
const initializeCors = (app) => {
  app.use(cors(corsOptions));
};

//without any configuration
// const initializeCors = (app) => {
//   // app.use(cors());
// };

module.exports = { initializeCors };
