// const axios = require('axios');

// exports.handler = async (event) => {
//   if (event.httpMethod !== 'POST') {
//     return {
//       statusCode: 405,
//       body: 'Method Not Allowed'
//     };
//   }

//   try {
//     const body = JSON.parse(event.body);
    
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: "gpt-4o-mini",
//         messages: body.messages,
//         stream: false
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(response.data)
//     };
//   } catch (error) {
//     console.error('Error:', error);
//     return {
//       statusCode: error.response?.status || 500,
//       body: JSON.stringify({
//         error: error.response?.data || 'Internal Server Error'
//       })
//     };
//   }
// };

// proxy.mjs
async function sendMessage() {
  if (isStreaming) return;

  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  addMessage('▋', 'ai'); // Placeholder initial
  userInput.value = '';
  isStreaming = true;

  try {
    const response = await fetch('/.netlify/functions/proxy', { // Chemin relatif
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }]
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') break;
        
        try {
          const parsed = JSON.parse(message);
          if (parsed.choices[0].delta?.content) {
            aiMessage += parsed.choices[0].delta.content;
            updateAIMessage(aiMessage);
          }
        } catch (e) {
          console.warn('Could not parse JSON:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    updateAIMessage("❌ Erreur de connexion à l'IA");
  } finally {
    isStreaming = false;
  }
}