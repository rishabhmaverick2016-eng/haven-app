import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add CSS for Ad Slot
ad_css = """
/* Google AdSense / Sponsor Banner Container */
.ad-banner-wrapper {
  margin: 14px 0 6px 0;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-subtle);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ad-tag {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-light);
  font-weight: 700;
}

.ad-content-box {
  width: 100%;
  min-height: 60px;
  max-width: 468px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ad-placeholder-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: var(--text-muted);
  text-align: left;
}

.ad-preview-icon {
  font-size: 1.5rem;
}

.ad-preview-text strong {
  display: block;
  font-size: 0.82rem;
  color: var(--text-main);
}

.ad-preview-text span {
  font-size: 0.72rem;
  color: var(--text-light);
}

.ad-support-link {
  font-size: 0.72rem;
  color: var(--text-light);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
}

.ad-support-link:hover {
  color: var(--color-primary);
}
"""

if '.ad-banner-wrapper' not in html:
    html = html.replace('</style>', f'{ad_css}\n</style>')

# 2. Add Ad Slot HTML before </main>
ad_html = """      <!-- Google AdSense / Sponsor Banner Slot -->
      <div id="havenAdSlot" class="ad-banner-wrapper">
        <div class="ad-tag">SPONSORED / ADVERTISEMENT</div>
        
        <div class="ad-content-box">
          <!-- PASTE YOUR GOOGLE ADSENSE CODE HERE:
          <ins class="adsbygoogle"
               style="display:inline-block;width:320px;height:50px"
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="XXXXXXXXXX"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
          -->
          <div class="ad-placeholder-preview">
            <span class="ad-preview-icon">📢</span>
            <div class="ad-preview-text">
              <strong>Google AdSense Banner Slot</strong>
              <span>Subtle, non-intrusive mobile banner (320x50)</span>
            </div>
          </div>
        </div>

        <button id="supportHavenBtn" class="ad-support-link">✨ Enjoying Haven? Support with a Coffee / Remove Ads</button>
      </div>"""

if 'id="havenAdSlot"' not in html:
    html = html.replace('</main>', f'{ad_html}\n    </main>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Google AdSense slot added cleanly to index.html!")
