/**
 * Haven Application Core Logic
 * Private, shame-free, mobile-first companion for breaking the freeze-burnout-guilt cycle.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. STATE & STORAGE MANAGEMENT
  // =========================================================================
  const STORAGE_KEYS = {
    THEME: 'haven_theme',
    BATTERY: 'haven_battery',
    INTENTIONS: 'haven_intentions',
    WINS: 'haven_wins',
    LOVE_NOTE: 'haven_love_note',
    HUSBAND_PHONE: 'haven_husband_phone',
    GEMINI_KEY: 'haven_gemini_key'
  };

  const DEFAULT_INTENTIONS = {
    low: [
      { id: 'l1', text: 'Drink a warm glass of water 💧', done: false, badge: 'Gentle Care' },
      { id: 'l2', text: 'Step near a window or outside for 2 minutes 🍃', done: false, badge: 'Grounding' },
      { id: 'l3', text: 'Give yourself permission to lie down without guilt 🛋️', done: false, badge: 'Rest' }
    ],
    med: [
      { id: 'm1', text: 'Pick ONE single priority task (leave the rest) 🎯', done: false, badge: 'Focus' },
      { id: 'm2', text: 'Eat a nourishing meal without rushing 🥗', done: false, badge: 'Body Care' },
      { id: 'm3', text: 'Take a 10-minute digital break away from screens 🧘', done: false, badge: 'Reset' },
      { id: 'm4', text: 'Notice one thing you did well today ✨', done: false, badge: 'Self-Kindness' }
    ],
    high: [
      { id: 'h1', text: 'Tackle the main project you’ve been putting off 🚀', done: false, badge: 'Momentum' },
      { id: 'h2', text: 'Get 20 minutes of movement or a refreshing walk 🏃‍♀️', done: false, badge: 'Energy' },
      { id: 'h3', text: 'Knock out two quick 5-minute admin chores 🧹', done: false, badge: 'Clarity' },
      { id: 'h4', text: 'Set an intentional stop time for this evening 🌙', done: false, badge: 'Boundary' }
    ]
  };

  const STATE = {
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'day',
    battery: localStorage.getItem(STORAGE_KEYS.BATTERY) || 'med',
    intentions: JSON.parse(localStorage.getItem(STORAGE_KEYS.INTENTIONS)) || DEFAULT_INTENTIONS,
    wins: JSON.parse(localStorage.getItem(STORAGE_KEYS.WINS)) || [
      { text: 'Opened Haven to be kind to myself 🌿', date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ],
    loveNote: localStorage.getItem(STORAGE_KEYS.LOVE_NOTE) ||
      `"You are doing so much better than your tired mind is telling you right now. I don't love you for how productive you are or how much you check off. I love you for who you are. Take all the time you need, breathe deep, and let me hold things down for you today."`,
    husbandPhone: localStorage.getItem(STORAGE_KEYS.HUSBAND_PHONE) || '',
    geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '',
    activeTab: 'tab-flow',
    breathingMode: 'sigh',
    isBreathingActive: false,
    breathingInterval: null,
    timerInterval: null,
    timerSecondsLeft: 120,
    currentSenseStep: 0,
    activeSound: null
  };

  // =========================================================================
  // 2. THEME & NAVIGATION
  // =========================================================================
  function applyTheme(theme) {
    STATE.theme = theme;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.body.className = theme === 'night' ? 'theme-night' : 'theme-day';
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'night' ? '☀️' : '🌙';
    }
  }

  function setupNavigation() {
    const navPills = document.querySelectorAll('.nav-pill');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(targetId) {
      STATE.activeTab = targetId;

      tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === targetId);
      });

      navPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.tab === targetId);
      });

      bottomNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === targetId);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If switching to Glow Jar, render canvas
      if (targetId === 'tab-wins') {
        renderJar();
      }
    }

    navPills.forEach(pill => {
      pill.addEventListener('click', () => switchTab(pill.dataset.tab));
    });

    bottomNavItems.forEach(item => {
      item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // Theme toggle button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        applyTheme(STATE.theme === 'day' ? 'night' : 'day');
      });
    }

    // Floating sound pill toggle
    const quickSoundBtn = document.getElementById('quickSoundBtn');
    if (quickSoundBtn) {
      quickSoundBtn.addEventListener('click', () => {
        if (window.soundEngine && window.soundEngine.isPlaying) {
          window.soundEngine.stopAmbient();
          STATE.activeSound = null;
          updateSoundUI();
        } else {
          // Default to Brown noise
          triggerSoundTrack('brown');
        }
      });
    }
  }

  // =========================================================================
  // 3. ENERGY BATTERY & INTENTION SYSTEM
  // =========================================================================
  const ENERGY_MESSAGES = {
    low: {
      tag: 'Gentle Survival 15%',
      badgeClass: 'battery-low',
      quote: `"Your battery is low today, and that is completely okay. Today is not about achieving; it is about preserving your flame. You have full permission to do only the bare minimum and rest."`
    },
    med: {
      tag: 'Steady Balance 50%',
      badgeClass: 'battery-med',
      quote: `"Today is a steady day. Pick one single meaningful priority, let everything else be soft, and protect your evening peace."`
    },
    high: {
      tag: 'Inspired Energy 85%',
      badgeClass: 'battery-high',
      quote: `"You're feeling an energy spark! Ride the wave gently, do the things that bring you satisfaction, but keep some reserve for tomorrow."`
    }
  };

  function updateBatteryUI() {
    const batteryButtons = document.querySelectorAll('.battery-btn');
    batteryButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === STATE.battery);
    });

    const statusTag = document.getElementById('batteryStatusTag');
    const msgBox = document.getElementById('energyMessage');
    const info = ENERGY_MESSAGES[STATE.battery];

    if (statusTag && info) {
      statusTag.textContent = info.tag;
      statusTag.className = `badge-battery ${info.badgeClass}`;
    }

    if (msgBox && info) {
      msgBox.innerHTML = `<p class="energy-quote">${info.quote}</p>`;
    }

    renderIntentions();
  }

  function renderIntentions() {
    const list = document.getElementById('intentionsList');
    if (!list) return;

    const items = STATE.intentions[STATE.battery] || [];
    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = `<li class="check-item"><span class="check-label">No tasks for today. Rest and take care of you! 🌿</span></li>`;
      return;
    }

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = `check-item ${item.done ? 'completed' : ''}`;
      li.innerHTML = `
        <div class="checkbox-custom" data-index="${index}">
          ${item.done ? '✓' : ''}
        </div>
        <span class="check-label" data-index="${index}">${item.text}</span>
        <span class="check-badge">${item.badge || 'Gentle'}</span>
      `;

      const toggleAction = () => {
        item.done = !item.done;
        saveIntentions();
        renderIntentions();
        if (item.done) {
          // Play sparkle and add to wins jar
          if (window.soundEngine) window.soundEngine.playSparkle();
          addWinRecord(`Completed: ${item.text}`);
        }
      };

      li.querySelector('.checkbox-custom').addEventListener('click', toggleAction);
      li.querySelector('.check-label').addEventListener('click', toggleAction);
      list.appendChild(li);
    });
  }

  function saveIntentions() {
    localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(STATE.intentions));
  }

  function setupBatteryEvents() {
    const batteryButtons = document.querySelectorAll('.battery-btn');
    batteryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.battery = btn.dataset.level;
        localStorage.setItem(STORAGE_KEYS.BATTERY, STATE.battery);
        updateBatteryUI();
      });
    });

    const addBtn = document.getElementById('addCustomTaskBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const text = prompt("Add a gentle intention for today:");
        if (text && text.trim()) {
          STATE.intentions[STATE.battery].push({
            id: 'custom_' + Date.now(),
            text: text.trim(),
            done: false,
            badge: 'Personal'
          });
          saveIntentions();
          renderIntentions();
        }
      });
    }
  }

  // =========================================================================
  // 4. BRAIN DUMP & CBT REFRAMER
  // =========================================================================
  const CBT_PATTERNS = [
    {
      keywords: ['phone', 'scroll', 'hours', 'wasted', 'couch', 'bed', 'guilt', 'lazy'],
      trap: 'The Shame Spiral & Executive Freeze',
      distortion: 'Labeling & Guilt',
      validation: 'Scrolling or staying in bed is not a moral failure or laziness. It is your nervous system’s natural defense response when it is overloaded and desperate for easy dopamine.',
      reframe: 'You did not "waste the whole day." Your body was trying to protect you from extreme sensory or task overload. A reset starts this very second, without needing to make up for lost time.',
      action: 'Place your phone facedown. Drink three sips of water, stretch your neck, and whisper: "I am safe and starting fresh right now."'
    },
    {
      keywords: ['task', 'tasks', 'piling', 'paralyzed', 'freeze', 'start', 'begin', 'behind', 'too much'],
      trap: 'Executive Dysfunction & Mountain Thinking',
      distortion: 'Catastrophizing & All-or-Nothing',
      validation: 'When 10 tasks sit in your brain at once, your amygdala interprets them as a physical predator, causing a complete freeze.',
      reframe: 'You do not have to finish the mountain. You only have to touch a single pebble. Any 1% action dismantles the freeze reflex.',
      action: 'Pick the easiest possible task. Do not finish it — just open the app/document or touch the object for 60 seconds.'
    },
    {
      keywords: ['everyone', 'other', 'family', 'people', 'needs', 'empty', 'drained', 'burned out', 'burnout'],
      trap: 'People-Pleasing & Boundary Depletion',
      distortion: 'The "Should" Trap',
      validation: 'You have been pouring from an empty pitcher for days or weeks. Chronic fatigue is your body begging you to protect yourself.',
      reframe: 'Saying "no" or stepping back is not selfish — it is survival. You cannot care for anyone if you burn into ashes.',
      action: 'Choose one small thing you were going to do for someone else today, and respectfully postpone it or ask for help.'
    },
    {
      keywords: ['failing', 'failure', 'consistent', 'consistency', 'never', 'ruined', 'disaster'],
      trap: 'All-or-Nothing Thinking',
      distortion: 'Black-and-White Cognition',
      validation: 'Neurodivergent and high-empathy minds do not have linear consistency. Nature doesn’t bloom 365 days a year either.',
      reframe: 'Consistency is not doing the exact same thing every day. Real consistency is coming back with self-compassion after an off day.',
      action: 'Write down: "I am learning a softer way to live, and today’s pause is part of my journey."'
    }
  ];

  function reframeThought(rawText) {
    const textLower = rawText.toLowerCase();

    // Find best pattern match
    let matchedPattern = null;
    let maxMatches = 0;

    CBT_PATTERNS.forEach(pattern => {
      let matches = 0;
      pattern.keywords.forEach(kw => {
        if (textLower.includes(kw)) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedPattern = pattern;
      }
    });

    if (!matchedPattern) {
      matchedPattern = {
        trap: 'Overwhelm & Cognitive Overload',
        distortion: 'Emotional Reasoning',
        validation: 'Whatever you are feeling right now is valid, but feelings are weather, not permanent facts.',
        reframe: 'You are carrying more than your nervous system was built to bear alone today. Slow down and drop the invisible weight.',
        action: 'Put both feet flat on the floor, take one deep breath, and do one comforting thing for yourself.'
      };
    }

    return matchedPattern;
  }

  async function handleBrainDumpSubmit() {
    const input = document.getElementById('brainDumpInput');
    const output = document.getElementById('reframeOutput');
    const btn = document.getElementById('reframingBtn');
    const userText = input.value.trim();

    if (!userText) {
      alert("Write or speak a thought first, even a single sentence!");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Listening & Unpacking...</span>`;

    // Check if free Gemini API key is available
    if (STATE.geminiKey) {
      try {
        const aiResponse = await callGeminiAPI(userText, STATE.geminiKey);
        renderReframeResult({
          trap: 'AI Gentle Insight',
          distortion: 'Mind Clarity',
          validation: aiResponse.validation,
          reframe: aiResponse.reframe,
          action: aiResponse.action
        });
        btn.disabled = false;
        btn.innerHTML = `<span>🪄 Unpack & Reframe</span>`;
        return;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local CBT engine:", err);
      }
    }

    // Default fast local CBT engine
    setTimeout(() => {
      const result = reframeThought(userText);
      renderReframeResult(result);
      btn.disabled = false;
      btn.innerHTML = `<span>🪄 Unpack & Reframe</span>`;
    }, 400);
  }

  function renderReframeResult(data) {
    const output = document.getElementById('reframeOutput');
    if (!output) return;

    output.classList.remove('hidden');
    output.innerHTML = `
      <div class="reframe-trap-badge">🧠 Identified Pattern: ${data.trap}</div>
      <p class="reframe-box-quote">"${data.reframe}"</p>
      <p class="small-text"><strong>Why your body feels this way:</strong> ${data.validation}</p>
      <div class="reframe-action-card">
        <span class="action-card-label">Your Only 1-Minute Micro-Action:</span>
        <span class="action-card-text">${data.action}</span>
      </div>
    `;

    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Gemini API Caller (Free tier)
  async function callGeminiAPI(prompt, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are Haven, a compassionate mental wellness companion for a loving wife struggling with overwhelm, task paralysis, and burnout. Respond with zero judgment and deep warmth. Return a pure JSON object with 3 keys:
    "validation" (1-2 sentences validating her nervous system),
    "reframe" (1-2 sentences providing a loving, truthful cognitive reframe),
    "action" (one absurdly tiny, low-demand physical action she can do in 60 seconds).`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nHere is what she is feeling: "${prompt}"` }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    const replyText = data.candidates[0].content.parts[0].text;
    return JSON.parse(replyText);
  }

  function setupBrainDumpEvents() {
    const btn = document.getElementById('reframingBtn');
    if (btn) btn.addEventListener('click', handleBrainDumpSubmit);

    const clearBtn = document.getElementById('clearDumpBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('brainDumpInput').value = '';
        document.getElementById('reframeOutput').classList.add('hidden');
      });
    }

    // Quick prompt chips
    const chips = document.querySelectorAll('.prompt-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('brainDumpInput');
        input.value = chip.dataset.text;
        handleBrainDumpSubmit();
      });
    });

    // Voice Dictation (Free Web Speech API)
    const micBtn = document.getElementById('micVoiceBtn');
    const micLabel = document.getElementById('micLabel');
    if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      let isRecording = false;

      micBtn.addEventListener('click', () => {
        if (!isRecording) {
          try {
            recognition.start();
            isRecording = true;
            micBtn.classList.add('recording');
            if (micLabel) micLabel.textContent = 'Listening...';
          } catch (e) {
            console.log(e);
          }
        } else {
          recognition.stop();
          isRecording = false;
          micBtn.classList.remove('recording');
          if (micLabel) micLabel.textContent = 'Speak';
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('brainDumpInput');
        input.value = input.value ? input.value + ' ' + transcript : transcript;
      };

      recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        if (micLabel) micLabel.textContent = 'Speak';
      };
    } else if (micBtn) {
      micBtn.style.display = 'none'; // Speech recognition not supported in browser
    }

    // API Key Save
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const keyInput = document.getElementById('geminiApiKey');
    const keyStatus = document.getElementById('keyStatus');

    if (keyInput && STATE.geminiKey) {
      keyInput.value = STATE.geminiKey;
    }

    if (saveKeyBtn) {
      saveKeyBtn.addEventListener('click', () => {
        const val = keyInput.value.trim();
        STATE.geminiKey = val;
        localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, val);
        if (keyStatus) {
          keyStatus.textContent = val ? '✓ Key saved securely on device!' : 'Key cleared. Running in offline mode.';
          setTimeout(() => { keyStatus.textContent = ''; }, 3000);
        }
      });
    }
  }

  // =========================================================================
  // 5. THE GLOW JAR (MICRO-WINS)
  // =========================================================================
  let jarParticles = [];

  function addWinRecord(text) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    STATE.wins.unshift({ text, date: timeStr });
    if (STATE.wins.length > 30) STATE.wins.pop(); // Keep last 30
    localStorage.setItem(STORAGE_KEYS.WINS, JSON.stringify(STATE.wins));

    // Spawn 2-3 glowing particles in canvas
    spawnJarParticle();
    updateWinsUI();
  }

  function spawnJarParticle() {
    const colors = ['#E5A93B', '#E89A8D', '#6A947A', '#9994C7', '#F2BD54'];
    const p = {
      x: 130 + Math.random() * 60,
      y: 80,
      vx: (Math.random() - 0.5) * 4,
      vy: 1 + Math.random() * 2,
      radius: 8 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      targetY: 260 - (jarParticles.length * 3.5) + (Math.random() * 10)
    };
    jarParticles.push(p);
  }

  function renderJar() {
    const canvas = document.getElementById('glowJarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw Glass Jar Body
    ctx.save();
    ctx.beginPath();
    // Jar mouth
    ctx.roundRect(100, 45, 120, 20, 6);
    ctx.fillStyle = 'rgba(215, 230, 222, 0.35)';
    ctx.fill();
    ctx.strokeStyle = STATE.theme === 'night' ? 'rgba(120, 160, 140, 0.4)' : 'rgba(76, 117, 88, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Jar neck & body
    ctx.beginPath();
    ctx.moveTo(105, 65);
    ctx.lineTo(80, 100);
    ctx.quadraticCurveTo(60, 140, 60, 220);
    ctx.quadraticCurveTo(60, 290, 100, 305);
    ctx.lineTo(220, 305);
    ctx.quadraticCurveTo(260, 290, 260, 220);
    ctx.quadraticCurveTo(260, 140, 240, 100);
    ctx.lineTo(215, 65);
    ctx.closePath();

    // Glass subtle gradient
    const jarGrad = ctx.createLinearGradient(60, 65, 260, 305);
    if (STATE.theme === 'night') {
      jarGrad.addColorStop(0, 'rgba(40, 60, 50, 0.25)');
      jarGrad.addColorStop(1, 'rgba(70, 110, 90, 0.15)');
    } else {
      jarGrad.addColorStop(0, 'rgba(235, 246, 239, 0.6)');
      jarGrad.addColorStop(1, 'rgba(205, 228, 215, 0.3)');
    }
    ctx.fillStyle = jarGrad;
    ctx.fill();
    ctx.stroke();

    // Glass Reflection Highlight
    ctx.beginPath();
    ctx.moveTo(85, 120);
    ctx.quadraticCurveTo(75, 180, 75, 230);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Cork Lid
    ctx.beginPath();
    ctx.roundRect(110, 30, 100, 18, 5);
    ctx.fillStyle = '#C89D6B';
    ctx.fill();
    ctx.strokeStyle = '#9E7445';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Glowing Crystals/Marbles inside jar
    jarParticles.forEach(p => {
      // Simple physics update
      if (p.y < p.targetY && p.y < 285) {
        p.y += p.vy;
        p.x += p.vx;
        p.vy += 0.2; // gravity
        // Wall boundaries
        if (p.x < 85) p.x = 85;
        if (p.x > 235) p.x = 235;
      }

      ctx.save();
      // Glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Shiny speck
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  function updateWinsUI() {
    const counter = document.getElementById('winCountNumber');
    if (counter) counter.textContent = STATE.wins.length;

    const list = document.getElementById('recentWinsList');
    if (list) {
      list.innerHTML = '';
      STATE.wins.slice(0, 5).forEach(win => {
        const li = document.createElement('li');
        li.className = 'recent-win-item';
        li.innerHTML = `
          <span>${win.text}</span>
          <span class="win-time">${win.date}</span>
        `;
        list.appendChild(li);
      });
    }

    renderJar();
  }

  function initJarParticles() {
    jarParticles = [];
    const count = Math.min(STATE.wins.length, 25);
    const colors = ['#E5A93B', '#E89A8D', '#6A947A', '#9994C7', '#F2BD54'];

    for (let i = 0; i < count; i++) {
      jarParticles.push({
        x: 95 + Math.random() * 130,
        y: 285 - (i * 7) + (Math.random() * 5),
        vx: 0,
        vy: 0,
        radius: 8 + Math.random() * 5,
        color: colors[i % colors.length],
        targetY: 285 - (i * 7)
      });
    }
    renderJar();
  }

  function setupWinsEvents() {
    // Quick win chips
    const chips = document.querySelectorAll('.win-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playSparkle();
        addWinRecord(chip.dataset.win);
      });
    });

    // Custom win input
    const addWinBtn = document.getElementById('addCustomWinBtn');
    const winInput = document.getElementById('customWinInput');
    if (addWinBtn && winInput) {
      addWinBtn.addEventListener('click', () => {
        const text = winInput.value.trim();
        if (text) {
          if (window.soundEngine) window.soundEngine.playSparkle();
          addWinRecord(text);
          winInput.value = '';
        }
      });
      winInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addWinBtn.click();
      });
    }

    // Shake Jar Button
    const shakeBtn = document.getElementById('shakeJarBtn');
    const canvas = document.getElementById('glowJarCanvas');
    const shakeAction = () => {
      if (window.soundEngine) window.soundEngine.playSparkle();
      jarParticles.forEach(p => {
        p.y -= 30 + Math.random() * 40;
        p.vx = (Math.random() - 0.5) * 6;
        p.vy = -1;
      });
      let frames = 0;
      function animateShake() {
        renderJar();
        frames++;
        if (frames < 45) requestAnimationFrame(animateShake);
      }
      animateShake();
    };

    if (shakeBtn) shakeBtn.addEventListener('click', shakeAction);
    if (canvas) canvas.addEventListener('click', shakeAction);
  }

  // =========================================================================
  // 6. SOUNDSCAPES & SOMATIC 5-4-3-2-1
  // =========================================================================
  function triggerSoundTrack(type) {
    if (!window.soundEngine) return;
    const isNowPlaying = window.soundEngine.playAmbient(type);
    STATE.activeSound = isNowPlaying ? type : null;
    updateSoundUI();
  }

  function updateSoundUI() {
    const soundCards = document.querySelectorAll('.sound-card');
    soundCards.forEach(card => {
      const isThisActive = card.dataset.sound === STATE.activeSound;
      card.classList.toggle('active', isThisActive);
      const btn = card.querySelector('.sound-play-toggle');
      if (btn) btn.textContent = isThisActive ? 'Stop' : 'Play';
    });

    const quickBtn = document.getElementById('quickSoundBtn');
    const soundPillText = document.getElementById('soundPillText');
    if (quickBtn && soundPillText) {
      quickBtn.classList.toggle('playing', !!STATE.activeSound);
      soundPillText.textContent = STATE.activeSound ? 'Playing' : 'Sound';
    }
  }

  function setupSoundEvents() {
    const soundCards = document.querySelectorAll('.sound-card');
    soundCards.forEach(card => {
      card.addEventListener('click', () => {
        triggerSoundTrack(card.dataset.sound);
      });
    });

    const volSlider = document.getElementById('soundVolumeRange');
    const volValue = document.getElementById('volValue');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        if (window.soundEngine) window.soundEngine.setVolume(val);
        if (volValue) volValue.textContent = `${e.target.value}%`;
      });
    }

    // 5-4-3-2-1 Grounding Steps
    const SENSE_STEPS = [
      { num: '5', title: 'Spot 5 things you can see', prompt: 'Notice textures, shadows, colors, or small details in the room.' },
      { num: '4', title: 'Notice 4 things you can physically touch', prompt: 'Feel the fabric of your clothes, the floor beneath you, or the coolness of your skin.' },
      { num: '3', title: 'Listen for 3 distinct sounds', prompt: 'A clock, distant traffic, your own quiet breath, or the hum of a fan.' },
      { num: '2', title: 'Notice 2 things you can smell', prompt: 'Your shampoo, fresh air, a cup of tea, or simply clean air.' },
      { num: '1', title: 'Notice 1 thing you can taste or feel gratitude for', prompt: 'A lingering mint, cool water, or simply the fact that you survived another breath.' }
    ];

    const groundingContainer = document.getElementById('groundingContainer');
    const nextBtn = document.getElementById('groundingNextBtn');
    const resetBtn = document.getElementById('groundingResetBtn');

    function renderSenseStep() {
      const step = SENSE_STEPS[STATE.currentSenseStep];
      if (!groundingContainer || !step) return;

      groundingContainer.querySelector('.grounding-number').textContent = step.num;
      document.getElementById('groundingTitle').textContent = step.title;
      document.getElementById('groundingPrompt').textContent = step.prompt;

      if (window.soundEngine) window.soundEngine.playChime(440 + (STATE.currentSenseStep * 40));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        STATE.currentSenseStep = (STATE.currentSenseStep + 1) % SENSE_STEPS.length;
        renderSenseStep();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        STATE.currentSenseStep = 0;
        renderSenseStep();
      });
    }
  }

  // =========================================================================
  // 7. HUSBAND'S LOVE ANCHOR & SIGNAL HUB
  // =========================================================================
  function setupLoveAnchorEvents() {
    const noteTextEl = document.getElementById('loveNoteText');
    const editBtn = document.getElementById('editLoveNoteBtn');
    const form = document.getElementById('editLoveNoteForm');
    const input = document.getElementById('loveNoteInput');
    const saveBtn = document.getElementById('saveLoveNoteBtn');
    const cancelBtn = document.getElementById('cancelLoveNoteBtn');

    if (noteTextEl) noteTextEl.textContent = STATE.loveNote;

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        input.value = STATE.loveNote.replace(/^"|"$/g, '');
        form.classList.remove('hidden');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (val) {
          STATE.loveNote = `"${val}"`;
          localStorage.setItem(STORAGE_KEYS.LOVE_NOTE, STATE.loveNote);
          noteTextEl.textContent = STATE.loveNote;
        }
        form.classList.add('hidden');
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        form.classList.add('hidden');
      });
    }

    // Phone config
    const phoneInput = document.getElementById('husbandPhoneInput');
    const savePhoneBtn = document.getElementById('savePhoneBtn');
    if (phoneInput && STATE.husbandPhone) {
      phoneInput.value = STATE.husbandPhone;
    }

    if (savePhoneBtn) {
      savePhoneBtn.addEventListener('click', () => {
        const num = phoneInput.value.replace(/[^0-9]/g, '');
        STATE.husbandPhone = num;
        localStorage.setItem(STORAGE_KEYS.HUSBAND_PHONE, num);
        alert("Husband's WhatsApp number saved! 📱");
      });
    }

    // WhatsApp Signal Buttons
    const signalButtons = document.querySelectorAll('.signal-btn');
    signalButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        let phone = STATE.husbandPhone;
        if (!phone) {
          phone = prompt("Enter your husband's WhatsApp number (with country code, e.g. 919876543210):");
          if (phone) {
            phone = phone.replace(/[^0-9]/g, '');
            STATE.husbandPhone = phone;
            localStorage.setItem(STORAGE_KEYS.HUSBAND_PHONE, phone);
            if (phoneInput) phoneInput.value = phone;
          } else {
            return;
          }
        }

        const msg = encodeURIComponent(btn.dataset.msg);
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
        window.open(url, '_blank');
      });
    });
  }

  // =========================================================================
  // 8. UNFREEZE PROTOCOL & 2-MINUTE TASK SLICER
  // =========================================================================
  const BREATHING_CONFIGS = {
    sigh: {
      title: 'Physiological Sigh',
      cycles: [
        { label: 'Inhale through nose', sec: 2.5, scale: 1.4 },
        { label: 'Sniff top-up inhale', sec: 1.5, scale: 1.6 },
        { label: 'Long slow mouth exhale', sec: 5.5, scale: 1.0 }
      ]
    },
    box: {
      title: 'Box Breathing',
      cycles: [
        { label: 'Inhale', sec: 4.0, scale: 1.5 },
        { label: 'Hold', sec: 4.0, scale: 1.5 },
        { label: 'Exhale', sec: 4.0, scale: 1.0 },
        { label: 'Hold', sec: 4.0, scale: 1.0 }
      ]
    },
    calm: {
      title: '4-7-8 Deep Calm',
      cycles: [
        { label: 'Inhale gently', sec: 4.0, scale: 1.5 },
        { label: 'Hold breath', sec: 7.0, scale: 1.5 },
        { label: 'Slow exhale through mouth', sec: 8.0, scale: 1.0 }
      ]
    }
  };

  let breathStepIndex = 0;
  let breathTimeRemaining = 0;

  function startBreathingCycle() {
    stopBreathingCycle();
    STATE.isBreathingActive = true;
    breathStepIndex = 0;
    runNextBreathPhase();
  }

  function runNextBreathPhase() {
    if (!STATE.isBreathingActive) return;

    const config = BREATHING_CONFIGS[STATE.breathingMode];
    const currentPhase = config.cycles[breathStepIndex];

    const circle = document.getElementById('breathCircle');
    const label = document.getElementById('breathText');
    const timer = document.getElementById('breathTimer');

    if (label) label.textContent = currentPhase.label;
    if (circle) {
      circle.style.transitionDuration = `${currentPhase.sec}s`;
      circle.style.transform = `scale(${currentPhase.scale})`;
    }

    if (window.soundEngine) window.soundEngine.playChime(currentPhase.scale > 1.2 ? 528 : 396);

    breathTimeRemaining = Math.ceil(currentPhase.sec);
    if (timer) timer.textContent = `${breathTimeRemaining}s`;

    STATE.breathingInterval = setInterval(() => {
      breathTimeRemaining--;
      if (timer) timer.textContent = `${Math.max(0, breathTimeRemaining)}s`;

      if (breathTimeRemaining <= 0) {
        clearInterval(STATE.breathingInterval);
        breathStepIndex = (breathStepIndex + 1) % config.cycles.length;
        runNextBreathPhase();
      }
    }, 1000);
  }

  function stopBreathingCycle() {
    STATE.isBreathingActive = false;
    if (STATE.breathingInterval) {
      clearInterval(STATE.breathingInterval);
      STATE.breathingInterval = null;
    }
    const circle = document.getElementById('breathCircle');
    if (circle) circle.style.transform = 'scale(1.0)';
  }

  // Absurdly Tiny Task Dismantler Heuristics
  const TASK_SLICES = {
    'clean': 'Step 1: Just pick up ONE single item from the floor or counter. Put it away. That is your entire mission.',
    'room': 'Step 1: Just place one piece of clothing into the laundry basket. Stop immediately after.',
    'dishes': 'Step 1: Just wash or rinse ONE single cup or spoon. Leave the rest in the sink with no guilt.',
    'email': 'Step 1: Open your email app, look at ONE sender name, and close it. You do not need to reply yet.',
    'message': 'Step 1: Send a 3-word reply: "Will reply tomorrow ❤️" or just a thumbs up.',
    'project': 'Step 1: Open the blank document and write a 3-word title. Then step away for 5 minutes.',
    'work': 'Step 1: Write down the single easiest micro-step on a piece of paper. Just the words.',
    'bed': 'Step 1: Swing your feet over the edge of the bed and place your soles on the floor for 30 seconds.',
    'shower': 'Step 1: Turn the water on so it gets warm, and sit on the closed toilet lid for 1 minute.'
  };

  function sliceTask(taskText) {
    const textLower = taskText.toLowerCase();
    for (let key in TASK_SLICES) {
      if (textLower.includes(key)) {
        return TASK_SLICES[key];
      }
    }
    return `Step 1: Break "${taskText}" down — just spend 60 seconds looking at it or touching the first physical tool involved. You have permission to stop after that.`;
  }

  function start2MinTimer() {
    clearInterval(STATE.timerInterval);
    STATE.timerSecondsLeft = 120;
    const display = document.getElementById('twoMinTimerDisplay');
    const startBtn = document.getElementById('startTwoMinTimerBtn');
    const completeBtn = document.getElementById('completeMicroStepBtn');

    startBtn.textContent = '⏸ Running...';
    startBtn.disabled = true;

    STATE.timerInterval = setInterval(() => {
      STATE.timerSecondsLeft--;
      const mins = Math.floor(STATE.timerSecondsLeft / 60);
      const secs = STATE.timerSecondsLeft % 60;
      if (display) {
        display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      if (STATE.timerSecondsLeft <= 0) {
        clearInterval(STATE.timerInterval);
        if (window.soundEngine) window.soundEngine.playSparkle();
        if (display) display.textContent = '00:00 - Done!';
        startBtn.classList.add('hidden');
        if (completeBtn) completeBtn.classList.remove('hidden');
      }
    }, 1000);
  }

  function setupUnfreezeModalEvents() {
    const modal = document.getElementById('unfreezeModal');
    const openBtns = [
      document.getElementById('openUnfreezeModalBtn'),
      document.getElementById('bottomUnfreezeBtn')
    ];
    const closeBtn = document.getElementById('closeUnfreezeModal');

    const step1 = document.getElementById('unfreezeStep1');
    const step2 = document.getElementById('unfreezeStep2');
    const step3 = document.getElementById('unfreezeStep3');

    function showStep(targetStep) {
      [step1, step2, step3].forEach(step => {
        if (step) step.classList.toggle('active', step === targetStep);
      });
      if (targetStep === step1) {
        startBreathingCycle();
      } else {
        stopBreathingCycle();
      }
    }

    openBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          modal.classList.remove('hidden');
          showStep(step1);
        });
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        stopBreathingCycle();
        clearInterval(STATE.timerInterval);
      });
    }

    const finishBtn = document.getElementById('finishUnfreezeBtn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        stopBreathingCycle();
        clearInterval(STATE.timerInterval);
      });
    }

    // Step Navigations
    const goToStep2Btn = document.getElementById('goToStep2Btn');
    const skipToStep2Btn = document.getElementById('skipToStep2Btn');
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const goToStep3Btn = document.getElementById('goToStep3Btn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');

    if (goToStep2Btn) goToStep2Btn.addEventListener('click', () => showStep(step2));
    if (skipToStep2Btn) skipToStep2Btn.addEventListener('click', () => showStep(step2));
    if (backToStep1Btn) backToStep1Btn.addEventListener('click', () => showStep(step1));
    if (goToStep3Btn) goToStep3Btn.addEventListener('click', () => showStep(step3));
    if (backToStep2Btn) backToStep2Btn.addEventListener('click', () => showStep(step2));

    // Breathing mode buttons
    const breathModeBtns = document.querySelectorAll('.breath-mode-btn');
    breathModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        breathModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.breathingMode = btn.dataset.mode;
        startBreathingCycle();
      });
    });

    // Task Slicer
    const sliceBtn = document.getElementById('sliceTaskBtn');
    const taskInput = document.getElementById('paralysisTaskInput');
    const microCard = document.getElementById('microStepCard');
    const microText = document.getElementById('microStepText');

    function performSlice(taskName) {
      if (!taskName) return;
      const micro = sliceTask(taskName);
      if (microText) microText.textContent = micro;
      if (microCard) microCard.classList.remove('hidden');
    }

    if (sliceBtn) {
      sliceBtn.addEventListener('click', () => {
        performSlice(taskInput.value.trim());
      });
    }

    const sliceChips = document.querySelectorAll('.slice-chip');
    sliceChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (taskInput) taskInput.value = chip.dataset.task;
        performSlice(chip.dataset.task);
      });
    });

    // 2 Min Timer
    const startTimerBtn = document.getElementById('startTwoMinTimerBtn');
    if (startTimerBtn) startTimerBtn.addEventListener('click', start2MinTimer);

    const completeBtn = document.getElementById('completeMicroStepBtn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        const text = microText.textContent || 'Broke task paralysis';
        addWinRecord(`Unfroze: ${text.slice(0, 45)}...`);
        if (window.soundEngine) window.soundEngine.playSparkle();
        alert("Incredible work! Your win has been placed into the Glow Jar! ✨");
        modal.classList.add('hidden');
        stopBreathingCycle();
      });
    }
  }

  // =========================================================================
  // 9. INITIALIZATION
  // =========================================================================
  function init() {
    applyTheme(STATE.theme);
    setupNavigation();
    updateBatteryUI();
    setupBatteryEvents();
    setupBrainDumpEvents();
    setupWinsEvents();
    initJarParticles();
    updateWinsUI();
    setupSoundEvents();
    setupLoveAnchorEvents();
    setupUnfreezeModalEvents();

    console.log("Haven Initialized — Safe space ready.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
