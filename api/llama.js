const Groq = require('groq-sdk');
const axios = require('axios');

const groq = new Groq({apiKey: "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"});
let chatHistory = [];

const handleChat = async (req, res) => {
  const userId = req.query.user;
  const prompt = req.query.text || '';
  const systemMessage = req.query.systemPrompt || 'You are a helpful assistant';
  const aiMessage = req.query.aiMessage || '';

  const sendRequest = async (sliceLength) => {
    try {
      const messages = chatHistory.slice(-sliceLength);
      const payload = {
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
          { role: "user", content: prompt },
          aiMessage ? { role: "assistant", content: aiMessage } : null
        ].filter(Boolean),
        model: "gemma2-9b-it", 
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      };

      const chatCompletion = await groq.chat.completions.create(payload);
      let assistantMessage = '';
      for await (const chunk of chatCompletion) {
        assistantMessage += chunk.choices[0]?.delta?.content || '';
      }

      chatHistory.push({ role: "user", content: prompt }, { role: "assistant", content: assistantMessage.trim() });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

      if (userId) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
          json: { [userId]: chatHistory }
        });
      }

      res.json({ result: assistantMessage.trim(), history: userId ? `https://copper-ambiguous-velvet.glitch.me/read/${userId}` : null });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  try {
    if (userId) {
      try {
        const readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
        chatHistory = readResponse.data[userId] || [];
      } catch (error) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, { json: { [userId]: [] } });
        chatHistory = [];
      }
    } else {
      chatHistory = [];
    }

    let success = await sendRequest(20);
    if (!success) success = await sendRequest(15);
    if (!success) success = await sendRequest(10);
    if (!success) success = await sendRequest(5);
    if (!success) {
      chatHistory = [];
      success = await sendRequest(0);
    }
    if (!success) throw new Error('All retries failed');
  } catch (error) {
    if (userId) {
      await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, { json: { [userId]: [] } });
    }
    console.error('Error request:', error);
    res.status(200).json({ result: 'Hello new user👋🏻' });
  }
};

module.exports = { handleChat };