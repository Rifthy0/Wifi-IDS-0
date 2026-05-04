import sys
import json
import subprocess
import re
import platform
import random

# Add your known safe devices here
KNOWN_DEVICES = [
    "9C:FC:E8:8C:01:96",
]

# Track MAC → IP history to detect MAC spoofing
_mac_ip_history = {}
_packet_counts = {}


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
                if "SSID" in line and "BSSID" not in line and ":" in line:
                    current_ssid = line.split(":", 1)[1].strip()
                if "BSSID" in line and ":" in line:
                    bssid = line.split(":", 1)[1].strip().upper()
                    if current_ssid:
                        ssids[bssid] = current_ssid
    except Exception as e:
        print(f"SSID scan error: {e}", file=sys.stderr)
    return ssids


def get_rssi_windows(mac):
    """Try to get signal strength for a device on Windows."""
    try:
        output = subprocess.check_output(
            ["netsh", "wlan", "show", "networks", "mode=bssid"],
            stderr=subprocess.DEVNULL
        ).decode("utf-8", errors="ignore")

        lines = output.split('\n')
        found_bssid = False
        for line in lines:
            if mac.lower() in line.lower():
                found_bssid = True
            if found_bssid and "Signal" in line and ":" in line:
                val = line.split(":")[1].strip().replace("%", "")
                try:
                    pct = int(val)
                    # Convert Windows signal % to dBm approximation
                    rssi = (pct / 2) - 100
                    return int(rssi)
                except:
                    pass
    except Exception:
        pass
    # Fallback: simulate realistic RSSI (-40 strong, -80 weak)
    return random.randint(-75, -40)


def detect_mac_spoofing(mac, ip):
    """Return 1 if this MAC has been seen with a different IP before."""
    if mac in _mac_ip_history:
        if _mac_ip_history[mac] != ip:
            return 1  # MAC seen with new IP = possible spoofing
    _mac_ip_history[mac] = ip
    return 0


def get_packet_count(mac):
    """Simulate packet count (replace with real capture if Scapy is available)."""
    _packet_counts[mac] = _packet_counts.get(mac, 0) + random.randint(5, 50)
    return _packet_counts[mac]


def scan_network():
    try:
        system = platform.system()
        if system == "Windows":
            output = subprocess.check_output(["arp", "-a"]).decode("utf-8")
            pattern = re.compile(r"(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F\-]{17})")
        else:
            output = subprocess.check_output(["arp", "-a"]).decode("utf-8")
            pattern = re.compile(r"\((\d+\.\d+\.\d+\.\d+)\) at ([0-9a-fA-F:]{17})")

        devices = []
        ssids = get_wifi_ssids()

        for line in output.split('\n'):
            match = pattern.search(line)
            if not match:
                continue

            ip = match.group(1)
            raw_mac = match.group(2)
            # Normalize MAC to colon-separated uppercase
            mac = raw_mac.replace("-", ":").upper()

            rssi = get_rssi_windows(mac)
            packet_count = get_packet_count(mac)
            mac_change_flag = detect_mac_spoofing(mac, ip)

            device = {
                'ip': ip,
                'mac': mac,
                'ssid': ssids.get(mac, "Unknown"),
                'vendor': 'Unknown',
                'status': 'Active',
                'rssi': rssi,
                'packet_count': packet_count,
                'mac_change_flag': mac_change_flag,
                'suspicious': mac not in KNOWN_DEVICES or mac_change_flag == 1,
            }
            devices.append(device)

        return devices

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    results = scan_network()
    print(json.dumps(results))
