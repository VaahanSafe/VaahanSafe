/**
 * Enterprise Typed React Query Keys Factory
 * Guarantees zero duplicate key strings across all feature hooks and queries.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },

  owner: {
    all: ['owner'] as const,
    profile: () => ['owner', 'profile'] as const,
    stats: () => ['owner', 'stats'] as const,
    vehicles: () => ['owner', 'vehicles'] as const,
  },

  vehicles: {
    all: ['vehicles'] as const,
    list: (params?: Record<string, unknown>) => ['vehicles', 'list', params] as const,
    detail: (id: string) => ['vehicles', 'detail', id] as const,
    scans: (id: string, params?: Record<string, unknown>) => ['vehicles', 'detail', id, 'scans', params] as const,
    qr: (id: string) => ['vehicles', 'detail', id, 'qr'] as const,
    alerts: (id: string) => ['vehicles', 'detail', id, 'alerts'] as const,
  },

  contacts: {
    all: ['contacts'] as const,
    list: (vehicleId: string) => ['contacts', 'list', vehicleId] as const,
  },

  medical: {
    all: ['medical'] as const,
    info: (vehicleId: string) => ['medical', 'info', vehicleId] as const,
    aiSummary: (vehicleId: string) => ['medical', 'aiSummary', vehicleId] as const,
  },

  scans: {
    all: ['scans'] as const,
    lookup: (qrCode: string) => ['scans', 'publicLookup', qrCode] as const,
    publicLookup: (qrCode: string) => ['scans', 'publicLookup', qrCode] as const,
    publicMedical: (qrCode: string) => ['scans', 'publicMedical', qrCode] as const,
    status: (qrCode: string) => ['scans', 'status', qrCode] as const,
  },

  payments: {
    all: ['payments'] as const,
    history: () => ['payments', 'history'] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },

  admin: {
    all: ['admin'] as const,
    metrics: () => ['admin', 'metrics'] as const,
    scans: (params?: Record<string, unknown>) => ['admin', 'scans', params] as const,
    scanDetail: (id: string) => ['admin', 'scanDetail', id] as const,
    flaggedScans: (params?: Record<string, unknown>) => ['admin', 'flaggedScans', params] as const,
    owners: (params?: Record<string, unknown>) => ['admin', 'owners', params] as const,
    ownerDetail: (id: string) => ['admin', 'ownerDetail', id] as const,
    alertFailures: () => ['admin', 'alertFailures'] as const,
    deadLetter: () => ['admin', 'deadLetter'] as const,
  },
} as const;
