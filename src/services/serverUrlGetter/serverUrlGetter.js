// serverBaseUrlGetter.js

const serverUrlGetter = (req) => {
  // Construct the server base URL
  const serverBaseUrl = `${req.protocol}://${req.get("host")}`;
  return serverBaseUrl;
};

module.exports = serverUrlGetter;
