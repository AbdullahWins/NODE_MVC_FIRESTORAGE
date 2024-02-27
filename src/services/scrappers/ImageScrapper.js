const axios = require("axios");
const cheerio = require("cheerio");

async function ImageScrapperWithCheerio(query) {
  try {
    const response = await axios.get(
      `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`
    );
    const $ = cheerio.load(response.data);

    // Find all image elements and extract the src attribute of the first one that has a full URL
    let imageUrl;
    $("img").each(function () {
      const src = $(this).attr("src");
      if (src && src.startsWith("http")) {
        imageUrl = src;
        return false; // exit the loop once we find the first image with a full URL
      }
    });

    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function ImageScrapperWithGoogle(query) {
  try {
    const apiKey = "YOUR_API_KEY"; // Replace with your API key
    const searchEngineId = "YOUR_SEARCH_ENGINE_ID"; // Replace with your search engine ID
    const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
      query
    )}&searchType=image`;

    const response = await axios.get(endpoint);
    const imageUrl = response.data.items[0]?.link;
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

module.exports = { ImageScrapperWithCheerio, ImageScrapperWithGoogle };
