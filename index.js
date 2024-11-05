const express = require('express');
const llama = require("./api/llama.js");
const sistem = require("./api/sistem.js");
const app = express();

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


app.get('/', (req, res) =>{
  if (!req.query.enc) return res.json({message: "Masukkan parameter enc"})
  const decoded = Buffer.from(req.query.enc, 'base64').toString('utf8');
  res.json(decoded);
})
app.get('/system',async (req, res)=>{
  await sistem.alic(req, res);
})
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
