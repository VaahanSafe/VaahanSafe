export interface AuditLogEntry {
  id: string;
  action: string;
  category: 'status_override' | 'medical_view' | 'dead_letter_retry' | 'general_audit';
  operatorEmail: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export const securityLogger = {
  log(action: string, category: AuditLogEntry['category'], details: string) {
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem('vs_admin_audit_logs') || '[]');
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      action,
      category,
      operatorEmail: 'operator.session@vaahansafe.com',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ipAddress: '192.168.1.100',
      details
    };
    logs.unshift(newEntry);
    localStorage.setItem('vs_admin_audit_logs', JSON.stringify(logs));
  },
  
  getLogs(): AuditLogEntry[] {
    const stored = localStorage.getItem('vs_admin_audit_logs');
    if (!stored) {
      const initialLogs: AuditLogEntry[] = [
        {
          id: "AUD-8821-412",
          action: "Initialize Admin Portal Session",
          category: "general_audit",
          operatorEmail: "operator.session@vaahansafe.com",
          timestamp: "2026-07-18 12:00:00",
          ipAddress: "192.168.1.100",
          details: "Operator primary workspace session active"
        },
        {
          id: "AUD-9912-892",
          action: "Compliance Review: Flagged anomalous scan #LOG-9005",
          category: "general_audit",
          operatorEmail: "operator.session@vaahansafe.com",
          timestamp: "2026-07-18 12:45:00",
          ipAddress: "192.168.1.100",
          details: "Geomismatch check: user flagged IP resolved as safe"
        }
      ];
      localStorage.setItem('vs_admin_audit_logs', JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(stored);
  }
};
