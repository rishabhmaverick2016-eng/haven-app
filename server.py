import os
import sys
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return 'localhost'

class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin and proper caching headers
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    local_ip = get_local_ip()
    local_url = f"http://localhost:{PORT}"
    mobile_url = f"http://{local_ip}:{PORT}"

    print("=" * 65)
    print(" [HAVEN] YOUR WIFE'S SANCTUARY APP IS RUNNING!")
    print("=" * 65)
    print(f"\n* On this computer: {local_url}")
    print(f"* On your wife's phone (connected to the same Wi-Fi):")
    print(f"   --> {mobile_url}")
    print("\n* TIP FOR HER PHONE:")
    print("   1. iPhone (Safari): Tap Share icon -> 'Add to Home Screen'")
    print("   2. Android (Chrome): Tap 3 dots -> 'Install App' or 'Add to Home Screen'")
    print("   It will launch full screen like an actual native app!")
    print("=" * 65)
    print("Press Ctrl+C in this terminal anytime to stop the server.\n")

    try:
        webbrowser.open(local_url)
    except Exception:
        pass

    httpd = HTTPServer(('0.0.0.0', PORT), QuietHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nHaven server stopped.")

if __name__ == '__main__':
    main()
