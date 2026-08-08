/**
 * Centralized API Endpoint Registry
 * Single Source of Truth for all Backend API Endpoints (FastAPI /api/v1)
 */
export const ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    REFRESH: '/auth/token/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  auth: {
    requestOtp: '/auth/otp/request',
    verifyOtp: '/auth/otp/verify',
    refresh: '/auth/token/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },

  // Owner Profile & Account
  OWNERS: {
    PROFILE: '/owners/profile',
    UPDATE_PROFILE: '/owners/profile',
    DELETE_REQUEST: '/owners/delete-request',
    DASHBOARD_STATS: '/owners/dashboard-stats',
    VEHICLES: '/owners/vehicles',
    LOCATION_SUGGEST: '/owners/location/suggest',
    LOCATION_REVERSE: '/owners/location/reverse-geocode',
    LOCATION_IP_GEOCODE: '/owners/location/ip-geocode',
    SESSIONS: '/owners/sessions',
    TERMINATE_SESSIONS: '/owners/sessions/terminate',
    NOTIFICATIONS: '/owners/notifications',
    NOTIFICATIONS_READ: (id: string) => `/owners/notifications/${id}/read`,
    NOTIFICATIONS_MARK_ALL_READ: '/owners/notifications/mark-all-read',
    NOTIFICATIONS_DELETE: (id: string) => `/owners/notifications/${id}`,
    NOTIFICATIONS_CLEAR_ALL: '/owners/notifications/clear-all',
  },
  owner: {
    profile: '/owners/profile',
    deleteRequest: '/owners/delete-request',
    dashboardStats: '/owners/dashboard-stats',
    vehicles: '/owners/vehicles',
    locationSuggest: '/owners/location/suggest',
    locationReverse: '/owners/location/reverse-geocode',
    locationIpGeocode: '/owners/location/ip-geocode',
    sessions: '/owners/sessions',
    terminateSessions: '/owners/sessions/terminate',
    notifications: '/owners/notifications',
    notificationsRead: (id: string) => `/owners/notifications/${id}/read`,
    notificationsMarkAllRead: '/owners/notifications/mark-all-read',
    notificationsDelete: (id: string) => `/owners/notifications/${id}`,
    notificationsClearAll: '/owners/notifications/clear-all',
  },

  // Vehicle Management
  VEHICLES: {
    BASE: '/vehicles',
    REGISTER: '/vehicles/register',
    DETAIL: (id: string) => `/vehicles/${id}`,
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
    SCANS: (id: string) => `/vehicles/${id}/scan-history`,
    QR: (id: string) => `/vehicles/${id}/qr-image`,
    CERTIFICATE: (id: string) => `/vehicles/${id}/certificate`,
    STICKER: (id: string) => `/vehicles/${id}/sticker`,
    RENEW: (id: string) => `/vehicles/${id}/renew`,
    ALERT_HISTORY: (id: string) => `/vehicles/${id}/alert-history`,
  },
  vehicles: {
    list: '/vehicles',
    register: '/vehicles/register',
    detail: (id: string) => `/vehicles/${id}`,
    update: (id: string) => `/vehicles/${id}`,
    delete: (id: string) => `/vehicles/${id}`,
    scans: (id: string) => `/vehicles/${id}/scan-history`,
    qrImage: (id: string) => `/vehicles/${id}/qr-image`,
    certificate: (id: string) => `/vehicles/${id}/certificate`,
    sticker: (id: string) => `/vehicles/${id}/sticker`,
    renew: (id: string) => `/vehicles/${id}/renew`,
    alertHistory: (id: string) => `/vehicles/${id}/alert-history`,
  },

  // Vehicle Emergency Contacts
  CONTACTS: {
    BASE: (vehicleId: string) => `/vehicles/${vehicleId}/contacts`,
    DETAIL: (vehicleId: string, contactId: string) => `/vehicles/${vehicleId}/contacts/${contactId}`,
    REORDER: (vehicleId: string) => `/vehicles/${vehicleId}/contacts/reorder`,
  },
  contacts: {
    list: (vehicleId: string) => `/vehicles/${vehicleId}/contacts`,
    create: (vehicleId: string) => `/vehicles/${vehicleId}/contacts`,
    update: (vehicleId: string, contactId: string) => `/vehicles/${vehicleId}/contacts/${contactId}`,
    delete: (vehicleId: string, contactId: string) => `/vehicles/${vehicleId}/contacts/${contactId}`,
    reorder: (vehicleId: string) => `/vehicles/${vehicleId}/contacts/reorder`,
  },

  // Medical Card Parameters
  MEDICAL: {
    BASE: (vehicleId: string) => `/vehicles/${vehicleId}/medical`,
    AI_SUMMARY: (vehicleId: string) => `/vehicles/${vehicleId}/medical/ai-summary`,
  },
  medical: {
    get: (vehicleId: string) => `/vehicles/${vehicleId}/medical`,
    save: (vehicleId: string) => `/vehicles/${vehicleId}/medical`,
    aiSummary: (vehicleId: string) => `/vehicles/${vehicleId}/medical/ai-summary`,
  },

  // Public Bystander & SOS Scans
  SCANS: {
    LOOKUP: (qrCode: string) => `/scan/${qrCode}/lookup`,
    EMERGENCY: (qrCode: string) => `/scan/${qrCode}/emergency`,
    PARKING: (qrCode: string) => `/scan/${qrCode}/wrong-parking`,
    PUBLIC_MEDICAL: (qrCode: string) => `/scan/${qrCode}/medical`,
    STATUS: (qrCode: string) => `/scan/${qrCode}/status`,
  },
  scans: {
    lookup: (qrCode: string) => `/scan/${qrCode}/lookup`,
    emergency: (qrCode: string) => `/scan/${qrCode}/emergency`,
    parking: (qrCode: string) => `/scan/${qrCode}/wrong-parking`,
    medical: (qrCode: string) => `/scan/${qrCode}/medical`,
    status: (qrCode: string) => `/scan/${qrCode}/status`,
  },

  // Payment Transactions & Billing
  PAYMENTS: {
    CREATE_ORDER: '/payments/order/create',
    VERIFY: '/payments/verify',
    HISTORY: '/payments/history',
    REFUND: (id: string) => `/payments/${id}/refund`,
    DETAIL: (id: string) => `/payments/${id}`,
    INVOICE: (id: string) => `/payments/${id}/invoice`,
  },
  payments: {
    createOrder: '/payments/order/create',
    verify: '/payments/verify',
    history: '/payments/history',
    refund: (id: string) => `/payments/${id}/refund`,
    detail: (id: string) => `/payments/${id}`,
  },

  // Administrative Control Operations
  ADMIN: {
    SCANS: '/admin/scans',
    FLAGGED_SCANS: '/admin/scans/flagged',
    SCAN_DETAIL: (id: string) => `/admin/scans/${id}`,
    OWNERS: '/admin/owners',
    OWNER_DETAIL: (id: string) => `/admin/owners/${id}`,
    VEHICLE_OVERRIDE: (id: string) => `/admin/vehicles/${id}/status`,
    RENEWALS_PUSH: '/admin/renewals/push',
    METRICS: '/admin/metrics',
    ALERT_FAILURES: '/admin/alert-failures',
    ABUSE_TRIGGER: '/admin/abuse-scan/trigger',
    DEAD_LETTER: '/admin/dead-letter',
    DEAD_LETTER_RETRY: (id: string) => `/admin/dead-letter/${id}/retry`,
  },
  admin: {
    scans: '/admin/scans',
    flaggedScans: '/admin/scans/flagged',
    scanDetail: (id: string) => `/admin/scans/${id}`,
    owners: '/admin/owners',
    ownerDetail: (id: string) => `/admin/owners/${id}`,
    vehicleOverride: (id: string) => `/admin/vehicles/${id}/status`,
    pushRenewals: '/admin/renewals/push',
    metrics: '/admin/metrics',
    alertFailures: '/admin/alert-failures',
    triggerAbuseScan: '/admin/abuse-scan/trigger',
    deadLetter: '/admin/dead-letter',
    retryDeadLetter: (id: string) => `/admin/dead-letter/${id}/retry`,
  },
} as const;
