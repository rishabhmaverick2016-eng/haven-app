import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Head with Apple Touch Icon and 192/512 icons
head_icons = """  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="icon-512.png">"""

if 'apple-touch-icon.png' not in html:
    html = html.replace('<link rel="manifest" href="manifest.json">', f'<link rel="manifest" href="manifest.json">\n{head_icons}')

# 2. Add Install button in header-right
install_btn_html = """        <!-- Install App Button -->
        <button id="installAppBtn" class="pill-btn install-pill" title="Install Haven on your phone">
          <span class="icon">📲</span>
          <span>Install</span>
        </button>"""

if 'id="installAppBtn"' not in html:
    html = html.replace('<!-- Ambient Sound Floating Toggle -->', f'{install_btn_html}\n        <!-- Ambient Sound Floating Toggle -->')

# 3. Add Mobile Banner right below header
banner_html = """    <!-- Mobile Install Guidance Banner (Auto-detects iPhone or Android) -->
    <div id="mobileInstallBanner" class="mobile-install-banner">
      <div class="banner-text">
        <strong>📲 Add to Phone Home Screen:</strong>
        <span id="installInstructionText">Tap for quick 2-step setup</span>
      </div>
      <button id="bannerActionBtn" class="pill-btn-small">How to Install</button>
      <button id="dismissBannerBtn" class="banner-dismiss-btn" title="Dismiss">✕</button>
    </div>"""

if 'id="mobileInstallBanner"' not in html:
    html = html.replace('</header>', f'</header>\n{banner_html}')

# 4. Add Install Guide Modal before </body>
modal_html = """  <!-- MODAL: HOW TO INSTALL ON PHONE -->
  <div id="installGuideModal" class="modal-overlay hidden">
    <div class="modal-card">
      <button id="closeInstallGuideBtn" class="modal-close-btn">✕</button>
      <div class="step-indicator">Phone App Setup</div>
      <h3 class="modal-heading">Add Haven to Your Home Screen</h3>
      
      <div class="install-guide-tabs" style="display:flex; gap:8px; margin: 12px 0;">
        <button id="guideIosTab" class="pill-btn active">🍎 iPhone (Safari)</button>
        <button id="guideAndroidTab" class="pill-btn">🤖 Android (Chrome)</button>
      </div>

      <div id="guideIosContent" class="guide-content">
        <p class="small-text" style="margin-bottom:12px; color:var(--text-main);">Apple does not allow websites to install automatically. Follow these 2 simple steps:</p>
        <div style="background:var(--bg-card-subtle); padding:14px; border-radius:12px; display:flex; flex-direction:column; gap:10px;">
          <div><strong>1. Tap the Share button</strong> <span style="font-size:1.3rem;">📤</span> at the bottom of Safari (the square with the arrow pointing up).</div>
          <div><strong>2. Scroll down</strong> and tap <strong>"Add to Home Screen"</strong> <span style="font-size:1.3rem;">➕</span>.</div>
          <div><strong>3. Tap "Add"</strong> in the top right corner.</div>
        </div>
        <p class="small-text" style="margin-top:12px; color:var(--text-muted);">✨ Haven will now be placed on your iPhone screen with its leaf icon, and open full-screen like a real app without browser bars!</p>
      </div>

      <div id="guideAndroidContent" class="guide-content hidden">
        <div style="background:var(--bg-card-subtle); padding:14px; border-radius:12px; display:flex; flex-direction:column; gap:10px;">
          <div><strong>Option 1:</strong> Tap the button below to install directly:</div>
          <button id="directAndroidInstallBtn" class="btn-primary" style="width:100%; margin:4px 0;">📲 Install Haven Now</button>
          <div><strong>Option 2:</strong> Tap the <strong>3 dots (⋮)</strong> in Chrome top-right ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
        </div>
      </div>
    </div>
  </div>"""

if 'id="installGuideModal"' not in html:
    html = html.replace('</body>', f'{modal_html}\n</body>')

# 5. Add Banner Styles into CSS inside <style>
banner_css = """
/* Mobile Install Banner */
.mobile-install-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: linear-gradient(135deg, var(--bg-card-subtle) 0%, var(--bg-accent) 100%);
  border-bottom: 1px solid var(--border-subtle);
  padding: 8px 16px;
  font-size: 0.8rem;
  animation: fadeIn 0.3s ease;
}
.mobile-install-banner.hidden {
  display: none !important;
}
.banner-text {
  flex: 1;
  color: var(--text-main);
}
.banner-text strong {
  color: var(--color-primary);
  display: block;
}
.banner-dismiss-btn {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 0.9rem;
  padding: 4px 6px;
  cursor: pointer;
}
.install-pill {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
"""

if '.mobile-install-banner' not in html:
    html = html.replace('</style>', f'{banner_css}\n</style>')

# 6. Add Install PWA Logic into <script>
pwa_js = """
    // PWA Installation & Guidance Logic
    let deferredInstallPrompt = null;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    const banner = document.getElementById('mobileInstallBanner');
    const installBtn = document.getElementById('installAppBtn');
    const bannerActionBtn = document.getElementById('bannerActionBtn');
    const dismissBtn = document.getElementById('dismissBannerBtn');
    const guideModal = document.getElementById('installGuideModal');
    const closeGuideBtn = document.getElementById('closeInstallGuideBtn');
    const guideIosTab = document.getElementById('guideIosTab');
    const guideAndroidTab = document.getElementById('guideAndroidTab');
    const guideIosContent = document.getElementById('guideIosContent');
    const guideAndroidContent = document.getElementById('guideAndroidContent');
    const directAndroidInstallBtn = document.getElementById('directAndroidInstallBtn');

    if (isStandalone) {
      if (banner) banner.classList.add('hidden');
      if (installBtn) installBtn.classList.add('hidden');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (directAndroidInstallBtn) directAndroidInstallBtn.classList.remove('hidden');
    });

    function openInstallGuide() {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            if (banner) banner.classList.add('hidden');
          }
          deferredInstallPrompt = null;
        });
      } else {
        if (guideModal) guideModal.classList.remove('hidden');
        if (isIos) {
          showIosGuide();
        } else {
          showAndroidGuide();
        }
      }
    }

    function showIosGuide() {
      guideIosTab.classList.add('active');
      guideAndroidTab.classList.remove('active');
      guideIosContent.classList.remove('hidden');
      guideAndroidContent.classList.add('hidden');
    }

    function showAndroidGuide() {
      guideAndroidTab.classList.add('active');
      guideIosTab.classList.remove('active');
      guideAndroidContent.classList.remove('hidden');
      guideIosContent.classList.add('hidden');
    }

    if (installBtn) installBtn.addEventListener('click', openInstallGuide);
    if (bannerActionBtn) bannerActionBtn.addEventListener('click', openInstallGuide);
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    if (dismissBtn) dismissBtn.addEventListener('click', () => banner.classList.add('hidden'));
    if (guideIosTab) guideIosTab.addEventListener('click', showIosGuide);
    if (guideAndroidTab) guideAndroidTab.addEventListener('click', showAndroidGuide);
    if (directAndroidInstallBtn) {
      directAndroidInstallBtn.addEventListener('click', () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt = null;
        } else {
          alert('Tap the 3 dots (⋮) in Chrome top-right and choose "Install app" or "Add to Home screen".');
        }
      });
    }
"""

if 'beforeinstallprompt' not in html:
    html = html.replace('navigator.serviceWorker.register(\'service-worker.js\')', f'{pwa_js}\n    navigator.serviceWorker.register(\'service-worker.js\')')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated with complete mobile PWA install guide & handler!")
