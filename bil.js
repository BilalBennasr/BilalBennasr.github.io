document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    const chatLog = document.getElementById('chat-log');
    
    // Afficher le message utilisateur
    chatLog.innerHTML += `<p><strong>Vous:</strong> ${userInput}</p>`;
    
    // Envoyer le message à ton backend (voir étape 2)
    const response = await fetch('https://ton-backend.com/api/chat', {  // Remplace par l'URL de ton endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    });
    
    const data = await response.json();
    
    // Afficher la réponse de l'IA
    chatLog.innerHTML += `<p><strong>IA:</strong> ${data.response}</p>`;
  });
  