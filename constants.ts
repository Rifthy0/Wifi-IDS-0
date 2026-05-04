
// A small subset of OUI (Organizationally Unique Identifier) for vendor lookup
export const MAC_VENDOR_PREFIXES: { [key: string]: { name: string, type: string } } = {
  '00:0C:29': { name: 'VMware, Inc.', type: 'Virtual Machine' },
  '00:1C:42': { name: 'Cisco Systems, Inc', type: 'Router/Switch' },
  '00:50:56': { name: 'VMware, Inc.', type: 'Virtual Machine' },
  '08:00:27': { name: 'Oracle Corporation', type: 'Virtual Machine' },
  '2C:F0:5D': { name: 'Apple, Inc.', type: 'Smartphone' },
  '3C:D9:2B': { name: 'Hewlett Packard', type: 'Laptop' },
  '70:B3:D5': { name: 'Apple, Inc.', type: 'Laptop' },
  '84:3D:C6': { name: 'TP-Link', type: 'Router' },
  '9C:FC:E8': { name: 'Intel Corporate', type: 'Laptop' },
  'A4:5E:60': { name: 'Google, Inc.', type: 'Smartphone' },
  'B8:27:EB': { name: 'Raspberry Pi Foundation', type: 'IoT Device' },
  'CC:65:AD': { name: 'TP-Link', type: 'IoT Device' },
  'DC:A6:32': { name: 'ASUSTek COMPUTER INC.', type: 'Laptop' },
  'F8:E4:3B': { name: 'Apple, Inc.', type: 'Tablet' },
};

export const SIMULATION_TICK_RATE_MS = 3000; // New device check every 3 seconds
export const MAX_DEVICES = 50;