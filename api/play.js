const { ytdown } = require("nayan-media-downloader");
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const query = req.query.query;
    const ytsResponse = await axios.get(`https://itzpire.com/search/youtube?query=${encodeURIComponent(query)}`);

    if (ytsResponse.data && ytsResponse.data.status === "success") {
      const videos = ytsResponse.data.data.filter(video => video.duration.seconds <= 600);

      if (videos.length > 0) {
        const videoUrl = videos[0].url;
        const downloadUrl = await ytdown(videoUrl);
        res.json({
          status: "success",
          message: "Video downloaded successfully",
          downloadUrl: downloadUrl
        });
      } else {
        res.status(404).json({
          status: "error",
          message: "No videos found under 10 minutes for the given query"
        });
      }
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