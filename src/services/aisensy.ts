import { db } from './db'

export const aisensy = {
  /**
   * Simulates sending WhatsApp emergency templates to the registered contacts
   */
  async sendEmergencyAlert(
    vehicleId: string, 
    coordinates: { lat: number; lng: number } | null, 
    photoUrl: string | null
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicle = db.getVehicleById(vehicleId);
        if (!vehicle) {
          resolve({ success: false, message: 'Vehicle not found' });
          return;
        }

        if (vehicle.activeAlertsPaused) {
          resolve({ success: false, message: 'Owner has temporarily paused alerts.' });
          return;
        }

        const mapLink = coordinates 
          ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
          : 'Location access denied by scanner';

        const alertMessage = `🚨 *VAAHANSAFE EMERGENCY ALERT* 🚨\n\n` +
          `Vehicle *${vehicle.licensePlate}* registered to *${vehicle.ownerName}* has been reported in an emergency.\n\n` +
          `📍 *Scan Location:* ${mapLink}\n` +
          `🩸 *Blood Group:* ${vehicle.bloodGroup}\n` +
          `⚠️ *Medical Info:* ${vehicle.medicalNotes || 'None'}\n\n` +
          `📸 *Incident photo attached.*`;

        // Record scan event to DB logs
        db.addLog({
          vehicleId,
          type: 'emergency',
          details: `Emergency report submitted. Location: ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Unknown'}. WhatsApp notifications routed to ${vehicle.emergencyContacts.length} contacts.`,
          photoUrl: photoUrl || undefined,
          coordinates: coordinates || undefined
        });

        // Trigger visual broadcast event so dashboards can show the alert message
        window.dispatchEvent(new CustomEvent('vs_whatsapp_sent', {
          detail: {
            licensePlate: vehicle.licensePlate,
            message: alertMessage,
            contacts: vehicle.emergencyContacts,
            photoUrl
          }
        }));

        resolve({ success: true, message: `Emergency WhatsApp template sent to ${vehicle.emergencyContacts.length} contacts.` });
      }, 1000);
    });
  },

  async sendParkingAlert(
    _vehicleId: string,
    issue: string,
    _coordinates: { lat: number; lng: number } | null
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Parking alert for ${issue} sent successfully.` });
      }, 500);
    });
  }
};
