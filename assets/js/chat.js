// async function sendMessage(message) {
//   try {
//     const response = await fetch('/.netlify/functions/proxy', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messages: [{ role: "user", content: message }]
//       })
//     });
    
//     const data = await response.json();
//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error;
//   }
// }

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