const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// NOUVEAU : tableau qui stocke tout l'historique de la conversation
// Format attendu par l'API : [{ role: "user", content: "..." }, ...]
let conversationHistory = [];

function addMessage(text, role) {
  const div = document.createElement('div');
  div.classList.add('message', role);
  div.innerHTML = text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/---/g, '<hr>')
  .replace(/\n/g, '<br>');
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  try {
    // NOUVEAU : on envoie aussi l'historique complet
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: conversationHistory  // on envoie l'historique
      })
    });

    const data = await response.json();
    addMessage(data.reply, 'assistant');

    // NOUVEAU : on ajoute les deux derniers messages à l'historique
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.reply }
    );

    // OPTIONNEL : limiter l'historique aux 20 derniers messages
    // (pour éviter des requêtes trop longues et des coûts élevés)
    if (conversationHistory.length > 30) {
      conversationHistory = conversationHistory.slice(-20);
    }

  } catch (error) {
    addMessage('Connection error.', 'assistant');
    console.error(error);
  }

  sendBtn.disabled = false;
  sendBtn.textContent = 'Send';
  userInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// === SAUVEGARDE LOCALE ===
// localStorage persiste les données même si on ferme le navigateur

function saveToLocalStorage() {
  localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    conversationHistory = JSON.parse(saved);
    // Réaffiche les messages sauvegardés
    conversationHistory.forEach(msg => {
      addMessage(msg.content, msg.role);
    });
  }
}

// Charge l'historique au démarrage
loadFromLocalStorage();

// Sauvegarde après chaque envoi (ajoute ça dans sendMessage, après avoir mis à jour conversationHistory)
// Dans la fonction sendMessage, après conversationHistory.push(...), ajoute :
// saveToLocalStorage();


// === BOUTON GET SUMMARY ===
const summaryBtn = document.getElementById('summary-btn');
const summaryModal = document.getElementById('summary-modal');
const summaryText = document.getElementById('summary-text');
const closeModal = document.getElementById('close-modal');

summaryBtn.addEventListener('click', async () => {

  if (conversationHistory.length === 0) {
    alert('Have a conversation first!');
    return;
  }

  summaryBtn.textContent = 'Analyzing...';
  summaryBtn.disabled = true;

  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: conversationHistory })
    });

    const data = await response.json();

    // Affiche le résumé dans la modale
    summaryText.textContent = data.summary;
    summaryModal.style.display = 'flex';

  } catch (error) {
    alert('Error generating summary.');
    console.error(error);
  }

  summaryBtn.textContent = 'Get Summary';
  summaryBtn.disabled = false;
});

// Ferme la modale
closeModal.addEventListener('click', () => {
  summaryModal.style.display = 'none';
});

// Ferme la modale en cliquant dehors
summaryModal.addEventListener('click', (e) => {
  if (e.target === summaryModal) summaryModal.style.display = 'none';
});