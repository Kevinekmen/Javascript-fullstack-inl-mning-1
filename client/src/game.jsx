import React, { useState } from 'react';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#1a1a2e',
    color: '#eee',
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom:'60px',
    width:'100%',
  },
  nav: {
    display: 'flex',
    gap: '24px',
    padding: '16px 32px',
    background: '#16213e',
    borderBottom: '1px solid #0f3460',
  },
  navLink: {
    color: '#e94560',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '0 16px',
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '24px',
    color: '#e94560',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#aaa',
    fontSize: '14px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  range: {
    width: '100%',
    margin: '8px 0 20px',
    accentColor: '#e94560',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    color: '#ccc',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  guessRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    justifyContent: 'center',
  },
  tile: (result) => ({
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    background: result === 'correct' ? '#4caf50' : result === 'misplaced' ? '#ff9800' : '#c0392b',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  }),
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '18px',
    borderRadius: '8px',
    border: '2px solid #0f3460',
    background: '#0f3460',
    color: '#fff',
    outline: 'none',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  guessButton: {
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  wonCard: {
    marginTop: '24px',
    background: '#16213e',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  wonTitle: {
    fontSize: '1.8rem',
    color: '#4caf50',
    marginBottom: '8px',
  },
  nameInput: {
    flex: 1,
    padding: '10px 14px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '2px solid #0f3460',
    background: '#0f3460',
    color: '#fff',
    outline: 'none',
  },
  submitButton: {
    padding: '10px 18px',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    color: '#e94560',
    marginTop: '10px',
    fontSize: '14px',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
    marginBottom: '16px',
  },
};

const COLOR = {
  correct: '#4caf50',
  misplaced: '#ff9800',
  incorrect: '#c0392b',
};

function checkGuess(guess, correctWord) {
  const result = [];
  const used = Array(correctWord.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === correctWord[i]) {
      result[i] = { letter: guess[i], result: 'correct' };
      used[i] = true;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i]) continue;
    let found = false;
    for (let j = 0; j < correctWord.length; j++) {
      if (guess[i] === correctWord[j] && !used[j]) {
        found = true;
        used[j] = true;
        break;
      }
    }
    result[i] = { letter: guess[i], result: found ? 'misplaced' : 'incorrect' };
  }

  return result;
}

export default function Game() {
  const [wordLength, setWordLength] = useState(5);
  const [uniqueLetters, setUniqueLetters] = useState(false);
  const [secretWord, setSecretWord] = useState(null);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [won, setWon] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startGame() {
    setLoading(true);
    setError('');
    setGuesses([]);
    setGuess('');
    setWon(false);
    setSubmitted(false);
    setPlayerName('');

    try {
      const res = await fetch(`/api/word?length=${wordLength}&unique=${uniqueLetters}`);
      const data = await res.json();
      if (!data.word) throw new Error('Inget ord');
      setSecretWord(data.word);
      setStartTime(Date.now());
      setEndTime(null);
    } catch {
      setError('Kunde inte hämta ord. Försök igen.');
    }
    setLoading(false);
  }

  function handleGuess() {
    const g = guess.toUpperCase().trim();
    if (g.length !== wordLength) {
      setError(`Ordet måste vara ${wordLength} bokstäver!`);
      return;
    }
    setError('');
    const feedback = checkGuess(g, secretWord);
    const newGuesses = [...guesses, { word: g, feedback }];
    setGuesses(newGuesses);
    setGuess('');
    if (g === secretWord) {
      setWon(true);
      setEndTime(Date.now());
    }
  }

  async function submitScore() {
    if (!playerName.trim()) return;
    await fetch('/api/highscore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName.trim(),
        time: endTime - startTime,
        guesses: guesses.map(g => g.word),
        settings: { length: wordLength, unique: uniqueLetters }
      })
    });
    setSubmitted(true);
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <a href="/" style={styles.navLink}>🎮 Spela</a>
        <a href="/highscore" style={styles.navLink}>🏆 Highscore</a>
        <a href="/om" style={styles.navLink}>ℹ️ Om</a>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.title}>Wordle</h1>

        {!secretWord && (
          <div style={styles.card}>
            <h2 style={{ marginBottom: '20px', color: '#ccc' }}>Inställningar</h2>

            <label style={styles.label}>Ordlängd: <strong style={{ color: '#e94560' }}>{wordLength} bokstäver</strong></label>
            <input
              type="range" min="3" max="10"
              value={wordLength}
              onChange={e => setWordLength(Number(e.target.value))}
              style={styles.range}
            />

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={uniqueLetters}
                onChange={e => setUniqueLetters(e.target.checked)}
              />
              Bara unika bokstäver
            </label>

            <button onClick={startGame} disabled={loading} style={styles.button}>
              {loading ? 'Laddar ord...' : 'Starta spelet'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {secretWord && (
          <>
            <p style={styles.hint}>Gissa ett ord med <strong>{wordLength}</strong> bokstäver</p>

            <div style={{ marginBottom: '16px' }}>
              {guesses.map((g, i) => (
                <div key={i} style={styles.guessRow}>
                  {g.feedback.map((f, j) => (
                    <div key={j} style={styles.tile(f.result)}>
                      {f.letter}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {!won && (
              <div style={styles.inputRow}>
                <input
                  type="text"
                  value={guess}
                  onChange={e => setGuess(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleGuess()}
                  maxLength={wordLength}
                  placeholder={'_ '.repeat(wordLength).trim()}
                  style={styles.input}
                />
                <button onClick={handleGuess} style={styles.guessButton}>
                  Gissa
                </button>
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            {won && (
              <div style={styles.wonCard}>
                <div style={styles.wonTitle}>🎉 Rätt!</div>
                <p>Ordet var <strong style={{ color: '#e94560' }}>{secretWord}</strong></p>
                <p style={{ color: '#aaa' }}>
                  Tid: <strong style={{ color: '#fff' }}>{((endTime - startTime) / 1000).toFixed(1)}s</strong>
                  &nbsp;·&nbsp;
                  Gissningar: <strong style={{ color: '#fff' }}>{guesses.length}</strong>
                </p>

                {!submitted ? (
                  <>
                    <p style={{ color: '#aaa', marginBottom: '10px' }}>Ange ditt namn för highscore:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={playerName}
                        onChange={e => setPlayerName(e.target.value)}
                        placeholder="Ditt namn..."
                        style={styles.nameInput}
                      />
                      <button onClick={submitScore} style={styles.submitButton}>Skicka</button>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#4caf50' }}>✅ Sparat! <a href="/highscore" style={{ color: '#e94560' }}>Se highscore</a></p>
                )}

                <button onClick={startGame} style={{ ...styles.button, marginTop: '16px' }}>
                  Spela igen
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}