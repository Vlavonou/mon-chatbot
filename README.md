# My English Friend — Chatbot IA Personnel

Un chatbot conversationnel personnel pour pratiquer l'anglais avec une IA.
L'IA corrige discrètement les fautes de grammaire et génère un résumé pédagogique.

---

## Fonctionnalités

- Conversation naturelle en anglais avec une IA
- Correction des fautes de grammaire expliquée en français
- Bouton "Get Summary" pour un bilan pédagogique de la session
- Sauvegarde automatique de l'historique (localStorage)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | HTML, CSS, JavaScript vanilla |
| Backend | Node.js + Express |
| IA | Groq API (LLaMA 3.3 70B) |
| Stockage | localStorage (navigateur) |

---

## Installation et lancement

### 1. Cloner le projet

```bash
git clone https://github.com/TON-USERNAME/mon-chatbot.git
cd mon-chatbot
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la clé API

Crée un fichier `.env` à la racine du projet :

```
GROQ_API_KEY=ta_clé_api_groq_ici
PORT=3000
```

> Ne partage jamais ton fichier `.env` — il est ignoré par Git.

### 4. Lancer le serveur

```bash
node server.js
```

### 5. Ouvrir l'application

Ouvre ton navigateur et va sur :

```
http://localhost:3000
```

---

## Structure du projet

```
mon-chatbot/
├── public/
│   ├── index.html      ← interface de l'application
│   ├── style.css       ← design
│   └── app.js          ← JavaScript frontend
├── server.js           ← serveur Node.js + routes API
├── .env                ← clé API (non partagé)
├── .gitignore          ← fichiers ignorés par Git
├── package.json        ← dépendances du projet
└── README.md           ← ce fichier
```

---

## Obtenir une clé API Groq

1. Va sur [console.groq.com](https://console.groq.com)
2. Crée un compte gratuit
3. Va dans **API Keys** → **Create API Key**
4. Copie la clé et mets-la dans ton fichier `.env`

---

## Comment utiliser

1. Lance le serveur avec `node server.js`
2. Ouvre `http://localhost:3000` dans ton navigateur
3. Écris un message en anglais et appuie sur **Send** ou **Entrée**
4. L'IA répond et corrige tes fautes discrètement en français
5. Clique sur **Get Summary** pour voir un bilan de tes erreurs

---

## Usage

Ce projet est à usage **strictement personnel** pour pratiquer l'anglais.
Il n'est pas destiné à être déployé publiquement.

---

*Projet construit en suivant un guide pédagogique pour apprendre Node.js et les APIs IA.*# mon-chatbot
