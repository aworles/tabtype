const WORDS = `
in one good real one not school set they state high life consider
on and not come what also for set point can want as while with of
order child about school thing never hold find each too between
program work end you home place around while place problem end begin
interest public where see time those increase give think seem small
`.trim().split(/\s+/);

let gameTime = 15;          // ⭐ default 15s
let timer = null;
let startTime = null;
let correctChars = 0;
let typedChars = 0;

let mode = "time";
let wordsLimit = 25;        // ⭐ default 25 words

let highestWpm = 0;
const goal = 55;            // ⭐ 55 WPM goal

// ⭐ NEW: code shown after reaching goal
let goalCode = "---";

const game = document.getElementById('game');
const wordsEl = document.getElementById('words');
const cursor = document.getElementById('cursor');

const progressLeft = document.getElementById('progress-left');
const progressRight = document.getElementById('progress-right');

const goalBarFill = document.getElementById('goal-bar-fill');
const goalBarText = document.getElementById('goal-bar-text');

// ⭐ NEW: code element
const goalCodeEl = document.getElementById('goal-code');

let wordIndex = 0;
let letterIndex = 0;

// ⭐ NEW: update code display
function updateGoalCode() {
  if (goalCodeEl) {
    goalCodeEl.textContent = "Code: " + goalCode;
  }
}

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function buildWords() {
  wordsEl.innerHTML = '';
  wordsEl.style.marginTop = '0px';

  const count = mode === "words" ? wordsLimit : 300;

  for (let i = 0; i < count; i++) {
    const word = document.createElement('div');
    word.className = 'word';

    randomWord().split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      word.appendChild(span);
    });

    wordsEl.appendChild(word);
  }

  wordIndex = 0;
  letterIndex = 0;
  updateCurrent();
  updateCursor();
}

function updateCurrent() {
  document.querySelectorAll('.current').forEach(el =>
    el.classList.remove('current')
  );

  const word = wordsEl.children[wordIndex];
  const letter = word?.children[letterIndex];
  if (word) word.classList.add('current');
  if (letter) letter.classList.add('current');
}

function startTimer() {
  if (timer) return;

  startTime = Date.now();
  timer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const minutes = elapsed / 60;
    const liveWpm = minutes > 0 ? Math.round((typedChars / 5) / minutes) : 0;

    if (mode === "time") {
      const left = Math.max(0, gameTime - Math.floor(elapsed));
      progressLeft.textContent = `Time: ${left}s`;
      progressRight.textContent = `WPM: ${liveWpm}`;
      if (left === 0) endGame();
    } else {
      progressRight.textContent = `WPM: ${liveWpm}`;
    }
  }, 1000);
}

function updateGoalBar() {
  const fill = Math.min(highestWpm / goal, 1);
  goalBarFill.style.width = (fill * 100) + "%";

  if (highestWpm >= goal) {
    goalBarText.textContent = `Highest WPM: ${highestWpm}+ (Goal reached!)`;
  } else {
    goalBarText.textContent = `Highest WPM: ${highestWpm} / ${goal}`;
  }
}

function baguetteConfetti() {
  const container = document.getElementById("confetti-container");

  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "baguette";

      const icons = ["🥖", "🥐"];
      el.textContent = icons[Math.floor(Math.random() * icons.length)];

      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = (1.5 + Math.random() * 2.5) + "rem";
      el.style.animationDuration = (4 + Math.random() * 3) + "s";
      el.style.animationTimingFunction = "linear";

      container.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    }, i * 20);
  }
}

function endGame() {
  clearInterval(timer);
  timer = null;
  game.classList.add('over');

  const elapsed = (Date.now() - startTime) / 1000 || 1;
  const minutes = elapsed / 60;
  const wpm = Math.round((typedChars / 5) / minutes);
  const accuracy = typedChars ? Math.round((correctChars / typedChars) * 100) : 0;

  progressLeft.textContent = `Result`;
  progressRight.textContent = `WPM: ${wpm} | ${accuracy}%`;

  const oldBest = highestWpm;
  if (wpm > highestWpm) {
    highestWpm = wpm;
    updateGoalBar();

    if (oldBest < goal && highestWpm >= goal) {
      baguetteConfetti();

      // ⭐ NEW: set your code here
      goalCode = "903";
      updateGoalCode();
    }
  }
}

