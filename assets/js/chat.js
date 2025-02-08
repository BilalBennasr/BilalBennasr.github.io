// chat.js
class OpenAIChat {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.messages = [];
      this.setupUI();
    }
  
    setupUI() {
      // Création des éléments du chat
      const chatContainer = document.createElement('div');
      chatContainer.className = 'chat-container';
      chatContainer.innerHTML = `
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <textarea class="chat-input" placeholder="Posez votre question..."></textarea>
          <button class="chat-submit">Envoyer</button>
        </div>
      `;
  
      document.body.appendChild(chatContainer);
  
      // Récupération des références
      this.messagesContainer = chatContainer.querySelector('.chat-messages');
      this.input = chatContainer.querySelector('.chat-input');
      this.submitButton = chatContainer.querySelector('.chat-submit');
  
      // Ajout des événements
      this.submitButton.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  
    async sendMessage() {
      const content = this.input.value.trim();
      if (!content) return;
  
      // Ajout du message utilisateur
      this.appendMessage('user', content);
      this.input.value = '';
  
      // Préparation du message assistant
      const assistantMessageElement = this.appendMessage('assistant', '');
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [...this.messages, { role: 'user', content }],
            stream: true
          })
        });
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
  
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
  
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                assistantMessage += content;
                assistantMessageElement.textContent = assistantMessage;
              } catch (e) {
                console.error('Error parsing SSE message:', e);
              }
            }
          }
        }
  
        this.messages.push(
          { role: 'user', content },
          { role: 'assistant', content: assistantMessage }
        );
  
      } catch (error) {
        console.error('Error:', error);
        assistantMessageElement.textContent = 'Une erreur est survenue...';
        assistantMessageElement.classList.add('error');
      }
    }
  
    appendMessage(role, content) {
      const messageElement = document.createElement('div');
      messageElement.className = `chat-message ${role}-message`;
      messageElement.textContent = content;
      this.messagesContainer.appendChild(messageElement);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      return messageElement;
    }
  }