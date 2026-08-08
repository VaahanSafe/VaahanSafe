# VaahanSafe | Comprehensive Client & Stakeholder Guide

> **Intelligent Vehicle Safety, Anonymous Windshield QR Ecosystem & Emergency SOS Dispatching**

---

## 📋 Executive Overview

**VaahanSafe** is a next-generation vehicle safety and privacy platform designed to solve two critical real-world roadside problems without compromising vehicle owner privacy:

1. **Anonymous Wrong Parking Resolution**: Enables bystanders or neighbors to call a vehicle owner anonymously to request moving a vehicle, without printing the owner's phone number on the windshield.
2. **Sub-2-Second Emergency SOS Dispatch**: In the event of a highway collision or medical emergency, any bystander scanning the windshield QR code triggers an instant dispatch of live GPS coordinates and vehicle information to the owner's designated family contacts via **WhatsApp** and **SMS**, while surfacing critical emergency medical details (e.g., blood group, allergies) to paramedics.

---

## 🔒 1. Data Collection, Storage & Privacy Architecture

### What Data We Collect
To provide seamless safety without intrusive tracking, VaahanSafe enforces a **minimal data collection policy** compliant with India’s **Digital Personal Data Protection (DPDP) Act, 2023**:

| Data Category | Specific Data Points | Purpose | Storage & Protection |
| :--- | :--- | :--- | :--- |
| **Owner Profile** | Full Name, Verified Phone Number, Email | Account management, authentication & alert routing | Stored in PostgreSQL (`vaahansafe.owners`). Phone numbers encrypted at rest via `pgcrypto`. |
| **Vehicle Profile** | License Plate Number, Vehicle Type (Car, Bike, Fleet), Make/Model, Assigned QR Code Serial Number | Linking physical windshield QR sticker to account | Stored in `vaahansafe.vehicles`. QR serials are non-predictable UUIDs. |
| **Emergency Contacts** | Up to 3 Contact Names, Mobile Numbers, Relationship (e.g., Spouse, Parent) | Recipient list for instant SOS WhatsApp/SMS alerts | Stored in `vaahansafe.emergency_contacts`. |
| **Medical Profile (Optional)** | Blood Group, Chronic Conditions, Drug Allergies, Organ Donor Status, Emergency Notes | Displayed exclusively on emergency scans during the "Golden Hour" | Stored in `vaahansafe.medical_profiles`. Owner toggles visibility on/off. |
| **Scan Telemetry** | Scan Timestamp, Geolocation (Lat/Lng), IP Address, Browser User-Agent, Snap Verification Image | Audit logging, rate limiting, anti-spam validation, emergency location dispatch | Stored in `vaahansafe.scans`. Retention policy automatically purges after audit cycle. |

### Where Data is Saved & How it is Secured
* **Primary Database**: PostgreSQL 15+ hosted on secure infrastructure using schema segregation (`vaahansafe` schema for application state, `audit` schema for security logs).
* **Field Encryption**: Sensitive fields (phone numbers, emergency notes) are encrypted using PostgreSQL `pgcrypto` AES encryption.
* **Privacy by Design**: Phone numbers are **NEVER** displayed in clear text on the windshield tag, on the scan webpage, or to bystanders placing calls.

---

## 🚗 2. Vehicle Registration & Onboarding Flow

```
[ Step 1: Purchase / Obtain Tag ] ──► [ Step 2: Register Account ] ──► [ Step 3: Pair QR & Vehicle ]
                                                                                   │
[ Live & Protection Active ] ◄── [ Step 5: Activate Privacy Toggles ] ◄── [ Step 4: Add Contacts ]
```

1. **Tag Acquisition**: The vehicle owner receives a physical, weatherproof, high-contrast retroreflective VaahanSafe QR sticker.
2. **Account Registration**: The owner scans the QR tag or enters `vaahansafe.com`, verifies their mobile number via OTP.
3. **Vehicle Binding**: The owner enters vehicle details (License Plate: e.g., `DL 01 AB 1234`, Make/Model) to pair with the QR serial UUID.
4. **Emergency Contact Setup**: Owner adds primary and secondary emergency contact numbers.
5. **Medical Profile & Privacy Toggles**: Owner configures optional medical information and toggles which details should be visible during emergency scans.

---

## 📱 3. How the Windshield QR System Works (Step-by-Step Deep Dive)

### Step A: The Scan (Zero App Download Required)
* When a bystander or paramedic scans the windshield QR tag with any standard smartphone camera (iOS or Android), it opens a secure lightweight web page (`https://vaahansafe.com/scan/{qr_id}`).
* **No app installation or user registration is required for the bystander**.

