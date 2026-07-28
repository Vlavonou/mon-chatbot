const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Charge l'historique depuis localStorage au démarrage
// Si rien n'est sauvegardé, on commence avec un tableau vide
let conversationHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

// === FONCTION : AJOUTER UN MESSAGE DANS LE CHAT ===
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

// === FONCTION : SAUVEGARDER DANS LOCALSTORAGE ===
function saveToLocalStorage() {
  localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
}

// === FONCTION : AFFICHER LES ANCIENS MESSAGES AU CHARGEMENT ===
function loadMessages() {
  conversationHistory.forEach(msg => {
    addMessage(msg.content, msg.role);
  });
}

// === FONCTION PRINCIPALE : ENVOYER UN MESSAGE ===
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  userInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: conversationHistory
      })
    });

    const data = await response.json();
    addMessage(data.reply, 'assistant');

    // Ajoute les deux messages à l'historique
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.reply }
    );

    // Limite l'historique aux 20 derniers messages
    if (conversationHistory.length > 30) {
      conversationHistory = conversationHistory.slice(-20);
    }

    // ✅ SAUVEGARDE APRÈS CHAQUE MESSAGE — c'est ici que ça manquait !
    saveToLocalStorage();

  } catch (error) {
    addMessage('❌ Connection error. Is the server running?', 'assistant');
    console.error(error);
  }

  sendBtn.disabled = false;
  sendBtn.textContent = 'Send';
  userInput.focus();
}

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

// === ÉVÉNEMENTS ===
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// === CHARGEMENT INITIAL ===
// Réaffiche les anciens messages au démarrage de la page
loadMessages();