const https = require('https');

let wordCache = [];

function fetchWords() {
  return new Promise((resolve, reject) => {
    https.get('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        wordCache = data.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
        resolve(wordCache);
      });
    }).on('error', reject);
  });
}

async function getRandomWord(length = 5, unique = false) {
  if (wordCache.length === 0) {
    await fetchWords();
  }

  let filtered = wordCache.filter(w => w.length === length);

  if (unique) {
    filtered = filtered.filter(w => new Set(w).size === w.length);
  }

  if (filtered.length === 0) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

module.exports = { getRandomWord };