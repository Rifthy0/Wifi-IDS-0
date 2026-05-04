from services.email_service import send_alert_email

print("🚀 Starting email test...")

device = {
    "mac": "TEST-DEVICE-001",
    "signal": -25
}

send_alert_email(device)

print("✅ Test finished")