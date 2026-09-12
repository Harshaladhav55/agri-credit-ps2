import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('server/data');
const auditLogFile = path.join(dataDir, 'audit_logs.json');

const loadAuditLogs = () => {
  try {
    if (!fs.existsSync(auditLogFile)) {
      return [];
    }
    const raw = fs.readFileSync(auditLogFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading audit_logs.json:', err);
    return [];
  }
};

const saveAuditLogs = (logs) => {
  try {
    fs.writeFileSync(auditLogFile, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving audit_logs.json:', err);
  }
};

/**
 * Log a new chronological audit event
 */
export function logAuditEvent({ entityType, entityId, eventType, previousValue = null, newValue = null, details = '', performedBy = 'System' }) {
  const logs = loadAuditLogs();

  const newLog = {
    logId: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    entityType, // 'FARMER' or 'GROUP'
    entityId,   // farmerId or groupId
    eventType,  // e.g., 'PROFILE_UPDATE', 'LOAN_APPLICATION', 'DEFAULT_TRIGGERED'
    previousValue: previousValue !== null ? String(previousValue) : null,
    newValue: newValue !== null ? String(newValue) : null,
    details,
    performedBy,
    timestamp: new Date().toISOString()
  };

  logs.push(newLog);
  saveAuditLogs(logs);
  return newLog;
}

/**
 * Fetch full chronological audit trail for a farmer
 */
export function getFarmerAuditTrail(farmerId) {
  const logs = loadAuditLogs();
  return logs
    .filter((l) => l.entityType === 'FARMER' && l.entityId === farmerId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Fetch full chronological audit trail for a group
 */
export function getGroupAuditTrail(groupId) {
  const logs = loadAuditLogs();
  return logs
    .filter((l) => l.entityType === 'GROUP' && l.entityId === groupId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Fetch all audit logs
 */
export function getAllAuditLogs() {
  const logs = loadAuditLogs();
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
