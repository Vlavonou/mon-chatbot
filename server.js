// === CHARGEMENT DES BIBLIOTHÈQUES ===

// dotenv : charge les variables de .env dans process.env
require('dotenv').config();

// express : crée notre serveur web
const express = require('express');

// groq-sdk : permet de parler à l'API Groq
const Groq = require('groq-sdk');

// === CONFIGURATION ===

const app = express();      // crée l'application Express
const PORT = process.env.PORT || 3000;  // port depuis .env ou 3000 par défaut

// Initialise Groq avec notre clé API (depuis .env)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// === MIDDLEWARES ===
// Un middleware est une fonction qui s'exécute à chaque requête

// Permet à Express de lire le JSON envoyé dans les requêtes
app.use(express.json());

// Sert automatiquement les fichiers du dossier "public"
// (index.html, style.css, app.js seront accessibles depuis le navigateur)
app.use(express.static('public'));

// === ROUTE API ===
// Une route = une adresse que le frontend peut appeler

// POST /api/chat : reçoit un message, renvoie la réponse de l'IA
// Le "system prompt" : instructions secrètes permanentes données à l'IA
// L'utilisateur ne le voit pas, mais l'IA le suit toujours
const SYSTEM_PROMPT = `You are a friendly English conversation partner helping a French speaker practice their English.

YOUR BEHAVIOR:
1. First, respond naturally to what the user said in English (1-2 sentences).
2. Then, if the user made ANY grammar or vocabulary mistake, you MUST add a correction section in French exactly like this format:

---
Correction :
Tu as dit : [exactly what the user wrote]
On dit plutôt : [the corrected version]
Pourquoi : [explanation in French why this is wrong]
Exemple : [2 correct example sentences]
---

3. If the user made NO mistake, just respond naturally in English without any correction section.

EXAMPLES OF HOW YOU MUST RESPOND:

User says "I are happy today" :
"You're happy today? That's wonderful! What's making you smile?

---
Correction :
Tu as dit : I are happy today
On dit plutôt : I am happy today
Pourquoi : Le verbe "to be" se conjugue différemment selon le sujet. Avec "I" on utilise toujours "am". "Are" s'utilise avec you/we/they.
Exemple : I am tired. I am happy to meet you.
---"

User says "Yesterday I go to the shop" :
"Oh you went to the shop yesterday! Did you find what you needed?

---
Correction :
Tu as dit : Yesterday I go to the shop
On dit plutôt : Yesterday I went to the shop
Pourquoi : Avec "yesterday" on utilise le passé simple. Le verbe "go" est irrégulier, son passé est "went".
Exemple : Yesterday I went to the shop. Last week I went to Paris.
---"

IMPORTANT:
- NEVER skip a mistake. ALWAYS correct it.
- Corrections MUST always be in French.
- Always end with a question in English to keep the conversation going.
- Be warm and encouraging.
- PRIORITY OF CORRECTIONS : Focus only on serious mistakes that would confuse 
  a native speaker or show weak English level. These are worth correcting :
  wrong verb tense, wrong verb conjugation, missing words, wrong word order,
  wrong preposition, serious spelling mistakes.
- DO NOT correct : missing punctuation, missing comma, capital letters,
  informal style, or very minor things that don't affect understanding.`;

app.post('/api/chat', async (req, res) => {

  // Maintenant on reçoit aussi l'historique depuis le frontend
  const { message, history } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message vide' });
  }

  try {
    // Construction des messages : système + historique + nouveau message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },  // instructions permanentes
      ...(history || []),                              // historique passé
      { role: 'user', content: message }             // nouveau message
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 600
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour générer un résumé pédagogique
app.post('/api/summary', async (req, res) => {

  const { history } = req.body;

  if (!history || history.length === 0) {
    return res.status(400).json({ error: 'No conversation to summarize' });
  }

  // Construit un résumé de la conversation en texte
  const conversationText = history
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const summaryPrompt = `Here is an English conversation with a language learner:

${conversationText}

Please analyze the conversation and provide a helpful learning summary with:
1. **Main mistakes made** (grammar, vocabulary, spelling)
2. **Corrections** with brief explanations
3. **Good phrases used** (positive reinforcement)
4. **3 practice examples** for the main mistake patterns

Keep it friendly, clear, and encouraging. Format it nicely.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 800
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });

  } catch (error) {
    console.error('Erreur summary:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// === DÉMARRAGE DU SERVEUR ===
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});