### Step B: Anti-Spam & Fraud Prevention Filter
Before any call bridge or emergency alert is initiated:
* **Rate Limiting**: The backend limits scans per vehicle (e.g., maximum 2 scans per hour per IP/device) to prevent nuisance fatigue or prank abuse.
* **Camera-Snap Verification**: Requires a quick 1-tap confirmation or camera snap to verify a genuine physical vehicle interaction.

### Step C: Intent Selection & Dual Dispatch Engine

When the scan page loads, the bystander is presented with two clear action options:

```
                          ┌──────────────────────────┐
                          │ Bystander Scans QR Code  │
                          └────────────┬─────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [ Option 1: Wrong Parking ]   [ Option 2: Emergency / SOS ]
                        │                             │
                        ▼                             ▼
               Exotel Call Bridge             AiSensy WhatsApp API
                        │                             │
              • Virtual Anonymous Call        • Live GPS Maps Link
              • Real phone numbers hidden     • Vehicle Details
              • No caller privacy breach      • Multi-Contact SOS Dispatch
                                              • Emergency Medical Card View
```

#### Option 1: Wrong Parking (Anonymous Call Masking)
* **Powered by**: **Exotel Telephony API**
* **How it works**:
  1. Bystander taps **"Call Vehicle Owner"**.
  2. The system initiates an Exotel Virtual Number Bridge.
  3. Exotel dials the bystander and bridges the connection to the owner.
  4. **Privacy Guarantee**: Neither the bystander nor the vehicle owner sees each other’s real mobile phone number. All calls display a neutral Exotel virtual number.

#### Option 2: Emergency / Collision SOS Alert
* **Powered by**: **AiSensy WhatsApp Business API & SMS Gateway**
* **How it works**:
  1. Bystander or paramedic taps **"Report Emergency / Crash"**.
  2. The browser captures the current GPS coordinates (Latitude / Longitude).
  3. The backend dispatches a high-priority **WhatsApp message** & **SMS** simultaneously to **all emergency contacts**:
     > *"🚨 VAAHANSAFE EMERGENCY ALERT: Vehicle [DL 01 AB 1234] was involved in an emergency scan. Live Location: https://maps.google.com/?q=28.6139,77.2090. Please reach out immediately."*
  4. **Medical Card Surface**: The scan page displays the owner's emergency blood group, allergies, and emergency instructions to assist first responders during the "Golden Hour".

---

## ⚡ 4. Technical Integration & Third-Party Infrastructure

| Service | Provider | Function |
| :--- | :--- | :--- |
| **Telephony Bridge** | **Exotel API** | Virtual number masking for anonymous 2-way voice calls between bystanders and vehicle owners. |
| **WhatsApp Dispatch** | **AiSensy API** | High-deliverability WhatsApp Business API template messages containing live Google Maps links and vehicle alerts. |
| **SMS Backup Gateway** | **Twilio / Gupshup** | Fallback SMS delivery for emergency notifications when WhatsApp data is unavailable. |
| **Database** | **PostgreSQL 15+** | Relational store with `pgcrypto` encryption for user privacy and audit trail logging. |
| **Frontend Framework** | **React 19 + Vite** | Ultra-fast, lightweight dynamic scan page optimized for instant mobile web loading. |

---

## 💬 5. Quick Client Presentation & Q&A Pitch Points

### Key Client Pitch Highlights:
1. **"100% Privacy-Preserving"**: Vehicle owners never have to leave handwritten phone numbers on dashboards or windshields.
2. **"Instant Golden-Hour Response"**: Sub-2-second alert dispatch ensures emergency contacts get real-time GPS locations when seconds count.
3. **"Zero Friction for Bystanders"**: No app downloads, no registration required for anyone scanning the QR code.
4. **"Built-in Anti-Spam Engine"**: Smart rate limiting and verification stop pranksters from abusing vehicle owners.
5. **"Fully Compliant"**: Designed in strict alignment with India's DPDP Act 2023 data privacy regulations.

---

### Frequently Asked Questions (Client Q&A):

* **Q: Will my personal phone number be displayed on the website or QR tag?**  
  * **A**: Absolutely not. The physical tag only contains an encrypted unique QR code. When scanned, bystanders call via Exotel's masked relay, so your real phone number is 100% hidden.

* **Q: What happens if someone scans the QR code repeatedly to annoy me?**  
  * **A**: Our intelligent anti-spam engine enforces strict rate limits (e.g., maximum 2 scans per hour per device) and verification steps to block prank calls and alert fatigue.

* **Q: What if the bystander doesn't have the VaahanSafe app installed?**  
  * **A**: No app is needed! The QR code opens instantly in standard mobile browsers (Chrome, Safari, Firefox).

* **Q: Who receives emergency alerts when a crash or emergency scan occurs?**  
  * **A**: All designated family/emergency contacts added during vehicle registration receive instant WhatsApp and SMS alerts containing the vehicle license plate number and live Google Maps location coordinates.
