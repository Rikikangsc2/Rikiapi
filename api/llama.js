const axios = require('axios');

const GROQ_API_KEY = "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"; // Replace with your actual Groq API key
const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
let chatHistory = [];

const handleChat = async (req, res, systemMessage) => {
  const userId = req.query.user;
  const prompt = req.query.text;
  systemMessage = systemMessage || req.query.systemPrompt;
  const aiMessage = req.query.aiMessage;

  const sendRequest = async (sliceLength) => {
    try {
      const messages = chatHistory.slice(-sliceLength);
      const payload = {
        messages: [
          { role: "system", content: systemMessage },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: "user", content: prompt },
          aiMessage ? { role: "system", content: aiMessage } : null
        ].filter(Boolean),
        model: "gemma2-9b-it", // You can change the model if needed
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false, // Set to true for streaming responses
        stop: null
      };

      const response = await axios.post(groqApiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        }
      });

      const assistantMessage = { role: "assistant", content: response.data.choices[0].message.content.trim() };
      chatHistory.push({ role: "user", content: prompt }, assistantMessage);

      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-20);
      }

      assistantMessage.content = assistantMessage.content.replace(/\n\n/g, '\n    ');
      assistantMessage.content = assistantMessage.content.replace(/\*\*/g, '*');

      if (userId) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
          json: { [userId]: chatHistory }
        });
      }

      res.json({ result: assistantMessage.content, history: userId ? `https://copper-ambiguous-velvet.glitch.me/read/${userId}` : null });
      return true;
    } catch (error) {
      console.error(error)
      return false;
    }
  };

  try {
    let readResponse = { data: {} };

    if (userId) {
      try {
        readResponse = await axios.get(`https://copper-ambiguous-velvet.glitch.me/read/${userId}`);
      } catch (error) {
        await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, { json: { [userId]: [] } });
        readResponse.data = {};
      }
      chatHistory = readResponse.data[userId] || [];
    } else {
      chatHistory = []; // Empty history for anonymous users
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
      await axios.post(`https://copper-ambiguous-velvet.glitch.me/write/${userId}`, {
        json: { [userId]: [] }
      });
    }
    console.error('Error request:', error);
    res.status(200).json({ result: 'Hello new user👋🏻' });
  }
};

module.exports = { handleChat };
