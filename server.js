const express = require('express');
const path = require('path');
const { connectDB, getDB } = require('./db');
const { getRandomWord } = require('./words');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

const navHTML = `
  <nav style="display:flex;gap:24px;padding:16px 32px;background:#16213e;border-bottom:1px solid #0f3460;">
    <a href="/" style="color:#e94560;text-decoration:none;font-weight:bold;letter-spacing:1px;">🎮 Spela</a>
    <a href="/highscore" style="color:#e94560;text-decoration:none;font-weight:bold;letter-spacing:1px;">🏆 Highscore</a>
    <a href="/om" style="color:#e94560;text-decoration:none;font-weight:bold;letter-spacing:1px;">ℹ️ Om</a>
  </nav>
`;

const baseStyle = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #1a1a2e;
      color: #eee;
      font-family: 'Segoe UI', sans-serif;
    }
    .container {
      max-width: 700px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 {
      font-size: 2rem;
      color: #e94560;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 24px;
      text-align: center;
    }
    .card {
      background: #16213e;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
  </style>
`;


app.get('/api/word', async (req, res) => {
  const length = parseInt(req.query.length) || 5;
  const unique = req.query.unique === 'true';
  const word = await getRandomWord(length, unique);
  if (!word) return res.status(404).json({ error: 'Inget ord hittades' });
  res.json({ word });
});


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

// Highscore-sida
app.get('/highscore', async (req, res) => {
  const db = getDB();
  const scores = await db.collection('highscores')
    .find()
    .sort({ time: 1 })
    .limit(20)
    .toArray();

  const medals = ['🥇', '🥈', '🥉'];

  const rows = scores.map((s, i) => `
    <tr style="border-bottom:1px solid #0f3460;">
      <td style="padding:14px 16px;color:#e94560;font-weight:bold;">${medals[i] || i + 1}</td>
      <td style="padding:14px 16px;font-weight:bold;">${s.name}</td>
      <td style="padding:14px 16px;color:#4caf50;">${(s.time / 1000).toFixed(1)}s</td>
      <td style="padding:14px 16px;color:#aaa;">${s.guesses.length} gissningar</td>
      <td style="padding:14px 16px;color:#aaa;">${s.settings.length} bokstäver${s.settings.unique ? ', unika' : ''}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <title>Highscore – Wordle</title>
      ${baseStyle}
      <style>
        table { width: 100%; border-collapse: collapse; }
        th { padding: 12px 16px; text-align: left; color: #888; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; border-bottom: 2px solid #0f3460; }
        tr:hover { background: #0f3460; }
        .empty { text-align: center; color: #888; padding: 40px 0; }
      </style>
    </head>
    <body>
      ${navHTML}
      <div class="container">
        <h1>🏆 Highscore</h1>
        <div class="card">
          ${scores.length === 0 ? `
            <div class="empty">
              <p style="font-size:3rem;">🎮</p>
              <p style="margin-top:12px;">Inga resultat än – spela spelet!</p>
              <a href="/" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#e94560;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Spela nu</a>
            </div>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Namn</th>
                  <th>Tid</th>
                  <th>Gissningar</th>
                  <th>Inställningar</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `}
        </div>
      </div>
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
      ${baseStyle}
      <style>
        .feedback-box {
          display: flex;
          gap: 12px;
          margin: 12px 0;
          align-items: center;
        }
        .tile {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .tile-label {
          color: #aaa;
          font-size: 14px;
        }
        p { color: #ccc; line-height: 1.7; margin-bottom: 16px; }
        h2 { color: #e94560; margin: 24px 0 12px; font-size: 1.1rem; letter-spacing: 1px; text-transform: uppercase; }
        .tech { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .badge {
          background: #0f3460;
          color: #e94560;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      ${navHTML}
      <div class="container">
        <h1>ℹ️ Om projektet</h1>
        <div class="card">
          <h2>Vad är det här?</h2>
          <p>Ett Wordle inspirerat spel där du gissar ett hemligt ord. Du väljer själv hur långt ordet ska vara.</p>

          <h2>Hur spelar man?</h2>
          <p>Skriv in ett ord och tryck på "Gissa". Du får direkt feedback på varje bokstav:</p>

          <div class="feedback-box">
            <div class="tile" style="background:#4caf50;">A</div>
            <span class="tile-label">Rätt bokstav på rätt plats</span>
          </div>
          <div class="feedback-box">
            <div class="tile" style="background:#ff9800;">B</div>
            <span class="tile-label">Bokstaven finns i ordet men på fel plats</span>
          </div>
          <div class="feedback-box">
            <div class="tile" style="background:#c0392b;">C</div>
            <span class="tile-label">Bokstaven finns inte i ordet</span>
          </div>

          <h2>Tekniker</h2>
          <p>Spelet är byggt med följande tekniker:</p>
          <div class="tech">
            <span class="badge">Node.js</span>
            <span class="badge">Express</span>
            <span class="badge">React</span>
            <span class="badge">Vite</span>
            <span class="badge">MongoDB</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = 5080;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);
  });
});