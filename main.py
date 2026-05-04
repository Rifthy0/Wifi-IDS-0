import uvicorn
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime
import json
import subprocess
import os
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, get_db
from models import EventLogModel
from anomaly import detector

from services.email_service import send_test_email as dispatch_test_email, send_alert_email_dynamic

app = FastAPI(title="Smart Wi-Fi IDS API")


sent_devices = set()



@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)



@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.datetime.utcnow()
    }


@app.get("/api/devices")
async def get_devices(db: AsyncSession = Depends(get_db)):
    try:
        print("🚀 Running scanner...")

        process = subprocess.Popen(
            ["python", "scanner.py"],  
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.getcwd()
        )

        stdout, stderr = process.communicate(timeout=30)

        if stderr:
            print("❌ Scanner error:", stderr.decode())

        stdout_str = stdout.decode()
        print("RAW OUTPUT:", stdout_str)

        # Parse JSON safely
        try:
            scan_results = json.loads(stdout_str)
        except json.JSONDecodeError as je:
            print("❌ JSON parsing error:", str(je))
            return []

        if isinstance(scan_results, dict) and "error" in scan_results:
            print("❌ Scan error:", scan_results["error"])
            return []

        if not isinstance(scan_results, list):
            print("❌ Invalid scan results format")
            return []

        print("✅ Parsed devices:", scan_results)

        # Get email configuration from environment
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        recipient_email = os.getenv("RECIPIENT_EMAIL") or smtp_user

        for device in scan_results:
            mac = device.get("mac")
            rssi = device.get("rssi", -50)
            
            # Use anomaly detector to determine if device is suspicious
            threat_score = detector.predict(rssi)
            # Threshold: score < -0.5 indicates anomaly
            is_suspicious = threat_score < -0.5
            
            device["suspicious"] = is_suspicious
            device["threat_score"] = max(0, min(100, int((1 - threat_score) * 50)))  # Convert to 0-100 scale
            
            # Map device status based on suspicion
            if is_suspicious:
                device["status"] = "Suspicious"
            else:
                device["status"] = "Known"

            # Send email for ALL newly detected devices (not just suspicious ones)
            if mac not in sent_devices and smtp_user and smtp_pass:
                print("📧 Sending email for newly detected device:", mac)
                try:
                    # Create device info for email
                    device_info = {
                        "mac": mac,
                        "signal": f"{rssi} dBm",
                        "vendor": device.get("vendor", "Unknown"),
                        "reason": f"New device connected to WiFi network - Status: {'Suspicious' if is_suspicious else 'Normal'}"
                    }
                    
                    send_alert_email_dynamic(
                        device_info,
                        smtp_server,
                        smtp_port,
                        smtp_user,
                        smtp_pass,
                        recipient_email
                    )
                    sent_devices.add(mac)
                    print(f"✅ Email sent successfully for device {mac}")
                except Exception as email_err:
                    print(f"❌ Email sending failed for {mac}: {str(email_err)}")

            if is_suspicious:
                print("⚠ Suspicious device detected:", mac)
                # Log the alert
                new_log = EventLogModel(
                    level="Alert",
                    message=f"Suspicious device detected: {mac} (RSSI: {rssi}, Threat Score: {device['threat_score']})" 
                )
                db.add(new_log)

        await db.commit()

        return scan_results

    except subprocess.TimeoutExpired:
        print("❌ Scanner timeout")
        return []
    except Exception as e:
        print("❌ System error:", str(e))
        import traceback
        traceback.print_exc()
        return []



@app.post("/api/devices/block")
async def block_device(mac: str, db: AsyncSession = Depends(get_db)):

    new_log = EventLogModel(
        level="Alert",
        message=f"Blocking command issued for MAC: {mac}"
    )

    db.add(new_log)
    await db.commit()

    return {
        "status": "success",
        "mac": mac
    }



@app.get("/api/logs")
async def get_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EventLogModel)
        .order_by(EventLogModel.timestamp.desc())
        .limit(100)
    )

    return result.scalars().all()



from pydantic import BaseModel

class EmailTestRequest(BaseModel):
    smtp_server: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    recipient_email: str

@app.post("/api/email/test")
async def test_email(request: EmailTestRequest):
    """Test email configuration by sending a test email"""
    try:
        result = send_test_email(
            smtp_server=request.smtp_server,
            smtp_port=request.smtp_port,
            smtp_user=request.smtp_user,
            smtp_pass=request.smtp_pass,
            recipient_email=request.recipient_email
        )
        return {"status": "success", "message": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}



class AlertPayload(BaseModel):
    mac: str
    signal: str
    vendor: str
    reason: str
    smtp_server: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    recipient_email: str

@app.post("/api/email/alert")
async def trigger_alert_email(payload: AlertPayload):
    try:
        device_data = {
            "mac": payload.mac,
            "signal": payload.signal,
            "vendor": payload.vendor,
            "reason": payload.reason
        }
        
        result_message = send_alert_email_dynamic(
            device_data,
            payload.smtp_server,
            payload.smtp_port,
            payload.smtp_user,
            payload.smtp_pass,
            payload.recipient_email
        )
        return {"status": "success", "message": "Alert email dispatched"}
    except Exception as e:
        print(f"Alert Error: {e}")
        return {"status": "error", "detail": str(e)}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)