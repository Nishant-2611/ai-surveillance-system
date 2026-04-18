"""
pi_simulator.py — Raspberry Pi Upload Simulator
================================================
Simulates a Raspberry Pi sending motion/human-detected alerts to the
SecureEye backend. Generates a synthetic test image (no hardware needed).

Usage:
    python pi_simulator.py [--url URL] [--user USERNAME] [--pass PASSWORD]
                           [--type TYPE] [--count N] [--interval SECONDS]

Examples:
    python pi_simulator.py
    python pi_simulator.py --type human_detected --count 5 --interval 2
    python pi_simulator.py --url http://192.168.1.10:5000
"""

import argparse
import io
import os
import random
import sys
import time
from datetime import datetime

import requests

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# ── Defaults ───────────────────────────────────────────────────────────────────
DEFAULT_URL      = 'http://127.0.0.1:5000'
DEFAULT_USER     = 'admin'
DEFAULT_PASS     = 'admin123'
ALERT_TYPES      = ['motion', 'human_detected', 'intrusion']

# ── Helpers ────────────────────────────────────────────────────────────────────

def log(msg, level='INFO'):
    prefix = {'INFO': '✅', 'WARN': '⚠️', 'ERR': '❌'}.get(level, 'ℹ️')
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {prefix}  {msg}")


def get_token(base_url: str, username: str, password: str) -> str:
    """Register (if needed) then login and return JWT token."""
    # Try to register first (ignore conflict if user already exists)
    requests.post(f"{base_url}/api/register",
                  json={'username': username, 'password': password})

    resp = requests.post(f"{base_url}/api/login",
                         json={'username': username, 'password': password})
    resp.raise_for_status()
    token = resp.json()['access_token']
    log(f"Authenticated as '{username}'")
    return token


def make_test_image(alert_type: str, index: int) -> bytes:
    """Generate a synthetic JPEG test image labelled with alert info."""
    if PIL_AVAILABLE:
        colors = {'motion': (20, 80, 40), 'human_detected': (20, 40, 90),
                  'intrusion': (90, 20, 20)}
        bg = colors.get(alert_type, (30, 30, 30))
        img = Image.new('RGB', (640, 480), color=bg)
        draw = ImageDraw.Draw(img)
        # Grid lines
        for x in range(0, 640, 40):
            draw.line([(x, 0), (x, 480)], fill=(255, 255, 255, 30), width=1)
        for y in range(0, 480, 40):
            draw.line([(0, y), (640, y)], fill=(255, 255, 255, 30), width=1)
        # Labels
        draw.text((20, 20),  "SecureEye — AI Surveillance",  fill=(0, 220, 170))
        draw.text((20, 60),  f"ALERT TYPE : {alert_type.upper()}", fill=(255, 255, 255))
        draw.text((20, 90),  f"TIMESTAMP  : {datetime.utcnow().isoformat()}Z", fill=(200, 200, 200))
        draw.text((20, 120), f"FRAME #    : {index}", fill=(200, 200, 200))
        draw.text((20, 160), "[ SIMULATED CAMERA FEED ]", fill=(0, 220, 170))
        # Motion box
        x0, y0 = random.randint(100, 300), random.randint(100, 250)
        draw.rectangle([x0, y0, x0 + 160, y0 + 120], outline=(0, 255, 100), width=3)
        draw.text((x0 + 4, y0 + 4), "TARGET", fill=(0, 255, 100))
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=85)
        return buf.getvalue()
    else:
        # Minimal 1x1 white JPEG when Pillow not installed
        return (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
            b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
            b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\x1e'
            b'\x1e\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4'
            b'\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00'
            b'\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4'
            b'\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00'
            b'\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142'
            b'\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18'
            b'\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZ'
            b'cdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95'
            b'\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3'
            b'\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca'
            b'\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7'
            b'\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00'
            b'\x08\x01\x01\x00\x00?\x00\xfb\xd3P\x00\x00\x00\x1f\xff\xd9'
        )


def send_alert(base_url: str, token: str, alert_type: str, index: int) -> dict:
    """POST /api/upload with a synthetic image."""
    img_bytes  = make_test_image(alert_type, index)
    timestamp  = datetime.utcnow().isoformat()

    resp = requests.post(
        f"{base_url}/api/upload",
        headers={'Authorization': f'Bearer {token}'},
        data={'type': alert_type, 'timestamp': timestamp},
        files={'file': (f'frame_{index:04d}.jpg', img_bytes, 'image/jpeg')},
    )
    resp.raise_for_status()
    return resp.json()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='SecureEye Raspberry Pi Simulator')
    parser.add_argument('--url',      default=DEFAULT_URL,  help='Backend base URL')
    parser.add_argument('--user',     default=DEFAULT_USER, help='Login username')
    parser.add_argument('--pass',     default=DEFAULT_PASS, dest='password',
                        help='Login password')
    parser.add_argument('--type',     default='motion',
                        choices=ALERT_TYPES + ['random'],
                        help='Alert type to send (default: motion)')
    parser.add_argument('--count',    type=int, default=3,  help='Number of alerts')
    parser.add_argument('--interval', type=float, default=1.5,
                        help='Seconds between alerts')
    args = parser.parse_args()

    if not PIL_AVAILABLE:
        log("Pillow not installed — using minimal JPEG. Run: pip install Pillow", 'WARN')

    print("\n" + "═" * 60)
    print("  🎥  SecureEye — Raspberry Pi Simulator")
    print("═" * 60)
    print(f"  Server   : {args.url}")
    print(f"  Username : {args.user}")
    print(f"  Alerts   : {args.count}")
    print(f"  Interval : {args.interval}s")
    print("═" * 60 + "\n")

    try:
        token = get_token(args.url, args.user, args.password)
    except Exception as exc:
        log(f"Authentication failed: {exc}", 'ERR')
        sys.exit(1)

    for i in range(1, args.count + 1):
        alert_type = (random.choice(ALERT_TYPES) if args.type in (None, 'random')
                      else args.type)
        log(f"[{i}/{args.count}] Sending '{alert_type}' alert…")
        try:
            result = send_alert(args.url, token, alert_type, i)
            alert  = result.get('alert', {})
            log(f"  → Alert ID {alert.get('id')} created | media: {alert.get('media_path', 'none')}")
        except Exception as exc:
            log(f"  Upload failed: {exc}", 'ERR')

        if i < args.count:
            time.sleep(args.interval)

    print("\n" + "═" * 60)
    print("  ✅  Simulation complete. Check dashboard for new alerts.")
    print("═" * 60 + "\n")


if __name__ == '__main__':
    main()
