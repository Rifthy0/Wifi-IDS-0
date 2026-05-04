
export enum DeviceStatus {
  Trusted = 'Trusted',
  Suspicious = 'Suspicious',
  Unknown = 'Unknown',
}

export interface DeviceBehavior {
  connectionTimes: number[]; // Store timestamps of connections
  dataTransmitted: number; // in KB
}

export interface DeviceBehaviorProfile {
  avgConnectionHour: number | null;
  stdDevConnectionHour: number | null;
  avgDataPerTick: number | null;
  established: boolean;
}

export interface StatusHistoryEntry {
  timestamp: number;
  status: DeviceStatus | 'Blocked';
  threatScore: number;
  event?: string;
}

export interface Device {
  id: string;
  mac: string;
  ip: string;
  ssid?: string; // Network Name
  vendor: string;
  rssi: number; // Signal strength
  status: DeviceStatus;
  firstSeen: number;
  lastSeen: number;
  suspicionReason?: string;
  behavior: DeviceBehavior;
  behaviorProfile: DeviceBehaviorProfile;
  isExplicitlyTrusted?: boolean;
  threatScore: number;
  deviceType: string;
  rssiHistory: number[];
  isBlocked?: boolean;
  location?: string;
  statusHistory: StatusHistoryEntry[];
}

export enum LogLevel {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Alert = 'Alert',
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

export enum ThreatLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface ChartDataPoint {
  time: string;
  trusted: number;
  suspicious: number;
}

export interface HistoricalDataPoint {
    name: string;
    threats: number;
}

export interface EmailSettings {
  recipientEmail: string;
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
}

export interface AiInsight {
  confidence: number;
  message: string;
  deviceMac: string;
}
