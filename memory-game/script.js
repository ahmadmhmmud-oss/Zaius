// متغيرات اللعبة
const levels = {
  easy: { length: 3, speed: 900 },
  medium: { length: 6, speed: 650 },
  hard: { length: 9, speed: 400 },
  extreme: { length: 13, speed: 250 }
};
const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let userStep = 0;
let score = 0;
let lives = 3;
let currentLevel = 'easy';
let playing = false;

// جسيمات للصفحة الترحيبية
if (document.querySelector('.particles')) {
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.position = 'absolute';
    p.style.width = '12px';
    p.style.height = '12px';
    p.style.borderRadius = '50%';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.top = Math.random()*100 + 'vh';
    p.style.left = Math.random()*100 + 'vw';
    p.style.opacity = Math.random()*0.7+0.3;
    p.style.animation = `moveParticle ${2+Math.random()*3}s infinite alternate`;
    document.querySelector('.particles').appendChild(p);
  }
  const style = document.createElement('style');
  style.innerHTML = `@keyframes moveParticle { from { transform: translateY(0); } to { transform: translateY(-30px); } }`;
  document.head.appendChild(style);
}

// صفحة اللعبة
if (document.querySelector('.game-container')) {
  const timerSpan = document.getElementById('timer');
  let timerInterval = null;
  let timeLeft = 0;
  const scoreSpan = document.getElementById('score');
  const livesSpan = document.getElementById('lives');
  const messageDiv = document.getElementById('message');
  const colorBtns = colors.map(c => document.getElementById(c));
  const levelSelect = document.getElementById('level');
  const startLevelBtn = document.getElementById('startLevel');
  const soundCorrect = document.getElementById('sound-correct');
  const soundWrong = document.getElementById('sound-wrong');

  function resetGameVars() {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = 0;
  if (timerSpan) timerSpan.textContent = 'الوقت: --';
    sequence = [];
    userStep = 0;
    score = 0;
    lives = 3;
    playing = false;
    scoreSpan.textContent = 'النقاط: 0';
    livesSpan.textContent = 'الحيوات: 3';
    messageDiv.textContent = '';
    colorBtns.forEach(btn => btn.disabled = true);
  }

  function generateSequence(level) {
    sequence = [];
    for (let i = 0; i < levels[level].length; i++) {
      sequence.push(colors[Math.floor(Math.random()*colors.length)]);
    }
  }

  function playSequence(level) {
    // بعد عرض التسلسل، يبدأ المؤقت
    function startTimer(level) {
      let seconds = 10;
      if (level === 'easy') seconds = 10;
      else if (level === 'medium') seconds = 15;
      else if (level === 'hard') seconds = 20;
      else if (level === 'extreme') seconds = 25;
      timeLeft = seconds;
      if (timerSpan) timerSpan.textContent = `الوقت: ${timeLeft}`;
      timerInterval = setInterval(() => {
        timeLeft--;
        if (timerSpan) timerSpan.textContent = `الوقت: ${timeLeft}`;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (timerSpan) timerSpan.textContent = 'انتهى الوقت!';
            colorBtns.forEach(btn => btn.disabled = true);
            messageDiv.textContent = 'لقد خسرت ههههه';
            startLevelBtn.disabled = false;
            setTimeout(() => {
              resetGameVars();
            }, 2000);
          }
      }, 1000);
    }
    let i = 0;
    playing = true;
    colorBtns.forEach(btn => btn.disabled = true);
    messageDiv.textContent = 'انتبه للتسلسل...';
    function next() {
      if (i > 0) {
        colorBtns.forEach(btn => btn.classList.remove('active'));
      }
      if (i < sequence.length) {
        const color = sequence[i];
        document.getElementById(color).classList.add('active');
        setTimeout(() => {
          i++;
          next();
        }, levels[level].speed);
      } else {
        colorBtns.forEach(btn => btn.disabled = false);
        messageDiv.textContent = 'كرر التسلسل!';
        playing = false;
        userStep = 0;
          startTimer(level);
      }
    }
    next();
  }

  function handleUserInput(color) {
    if (timeLeft > 0) {
      clearInterval(timerInterval);
      if (timerSpan) timerSpan.textContent = 'الوقت: --';
      timeLeft = 0;
    }
    if (playing) return;
    if (color === sequence[userStep]) {
      if(soundCorrect) soundCorrect.play();
      userStep++;
      if (userStep === sequence.length) {
        score++;
        scoreSpan.textContent = `النقاط: ${score}`;
        // رسائل الفوز بالعربية
        const winMessages = ['بارك الله فيك!', 'أحسنت يا بطل!', 'ممتاز!', 'ذاكرتك قوية!'];
        messageDiv.textContent = winMessages[Math.floor(Math.random()*winMessages.length)];
        messageDiv.classList.add('win');
        colorBtns.forEach(btn => btn.disabled = true);
        setTimeout(() => {
          messageDiv.classList.remove('win');
          // الانتقال التلقائي للمستوى التالي أو زيادة السرعة
          let nextLevel = currentLevel;
          if (currentLevel === 'easy') nextLevel = 'medium';
          else if (currentLevel === 'medium') nextLevel = 'hard';
          else if (currentLevel === 'hard') nextLevel = 'extreme';
          // إذا كان بالفعل في أصعب مستوى، فقط زد السرعة قليلاً
          if (currentLevel === 'extreme') {
            levels.extreme.speed = Math.max(100, levels.extreme.speed - 30);
          } else {
            currentLevel = nextLevel;
            levelSelect.value = nextLevel;
          }
          resetGameVars();
          generateSequence(currentLevel);
          setTimeout(() => {
            playSequence(currentLevel);
          }, 700);
        }, 1200);
      }
    } else {
      if(soundWrong) soundWrong.play();
      lives--;
      livesSpan.textContent = `الحيوات: ${lives}`;
      messageDiv.textContent = 'خطأ! حاول مرة أخرى.';
      messageDiv.classList.remove('win');
      if (lives === 0) {
        messageDiv.textContent = `انتهت اللعبة! مجموع نقاطك: ${score}`;
        colorBtns.forEach(btn => btn.disabled = true);
        startLevelBtn.disabled = false;
      } else {
        userStep = 0;
        setTimeout(() => {
          playSequence(currentLevel);
        }, 1000);
      }
    }
  }

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => handleUserInput(btn.id));
  });

  startLevelBtn.addEventListener('click', () => {
    currentLevel = levelSelect.value;
    resetGameVars();
    generateSequence(currentLevel);
    startLevelBtn.disabled = true;
    setTimeout(() => {
      playSequence(currentLevel);
    }, 600);
  });

  resetGameVars();
}
