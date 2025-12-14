// ===== AUDIO =====

const idleMusic = new Audio('audio/idle.mp3');
const focusMusic = new Audio('audio/focus.mp3');
const breakMusic = new Audio('audio/break.mp3');
const bell = new Audio('audio/bell.wav');

[idleMusic, focusMusic, breakMusic].forEach(m => {
  m.loop = true;
  m.volume = 0.2;
});

// ===== STATE =====

let mode = null;
let isRunning = false;
let interval = null;
let musicMuted = false;

let workRemaining = 25 * 60;
let breakRemaining = 5 * 60;

// ===== ELEMENTS =====

const minutesEl = document.querySelector('.minutes');
const secondsEl = document.querySelector('.seconds');
const breakEl = document.querySelector('.break-time');

const workBox = document.querySelector('.work-time');
const breakBox = document.querySelector('.break-time');

const message = document.querySelector('.app-message');
const resetBtn = document.querySelector('.btn-restart');

const musicToggle = document.getElementById('music-toggle');
const themeToggle = document.getElementById('theme-toggle');
const bgVideo = document.getElementById('bgVideo');

const clockIcon = document.querySelector('.clock-icon');
const popover = document.getElementById('time-popover');

// ===== HELPERS =====

function stopMusic() {
  [idleMusic, focusMusic, breakMusic].forEach(m => {
    m.pause();
    m.currentTime = 0;
  });
}

function playMusic(type) {
  stopMusic();
  if (musicMuted) return;
  if (type === 'idle') idleMusic.play();
  if (type === 'focus') focusMusic.play();
  if (type === 'break') breakMusic.play();
}

function updateUI() {
  minutesEl.textContent = String(Math.floor(workRemaining / 60)).padStart(2, '0');
  secondsEl.textContent = String(workRemaining % 60).padStart(2, '0');

  const bm = Math.floor(breakRemaining / 60);
  const bs = breakRemaining % 60;
  breakEl.textContent = `${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}`;
}

updateUI();

// ===== TIMER =====

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (mode === 'work') {
      if (--workRemaining <= 0) return endWork();
    }
    if (mode === 'break') {
      if (--breakRemaining <= 0) return endBreak();
    }
    updateUI();
  }, 1000);
}

function pause() {
  clearInterval(interval);
  isRunning = false;
  playMusic('idle');
  message.textContent = 'Paused';
}

function endWork() {
  clearInterval(interval);
  bell.play();
  isRunning = false;
  mode = null;
  playMusic('idle');
  message.textContent = 'Focus complete!';
}

function endBreak() {
  clearInterval(interval);
  bell.play();
  isRunning = false;
  mode = null;
  playMusic('idle');
  message.textContent = 'Break over!';
}

// ===== TIMER TOGGLES =====

workBox.onclick = () => {
  if (isRunning && mode === 'work') return pause();
  mode = 'work';
  isRunning = true;
  playMusic('focus');
  message.textContent = 'Focus running...';
  startTimer();
};

breakBox.onclick = () => {
  if (isRunning && mode === 'break') return pause();
  mode = 'break';
  isRunning = true;
  playMusic('break');
  message.textContent = 'Break time...';
  startTimer();
};

// ===== RESET =====

resetBtn.onclick = () => {
  clearInterval(interval);
  workRemaining = 1500;
  breakRemaining = 300;
  isRunning = false;
  mode = null;
  playMusic('idle');
  updateUI();
  message.textContent = 'Click a timer to start';
};

// ===== MUSIC TOGGLE =====

musicToggle.onclick = () => {
  musicMuted = !musicMuted;
  musicToggle.textContent = musicMuted ? 'music_off' : 'music_note';
  if (musicMuted) stopMusic();
  else playMusic(isRunning ? mode : 'idle');
};

// ===== THEME TOGGLE =====

themeToggle.onclick = () => {
  const isDark = document.body.dataset.theme === 'dark';
  document.body.dataset.theme = isDark ? 'light' : 'dark';
  bgVideo.src = isDark ? 'videos/light.mp4' : 'videos/dark.mp4';
  themeToggle.textContent = isDark ? 'dark_mode' : 'light_mode';
};

// ===== TIME POPOVER =====

clockIcon.onclick = e => {
  e.stopPropagation();
  popover.classList.toggle('hidden');
};

document.onclick = () => popover.classList.add('hidden');
popover.onclick = e => e.stopPropagation();

popover.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;

    const delta = btn.dataset.dir === '+' ? 60 : -60;

    if (btn.dataset.type === 'work') {
      workRemaining = Math.max(60, workRemaining + delta);
    }

    if (btn.dataset.type === 'break') {
      breakRemaining = Math.max(60, breakRemaining + delta);
    }

    updateUI();
  };
});
