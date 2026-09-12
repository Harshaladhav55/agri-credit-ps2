import crypto from 'crypto';

const activeConsents = new Map();

export function createConsentToken(farmerId, recipient, permissions = [], validHours = 72) {
  const tokenId = 'TOKEN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + validHours * 3600 * 1000).toISOString();

  const consentRecord = {
    tokenId,
    farmerId,
    recipient,
    permissions: permissions.length ? permissions : ['CreditScoreView', 'YieldEstimation', 'PMKisanProof'],
    status: 'ACTIVE',
    createdAt,
    expiresAt,
    zkProofHash: '0xzk' + crypto.randomBytes(16).toString('hex')
  };

  activeConsents.set(tokenId, consentRecord);
  return consentRecord;
}

export function revokeConsentToken(tokenId) {
  if (activeConsents.has(tokenId)) {
    const record = activeConsents.get(tokenId);
    record.status = 'REVOKED';
    activeConsents.set(tokenId, record);
    return true;
  }
  return false;
}

export function listFarmerConsents(farmerId) {
  const result = [];
  for (const [id, record] of activeConsents.entries()) {
    if (record.farmerId === farmerId) {
      result.push(record);
    }
  }
  return result;
}
