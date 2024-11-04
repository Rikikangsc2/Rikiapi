const express = require('express');
const axios = require('axios');
const https = require('https');
const userAgentGenerator = require('user-agents-generator');

const app = express();

// Endpoint /llama
app.get('/llama', async (req, res, next) => {
  try {
    const user = req.query.user || 'riki';
    const text = req.query.text || 'anda siapa';
    const systemPrompt = req.query.systemPrompt || 'anda adalah AI';

    const userAgentMethods = [
      userAgentGenerator.chrome,
      userAgentGenerator.firefox,
      userAgentGenerator.safari,
      userAgentGenerator.android,
      userAgentGenerator.ios
    ];

    const randomMethod = userAgentMethods[Math.floor(Math.random() * userAgentMethods.length)];
    const userAgent = randomMethod();

    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': userAgent
      }
    });

    const url = 'https://purapi-server.rf.gd/llama.php';
    const params = { user, text, systemPrompt };

    const response = await instance.get(url, { params });

    res.json(response.data);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
      error: error.message
    });
  }
});

// Mulai server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
