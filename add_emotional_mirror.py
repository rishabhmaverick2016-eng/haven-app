import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. CSS for Emotional Mirror
mirror_css = """
/* Emotional Mirror Tool */
.mirror-card {
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(153, 148, 199, 0.08) 100%);
  border-color: rgba(153, 148, 199, 0.25);
}

.mirror-step-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.mirror-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.emotion-tags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px) {
  .emotion-tags-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.emotion-tag-btn {
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: all 0.2s ease;
}

.emotion-tag-btn span {
  font-size: 1.4rem;
}

.emotion-tag-btn strong {
  display: block;
  font-size: 0.8rem;
  color: var(--text-main);
  line-height: 1.2;
}

.emotion-tag-btn small {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.emotion-tag-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(76, 117, 88, 0.2);
}

.trigger-source-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trigger-btn {
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
}

.trigger-btn.active {
  background: var(--color-primary);
  color: #FFFFFF;
  border-color: var(--color-primary);
}

.mirror-inputs-pair {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mirror-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-hint {
  font-size: 0.74rem;
  color: var(--text-light);
  font-weight: 600;
}

.mirror-field input {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-card-subtle);
  color: var(--text-main);
  font-size: 0.86rem;
  outline: none;
}

.mirror-field input:focus {
  border-color: var(--color-primary);
}

/* Mirror Result Card */
.mirror-result-card {
  background: var(--bg-secondary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.mirror-result-badge {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.mirror-quote {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: var(--text-main);
  line-height: 1.45;
  font-style: italic;
}

.agency-choice-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.agency-choice-title {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-light);
}

.agency-action-btn {
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-subtle);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  text-align: left;
  font-size: 0.84rem;
  color: var(--text-main);
  font-weight: 500;
  transition: all 0.2s ease;
}

.agency-action-btn:hover, .agency-action-btn:active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}
"""

if '.mirror-card' not in html:
    html = html.replace('</style>', f'{mirror_css}\n</style>')

# 2. HTML for Emotional Mirror
mirror_html = """
        <!-- ============================================== -->
        <!-- TOOL: THE EMOTIONAL MIRROR (WHO HURT YOU & RECLAIM POWER) -->
        <!-- ============================================== -->
        <div class="card mirror-card">
          <div class="card-header">
            <div>
              <span class="section-badge">Agency & Clarity</span>
              <h3 class="card-title">🪞 The Emotional Mirror</h3>
              <p class="card-subtitle">Name the hurt, trace who triggered it, and take your power back.</p>
            </div>
          </div>

          <!-- Step 1: Label Emotion -->
          <div class="mirror-step-box">
            <label class="mirror-label">Step 1: What is the exact feeling in your chest?</label>
            <div class="emotion-tags-grid">
              <button class="emotion-tag-btn" data-emotion="Anger" data-signal="A boundary was crossed or an expectation was broken.">
                <span>😡</span>
                <div>
                  <strong>Anger</strong>
                  <small>Boundary crossed</small>
                </div>
              </button>

              <button class="emotion-tag-btn" data-emotion="Resentment" data-signal="You gave more than you wanted to, and felt taken for granted.">
                <span>💔</span>
                <div>
                  <strong>Resentment</strong>
                  <small>Over-giving / unappreciated</small>
                </div>
              </button>

              <button class="emotion-tag-btn" data-emotion="Guilt" data-signal="You are measuring yourself against an unrealistic expectation.">
                <span>😔</span>
                <div>
                  <strong>Guilt / Shame</strong>
                  <small>Harsh self-standard</small>
                </div>
              </button>

              <button class="emotion-tag-btn" data-emotion="Invisible" data-signal="You are waiting for someone to notice your effort without asking.">
                <span>🥀</span>
                <div>
                  <strong>Invisible</strong>
                  <small>Unspoken desire for care</small>
                </div>
              </button>

              <button class="emotion-tag-btn" data-emotion="Overwhelmed" data-signal="Too many demands and not enough emotional safety.">
                <span>🌫️</span>
                <div>
                  <strong>Overwhelmed</strong>
                  <small>System in shutdown</small>
                </div>
              </button>

              <button class="emotion-tag-btn" data-emotion="Anxious" data-signal="Your mind is trying to anticipate and prevent pain.">
                <span>😟</span>
                <div>
                  <strong>Anxious</strong>
                  <small>Hyper-vigilance</small>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Trigger Source -->
          <div class="mirror-step-box">
            <label class="mirror-label">Step 2: Who sparked or triggered this feeling?</label>
            <div class="trigger-source-grid">
              <button class="trigger-btn" data-source="Partner / Husband">👤 Partner / Husband</button>
              <button class="trigger-btn" data-source="Work / Boss / Client">💼 Work / Boss</button>
              <button class="trigger-btn" data-source="Family / In-Laws">👨‍👩‍👧 Family / In-Laws</button>
              <button class="trigger-btn" data-source="Social Circle / Friend">👥 Friend / Others</button>
              <button class="trigger-btn" data-source="My Own Mind">🧠 My Inner Critic</button>
            </div>
          </div>

          <!-- Step 3: Factual Event vs Silent Expectation -->
          <div class="mirror-step-box">
            <label class="mirror-label">Step 3: What happened vs. What story did your mind tell?</label>
            <div class="mirror-inputs-pair">
              <div class="mirror-field">
                <span class="field-hint">1. What did they actually say or do? (The bare fact):</span>
                <input type="text" id="mirrorFactInput" placeholder="e.g. He left without asking, or boss sent email late...">
              </div>
              <div class="mirror-field">
                <span class="field-hint">2. What silent expectation or story was I holding?:</span>
                <input type="text" id="mirrorStoryInput" placeholder="e.g. I expected them to know I was tired, or I thought they think I'm failing...">
              </div>
            </div>

            <button id="unveilMirrorBtn" class="btn-primary" style="width: 100%; margin-top: 10px;">
              <span>🪞 Reveal The Truth & Reclaim My Power</span>
            </button>
          </div>

          <!-- The Result / Agency Card -->
          <div id="mirrorResultCard" class="mirror-result-card hidden">
            <!-- Dynamically populated via JS -->
          </div>
        </div>
"""