game.addEventListener('keydown', e => {
  if (game.classList.contains('over')) return;

  const word = wordsEl.children[wordIndex];
  const letters = word?.children;
  if (!letters) return;

  if (e.key.length === 1 && e.key !== ' ') {
    startTimer();
  }

  if (e.key.length === 1 && e.key !== ' ') {
    if (letterIndex < letters.length) {
      const letter = letters[letterIndex];
      const correct = e.key === letter.textContent;
      letter.classList.add(correct ? 'correct' : 'incorrect');
      typedChars++;
      if (correct) correctChars++;
      letterIndex++;

      if (mode === "words") {
        const isLastWord = wordIndex === wordsLimit - 1;
        const isLastLetter = letterIndex === letters.length;

        if (isLastWord && isLastLetter) {
          updateCurrent();
          updateCursor();
          endGame();
          return;
        }
      }

      updateCurrent();
      updateCursor();
    }
  }

  if (e.key === 'Backspace') {
    if (!timer && typedChars > 0) startTimer();

    if (letterIndex === 0 && wordIndex > 0) {
      const prevWord = wordsEl.children[wordIndex - 1];
      const prevLetters = prevWord.children;

      let hasTyped = false;
      for (let l of prevLetters) {
        if (l.classList.contains('correct') || l.classList.contains('incorrect')) {
          hasTyped = true;
          break;
        }
      }

      if (hasTyped) {
        wordIndex--;
        letterIndex = prevLetters.length;
        updateCurrent();
        updateCursor();
        return;
      }
    }

    if (letterIndex > 0) {
      letterIndex--;
      const letter = letters[letterIndex];

      if (letter.classList.contains('correct')) correctChars--;
      letter.classList.remove('correct', 'incorrect');
      typedChars = Math.max(0, typedChars - 1);

      updateCurrent();
      updateCursor();
    }
  }

  if (e.key === ' ') {
    if (!timer && typedChars > 0) startTimer();

    while (letterIndex < letters.length) {
      const letter = letters[letterIndex];
      letter.classList.add('incorrect');
      typedChars++;
      letterIndex++;
    }

    wordIndex++;
    letterIndex = 0;

    if (mode === "words") {
      progressLeft.textContent = `Words: ${wordIndex}/${wordsLimit}`;
      if (wordIndex >= wordsLimit) {
        endGame();
        return;
      }
    }

    updateCurrent();
    updateCursor();
    e.preventDefault();
  }
});

function updateCursor() {
  const word = wordsEl.children[wordIndex];
  const letter = word?.children[letterIndex] || word?.lastChild;
  if (!letter) return;

  const rect = letter.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();

  cursor.style.top = rect.top - gameRect.top + 'px';
  cursor.style.left =
    (letter === word.children[letterIndex]
      ? rect.left
      : rect.right) - gameRect.left + 'px';

  if (rect.top - gameRect.top > 70) {
    wordsEl.style.marginTop =
      (parseInt(wordsEl.style.marginTop || 0) - 36) + 'px';
  }
}

document.getElementById('newGameBtn').onclick = resetGame;

// TIME BUTTONS
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.onclick = () => {
    gameTime = Number(btn.dataset.time);

    document.querySelectorAll('.time-btn').forEach(b =>
      b.classList.remove('active')
    );
    btn.classList.add('active');

    resetGame();
  };
});

// MODE TABS
document.querySelector('[data-mode="time"]').onclick = () => {
  mode = "time";

  // ⭐ force default 15s and highlight its button
  gameTime = 15;
  document.getElementById("time-options").style.display = "flex";
  document.getElementById("words-options").style.display = "none";

  document.querySelectorAll('.mode-tab').forEach(b =>
    b.classList.remove('active')
  );
  document.querySelector('[data-mode="time"]').classList.add('active');

  document.querySelectorAll('.time-btn').forEach(b =>
    b.classList.remove('active')
  );
  const btn15 = document.querySelector('.time-btn[data-time="15"]');
  if (btn15) btn15.classList.add('active');

  resetGame();
};

document.querySelector('[data-mode="words"]').onclick = () => {
  mode = "words";

  // ⭐ force default 25 words and highlight its button
  wordsLimit = 25;
  document.getElementById("time-options").style.display = "none";
  document.getElementById("words-options").style.display = "flex";

  document.querySelectorAll('.mode-tab').forEach(b =>
    b.classList.remove('active')
  );
  document.querySelector('[data-mode="words"]').classList.add('active');

  document.querySelectorAll('.words-btn').forEach(b =>
    b.classList.remove('active')
  );
  const btn25 = document.querySelector('.words-btn[data-words="25"]');
  if (btn25) btn25.classList.add('active');

  resetGame();
};

// WORDS BUTTONS
document.querySelectorAll('.words-btn').forEach(btn => {
  btn.onclick = () => {
    wordsLimit = Number(btn.dataset.words);

    document.querySelectorAll('.words-btn').forEach(b =>
      b.classList.remove('active')
    );
    btn.classList.add('active');

    resetGame();
  };
});

function resetGame() {
  clearInterval(timer);
  timer = null;
  startTime = null;
  correctChars = 0;
  typedChars = 0;
  game.classList.remove('over');

  if (mode === "time") {
    progressLeft.textContent = `Time: ${gameTime}s`;
    progressRight.textContent = `WPM: 0`;
  } else {
    progressLeft.textContent = `Words: 0/${wordsLimit}`;
    progressRight.textContent = `WPM: 0`;
  }

  buildWords();
  game.focus();
}

const blurOverlay = document.getElementById("blur-overlay");
const focusError = document.getElementById("focus-error");

game.addEventListener("blur", () => {
  blurOverlay.style.display = "block";
  focusError.style.display = "flex";
});

game.addEventListener("focus", () => {
  blurOverlay.style.display = "none";
  focusError.style.display = "none";
});

document.querySelector(".overlay-start").addEventListener("click", () => {
  document.querySelector(".overlay-screen").style.display = "none";
});

buildWords();
resetGame();
updateGoalBar();
updateGoalCode();
game.focus();
