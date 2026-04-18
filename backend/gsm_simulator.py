import logging
import os

# ── Logging setup ──────────────────────────────────────────────────────────────
_log_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(_log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [GSM-SIM] %(levelname)s — %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(_log_dir, 'gsm_alerts.log')),
        logging.StreamHandler(),
    ],
)

_gsm_logger = logging.getLogger('GSM_SIMULATOR')

_EMOJIS = {
    'motion': '🏃',
    'human_detected': '👤',
    'intrusion': '🚨',
}


def send_gsm_alert(alert_type: str, timestamp: str, alert_id=None) -> dict:
    """
    Simulates an outgoing GSM SMS alert.
    In production replace the body of this function with your GSM module SDK call
    (e.g. Twilio, SIM800 serial command, or Textbelt free-tier REST API).
    """
    emoji = _EMOJIS.get(alert_type, '⚠️')
    label = alert_type.replace('_', ' ').title()

    banner = '═' * 58
    message = (
        f"\n{banner}\n"
        f"  {emoji}  GSM ALERT — {label}\n"
        f"{banner}\n"
        f"  Alert ID : {alert_id or 'N/A'}\n"
        f"  Type     : {label}\n"
        f"  Time     : {timestamp}\n"
        f"  SMS Text : 'ALERT! {label} detected at {timestamp}. "
        f"Check SecureEye dashboard immediately.'\n"
        f"  Status   : [SIMULATED] SMS would be dispatched to registered numbers.\n"
        f"{banner}\n"
    )

    _gsm_logger.warning(message)

    # ── Uncomment to send a real SMS via Textbelt (1 free SMS/day) ──────────
    # import requests
    # requests.post('https://textbelt.com/text', data={
    #     'phone': '+910000000000',
    #     'message': f'ALERT! {label} detected at {timestamp}.',
    #     'key': 'textbelt',   # free tier key
    # })

    return {'status': 'simulated', 'type': alert_type, 'timestamp': timestamp}
