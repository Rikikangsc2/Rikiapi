const yts = require('yt-search');

module.exports = async (req, res) => {
  try {
    const query = req.query.query;
    const r = await yts(query);

    // Akses properti 'all' untuk mendapatkan semua hasil video
    const videos = r.all.filter(video => video.type === 'video'); 

    // Urutkan video berdasarkan durasi (ascending)
    videos.sort((a, b) => a.seconds - b.seconds);

    // Ambil video pertama yang durasinya kurang dari atau sama dengan 10 menit (600 detik)
    const video = videos.find(video => video.seconds <= 600);

    if (video) {
      const videoUrl = video.url;
      res.json({
        audio: `https://purapi.koyeb.app/yt?type=mp3&url=${videoUrl}`,
        video: `https://purapi.koyeb.app/yt?type=mp4&url=${videoUrl}`,
        data: video
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "No videos found under 10 minutes for the given query"
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
