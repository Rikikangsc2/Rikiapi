const express = require('express');
const cloudscraper = require('cloudscraper');

const app = express();

app.get('/llama', async (req, res, next) => {
  try {
    const user = req.query.user || 'riki';
    const text = req.query.text || 'anda siapa';
    const systemPrompt = req.query.systemPrompt || 'anda adalah AI';

    const url = 'https://purapi-server.rf.gd/llama.php';
    const params = { user, text, systemPrompt };

    const response = await cloudscraper.get({
      uri: url,
      qs: params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      },
      strictSSL: false 
    });

    res.json(JSON.parse(response)); // Mengembalikan hasil ke client
  } catch (error) {
    next(error); // Jika ada error, lempar ke error handler
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server.',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
