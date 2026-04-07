const express = require('express');
const path = require('path');
const { connectDB, getDB } = require('./db');
const { getRandomWord } = require('./words');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// API: Hämta slumpmässigt ord
app.get('/api/word', async (req, res) => {
  const length = parseInt(req.query.length) || 5;
  const unique = req.query.unique === 'true';
  const word = await getRandomWord(length, unique);
  if (!word) return res.status(404).json({ error: 'Inget ord hittades' });
  res.json({ word });
});

// API: Spara highscore
app.post('/api/highscore', async (req, res) => {
  const { name, time, guesses, settings } = req.body;
  if (!name || !time || !guesses || !settings) {
    return res.status(400).json({ error: 'Saknar data' });
  }
  const db = getDB();
  await db.collection('highscores').insertOne({
    name,
    time,
    guesses,
    settings,
    createdAt: new Date()
  });
  res.json({ ok: true });
});

// Highscore-sida (server-side renderad)
app.get('/highscore', async (req, res) => {
  const db = getDB();
  const scores = await db.collection('highscores')
    .find()
    .sort({ time: 1 })
    .limit(20)
    .toArray();

  const rows = scores.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${(s.time / 1000).toFixed(1)}s</td>
      <td>${s.guesses.length}</td>
      <td>${s.settings.length} bokstäver${s.settings.unique ? ', unika' : ''}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <title>Highscore – Wordle</title>
      <style>
        body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px 14px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #f5f5f5; }
        nav a { margin-right: 16px; color: #4a90d9; text-decoration: none; }
      </style>
    </head>
    <body>
      <nav><a href="/">Spela</a><a href="/highscore">Highscore</a><a href="/om">Om</a></nav>
      <h1>🏆 Highscore</h1>
      ${scores.length === 0 ? '<p>Inga resultat än. Spela spelet!</p>' : `
        <table>
          <thead><tr><th>#</th><th>Namn</th><th>Tid</th><th>Gissningar</th><th>Inställningar</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `}
    </body>
    </html>
  `);
});

// Om-sida
app.get('/om', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <title>Om – Wordle</title>
      <style>
        body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; }
        nav a { margin-right: 16px; color: #4a90d9; text-decoration: none; }
      </style>
    </head>
    <body>
      <nav><a href="/">Spela</a><a href="/highscore">Highscore</a><a href="/om">Om</a></nav>
      <h1>Om projektet</h1>
      <p>Detta är ett Wordle-inspirerat spel byggt med Node.js, Express, React och MongoDB.</p>
      <p>Spelet går ut på att gissa ett hemligt ord. Efter varje gissning får du feedback:</p>
      <ul>
        <li>🟢 <strong>Grön</strong> – rätt bokstav på rätt plats</li>
        <li>🟡 <strong>Gul</strong> – bokstaven finns i ordet men på fel plats</li>
        <li>🔴 <strong>Röd</strong> – bokstaven finns inte i ordet</li>
      </ul>
      <p>Du kan välja hur långt ordet ska vara och om bokstäver får upprepas.</p>
    </body>
    </html>
  `);
});

// Alla övriga routes → React-appen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = 5080;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);
  });
});