const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const query = req.query.query;
    const ytsResponse = await axios.get(`https://itzpire.com/search/youtube?query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
      }
    });

    if (ytsResponse.data && ytsResponse.data.status === "success") {
      const videos = ytsResponse.data.data.filter(video => video.duration.seconds <= 600);

      if (videos.length > 0) {
        const videoUrl = videos[0].url;
        const downloadResponse = await axios.get(`https://purapi.koyeb.app/api/v1/ytdl?url=${encodeURIComponent(videoUrl)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
          }
        });

        res.json(downloadResponse.data);
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