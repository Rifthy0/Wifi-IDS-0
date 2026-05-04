import sys
import json
import subprocess
import re
import platform

# 🔥 Add your known safe devices here
KNOWN_DEVICES = [
    "9C:FC:E8:8C:01:96",   # replace with your own devices
]


def get_wifi_ssids():
    ssids = {}
    try:
        system = platform.system()

        if system == "Windows":
            output = subprocess.check_output(
                ["netsh", "wlan", "show", "networks", "mode=bssid"]
            ).decode("utf-8", errors="ignore")

            current_ssid = None
            for line in output.split('\n'):
                if "SSID" in line and ":" in line:
                    current_ssid = line.split(":")[1].strip()

                if "BSSID" in line and ":" in line:
                    bssid = line.split(":")[1].strip().upper()
                    if current_ssid:
                        ssids[bssid] = current_ssid

        else:
            # Simple fallback
            pass

    except Exception as e:
        print(f"SSID scan error: {e}", file=sys.stderr)

    return ssids


# -----------------------------
# 📡 ARP SCAN (WORKS ON WINDOWS)
# -----------------------------
def scan_network():
    try:
        output = subprocess.check_output(["arp", "-a"]).decode("utf-8")

        devices = []
        ssids = get_wifi_ssids()

        pattern = re.compile(r"\((\d+\.\d+\.\d+\.\d+)\) at ([0-9a-fA-F:]{17})")

        for line in output.split('\n'):
            match = pattern.search(line)

            if match:
                mac = match.group(2).upper()

                device = {
                    'ip': match.group(1),
                    'mac': mac,
                    'ssid': ssids.get(mac, "Unknown"),
                    'vendor': 'Unknown',
                    'status': 'Active',
                }

                # 🔥 ADD DETECTION LOGIC HERE
                if mac not in KNOWN_DEVICES:
                    device["suspicious"] = True
                else:
                    device["suspicious"] = False

                devices.append(device)

        return devices

    except Exception as e:
        return {"error": str(e)}


# -----------------------------
# ▶️ MAIN
# -----------------------------
if __name__ == "__main__":
    results = scan_network()
    print(json.dumps(results))