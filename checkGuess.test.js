const checkGuess = require('./checkGuess');


//Test strategi
//Test 1: HELLO vs HALLÅ
//Syfte: kontrollera en blnanding av korrekta och inkorrekta bokstäver


//Test 2: APPLE vs APPLE
//Syfte: alla bokstäver sak vara korrekta

//Test 3: AAAAA vs APPLE
//Syfte: testa dubbletter

//Test 4: LEPPA vs APPLE
//Syfte: kontrollera misplacerade bokstäver


test("alla bokstäver rätt", () => {
    const result = checkGuess("APPLE", "APPLE");
    expect(result.every(r => r.result === "correct")).toBe(true);
});

test("inga bokstäver rätt", () => {
    const result = checkGuess("BBBBB", "APPLE");
    expect(result.every(r => r.result === "incorrect")).toBe(true);
});

test("dubbletter hanteras korrekt", () => {
    const result = checkGuess("AAAAA", "APPLE");
    const correctCount = result.filter(r => r.result === "correct").length;
    expect(correctCount).toBe(1);
});

test("misplaced fungerar", () => {
    const result = checkGuess("LEPPA", "APPLE");
    expect(result.some(r => r.result === "misplaced")).toBe(true);
});