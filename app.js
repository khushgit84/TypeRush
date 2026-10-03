/* ========================================
   TYPERUSH — APP LOGIC
   ======================================== */

(() => {
  'use strict';

  // ---- Paragraphs pool ----
  const PARAGRAPHS = [
    "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains painting the sky in shades of orange and purple",
    "Programming is the art of telling a computer what to do through carefully written instructions that form the backbone of every digital experience we encounter daily",
    "Technology has transformed the way we communicate work and live our lives making it possible to connect with people across the globe in just a matter of seconds",
    "The greatest glory in living lies not in never falling but in rising every time we fall and learning from every experience that shapes who we become over time",
    "Artificial intelligence is rapidly changing the landscape of software development enabling developers to write better code faster and with fewer bugs than ever before",
    "A good developer writes code that humans can understand while a great developer writes code that is maintainable scalable and elegant in its simplicity and design",
    "The ocean waves crashed against the rocky shoreline as seagulls circled overhead and the salty breeze carried the scent of adventure across the sandy beach at dawn",
    "Innovation distinguishes between a leader and a follower and those who dare to think differently are the ones who end up changing the world for the better",
    "Every expert was once a beginner and every master was once a disaster but through persistence dedication and hard work they transformed their weaknesses into strengths",
    "The night sky was filled with countless stars each one a distant sun with its own planets and possibilities stretching across the infinite expanse of the universe",
    "Clean code is not written by following a set of rules rather it is written by a professional who cares deeply about the craft and takes pride in quality",
    "Music has the power to transport us to different places and times evoking emotions and memories that words alone cannot capture in their full depth and meaning",
    "Success is not final and failure is not fatal it is the courage to continue that counts and the determination to keep pushing forward despite all the obstacles",
    "The ancient library held thousands of books each containing worlds of knowledge waiting to be explored by curious minds seeking wisdom and understanding of the universe",
    "Building software is like constructing a cathedral it requires vision patience attention to detail and the collaborative effort of many skilled individuals working toward a common goal",
    "The morning dew glistened on the fresh green leaves as birds began their daily symphony welcoming another beautiful day filled with endless possibilities and new beginnings",
    "Data structures and algorithms form the foundation of computer science and mastering them is essential for any developer who wants to write efficient and optimized code",
    "Creativity is intelligence having fun and when you combine imagination with technical skill you can build things that not only work well but also inspire and delight users",
    "The winding mountain trail offered breathtaking views of the valley below where a river snaked through the lush green forest creating a scene of natural beauty and peace",
    "Writing tests for your code is like investing in insurance it takes time and effort upfront but saves you from catastrophic failures and costly bugs down the road",
  ];

  // ---- State ----
  let duration = 30;
  let timeLeft = 30;
  let timerInterval = null;
  let isRunning = false;
  let isFinished = false;
  let currentText = '';
  let charIndex = 0;
  let correctChars = 0;
  let wrongChars = 0;
  let totalTyped = 0;

  // ---- DOM ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const textDisplay  = $('#text-display');
  const typingInput  = $('#typing-input');
  const typingCard   = $('#typing-card');
  const typingHint   = $('#typing-hint');
  const liveWpm      = $('#live-wpm');
  const liveAccuracy = $('#live-accuracy');
  const liveTimer    = $('#live-timer');
  const liveChars    = $('#live-chars');
  const btnRestart   = $('#btn-restart');
  const durTabs      = $$('.dur-tab');
  const durTabsWrap  = $('#duration-tabs');
  const resultsOverlay = $('#results-overlay');
  const btnTryAgain  = $('#btn-try-again');

  // ---- Helpers ----
  function pickRandomText() {
    // Pick enough paragraphs to fill the duration
    const needed = Math.ceil(duration / 15);
    const shuffled = [...PARAGRAPHS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(needed, shuffled.length)).join(' ');
  }

  function renderText() {
    textDisplay.innerHTML = '';
    for (let i = 0; i < currentText.length; i++) {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = currentText[i];
      if (i === 0) span.classList.add('current');
      else span.classList.add('pending');
      textDisplay.appendChild(span);
    }
  }

  function updateLiveStats() {
    const elapsed = duration - timeLeft;
    // WPM = (correct chars / 5) / minutes
    const minutes = elapsed / 60 || 1 / 60;
    const wpm = Math.round((correctChars / 5) / minutes);
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    liveWpm.textContent = isNaN(wpm) || wpm < 0 ? 0 : wpm;
    liveAccuracy.textContent = accuracy;
    liveTimer.textContent = timeLeft;
    liveChars.textContent = correctChars;
  }

  function scrollTextDisplay() {
    const chars = textDisplay.querySelectorAll('.char');
    if (charIndex < chars.length) {
      const currentChar = chars[charIndex];
      const containerTop = textDisplay.getBoundingClientRect().top;
      const charTop = currentChar.getBoundingClientRect().top;
      const offset = charTop - containerTop;
      // Keep 2 lines visible above
      if (offset > 60) {
        textDisplay.scrollTop += offset - 30;
      }
    }
  }

  // ---- Duration indicator position ----
  function updateDurIndicator() {
    const activeTab = durTabsWrap.querySelector('.dur-tab.active');
    const indicator = durTabsWrap.querySelector('.dur-indicator');
    if (activeTab && indicator) {
      indicator.style.left = activeTab.offsetLeft + 'px';
      indicator.style.width = activeTab.offsetWidth + 'px';
    }
  }

  // ---- Timer ----
  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    typingHint.classList.add('hidden');

    timerInterval = setInterval(() => {
      timeLeft--;
      updateLiveStats();

      if (timeLeft <= 0) {
        endTest();
      }
    }, 1000);
  }

  function endTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isFinished = true;
    typingInput.disabled = true;
    typingCard.classList.add('completed');
    showResults();
  }

  function showResults() {
    const elapsed = duration;
    const minutes = elapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes);
    const cpm = Math.round(correctChars / minutes);
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    const wordsTyped = Math.round(correctChars / 5);

    // Set values
    $('#result-wpm').textContent = wpm;
    $('#result-accuracy').textContent = accuracy + '%';
    $('#result-correct').textContent = correctChars;
    $('#result-wrong').textContent = wrongChars;
    $('#result-cpm').textContent = cpm;
    $('#result-words').textContent = wordsTyped;
    $('#result-time').textContent = duration + 's';

    // Subtitle
    const sub = $('#results-sub');
    if (wpm >= 80) sub.textContent = '🔥 Blazing fast! You\'re a typing legend!';
    else if (wpm >= 60) sub.textContent = '⚡ Impressive speed! Keep it up!';
    else if (wpm >= 40) sub.textContent = '👍 Great job! Room for improvement.';
    else if (wpm >= 20) sub.textContent = '💪 Good start! Practice makes perfect.';
    else sub.textContent = '🌱 Keep practicing, you\'ll get faster!';

    // Animate WPM ring (max ~150 WPM for full circle)
    const ringFill = $('.wpm-ring-fill');
    const circumference = 2 * Math.PI * 78; // r=78
    const fraction = Math.min(wpm / 150, 1);
    const offset = circumference * (1 - fraction);

    // Reset first
    ringFill.style.transition = 'none';
    ringFill.style.strokeDashoffset = circumference;

    // Show overlay
    resultsOverlay.classList.add('show');

    // Animate after a tick
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ringFill.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4, 0, .2, 1)';
        ringFill.style.strokeDashoffset = offset;
      });
    });

    // Animate WPM counter
    animateCounter($('#result-wpm'), wpm, 1200);
  }

  function animateCounter(el, target, durationMs) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * ease);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Reset / Init ----
  function resetTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isFinished = false;
    charIndex = 0;
    correctChars = 0;
    wrongChars = 0;
    totalTyped = 0;
    timeLeft = duration;

    typingInput.disabled = false;
    typingInput.value = '';
    typingCard.classList.remove('completed', 'shake');
    typingHint.classList.remove('hidden');
    resultsOverlay.classList.remove('show');

    currentText = pickRandomText();
    renderText();
    updateLiveStats();
    typingInput.focus();
  }

  // ---- Input Handling ----
  typingInput.addEventListener('input', (e) => {
    if (isFinished) return;

    if (!isRunning) {
      startTimer();
    }

    const inputVal = typingInput.value;
    const chars = textDisplay.querySelectorAll('.char');

    // Process the last typed character
    if (inputVal.length > 0 && charIndex < currentText.length) {
      const typedChar = inputVal[inputVal.length - 1];
      const expectedChar = currentText[charIndex];

      totalTyped++;

      if (typedChar === expectedChar) {
        chars[charIndex].classList.remove('current', 'pending');
        chars[charIndex].classList.add('correct');
        correctChars++;
      } else {
        chars[charIndex].classList.remove('current', 'pending');
        chars[charIndex].classList.add('wrong');
        wrongChars++;

        // Shake feedback
        typingCard.classList.add('shake');
        setTimeout(() => typingCard.classList.remove('shake'), 300);
      }

      charIndex++;

      // Set next current
      if (charIndex < chars.length) {
        chars[charIndex].classList.remove('pending');
        chars[charIndex].classList.add('current');
      }

      // Clear input to keep it clean
      typingInput.value = '';

      // Scroll if needed
      scrollTextDisplay();

      updateLiveStats();

      // Check if we've typed all characters
      if (charIndex >= currentText.length) {
        endTest();
      }
    }
  });

  // Prevent paste
  typingInput.addEventListener('paste', (e) => e.preventDefault());

  // ---- Duration Tab Events ----
  durTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (isRunning) return; // Don't switch during test
      durTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      duration = parseInt(tab.dataset.duration);
      timeLeft = duration;
      updateDurIndicator();
      resetTest();
    });
  });

  // ---- Button Events ----
  btnRestart.addEventListener('click', resetTest);
  btnTryAgain.addEventListener('click', resetTest);

  // Close results on backdrop click
  resultsOverlay.addEventListener('click', (e) => {
    if (e.target === resultsOverlay) resetTest();
  });

  // Keyboard: Tab to restart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      resetTest();
    }
    if (e.key === 'Escape' && resultsOverlay.classList.contains('show')) {
      resetTest();
    }
  });

  // Click on text display focuses input
  textDisplay.addEventListener('click', () => {
    typingInput.focus();
  });

  // ---- Init ----
  function init() {
    currentText = pickRandomText();
    renderText();
    updateLiveStats();
    updateDurIndicator();
    typingInput.focus();
  }

  // Update indicator on resize
  window.addEventListener('resize', updateDurIndicator);

  init();
})();
