const express = require('express');
const llama = require("./api/llama.js");

const app = express();

app.get('/llama', async (req, res) => {
  await llama.handleChat(req, res);
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
