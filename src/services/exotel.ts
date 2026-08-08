import { db } from './db'

export const exotel = {
  /**
   * Simulates setting up a call bridge between the scanner and the owner
   */
  async connectMaskedCall(scannerPhone: string, vehicleId: string): Promise<{ success: boolean; bridgeId: string; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vehicle = db.getVehicleById(vehicleId);
        if (!vehicle) {
          resolve({
            success: false,
            bridgeId: '',
            message: 'Vehicle not registered'
          });
          return;
        }

        if (vehicle.activeAlertsPaused) {
          resolve({
            success: false,
            bridgeId: '',
            message: 'Owner has temporarily paused alerts for this vehicle.'
          });
          return;
        }

        const bridgeId = `exotel-br-${Math.floor(Math.random() * 900000 + 100000)}`;
        const details = `Call bridged. Masked Exotel relay (+9180XXXXXX) connected scanner (${scannerPhone}) to owner (${vehicle.ownerName}).`;
        
        // Log to database
        db.addLog({
          vehicleId,
          type: 'wrong_parking',
          details
        });

        // Trigger global audio alert simulation
        window.dispatchEvent(new CustomEvent('vs_call_active', {
          detail: { bridgeId, licensePlate: vehicle.licensePlate, ownerName: vehicle.ownerName }
        }));

        resolve({
          success: true,
          bridgeId,
          message: `Relay connected successfully. Calling vehicle owner anonymously.`
        });
      }, 1000);
    });
  },

  /**
   * Simulates the offline IVR fallback dial-in process.
   * Triggered when a scanner dials the printed number directly without internet.
   */
  simulateIVRCall(stickerId: string): { success: boolean; audioInstructions: string } {
    const vehicle = db.getVehicleById(stickerId);
    if (!vehicle) {
      return {
        success: false,
        audioInstructions: 'Invalid VaahanSafe sticker ID. Goodbye.'
      };
    }

    if (vehicle.activeAlertsPaused) {
      return {
        success: true,
        audioInstructions: 'The owner of this vehicle has paused alerts. You can leave a brief voicemail.'
      };
    }

    return {
      success: true,
      audioInstructions: `Connecting you to the owner of vehicle ${vehicle.licensePlate.split('').join(' ')}. Please stand by while we bridge your call anonymously.`
    };
  }
};
