// ===== WORDS =====
const WORDS = `
in one good real one not school set they state high life consider
on and not come what also for set point can want as while with of
order child about school thing never hold find each too between
program work end you home place around while place problem end begin
interest public where see time those increase give think seem small
`.trim().split(/\s+/);

// ===== STATE =====
let mode = "time";      // "time" or "words"
let gameTime = 15;      // seconds
let wordsLimit = 10;    // for words mode

let timer = null;
let startTime = null;
let correctChars = 0;
let typedChars = 0;

let wordIndex = 0;
let letterIndex = 0;

let highestWpm = 0;
const goal = 50;
let goalCode = "---";   // will change when goal reached

// ===== ELEMENTS =====
const game = document.getElementById('game');
const wordsEl = document.getElementById('words');
const cursor = document.getElementById('cursor');

const progressLeft = document.getElementById('progress-left');
const progressRight = document.getElementById('progress-right');

const goalBarFill = document.getElementById('goal-bar-fill');
const goalBarText = document.getElementById('goal-bar-text');
const goalCodeEl = document.getElementById('goal-code');

const modeTabs = document.querySelectorAll('.mode-tab');
const timeButtons = document.querySelectorAll('.time-btn');
const wordsButtons = document.querySelectorAll('.words-btn');

const timeOptions = document.getElementById('time-options');
const wordsOptions = document.getElementById('words-options');

const newGameBtn = document.getElementById('newGameBtn');
const confettiContainer = document.getElementById('confetti-container');

// ===== HELPERS =====
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

function updateGoalCode() {
  goalCodeEl.textContent = "Code: " + goalCode;
}

// ===== CODE CLICK (COPY) =====
goalCodeEl.addEventListener("click", () => {
  if (goalCode === "---") return;
  navigator.clipboard.writeText(goalCode);
  goalCodeEl.classList.add("copied");
  setTimeout(() => goalCodeEl.classList.remove("copied"), 600);
});

// ===== CONFETTI =====
function baguetteConfetti() {
  const total = 120;

  for (let i = 0; i < total; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "baguette";

      const icons = ["🥖", "🥐"];
      el.textContent = icons[Math.floor(Math.random() * icons.length)];

      const slice = 100 / total;
      const base = slice * i;
      const jitter = Math.random() * slice;
      el.style.left = (base + jitter) + "vw";

      el.style.fontSize = (1.5 + Math.random() * 2.5) + "rem";
      el.style.animationDuration = (4 + Math.random() * 3) + "s";

      confettiContainer.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    }, i * 20);
  }
}

// ===== END GAME =====
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

      // ⭐ YOUR CODE VALUE HERE
      goalCode = "49201";   // change this to whatever you want
      updateGoalCode();
    }
  }
}

// ===== KEYBOARD HANDLING =====
game.addEventListener('keydown', e => {
  if (game.classList.contains('over')) return;

  const word = wordsEl.children[wordIndex];
  const letters = word?.children;
  if (!letters) return;

  if (e.key.length === 1 && e.key !== ' ') {
    startTimer();
  }

  // Normal character
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

  // Backspace
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

  // Space
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

// ===== CURSOR =====
function updateCursor() {
  const word = wordsEl.children[wordIndex];
  const letter = word?.children[letterIndex] || word?.lastChild;
  if (!letter) return;

  const rect = letter.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();

  cursor.style.top = (rect.top - gameRect.top) + "px";
  cursor.style.left = (rect.left - gameRect.left) + "px";
}

// ===== NEW GAME BUTTON =====
newGameBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  game.classList.remove('over');

  correctChars = 0;
  typedChars = 0;

  if (mode === "time") {
    progressLeft.textContent = `Time: ${gameTime}s`;
  } else {
    progressLeft.textContent = `Words: 0/${wordsLimit}`;
  }
  progressRight.textContent = "WPM: 0";

  buildWords();
  updateCursor();
});

// ===== MODE TABS =====
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    mode = tab.dataset.mode;

    if (mode === "time") {
      timeOptions.style.display = "flex";
      wordsOptions.style.display = "none";
      progressLeft.textContent = `Time: ${gameTime}s`;
    } else {
      timeOptions.style.display = "none";
      wordsOptions.style.display = "flex";
      progressLeft.textContent = `Words: 0/${wordsLimit}`;
    }

    clearInterval(timer);
    timer = null;
    game.classList.remove('over');
    correctChars = 0;
    typedChars = 0;
    progressRight.textContent = "WPM: 0";

    buildWords();
    updateCursor();
  });
});

// ===== TIME BUTTONS =====
timeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    timeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    gameTime = parseInt(btn.dataset.time, 10);
    if (mode === "time") {
      progressLeft.textContent = `Time: ${gameTime}s`;
    }
  });
});

// ===== WORDS BUTTONS =====
wordsButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    wordsButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    wordsLimit = parseInt(btn.dataset.words, 10);
    if (mode === "words") {
      progressLeft.textContent = `Words: 0/${wordsLimit}`;
    }

    clearInterval(timer);
    timer = null;
    game.classList.remove('over');
    correctChars = 0;
    typedChars = 0;
    progressRight.textContent = "WPM: 0";

    buildWords();
    updateCursor();
  });
});

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", () => {
  buildWords();
  updateGoalBar();
  updateGoalCode();

  if (mode === "time") {
    progressLeft.textContent = `Time: ${gameTime}s`;
  } else {
    progressLeft.textContent = `Words: 0/${wordsLimit}`;
  }
  progressRight.textContent = "WPM: 0";
});
