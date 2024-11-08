const express = require('express');
const llama = require("./api/llama.js");
const sistem = require("./api/sistem.js");
const app = express();
const play = require("./api/play.js");

app.set('json spaces', 2);
app.use(express.json({
  reviver: (key, value) => {
    if (value === null) {
      return undefined;
    }
    return value;
  }
}));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const originalSend = res.json;
  res.json = (data) => {
    if (typeof data === 'object') {
      const respong = {
        community: "s.id/purinfo",
        author: 'wa.me/6283894391287',
        ...data
      }
      originalSend.call(res, respong);
    } else {
      originalSend.call(res, data);
    }
  };
  next();
});
//Router
app.get('/llama', llama.handleChat);
app.get('/sistem', sistem.alic);
app.get('/play', play);
app.get('/gemini', (req, res) => res.redirect(`https://purapi.koyeb.app/gemini?text=${req.query.text || ''}&systemPrompt=${req.query.systemPrompt || ''}&user=${req.query.user || ''}`));
app.get('/aio', (req, res) => res.redirect(`https://purapi.koyeb.app/aio?url=${req.query.url}`))

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
