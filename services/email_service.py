import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load .env
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "m.r.m.rifthy@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "")

def send_alert_email_dynamic(device, smtp_server: str, smtp_port: int, smtp_user: str, smtp_pass: str, recipient_email: str):
    if not smtp_server or not smtp_user or not smtp_pass:
        raise ValueError("SMTP server, user, and password are required from UI")

    subject = "🚨 ALERT: Unauthorized Device Detected"

    body = f"""
ALERT!

Unauthorized device detected on your network.

MAC Address: {device.get('mac', 'Unknown')}
Signal Strength: {device.get('signal', 'Unknown')}
Vendor: {device.get('vendor', 'Unknown')}
Reason: {device.get('reason', 'Unknown')}
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient_email

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, recipient_email, msg.as_string())
        server.quit()
        print("✅ Alert email sent successfully!")
        return "Alert email sent successfully!"
    except Exception as e:
        print("❌ Email error:", str(e))
        raise Exception(f"SMTP Error: {str(e)}")


def send_test_email(smtp_server: str, smtp_port: int, smtp_user: str, smtp_pass: str, recipient_email: str) -> str:
    """Send a test email with custom SMTP credentials"""
    if not smtp_server or not smtp_user or not smtp_pass:
        raise ValueError("SMTP server, user, and password are required")
    
    subject = "✅ Wi-Fi IDS Test Email"
    
    body = f"""
This is a test email from your Wi-Fi Intrusion Detection System.

If you received this, your email configuration is working correctly!

SMTP Server: {smtp_server}
SMTP Port: {smtp_port}
"""
    
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient_email
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, recipient_email, msg.as_string())
        server.quit()
        
        return "Test email sent successfully!"
    except Exception as e:
        raise Exception(f"SMTP Error: {str(e)}")
