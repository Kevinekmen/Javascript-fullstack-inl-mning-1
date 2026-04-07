import React, { useState } from 'react';

const COLOR = {
  correct: '#4caf50',
  misplaced: '#ff9800',
  incorrect: '#f44336',
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
    <div style={{ fontFamily: 'sans-serif', maxWidth: '500px', margin: '30px auto', padding: '0 16px' }}>
      <h1>🟩 Wordle</h1>

      {!secretWord && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h2>Inställningar</h2>
          <label>Ordlängd: <strong>{wordLength}</strong></label><br />
          <input
            type="range" min="3" max="10"
            value={wordLength}
            onChange={e => setWordLength(Number(e.target.value))}
            style={{ width: '100%', margin: '8px 0 16px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={uniqueLetters}
              onChange={e => setUniqueLetters(e.target.checked)}
            />
            Bara unika bokstäver
          </label>
          <button
            onClick={startGame}
            disabled={loading}
            style={{ marginTop: '16px', padding: '10px 24px', fontSize: '16px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '6px' }}
          >
            {loading ? 'Laddar...' : 'Starta spelet'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}

      {secretWord && (
        <>
          <p style={{ color: '#666' }}>Gissa ett ord med <strong>{wordLength}</strong> bokstäver.</p>
          <div style={{ marginBottom: '16px' }}>
            {guesses.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {g.feedback.map((f, j) => (
                  <div key={j} style={{
                    width: '40px', height: '40px',
                    background: COLOR[f.result],
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '18px',
                    borderRadius: '4px'
                  }}>
                    {f.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {!won && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleGuess()}
                maxLength={wordLength}
                placeholder={`${wordLength} bokstäver...`}
                style={{ padding: '10px', fontSize: '16px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                onClick={handleGuess}
                style={{ padding: '10px 18px', fontSize: '16px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '6px' }}
              >
                Gissa
              </button>
            </div>
          )}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {won && (
            <div style={{ marginTop: '20px', background: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
              <h2>🎉 Rätt! Ordet var <strong>{secretWord}</strong></h2>
              <p>Tid: <strong>{((endTime - startTime) / 1000).toFixed(1)}s</strong> | Gissningar: <strong>{guesses.length}</strong></p>
              {!submitted ? (
                <>
                  <p>Ange ditt namn för highscore:</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="Ditt namn"
                      style={{ padding: '8px', fontSize: '15px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                      onClick={submitScore}
                      style={{ padding: '8px 16px', cursor: 'pointer', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px' }}
                    >
                      Skicka
                    </button>
                  </div>
                </>
              ) : (
                <p>✅ Resultat sparat! <a href="/highscore">Se highscore</a></p>
              )}
              <button
                onClick={startGame}
                style={{ marginTop: '12px', padding: '10px 20px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '6px' }}
              >
                Spela igen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}