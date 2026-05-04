
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import InboxView from './components/InboxView';
import TrustedDevicesManager from './components/TrustedDevicesManager';
import LoginPage from './components/LoginPage';
import ConfirmationModal from './components/ConfirmationModal';
import { Device, DeviceStatus, LogEntry, LogLevel, ThreatLevel, ChartDataPoint, HistoricalDataPoint, EmailSettings, AiInsight, StatusHistoryEntry } from './types';
import { MAC_VENDOR_PREFIXES, SIMULATION_TICK_RATE_MS, MAX_DEVICES } from './constants';
import DeviceDetailPanel from './components/DeviceDetailPanel';

const LOCATIONS = ['New York, USA', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Local Network', 'Local Network', 'Local Network'];

const App: React.FC = () => {
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [stealthMode, setStealthMode] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [learningMode, setLearningMode] = useState<boolean>(false);
  const [adaptiveAiMode, setAdaptiveAiMode] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(ThreatLevel.Low);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isTrustedManagerOpen, setIsTrustedManagerOpen] = useState<boolean>(false);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement>(null);

  const [trustedMacs, setTrustedMacs] = useState<Set<string>>(() => {
    try {
      const item = localStorage.getItem('trustedMacs');
      return item ? new Set(JSON.parse(item)) : new Set();
    } catch (e) {
      console.error("Failed to parse trusted MACs from localStorage", e);
      return new Set();
    }
  });

   const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    try {
      const item = localStorage.getItem('emailSettings');
      const parsed = item ? JSON.parse(item) : {};
      return { 
        recipientEmail: parsed.recipientEmail || 'm.r.m.rifthy@gmail.com', 
        smtpServer: parsed.smtpServer || 'smtp.gmail.com', 
        smtpPort: parsed.smtpPort || '587', 
        smtpUser: parsed.smtpUser || 'm.r.m.rifthy@gmail.com', 
        smtpPass: parsed.smtpPass || 'fejwftwujimsgzjc' 
      };
    } catch (e) {
      console.error("Failed to parse email settings from localStorage", e);
      return { 
        recipientEmail: 'm.r.m.rifthy@gmail.com', 
        smtpServer: 'smtp.gmail.com', 
        smtpPort: '587', 
        smtpUser: 'm.r.m.rifthy@gmail.com', 
        smtpPass: 'fejwftwujimsgzjc' 
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('trustedMacs', JSON.stringify(Array.from(trustedMacs)));
  }, [trustedMacs]);
  
  useEffect(() => {
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
  }, [emailSettings]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const addLogEntry = useCallback((message: string, level: LogLevel) => {
    setLogEntries(prev => [{ id: self.crypto.randomUUID(), timestamp: Date.now(), message, level }, ...prev.slice(0, 99)]);
  }, []);

  const calculateThreatScore = (device: Device): number => {
    let score = 0;
    if (device.status === DeviceStatus.Unknown) score += 15;
    if (device.status === DeviceStatus.Suspicious) score += 40;
    if (device.suspicionReason?.includes('high data transfer')) score += 35;
    if (device.suspicionReason?.includes('Unusual connection time')) score += 20;
    if (device.suspicionReason?.includes('Spoofed MAC')) score += 50;
    if (device.suspicionReason?.includes('unexpected location')) score += 30;
    if (device.vendor === 'Unknown') score += 10;
    if (device.rssi < -80) score += 10;
    if (device.rssi < -90) score += 20;

    return Math.min(100, Math.max(0, score));
  };
  
  const handleTrustDevice = useCallback((deviceId: string) => {
    setDevices(prev => prev.map(d => {
        if (d.id === deviceId) {
            setTrustedMacs(prevMacs => new Set(prevMacs).add(d.mac));
            addLogEntry(`Device ${d.mac} has been manually trusted.`, LogLevel.Info);
            const updated = { ...d, status: DeviceStatus.Trusted, isExplicitlyTrusted: true, suspicionReason: undefined, isBlocked: false, threatScore: 0 };
            updated.statusHistory = [...updated.statusHistory, { timestamp: Date.now(), status: DeviceStatus.Trusted, threatScore: 0, event: 'Manually Trusted' }];
            return updated;
        }
        return d;
    }));
  }, [addLogEntry]);

  const handleAddTrustedMac = useCallback((mac: string) => {
      const upperMac = mac.toUpperCase();
      if (!/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/.test(upperMac)) {
          addLogEntry(`Invalid MAC address format: ${mac}`, LogLevel.Warning);
          return;
      }
      if (trustedMacs.has(upperMac)) {
          addLogEntry(`MAC address ${upperMac} is already trusted.`, LogLevel.Info);
          return;
      }
      setTrustedMacs(prev => new Set(prev).add(upperMac));
      addLogEntry(`Manually added ${upperMac} to trusted list.`, LogLevel.Info);
      setDevices(prev => prev.map(d => {
        if (d.mac === upperMac) {
          const updated = { ...d, status: DeviceStatus.Trusted, isExplicitlyTrusted: true, suspicionReason: undefined, isBlocked: false, threatScore: 0 };
          updated.statusHistory = [...updated.statusHistory, { timestamp: Date.now(), status: DeviceStatus.Trusted, threatScore: 0, event: 'Added to Global Trusted List' }];
          return updated;
        }
        return d;
      }));
  }, [trustedMacs, addLogEntry]);

  const handleRemoveTrustedMac = useCallback((mac: string) => {
      setTrustedMacs(prev => {
          const newMacs = new Set(prev);
          newMacs.delete(mac);
          return newMacs;
      });
      addLogEntry(`Removed ${mac} from trusted list.`, LogLevel.Warning);
      setDevices(prev => prev.map(d => {
          if (d.mac === mac) {
              const untrustedDevice = { ...d, status: DeviceStatus.Unknown, isExplicitlyTrusted: false };
              const updated = { ...untrustedDevice, threatScore: calculateThreatScore(untrustedDevice) };
              updated.statusHistory = [...updated.statusHistory, { timestamp: Date.now(), status: DeviceStatus.Unknown, threatScore: updated.threatScore, event: 'Removed from Trusted List' }];
              return updated;
          }
          return d;
      }));
  }, [addLogEntry]);
    
  const handleBlockDevice = useCallback((deviceId: string) => {
    setPendingBlockId(deviceId);
  }, []);

  const confirmBlockExecution = useCallback(async () => {
    if (!pendingBlockId) return;
    
    if (!isSimulationMode) {
      try {
        const response = await fetch('/api/devices/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pendingBlockId })
        });
        if (response.ok) {
          addLogEntry(`Real-time block command sent for device ${pendingBlockId}.`, LogLevel.Alert);
        }
      } catch (error) {
        console.error("Failed to block device in real mode", error);
        addLogEntry("Failed to communicate with real-time IDS engine.", LogLevel.Alert);
      }
    }

    setDevices(prev => prev.map(d => {
        if (d.id === pendingBlockId) {
              if(trustedMacs.has(d.mac)) {
                  setTrustedMacs(prevMacs => {
                    const newMacs = new Set(prevMacs);
                    newMacs.delete(d.mac);
                    return newMacs;
                });
              }
            addLogEntry(`Device ${d.mac} has been blocked.`, LogLevel.Alert);
            const blockedDevice = { ...d, isBlocked: true, status: DeviceStatus.Suspicious, isExplicitlyTrusted: false };
            const updated = { ...blockedDevice, threatScore: calculateThreatScore(blockedDevice) };
            updated.statusHistory = [...updated.statusHistory, { timestamp: Date.now(), status: 'Blocked' as any, threatScore: updated.threatScore, event: 'Device Blocked' }];
            return updated;
        }
        return d;
    }));
    setPendingBlockId(null);
  }, [pendingBlockId, addLogEntry, trustedMacs]);

  const handleExportLogs = useCallback(() => {
    const headers = "Timestamp,Level,Message\n";
    const csvContent = logEntries
        .map(entry => {
            const timestamp = new Date(entry.timestamp).toISOString();
            const message = `"${entry.message.replace(/"/g, '""')}"`;
            return [timestamp, entry.level, message].join(',');
        })
        .reverse()
        .join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `wifi_ids_event_log_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    addLogEntry("Event log exported to CSV.", LogLevel.Info);
  }, [logEntries, addLogEntry]);
    
  const handleSaveEmailSettings = useCallback((settings: EmailSettings) => {
      setEmailSettings(settings);
      addLogEntry("Email alert settings saved successfully.", LogLevel.Info);
  }, [addLogEntry]);

  const handleSendTestEmail = useCallback(async (settings: EmailSettings) => {
      if (!settings.recipientEmail || !settings.smtpServer) {
          addLogEntry("Cannot send test email. Recipient and SMTP server must be configured.", LogLevel.Warning);
          return;
      }
      
      addLogEntry(`Sending test email to ${settings.recipientEmail}...`, LogLevel.Info);
      
      try {
          const response = await fetch('/api/email/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  smtp_server: settings.smtpServer,
                  smtp_port: parseInt(settings.smtpPort) || 587,
                  smtp_user: settings.smtpUser,
                  smtp_pass: settings.smtpPass,
                  recipient_email: settings.recipientEmail
              })
          });
          
          const result = await response.json();
          
          if (result.status === 'success') {
              addLogEntry(`✅ Test email sent successfully to ${settings.recipientEmail}`, LogLevel.Info);
          } else {
              addLogEntry(`❌ Email failed: ${result.message}`, LogLevel.Error);
          }
      } catch (error) {
          addLogEntry(`❌ Email error: ${error instanceof Error ? error.message : 'Unknown error'}`, LogLevel.Error);
      }
  }, [addLogEntry]);

  const generateRandomMac = useCallback(() => {
    const prefixes = Object.keys(MAC_VENDOR_PREFIXES);
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Array(3).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
    return `${randomPrefix}:${suffix}`.toUpperCase();
  }, []);

  const simulationEmailsSentRef = useRef<Set<string>>(new Set());

  const isSuspiciousOnFirstSight = useCallback((device: Omit<Device, 'id' | 'status' | 'firstSeen' | 'lastSeen' | 'behavior' | 'behaviorProfile' | 'threatScore' | 'deviceType' | 'rssiHistory' | 'statusHistory'>, currentDevices: Device[], isLearning: boolean): { suspicious: boolean, reason?: string } => {
    if (device.rssi < -85) return { suspicious: true, reason: 'Extremely low signal strength (potential remote attack).' };
    if (device.vendor === 'Unknown') return { suspicious: true, reason: 'MAC address vendor is not recognized.' };
    if (device.location !== 'Local Network') return { suspicious: true, reason: `Connection from an unexpected location: ${device.location}.` };
    const duplicateMac = currentDevices.find(d => d.mac === device.mac);
    if (duplicateMac) return { suspicious: true, reason: `Spoofed MAC address, detected duplicate of ${duplicateMac.ip}.` };
    if (isLearning && device.rssi < -80) return { suspicious: false };
    if (device.rssi < -80) return { suspicious: true, reason: 'Low signal strength.'};
    return { suspicious: false };
  }, []);

  const runSimulationTick = useCallback(() => {
    if (!isSimulationMode) return;
    setDevices(prevDevices => {
        const now = Date.now();
        
        let updatedDevices = prevDevices.map(d => {
            if (d.isBlocked) return d;
            const newRssi = d.status !== DeviceStatus.Trusted ? d.rssi + Math.floor(Math.random() * 5) - 2 : d.rssi;
            const updatedDevice = { ...d, rssi: newRssi, lastSeen: now, rssiHistory: [...d.rssiHistory, newRssi].slice(-20) };
            const isTrusted = d.status === DeviceStatus.Trusted;
            const dataThisTick = Math.floor(Math.random() * (isTrusted ? 50 : 150)) + 5;
            const isAnomalyTriggered = Math.random() > 0.97 && d.behaviorProfile.established;
            const finalDataThisTick = isAnomalyTriggered ? dataThisTick * 15 : dataThisTick;
            updatedDevice.behavior = { ...d.behavior, dataTransmitted: d.behavior.dataTransmitted + finalDataThisTick, connectionTimes: [...d.behavior.connectionTimes, now].slice(-100) };
            const ticksSinceFirstSeen = (now - d.firstSeen) / SIMULATION_TICK_RATE_MS;
            
            if (!d.behaviorProfile.established && ticksSinceFirstSeen > 10 && d.status !== DeviceStatus.Trusted) {
                const hours = updatedDevice.behavior.connectionTimes.map(t => new Date(t).getUTCHours());
                const sumHours = hours.reduce((a, b) => a + b, 0);
                const avgHour = sumHours / hours.length;
                const sqDiffs = hours.map(h => Math.pow(h - avgHour, 2));
                const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / sqDiffs.length;
                const stdDev = Math.sqrt(avgSqDiff);
                updatedDevice.behaviorProfile = { avgConnectionHour: avgHour, stdDevConnectionHour: stdDev, avgDataPerTick: updatedDevice.behavior.dataTransmitted / ticksSinceFirstSeen, established: true };
                addLogEntry(`Behavior profile established for ${d.mac}.`, LogLevel.Info);
                updatedDevice.statusHistory = [...updatedDevice.statusHistory, { timestamp: now, status: updatedDevice.status, threatScore: updatedDevice.threatScore, event: 'Behavioral Baseline Established' }];
            }
            
            if (updatedDevice.behaviorProfile.established && !updatedDevice.isExplicitlyTrusted) {
                const profile = updatedDevice.behaviorProfile;
                const currentHour = new Date(now).getUTCHours();
                const oldStatus = updatedDevice.status;
                
                if (Math.abs(currentHour - profile.avgConnectionHour!) > (profile.stdDevConnectionHour! * 2 + 1)) {
                    updatedDevice.status = DeviceStatus.Suspicious;
                    updatedDevice.suspicionReason = `Unusual connection time (connected at ${currentHour}:00, expected ~${Math.round(profile.avgConnectionHour!)}:00).`;
                    if (oldStatus !== DeviceStatus.Suspicious) {
                        addLogEntry(`Behavior anomaly for ${updatedDevice.mac}: ${updatedDevice.suspicionReason}`, LogLevel.Warning);
                        updatedDevice.statusHistory = [...updatedDevice.statusHistory, { timestamp: now, status: updatedDevice.status, threatScore: calculateThreatScore(updatedDevice), event: 'Anomalous Connection Time Detected' }];
                    }
                    setAiInsight({
                        confidence: Math.floor(Math.random() * 16) + 60, // 60-75%
                        message: 'Unusual connection time detected',
                        deviceMac: updatedDevice.mac
                    });
                }
                
                if (finalDataThisTick > profile.avgDataPerTick! * 10 && profile.avgDataPerTick! > 1) {
                      updatedDevice.status = DeviceStatus.Suspicious;
                      updatedDevice.suspicionReason = `Unusually high data transfer (${finalDataThisTick.toFixed(0)} KB) compared to average.`;
                      if (oldStatus !== DeviceStatus.Suspicious) {
                        addLogEntry(`Behavior anomaly for ${updatedDevice.mac}: ${updatedDevice.suspicionReason}`, LogLevel.Alert);
                        updatedDevice.statusHistory = [...updatedDevice.statusHistory, { timestamp: now, status: updatedDevice.status, threatScore: calculateThreatScore(updatedDevice), event: 'Massive Data Transfer Burst' }];
                      }
                      setAiInsight({
                          confidence: Math.floor(Math.random() * 15) + 85, // 85-99%
                          message: 'Unusual data burst',
                          deviceMac: updatedDevice.mac
                      });
                }
            }
            
            const newThreatScore = calculateThreatScore(updatedDevice);
            // Periodically log threat score history even if status doesn't change
            if (now % 15000 < SIMULATION_TICK_RATE_MS) {
                updatedDevice.statusHistory = [...updatedDevice.statusHistory.slice(-49), { timestamp: now, status: updatedDevice.status, threatScore: newThreatScore }];
            }
            updatedDevice.threatScore = newThreatScore;
            return updatedDevice;
        });
        
        let devicesAfterDepartures = updatedDevices.filter(d => {
            const shouldDepart = !d.isExplicitlyTrusted && !d.isBlocked && Math.random() < 0.01;
            if (shouldDepart) { addLogEntry(`Device ${d.mac} disconnected.`, LogLevel.Info); }
            return !shouldDepart;
        });

        const newDeviceDiscoveryChance = stealthMode ? 0.85 : 0.6;
        if (Math.random() > newDeviceDiscoveryChance && devicesAfterDepartures.length < MAX_DEVICES) {
            const mac = generateRandomMac();
            if (!devicesAfterDepartures.some(d => d.mac === mac)) {
                const prefix = mac.substring(0, 8);
                const vendorInfo = MAC_VENDOR_PREFIXES[prefix] || { name: 'Unknown', type: 'Unknown' };
                const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
                const ssids = ['Office_Guest', 'HQ_Secure', 'IoT_Net', 'Staff_Wi-Fi'];
                const partialDevice = { 
                  mac, 
                  ip: `192.168.1.${Math.floor(Math.random() * 253) + 2}`, 
                  vendor: vendorInfo.name, 
                  rssi: -Math.floor(Math.random() * 60) - 30, 
                  deviceType: vendorInfo.type, 
                  location,
                  ssid: ssids[Math.floor(Math.random() * ssids.length)]
                };
                
                if (trustedMacs.has(mac)) {
                      const newDevice: Device = { ...partialDevice, id: self.crypto.randomUUID(), status: DeviceStatus.Trusted, suspicionReason: undefined, firstSeen: now, lastSeen: now, behavior: { connectionTimes: [now], dataTransmitted: 0 }, behaviorProfile: { avgConnectionHour: null, stdDevConnectionHour: null, avgDataPerTick: null, established: false }, isExplicitlyTrusted: true, threatScore: 0, rssiHistory: [partialDevice.rssi], isBlocked: false, statusHistory: [{ timestamp: now, status: DeviceStatus.Trusted, threatScore: 0, event: 'Trusted Device Connected' }] };
                      addLogEntry(`Recognized trusted device reconnected: ${newDevice.mac}`, LogLevel.Info);
                      devicesAfterDepartures.push(newDevice);
                } else {
                    const { suspicious, reason } = isSuspiciousOnFirstSight(partialDevice, devicesAfterDepartures, learningMode);
                    const newDeviceStatus = suspicious ? DeviceStatus.Suspicious : DeviceStatus.Unknown;
                    let newDevice: Device = { ...partialDevice, id: self.crypto.randomUUID(), status: newDeviceStatus, suspicionReason: reason, firstSeen: now, lastSeen: now, behavior: { connectionTimes: [now], dataTransmitted: 0 }, behaviorProfile: { avgConnectionHour: null, stdDevConnectionHour: null, avgDataPerTick: null, established: false }, isExplicitlyTrusted: false, threatScore: 0, rssiHistory: [partialDevice.rssi], isBlocked: false, statusHistory: [] };
                    newDevice.threatScore = calculateThreatScore(newDevice);
                    newDevice.statusHistory = [{ timestamp: now, status: newDeviceStatus, threatScore: newDevice.threatScore, event: 'First Discovery' }];
                    
                    const alertRecipient = emailSettings.recipientEmail || "admin";

                    // 1. Log to the UI Correctly
                    if (newDevice.status === DeviceStatus.Suspicious) { 
                        addLogEntry(`[Email Alert Sent to ${alertRecipient}] Suspicious device: ${newDevice.mac} (${reason})`, LogLevel.Alert);
                    } 
                    else { 
                        addLogEntry(`[Email Alert Sent to ${alertRecipient}] New unknown device: ${newDevice.mac} (${newDevice.vendor})`, LogLevel.Warning); 
                    }

                    // 2. ACTUALLY fire the physical email for BOTH types of alerts!
                    if (!simulationEmailsSentRef.current.has(newDevice.mac)) {
                        simulationEmailsSentRef.current.add(newDevice.mac);
                        fetch('/api/email/alert', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                mac: newDevice.mac, 
                                signal: `${newDevice.rssi} dBm (Simulated)`, 
                                vendor: newDevice.vendor || 'Unknown', 
                                reason: reason || 'New Unknown Device Discovered',
                                smtp_server: emailSettings.smtpServer,
                                smtp_port: parseInt(emailSettings.smtpPort) || 587,
                                smtp_user: emailSettings.smtpUser,
                                smtp_pass: emailSettings.smtpPass,
                                recipient_email: emailSettings.recipientEmail
                            })
                        }).catch(console.error);
                        
                        addLogEntry(`[Live Demo] Actual test email dispatched for simulated device ${newDevice.mac}!`, LogLevel.Info);
                    }

                    devicesAfterDepartures.push(newDevice);
                }
            }
        }
        
        return devicesAfterDepartures;
    });
  }, [addLogEntry, generateRandomMac, isSuspiciousOnFirstSight, learningMode, stealthMode, trustedMacs, emailSettings]);

  useEffect(() => {
    if (isSimulationMode) {
        if (isScanning) {
            addLogEntry("Wi-Fi scanning started (Simulation).", LogLevel.Info);
            const interval = setInterval(runSimulationTick, SIMULATION_TICK_RATE_MS);
            return () => { clearInterval(interval); addLogEntry("Wi-Fi scanning stopped (Simulation).", LogLevel.Info); };
        }
    } else {
        // Clear simulation devices when entering real mode
        setDevices([]);
        if (isScanning) {
            addLogEntry("Real-time IDS engine connection established.", LogLevel.Info);
            const fetchRealData = async () => {
                try {
                    const [devicesRes, logsRes] = await Promise.all([
                        fetch('/api/devices'),
                        fetch('/api/logs')
                    ]);
                    if (devicesRes.ok && logsRes.ok) {
                        const realDevices = await devicesRes.json();
                        const realLogs = await logsRes.json();
                        setDevices(realDevices);
                        setLogEntries(prev => {
                            const existingIds = new Set(prev.map(l => l.id));
                            const newLogs = realLogs.filter((l: any) => !existingIds.has(l.id));
                            return [...newLogs, ...prev].slice(0, 100);
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch real-time data", error);
                }
            };
            fetchRealData();
            const interval = setInterval(fetchRealData, 3000); // Poll every 3s in real mode
            return () => {
                clearInterval(interval);
                addLogEntry("Real-time IDS engine connection suspended.", LogLevel.Info);
            };
        }
    }
  }, [isSimulationMode, isScanning, runSimulationTick, addLogEntry, trustedMacs, learningMode, emailSettings]);

  useEffect(() => {
    setThreatLevel(prevThreatLevel => {
        const suspiciousCount = devices.filter(d => d.status === DeviceStatus.Suspicious && !d.isBlocked).length;
        const totalCount = devices.length;
        if (totalCount === 0) {
            return ThreatLevel.Low;
        }
        const ratio = suspiciousCount / totalCount;

        let newThreatLevel: ThreatLevel;
        if (ratio > 0.3 || suspiciousCount > 5) newThreatLevel = ThreatLevel.Critical;
        else if (ratio > 0.15 || suspiciousCount > 2) newThreatLevel = ThreatLevel.High;
        else if (suspiciousCount > 0) newThreatLevel = ThreatLevel.Medium;
        else newThreatLevel = ThreatLevel.Low;
        
        const isEscalation = (newThreatLevel === ThreatLevel.High || newThreatLevel === ThreatLevel.Critical) &&
                             (prevThreatLevel !== ThreatLevel.High && prevThreatLevel !== ThreatLevel.Critical);

        if (isEscalation && isScanning) {
            setIsAlerting(true);
            alertAudioRef.current?.play().catch(e => console.log("Audio play failed:", e));
            setTimeout(() => setIsAlerting(false), 3000); // Alert duration
        }

        return newThreatLevel;
    });
  }, [devices, isScanning]);

  useEffect(() => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const trusted = devices.filter(d => d.status === DeviceStatus.Trusted).length;
    const suspicious = devices.filter(d => d.status === DeviceStatus.Suspicious).length;
    setChartData(prev => [...prev.slice(-29), { time: timeLabel, trusted, suspicious }]);
  }, [devices]);
    
  useEffect(() => {
    const today = new Date();
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            threats: Math.floor(Math.random() * 3) + (i > 4 ? Math.floor(Math.random() * 5) : 1)
        };
    });
    setHistoricalData(data);
  }, []);

  const deviceCounts = useMemo(() => {
    return devices.reduce((acc, device) => {
        if (device.isBlocked) acc.blocked++;
        else if (device.status === DeviceStatus.Trusted) acc.trusted++;
        else if (device.status === DeviceStatus.Suspicious) acc.suspicious++;
        else if (device.status === DeviceStatus.Unknown) acc.unknown++;
        return acc;
    }, { trusted: 0, suspicious: 0, unknown: 0, blocked: 0 });
  }, [devices]);
    
  const devicesNeedingAction = useMemo(() => {
    return devices.filter(d => d.status === DeviceStatus.Unknown && !d.isExplicitlyTrusted && !d.isBlocked);
  }, [devices]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Reset state on logout for a clean session
    setIsScanning(false);
  };

  const devicePendingBlock = useMemo(() => 
    devices.find(d => d.id === pendingBlockId), 
    [devices, pendingBlockId]
  );

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-slate-900 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-800 dark:to-slate-900 font-sans text-light-text-primary dark:text-slate-300">
      <Header 
        stealthMode={stealthMode} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        alertCount={devicesNeedingAction.length}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOpenTrustedManager={() => setIsTrustedManagerOpen(true)}
        onLogout={handleLogout}
        isSimulationMode={isSimulationMode}
        setIsSimulationMode={setIsSimulationMode}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard 
          stealthMode={stealthMode} 
          setStealthMode={setStealthMode} 
          theme={theme}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          learningMode={learningMode}
          setLearningMode={setLearningMode}
          adaptiveAiMode={adaptiveAiMode}
          setAdaptiveAiMode={setAdaptiveAiMode}
          devices={devices}
          logEntries={logEntries}
          threatLevel={threatLevel}
          chartData={chartData}
          historicalData={historicalData}
          isAlerting={isAlerting}
          handleTrustDevice={handleTrustDevice}
          handleBlockDevice={handleBlockDevice}
          handleExportLogs={handleExportLogs}
          addLogEntry={addLogEntry}
          deviceCounts={deviceCounts}
          devicesNeedingAction={devicesNeedingAction}
          alertAudioRef={alertAudioRef}
          emailSettings={emailSettings}
          onSaveEmailSettings={handleSaveEmailSettings}
          onSendTestEmail={handleSendTestEmail}
          aiInsight={aiInsight}
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
        />
      </main>
      <InboxView
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        devices={devicesNeedingAction}
        onTrust={handleTrustDevice}
        onBlock={handleBlockDevice}
      />
      <TrustedDevicesManager
        isOpen={isTrustedManagerOpen}
        onClose={() => setIsTrustedManagerOpen(false)}
        trustedMacs={Array.from(trustedMacs)}
        onAdd={handleAddTrustedMac}
        onRemove={handleRemoveTrustedMac}
      />
      <DeviceDetailPanel
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onTrust={handleTrustDevice}
        onBlock={handleBlockDevice}
        theme={theme}
      />
      
      {/* Confirmation Modal for Blocking */}
      <ConfirmationModal
        isOpen={!!pendingBlockId}
        onClose={() => setPendingBlockId(null)}
        onConfirm={confirmBlockExecution}
        title="Confirm Device Block"
        message={`Are you sure you want to block the device with MAC: ${devicePendingBlock?.mac}? This will immediately terminate its network access and classify it as a high-priority suspicious entity.`}
        confirmLabel="Block Device"
        confirmVariant="danger"
      />

      <footer className="text-center p-4 text-light-text-secondary dark:text-slate-600 text-xs">
        <p>Smart Wi-Fi IDS Dashboard &copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
