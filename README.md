# 🚗 VaahanSafe Frontend

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Sentry](https://img.shields.io/badge/Sentry-Monitored-362D59?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io/)

> **VaahanSafe** is a next-generation, QR-code powered vehicle safety, emergency response, and parking communication platform. The frontend application provides a fast, mobile-optimized experience for public QR scanning, vehicle owner management, emergency contact routing, and system administration.

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
  - [1. Street-Facing Public QR Scanner (`/scan/:qrId`)](#1-street-facing-public-qr-scanner-scanqrid)
  - [2. Vehicle Owner Dashboard](#2-vehicle-owner-dashboard)
  - [3. Admin Control Suite](#3-admin-control-suite)
  - [4. Marketing & Public Pages](#4-marketing--public-pages)
- [🛠️ Tech Stack & Dependencies](#%EF%B8%8F-tech-stack--dependencies)
- [📂 Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [⚡ Quickstart & Local Setup](#-quickstart--local-setup)
- [🔐 Environment Variables](#-environment-variables)
- [📜 Available Scripts](#-available-scripts)
- [🌐 Internationalization (i18n)](#-internationalization-i18n)
- [🔒 Security & Privacy Features](#-security--privacy-features)
- [📄 License & Maintenance](#-license--maintenance)

---

## ✨ Features Overview

### 1. Street-Facing Public QR Scanner (`/scan/:qrId`)
*Zero-friction, mobile-first interface designed for instant response on the road.*

- **Emergency Alert Dispatch**: Direct emergency contact trigger via SMS, WhatsApp, and automated voice calls without revealing the owner's personal phone number.
- **Wrong Parking Reporter**: Structured reporting wizard for blocked driveways or improper parking with photo attachment capabilities.
- **Emergency Medical ICE Gate**: Privacy-preserving access to blood group, critical allergies, and emergency medical profiles with audit verification.
- **Offline & Low-Network Resilience**: PWA-ready design with offline fallback indicators and optimistic UI state handling.

---

### 2. Vehicle Owner Dashboard
*Comprehensive self-service portal for managing registered vehicles and safety settings.*

- **Vehicle Management**: Register vehicles, generate high-res QR codes, and customize display cards.
- **Emergency Contact Routing**: Set up primary, secondary, and ICE emergency contacts.
- **Scan & Alert Audit Logs**: Detailed real-time log of every QR scan, location pin, and alert status dispatch.
- **Subscription & Billing**: Plan tiers, payment gateway checkout integration, and invoice history.
- **Security & Privacy Controls**: Granular toggles for phone privacy, medical card visibility, and session management.

---

### 3. Admin Control Suite
*Centralized management console for platform operators and support teams.*

- **Real-Time Analytics**: Monitor scan throughput, alert success rates, and active vehicle metrics via interactive Recharts dashboards.
- **Abuse & Flagged Scans Queue**: Inspect flagged scans, review user report tickets, and apply temporary or permanent blocks.
- **Alert Failure & Dead Letter Queue (DLQ)**: Track SMS/WhatsApp delivery failures (Exotel, AiSensy APIs) with retry triggers.
- **Audit Logging & User Management**: Full audit trail of administrative actions, user search, and vehicle verification statuses.

---

### 4. Marketing & Public Pages
*SEO-optimized landing pages built for performance and conversion.*

- High-impact Hero section with smooth Framer Motion micro-animations.
- Interactive Pricing Matrix and FAQ accordion.
- Multilingual support (English & Hindi) powered by `i18next`.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology | Usage / Purpose |
| :--- | :--- | :--- |
| **Core Framework** | **React 19 + TypeScript 5** | UI component architecture and type safety |
| **Build System** | **Vite 8** | Ultra-fast local HMR and production bundle optimization |
| **Styling** | **Tailwind CSS v4 + @shadcn/ui** | Modern design system, component primitives, dark/light theme support |
| **Animations** | **Framer Motion** | Fluid page transitions and micro-interactions |
| **State Management** | **Zustand + TanStack Query v5** | Global application state and async API query caching |
| **Routing** | **React Router v7** | Modular client-side routing with specialized auth guards |
| **Forms & Validation** | **React Hook Form + Zod** | Schema-driven form handling and validation |
| **Localization** | **i18next + react-i18next** | Multi-language translation (`en`, `hi`) |
| **Security & Analytics**| **Cloudflare Turnstile + Sentry** | Anti-bot verification and real-time error tracking |

---

## 📂 Project Architecture & Directory Structure

The frontend follows a **feature-driven layout** paired with modular routing and decoupled business logic layers.

```text
frontend/
├── public/                     # Static assets (favicons, manifest, og-image)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui primitives (Button, Dialog, Input, etc.)
│   │   ├── layout/             # Navbar, Sidebar, Footer, MobileNav, CommandPalette
│   │   ├── shared/             # Global providers, Toast, Modals, Loaders
│   │   └── svg/                # Vector illustrations & status graphics
│   ├── features/               # Domain-driven feature modules (Auth, Vehicles, Scans)
│   │   ├── auth/               # Auth APIs, schemas, and state hooks
│   │   ├── vehicles/           # Vehicle hooks, API client, Zod schemas
│   │   └── scans/              # QR scan logic & alert triggers
│   ├── hooks/                  # Custom React hooks (useAuth, useGeolocation, useCamera)
│   ├── i18n/                   # Translation files (en.json, hi.json)
│   ├── layouts/                # Portal layouts (Marketing, Auth, Dashboard, Admin, Scan)
│   ├── lib/                    # Core utilities, API clients, security, & analytics
│   │   ├── http/               # Axios instance & interceptors
│   │   ├── security/           # Token management, CSRF, input sanitization
│   │   └── monitoring/         # Sentry tracking & analytics helpers
│   ├── pages/                  # Page view components grouped by portal
│   │   ├── marketing/          # LandingPage, PricingPage, FaqPage
│   │   ├── auth/               # LoginPage, OtpVerifyPage, OnboardingPage
│   │   ├── dashboard/          # VehiclesListPage, VehicleDetailPage, BillingPage
│   │   ├── scan/               # ScanLandingPage, EmergencyReportPage, MedicalInfoViewPage
│   │   └── admin/              # AdminDashboardPage, AdminAuditLogPage, AdminDeadLetterPage
│   ├── router/                 # React Router v7 configuration & Auth Guards
│   ├── store/                  # Zustand stores (authStore, uiStore, notificationStore)
│   ├── styles/                 # Global CSS & typography definitions
│   └── types/                  # TypeScript interface declarations
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm`/`yarn`)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/VaahanSafe/VaahanSafe.git
   cd VaahanSafe/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `frontend` root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will start locally at `http://localhost:5173`.

---

## 🔐 Environment Variables

The application relies on the following environment configuration variables (`.env`):

| Variable Name | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Backend REST API base endpoint | `https://api.vaahansafe.com/api/v1` |
| `VITE_TURNSTILE_SITE_KEY` | Optional | Cloudflare Turnstile public key for bot defense | `0x4AAAAAA...` |
| `VITE_SENTRY_DSN` | Optional | Sentry DSN for client-side crash monitoring | `https://xyz@sentry.io/12345` |
| `VITE_ENABLE_ANALYTICS` | Optional | Toggle client analytics telemetry (`true`/`false`) | `true` |

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles production assets into `/dist`. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm run lint` | Runs ESLint across all `.ts` and `.tsx` source files. |

---

## 🌐 Internationalization (i18n)

VaahanSafe frontend features native multi-language support:
- **English (`en`)**: Default primary language.
- **Hindi (`hi`)**: Full localized strings across public scan pages and owner portals.

To add new translation keys:
1. Update `src/i18n/en.json` with the new key-value pairs.
2. Add corresponding translations to `src/i18n/hi.json`.
3. Consume in components via `useTranslation()`:
   ```tsx
   const { t } = useTranslation();
   return <h1>{t('scan.emergency_title')}</h1>;
   ```

---

## 🔒 Security & Privacy Features

- **Privacy-First Emergency Contact**: QR scanners communicate with owners via reverse-proxy API gateways. Real phone numbers are never exposed in client DOM or network payloads.
- **Gated Medical Records**: Emergency medical profiles require user confirmation and captcha validation before displaying sensitive information.
- **Client-Side Security Interceptors**: Axios interceptors automatically attach CSRF tokens and handle JWT auto-refresh and secure logout on authorization failures.
- **Input Sanitization & Rate-Limiting**: All public input forms are validated via Zod schemas and rate-limited to prevent automated spam alerts.

---

## 📄 License & Maintenance

Distributed under the **MIT License**. See `LICENSE` for more information.

Maintained with ❤️ by the **VaahanSafe Engineering Team**.
