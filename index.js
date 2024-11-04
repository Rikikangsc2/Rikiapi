const express = require('express');
const axios = require('axios');
const https = require('https');
const fakeUa = require('fake-useragent');

const app = express();

// Endpoint /llama
app.get('/llama', async (req, res, next) => {
  try {
    // Parameter yang diterima melalui query
    const user = req.query.user || 'riki';
    const text = req.query.text || 'anda siapa';
    const systemPrompt = req.query.systemPrompt || 'anda adalah AI';

    // Setup axios instance
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Bypass SSL yang tidak valid
      }),
      headers: {
        'User-Agent': fakeUa() // Menggunakan user-agent palsu dari fake-useragent
      }
    });

    const url = 'https://purapi-server.rf.gd/llama.php';
    const params = { user, text, systemPrompt };

    // Mengirim request ke API
    const response = await instance.get(url, { params });

    // Mengembalikan hasil ke client
    res.json(response.data);
  } catch (error) {
    next(error); // Jika ada error, lempar ke error handler
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Cetak error ke console
  res.status(500).json({
    message: 'Terjadi kesalahan pada server.',
    error: err.message
  });
});

// Mulai server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
