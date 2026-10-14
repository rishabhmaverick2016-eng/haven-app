import os

html_path = 'index.html'
css_path = 'styles.css'
audio_path = 'audio.js'
app_path = 'app.js'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

with open(audio_path, 'r', encoding='utf-8') as f:
    audio_js = f.read()

with open(app_path, 'r', encoding='utf-8') as f:
    app_js = f.read()

# Inline CSS
html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')

# Inline Audio and App JS
html = html.replace('<script src="audio.js"></script>', f'<script>\n{audio_js}\n</script>')
html = html.replace('<script src="app.js"></script>', f'<script>\n{app_js}\n</script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Bundled successfully! Total size: {len(html)} characters.")
