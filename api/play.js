const { ytdown } = require("nayan-media-downloader");
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // Ambil query dari parameter request
    const query = req.query.query;

    // Panggil API YTS untuk mencari video dengan query
    const ytsResponse = await axios.get(`https://itzpire.com/search/youtube?query=${encodeURIComponent(query)}`);

    // Pastikan API YTS mengembalikan data video
    if (ytsResponse.data && ytsResponse.data.status === "success" && ytsResponse.data.data.length > 0) {
      // Ambil URL video pertama dari hasil pencarian
      const videoUrl = ytsResponse.data.data[0].url;

      // Download video menggunakan Nayan media downloader
      const downloadUrl = await ytdown(videoUrl);

      // Kirimkan URL hasil download dalam response JSON
      res.json({
        status: "success",
        message: "Video downloaded successfully",
        downloadUrl: downloadUrl
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No videos found for the given query"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request"
    });
  }
};