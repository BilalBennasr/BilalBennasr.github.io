let isStreaming = false;

async function sendMessage() {
  if (isStreaming) return;
  
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;

  // Ajouter le message de l'utilisateur
  addMessage(message, 'user');
  userInput.value = '';
  
  isStreaming = true;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `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`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.replace(/^data: /, '');
        if (trimmedLine === '[DONE]') break;
        
        try {
          const data = JSON.parse(trimmedLine);
          const content = data.choices[0]?.delta?.content;
          if (content) {
            aiMessage += content;
            updateAIMessage(aiMessage);
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    addMessage("Désolé, une erreur s'est produite.", 'ai');
  }
  
  isStreaming = false;
}

function addMessage(content, sender) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  messageDiv.textContent = content;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateAIMessage(content) {
  const messages = document.getElementsByClassName('ai-message');
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    lastMessage.textContent = content;
    lastMessage.scrollIntoView({ behavior: 'smooth' });
  }
}