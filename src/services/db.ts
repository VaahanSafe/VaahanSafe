export interface Vehicle {
  id: string
  licensePlate: string
  ownerName: string
  ownerPhone: string
  bloodGroup: string
  allergies: string
  emergencyContacts: string[]
  medicalNotes: string
  stickerStatus: 'Processing' | 'Shipped' | 'Delivered'
  tier: 'Basic' | 'Shield' | 'Family Pro'
  activeAlertsPaused: boolean
  expiryDate: string
  organDonor?: boolean
  status?: 'active' | 'suspended' | 'expired' | 'pending'
}

export interface ScanLog {
  id: string
  vehicleId: string
  time: string
  type: 'wrong_parking' | 'emergency' | 'issue'
  details: string
  photoUrl?: string
  coordinates?: { lat: number; lng: number }
}

const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'vehicle-1',
    licensePlate: 'MH-12-AB-1234',
    ownerName: 'Amit Sharma',
    ownerPhone: '+919876543210',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Dust',
    emergencyContacts: ['+919876543211 (Spouse)', '+919876543212 (Brother)'],
    medicalNotes: 'Diabetic. Takes Metformin daily.',
    stickerStatus: 'Delivered',
    tier: 'Shield',
    activeAlertsPaused: false,
    expiryDate: '2027-07-06'
  },
  {
    id: 'vehicle-2',
    licensePlate: 'KA-03-XY-9876',
    ownerName: 'Priya Nair',
    ownerPhone: '+919988776655',
    bloodGroup: 'A-',
    allergies: 'Peanuts',
    emergencyContacts: ['+919988776650 (Father)'],
    medicalNotes: 'No major medical conditions.',
    stickerStatus: 'Shipped',
    tier: 'Basic',
    activeAlertsPaused: false,
    expiryDate: '2027-01-15'
  }
];

const SEED_LOGS: ScanLog[] = [
  {
    id: 'log-1',
    vehicleId: 'vehicle-1',
    time: '2026-07-06 14:30:12',
    type: 'wrong_parking',
    details: 'Wrong parking call bridge connected.'
  },
  {
    id: 'log-2',
    vehicleId: 'vehicle-1',
    time: '2026-07-06 12:15:00',
    type: 'emergency',
    details: 'Emergency alert sent. Location: 28.6139, 77.2090. Photo captured.',
    photoUrl: 'blob:https://vaahansafe.in/mock-photo-1'
  }
];

export const db = {
  init() {
    if (!localStorage.getItem('vs_vehicles')) {
      localStorage.setItem('vs_vehicles', JSON.stringify(SEED_VEHICLES));
    }
    if (!localStorage.getItem('vs_logs')) {
      localStorage.setItem('vs_logs', JSON.stringify(SEED_LOGS));
    }
  },

  getVehicles(): Vehicle[] {
    this.init();
    return JSON.parse(localStorage.getItem('vs_vehicles') || '[]');
  },

  getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  },

  getVehicleByPlate(plate: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.licensePlate.replace(/\s+/g, '').toUpperCase() === plate.replace(/\s+/g, '').toUpperCase());
  },

  registerVehicle(vehicle: Omit<Vehicle, 'id' | 'stickerStatus' | 'expiryDate'>): Vehicle {
    const vehicles = this.getVehicles();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
      stickerStatus: 'Processing',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    vehicles.push(newVehicle);
    localStorage.setItem('vs_vehicles', JSON.stringify(vehicles));
    return newVehicle;
  },

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    
    vehicles[index] = { ...vehicles[index], ...updates };
    localStorage.setItem('vs_vehicles', JSON.stringify(vehicles));
    return vehicles[index];
  },

  getLogs(vehicleId?: string): ScanLog[] {
    this.init();
    const logs: ScanLog[] = JSON.parse(localStorage.getItem('vs_logs') || '[]');
    if (vehicleId) {
      return logs.filter(l => l.vehicleId === vehicleId).sort((a, b) => b.time.localeCompare(a.time));
    }
    return logs.sort((a, b) => b.time.localeCompare(a.time));
  },

  addLog(log: Omit<ScanLog, 'id' | 'time'>): ScanLog {
    const logs = JSON.parse(localStorage.getItem('vs_logs') || '[]');
    const newLog: ScanLog = {
      ...log,
      id: `log-${Date.now()}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.push(newLog);
    localStorage.setItem('vs_logs', JSON.stringify(logs));
    
    // Also trigger system event logging on dashboard if open
    window.dispatchEvent(new CustomEvent('vs_new_log', { detail: newLog }));
    return newLog;
  }
};