if 'id="unveilMirrorBtn"' not in html:
    html = html.replace('<!-- Optional Gemini AI Key Settings (100% Free Option) -->', f'{mirror_html}\n        <!-- Optional Gemini AI Key Settings (100% Free Option) -->')

# 3. JavaScript Logic for Emotional Mirror
mirror_js = """
    // Emotional Mirror & Agency Logic
    let selectedEmotion = 'Resentment';
    let selectedEmotionSignal = 'You gave more than you wanted to, and felt taken for granted.';
    let selectedTriggerSource = 'Partner / Husband';

    const emotionBtns = document.querySelectorAll('.emotion-tag-btn');
    const triggerBtns = document.querySelectorAll('.trigger-btn');
    const unveilBtn = document.getElementById('unveilMirrorBtn');
    const resultCard = document.getElementById('mirrorResultCard');
    const factInput = document.getElementById('mirrorFactInput');
    const storyInput = document.getElementById('mirrorStoryInput');

    emotionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        emotionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedEmotion = btn.dataset.emotion;
        selectedEmotionSignal = btn.dataset.signal;
      });
    });

    triggerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        triggerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTriggerSource = btn.dataset.source;
      });
    });

    // Default first selection
    if (emotionBtns.length > 0) emotionBtns[1].classList.add('active');
    if (triggerBtns.length > 0) triggerBtns[0].classList.add('active');

    if (unveilBtn) {
      unveilBtn.addEventListener('click', () => {
        const fact = (factInput && factInput.value.trim()) || 'They did not meet what you anticipated.';
        const story = (storyInput && storyInput.value.trim()) || 'I expected them to read my needs without me having to say it.';

        let agencyAffirmation = '';
        if (selectedTriggerSource === 'Partner / Husband') {
          agencyAffirmation = 'I cannot expect him to read my mind. I reclaim my peace by clearly stating my need without anger, or choosing to rest right now.';
        } else if (selectedTriggerSource.includes('Work')) {
          agencyAffirmation = 'My worth is not tied to their urgent emails. I close my work screen and protect my evening boundary.';
        } else if (selectedTriggerSource.includes('Family')) {
          agencyAffirmation = 'Their expectations are not my obligations. I give myself permission to be imperfect in their eyes.';
        } else {
          agencyAffirmation = 'My inner critic is speaking out of fear. I do not have to obey its harsh voice today.';
        }

        resultCard.classList.remove('hidden');
        resultCard.innerHTML = `
          <div class="mirror-result-badge">✨ Your Emotional Truth & Agency</div>
          <p class="mirror-quote">"The external spark was ${selectedTriggerSource}. But the pain comes from the story: '${story}'."</p>
          <p class="small-text"><strong>Nervous System Signal:</strong> ${selectedEmotionSignal}</p>
          <div style="background:var(--bg-card-subtle); padding:12px; border-radius:10px; border-left:3px solid var(--color-primary);">
            <strong style="color:var(--color-primary); font-size:0.82rem; display:block; margin-bottom:4px;">Where Your Real Power Lives:</strong>
            <p style="font-size:0.88rem; color:var(--text-main); line-height:1.4;">${agencyAffirmation}</p>
          </div>
          <div class="agency-choice-box">
            <span class="agency-choice-title">Tap to anchor this into your heart:</span>
            <button class="agency-action-btn" data-claim="Claimed: I release the expectation that they will read my mind.">🛡️ I release the expectation that they must read my mind</button>
            <button class="agency-action-btn" data-claim="Claimed: I choose not to absorb their mood or chaos.">🛑 I refuse to let their mood dictate my day</button>
            <button class="agency-action-btn" data-claim="Claimed: Stating my boundary without guilt or apology.">🗣️ I will state my boundary simply, with no apology</button>
            <button class="agency-action-btn" data-claim="Claimed: Giving myself full permission to drop this.">🛋️ I give myself permission to drop this weight</button>
          </div>
        `;

        // Bind agency buttons
        const claimBtns = resultCard.querySelectorAll('.agency-action-btn');
        claimBtns.forEach(cBtn => {
          cBtn.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playSparkle();
            addWinRecord(cBtn.dataset.claim);
            alert("Power reclaimed! This breakthrough has been placed into your Glow Jar as a Win! ✨");
          });
        });

        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
"""

if 'unveilMirrorBtn' not in html or 'selectedEmotionSignal' not in html:
    html = html.replace('// PWA Installation & Guidance Logic', f'{mirror_js}\n    // PWA Installation & Guidance Logic')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Emotional Mirror tool successfully integrated into index.html!")
