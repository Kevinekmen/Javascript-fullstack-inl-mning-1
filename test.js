function checkGuess(guess, correctWord) {
    let result = [];
    let used = [];

    for (let i = 0; i < correctWord.length; i++) {
        used.push(false);
    }

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === correctWord[i]) {
            result[i] = { letter: guess[i], result: "correct" };
            used[i] = true;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (result[i]) continue;

        let found = false;

        for (let j = 0; j < correctWord.length; j++) {
            if (guess[i] === correctWord[j] && used[j] === false) {
                found = true;
                used[j] = true;
                break;
            }
        }

        if (found) {
            result[i] = { letter: guess[i], result: "misplaced" };
        } else {
            result[i] = { letter: guess[i], result: "incorrect" };
        }
    }

    return result;
}

//Test strategi
//Test 1: HELLO vs HALLÅ
//Syfte: kontrollera en blnanding av korrekta och inkorrekta bokstäver


//Test 2: APPLE vs APPLE
//Syfte: alla bokstäver sak vara korrekta

//Test 3: AAAAA vs APPLE
//Syfte: testa dubbletter

//Test 4: LEPPA vs APPLE
//Syfte: kontrollera misplacerade bokstäver

console.log(checkGuess("HELLO", "HALLÅ"));
console.log(checkGuess("APPLE", "APPLE"));
console.log(checkGuess("AAAAA", "APPLE"));
console.log(checkGuess("LEPPA", "APPLE"));