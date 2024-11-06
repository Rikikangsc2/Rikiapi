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
        res.json({audio: `https://purapi.koyeb.app/yt?type=mp3&url=${videoUrl}`, video: `https://purapi.koyeb.app/yt?type=mp4&url=${videoUrl}`,data:videos[0]})
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
      message: error.message
    });
  }
};