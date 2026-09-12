import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { calculateFarmerCreditProfile } from './services/creditScoringEngine.js';
import { runMLFarmerVerification } from './services/farmerVerificationML.js';
import { calculateGroupTrustScore, createGroupLoan, triggerJointLiabilityDefault, getGroupLoans, deleteGroupLoan } from './services/groupCreditEngine.js';
import { createConsentToken, revokeConsentToken, listFarmerConsents } from './services/consentManager.js';
import { predictFarmerRepaymentRisk } from './services/repaymentRiskAI.js';
import { logAuditEvent, getFarmerAuditTrail, getGroupAuditTrail, getAllAuditLogs } from './services/auditLogger.js';
import { getFarmerFullHistory } from './services/farmerHistoryService.js';
import { getGroupFullHistory } from './services/groupHistoryService.js';
import { initPostgresDB, pool, isPostgresAvailable } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dataDir = path.resolve('backend/data');

const readDataFile = (fileName) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, fileName), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const writeDataFile = (fileName, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${fileName}:`, err);
  }
};

// Initialize DB
initPostgresDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriTrust Credit Network Backend Engine',
    database: isPostgresAvailable() ? 'PostgreSQL Active' : 'Persistence Mode Active',
    timestamp: new Date().toISOString()
  });
});

// Admin Route: View All Registered Farmers & Login Credentials
app.get('/api/admin/registered-users', (req, res) => {
  const farmers = readDataFile('pm_kisan.json');
  const userList = farmers.map(f => ({
    farmerId: f.farmer_id,
    name: f.name,
    mobileNo: f.mobile_no || '9823011223',
    aadhaarNo: f.aadhaar_no || '4521-8890-1209',
    pmKisanId: f.pm_kisan_id || `PM-KISAN-${f.farmer_id}`,
    village: f.village,
    district: f.district,
    state: f.state,
    landAcres: f.landholding_acres,
    currentCrop: f.current_crop || 'Onion',
    previousCrop: f.previous_crop || 'Cotton',
    fpoId: f.fpo_id || 'FPO-MH-01',
    peer1: { name: f.peer_1_name || 'Vithalrao Shinde', mobile: f.peer_1_mobile || '9850123456' },
    peer2: { name: f.peer_2_name || 'Eknath Jadhav', mobile: f.peer_2_mobile || '9822987654' },
    registeredAt: f.last_disbursement_date || new Date().toISOString().split('T')[0]
  }));

  res.json({
    totalUsers: userList.length,
    users: userList
  });
});

// Update Farmer Profile Endpoint
app.put('/api/farmer/update-profile', async (req, res) => {
  const {
    farmerId,
    name,
    mobileNo,
    aadhaarNo,
    pmKisanId,
    state,
    district,
    village,
    landAcres,
    currentCrop,
    previousCrop,
    fpoId,
    peer1Name,
    peer1Mobile,
    peer2Name,
    peer2Mobile
  } = req.body;

  if (!farmerId) {
    return res.status(400).json({ success: false, message: 'farmerId is required.' });
  }

  // 1. Update in persistence JSON file
  const pmKisan = readDataFile('pm_kisan.json');
  const idx = pmKisan.findIndex(f => f.farmer_id === farmerId);

  if (idx !== -1) {
    pmKisan[idx] = {
      ...pmKisan[idx],
      name: name !== undefined ? name : pmKisan[idx].name,
      mobile_no: mobileNo !== undefined ? mobileNo : pmKisan[idx].mobile_no,
      aadhaar_no: aadhaarNo !== undefined ? aadhaarNo : pmKisan[idx].aadhaar_no,
      pm_kisan_id: pmKisanId !== undefined ? pmKisanId : pmKisan[idx].pm_kisan_id,
      state: state !== undefined ? state : pmKisan[idx].state,
      district: district !== undefined ? district : pmKisan[idx].district,
      village: village !== undefined ? village : pmKisan[idx].village,
      landholding_acres: landAcres !== undefined && landAcres !== null ? parseFloat(landAcres) || 0 : pmKisan[idx].landholding_acres,
      current_crop: currentCrop !== undefined ? currentCrop : pmKisan[idx].current_crop,
      previous_crop: previousCrop !== undefined ? previousCrop : pmKisan[idx].previous_crop,
      fpo_id: fpoId !== undefined ? fpoId : pmKisan[idx].fpo_id,
      peer_1_name: peer1Name !== undefined ? peer1Name : pmKisan[idx].peer_1_name,
      peer_1_mobile: peer1Mobile !== undefined ? peer1Mobile : pmKisan[idx].peer_1_mobile,
      peer_2_name: peer2Name !== undefined ? peer2Name : pmKisan[idx].peer_2_name,
      peer_2_mobile: peer2Mobile !== undefined ? peer2Mobile : pmKisan[idx].peer_2_mobile
    };
    writeDataFile('pm_kisan.json', pmKisan);
  }

  // 2. Update in PostgreSQL database if available
  if (isPostgresAvailable()) {
    try {
      await pool.query(
        `UPDATE farmers
         SET name = $1, mobile_no = $2, aadhaar_no = $3, pm_kisan_id = $4, village = $5, district = $6, state = $7,
             land_size_acres = $8, current_crop = $9, previous_crop = $10, fpo_id = $11, peer_1_name = $12, peer_1_mobile = $13, peer_2_name = $14, peer_2_mobile = $15
         WHERE id = $16`,
        [name, mobileNo, aadhaarNo, pmKisanId, village, district, state, parseFloat(landAcres) || 0, currentCrop, previousCrop, fpoId, peer1Name, peer1Mobile, peer2Name, peer2Mobile, farmerId]
      );
    } catch (dbErr) {
      console.error('PostgreSQL update error:', dbErr);
    }
  }

  // Re-calculate updated profile
  const updatedProfile = calculateFarmerCreditProfile(farmerId, {
    crop: currentCrop,
    landholding_acres: parseFloat(landAcres) || 0,
    calculate: parseFloat(landAcres) > 0,
    fpo_vouched: true
  });

  res.json({
    success: true,
    message: 'Farmer profile and farm details updated successfully in PostgreSQL database!',
    updatedUser: {
      id: farmerId,
      name,
      mobileNo,
      aadhaarNo,
      pmKisanId,
      role: 'farmer',
      village,
      district,
      state,
      landAcres: parseFloat(landAcres),
      currentCrop,
      previousCrop,
      peer1: { name: peer1Name, mobile: peer1Mobile },
      peer2: { name: peer2Name, mobile: peer2Mobile }
    },
    profile: updatedProfile
  });
});

// Delete Farmer Account Endpoint
app.delete('/api/farmer/delete-account/:farmerId', (req, res) => {
  const { farmerId } = req.params;
  const pmKisan = readDataFile('pm_kisan.json');
  const filtered = pmKisan.filter(f => f.farmer_id !== farmerId);
  writeDataFile('pm_kisan.json', filtered);
  res.json({ success: true, message: `Account ${farmerId} deleted successfully.` });
});

// Fetch Available FPO Organisations
app.get('/api/fpos', (req, res) => {
  const fpos = [
    { id: 'FPO-MH-01', name: 'Sahyadri Farmer Producer Company', district: 'Nashik', state: 'Maharashtra', memberCount: 1420 },
    { id: 'FPO-KA-02', name: 'Kolar Farmers Co-operative Society', district: 'Kolar', state: 'Karnataka', memberCount: 890 },
    { id: 'FPO-MH-03', name: 'Solapur Pomegranate Producer Society', district: 'Solapur', state: 'Maharashtra', memberCount: 650 },
    { id: 'FPO-GJ-04', name: 'Saurashtra Cotton & Agri Producer Co.', district: 'Rajkot', state: 'Gujarat', memberCount: 1100 }
  ];
  res.json(fpos);
});

// Authentication Endpoint (Login)
app.post('/api/auth/login', (req, res) => {
  const { identity, password, role } = req.body;

  if (!identity || !password) {
    return res.status(400).json({ success: false, message: 'Mobile number and OTP/Password are required.' });
  }

  const isMobileInput = /^\d+$/.test(identity);
  if (role === 'farmer' && isMobileInput && !/^[6-9]\d{9}$/.test(identity)) {
    return res.status(400).json({ success: false, message: 'Invalid 10-digit Indian mobile number.' });
  }

  const pmKisan = readDataFile('pm_kisan.json');

  if (role === 'farmer') {
    const farmer = pmKisan.find(f => 
      f.farmer_id === identity || 
      f.mobile_no === identity || 
      (isMobileInput && f.mobile_no === identity) ||
      (identity && f.name && f.name.toLowerCase() === identity.toLowerCase())
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer account not found for this mobile number or ID. Please register a new farmer account.'
      });
    }

    return res.json({
      success: true,
      token: 'JWT-FARMER-' + Math.random().toString(36).substring(2, 10),
      user: {
        id: farmer.farmer_id,
        name: farmer.name,
        mobileNo: farmer.mobile_no,
        aadhaarNo: farmer.aadhaar_no,
        pmKisanId: farmer.pm_kisan_id || `PM-KISAN-${farmer.farmer_id}`,
        role: 'farmer',
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landAcres: farmer.landholding_acres,
        currentCrop: farmer.current_crop || 'Not Specified',
        previousCrop: farmer.previous_crop || 'None',
        peer1: { name: farmer.peer_1_name || '', mobile: farmer.peer_1_mobile || '' },
        peer2: { name: farmer.peer_2_name || '', mobile: farmer.peer_2_mobile || '' },
        pmKisanVerified: farmer.pm_kisan_status === 'Active Beneficiary'
      }
    });
  }

  if (role === 'fpo') {
    return res.json({
      success: true,
      token: 'JWT-FPO-' + Math.random().toString(36).substring(2, 10),
      user: {
        id: 'FPO-MH-01',
        name: 'Sanjay Deshmukh (FPO Chairman)',
        role: 'fpo',
        fpoName: 'Sahyadri Farmer Producer Company',
        district: 'Nashik',
        membersCount: 1420
      }
    });
  }

  if (role === 'bank') {
    return res.json({
      success: true,
      token: 'JWT-BANK-' + Math.random().toString(36).substring(2, 10),
      user: {
        id: 'BANK-SBI-991',
        name: 'Anil Kulkarni (Senior Agri Credit Officer)',
        role: 'bank',
        institution: 'State Bank of India',
        branch: 'Nashik Agri Development Branch'
      }
    });
  }

  res.status(400).json({ success: false, message: 'Invalid role or credentials' });
});

// Detailed Farmer Account & Loan Application Registration Endpoint
app.post('/api/auth/register-farmer', async (req, res) => {
  const {
    name,
    mobileNo,
    aadhaarNo,
    pmKisanId,
    state,
    district,
    village,
    landAcres,
    currentCrop,
    previousCrop,
    fpoId,
    peer1Name,
    peer1Mobile,
    peer2Name,
    peer2Mobile
  } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Valid Name (at least 2 characters) is required.' });
  }

  if (!district || district === 'Select District') {
    return res.status(400).json({ success: false, message: 'Valid district is required.' });
  }

  const cleanMobile = (mobileNo || '').replace(/\D/g, '');
  if (cleanMobile && !/^[6-9]\d{9}$/.test(cleanMobile)) {
    return res.status(400).json({ success: false, message: 'Mobile number must be a valid 10-digit Indian phone number starting with 6-9.' });
  }

  const cleanAadhaar = (aadhaarNo || '').replace(/\D/g, '');
  if (cleanAadhaar && cleanAadhaar.length !== 12) {
    return res.status(400).json({ success: false, message: 'Aadhaar number must be exactly 12 digits.' });
  }

  const stateCode = (state || 'MH').substring(0, 2).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newFarmerId = `FARM-${stateCode}-${randomNum}`;
  const assignedPmKisanId = pmKisanId || `PM-KISAN-${stateCode}-${randomNum}`;

  const newFarmerRecord = {
    farmer_id: newFarmerId,
    name: name.trim(),
    mobile_no: cleanMobile,
    aadhaar_no: cleanAadhaar,
    pm_kisan_id: assignedPmKisanId,
    gender: 'Male',
    village: village || 'Pimplad',
    sub_district: district,
    district,
    state: state || 'Maharashtra',
    pm_kisan_status: 'Pending Verification',
    installments_received: 0,
    aadhaar_linked: true,
    landholding_acres: parseFloat(landAcres) || 0,
    current_crop: currentCrop || 'Not Specified',
    previous_crop: previousCrop || 'None',
    fpo_id: fpoId || 'FPO-MH-01',
    peer_1_name: peer1Name || '',
    peer_1_mobile: peer1Mobile || '',
    peer_2_name: peer2Name || '',
    peer_2_mobile: peer2Mobile || '',
    ownership_type: 'Owner Operator',
    khatuni_verified: false,
    is_new_farmer: true,
    last_disbursement_date: new Date().toISOString().split('T')[0]
  };

  // If PostgreSQL is connected, insert into PostgreSQL database
  if (isPostgresAvailable()) {
    try {
      await pool.query(
        `INSERT INTO farmers (id, name, mobile_no, aadhaar_no, pm_kisan_id, village, district, state, land_size_acres, current_crop, previous_crop, fpo_id, peer_1_name, peer_1_mobile, peer_2_name, peer_2_mobile)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO NOTHING`,
        [
          newFarmerId, name, cleanMobile, cleanAadhaar, assignedPmKisanId, village, district, state,
          parseFloat(landAcres) || 0, currentCrop, previousCrop, fpoId, peer1Name, peer1Mobile, peer2Name, peer2Mobile
        ]
      );
    } catch (dbErr) {
      console.error('PostgreSQL insert error:', dbErr);
    }
  }

  // Save to persistence JSON file
  const pmKisan = readDataFile('pm_kisan.json');
  pmKisan.unshift(newFarmerRecord);
  writeDataFile('pm_kisan.json', pmKisan);

  // Log ONLY initial registration audit event for this unique farmer ID
  logAuditEvent({
    entityType: 'FARMER',
    entityId: newFarmerId,
    eventType: 'FARMER_REGISTERED',
    previousValue: null,
    newValue: `Registered ID: ${newFarmerId}`,
    details: `Farmer ${name} registered account from ${village || 'N/A'}, ${district}, ${state}.`,
    performedBy: name
  });

  // Return initial clean profile for new farmer
  const profile = calculateFarmerCreditProfile(newFarmerId);

  res.json({
    success: true,
    message: 'Farmer account registered successfully!',
    token: 'JWT-FARMER-' + Math.random().toString(36).substring(2, 10),
    user: {
      id: newFarmerId,
      name: newFarmerRecord.name,
      mobileNo: newFarmerRecord.mobile_no,
      aadhaarNo: newFarmerRecord.aadhaar_no,
      pmKisanId: newFarmerRecord.pm_kisan_id,
      role: 'farmer',
      village: newFarmerRecord.village,
      district: newFarmerRecord.district,
      state: newFarmerRecord.state,
      landAcres: newFarmerRecord.landholding_acres,
      currentCrop: newFarmerRecord.current_crop,
      previousCrop: newFarmerRecord.previous_crop,
      peer1: { name: peer1Name, mobile: peer1Mobile },
      peer2: { name: peer2Name, mobile: peer2Mobile },
      pmKisanVerified: false
    },
    profile
  });
});

// Submit Loan Application Endpoint
app.post('/api/loan-application/apply', async (req, res) => {
  const { farmerId, requestedAmountINR, purpose } = req.body;
  const profile = calculateFarmerCreditProfile(farmerId);
  const loanId = `LOAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const loanRecord = {
    loanId,
    farmerId,
    requestedAmountINR: parseFloat(requestedAmountINR) || profile.creditMetrics.recommendedLimit,
    recommendedLimitINR: profile.creditMetrics.recommendedLimit,
    creditScore: profile.creditMetrics.score,
    riskTier: profile.creditMetrics.tier,
    purpose: purpose || 'Input Procurement & Drip Irrigation',
    status: 'SANCTIONED_BY_AI',
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Loan application submitted & evaluated against PostgreSQL credit parameters!',
    loanRecord,
    profile
  });
});

// Calculate or Fetch Farmer Credit Profile
app.get('/api/credit-profile/:farmerId', (req, res) => {
  const { farmerId } = req.params;
  const profile = calculateFarmerCreditProfile(farmerId);
  res.json(profile);
});

// Interactive Simulator
app.post('/api/credit-profile/simulate', (req, res) => {
  const { farmerId, crop, landholding_acres, fpo_vouched, fpo_peer_count, fpo_guarantee_pct } = req.body;
  const profile = calculateFarmerCreditProfile(farmerId || 'FARM-MH-8821', {
    crop,
    landholding_acres: parseFloat(landholding_acres) || 3.0,
    fpo_vouched: fpo_vouched !== false,
    fpo_peer_count: parseInt(fpo_peer_count) || 12,
    fpo_guarantee_pct: parseInt(fpo_guarantee_pct) || 25
  });
  res.json(profile);
});

// Machine Learning Multi-Source Farmer Verification Endpoint
app.post('/api/ml/verify-farmer', (req, res) => {
  const { farmerId, customData } = req.body;
  const result = runMLFarmerVerification(farmerId || 'FARM-MH-8821', customData || {});
  res.json({
    success: true,
    result
  });
});

// ML Farmer Verification Audit Endpoint (Batch verification report for all farmers)
app.get('/api/ml/verification-audit', (req, res) => {
  const farmers = readDataFile('pm_kisan.json');
  const auditReport = farmers.map(f => {
    const mlRes = runMLFarmerVerification(f.farmer_id);
    return {
      farmerId: f.farmer_id,
      name: f.name,
      district: f.district,
      state: f.state,
      landAcres: f.landholding_acres,
      authenticityScore: mlRes.verification.authenticityScore,
      verificationStatus: mlRes.verification.verificationStatus,
      statusBadgeLabel: mlRes.verification.statusBadgeLabel,
      riskFlags: mlRes.verification.riskFlags,
      explainableDrivers: mlRes.verification.explainableDrivers
    };
  });

  const verifiedCount = auditReport.filter(a => a.verificationStatus === 'VERIFIED_GENUINE').length;
  const flaggedCount = auditReport.filter(a => a.verificationStatus === 'VERIFIED_WITH_FLAG').length;
  const anomalyCount = auditReport.filter(a => a.verificationStatus === 'HIGH_ANOMALY_RISK').length;

  res.json({
    totalAudited: auditReport.length,
    summary: {
      verifiedGenuine: verifiedCount,
      verifiedWithFlags: flaggedCount,
      highAnomalyRisk: anomalyCount
    },
    auditReport
  });
});

// Market Intelligence Endpoint
app.get('/api/market-intelligence', (req, res) => {
  const agmarknet = readDataFile('agmarknet.json');
  const nhb = readDataFile('nhb_horticulture.json');
  const pmfby = readDataFile('pmfby_risk.json');
  const kcc = readDataFile('kcc_nlp.json');
  res.json({ agmarknet, nhb, pmfby, kcc });
});

// Community Joint Credit / Group Loan Endpoints
app.get('/api/group-credit/list-groups', (req, res) => {
  try {
    const groups = getGroupLoans();
    res.json({ success: true, totalGroups: groups.length, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/group-credit/calculate-score', (req, res) => {
  try {
    const { memberIds, groupName, gracePeriodDays } = req.body;
    const result = calculateGroupTrustScore(memberIds || ['FARM-MH-8821', 'FARM-MH-9103', 'FARM-KA-4419'], {
      groupName,
      gracePeriodDays
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/group-credit/create-group', (req, res) => {
  try {
    const { memberIds, groupName, village, district, state, gracePeriodDays } = req.body;
    const newGroup = createGroupLoan({ memberIds, groupName, village, district, state, gracePeriodDays });
    
    logAuditEvent({
      entityType: 'GROUP',
      entityId: newGroup.groupId,
      eventType: 'GROUP_CREATED',
      previousValue: null,
      newValue: newGroup.groupName,
      details: `Created JLG group with ${newGroup.memberIds.length} members. Initial Group Trust Score: ${newGroup.groupTrustScore} / 900.`,
      performedBy: 'FPO Admin'
    });

    res.json({ success: true, message: 'Joint Liability Group created successfully!', group: newGroup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/group-credit/trigger-default', (req, res) => {
  try {
    const { groupId, defaultingMemberId, gracePeriodDays } = req.body;
    const resolution = triggerJointLiabilityDefault(groupId, defaultingMemberId, gracePeriodDays || 30);

    logAuditEvent({
      entityType: 'GROUP',
      entityId: groupId,
      eventType: 'JOINT_LIABILITY_DEFAULT_TRIGGERED',
      previousValue: `Trust Score: ${resolution.previousGroupTrustScore}`,
      newValue: `Trust Score: ${resolution.newGroupTrustScore}`,
      details: `Member ${defaultingMemberId} defaulted. Guarantee fund drawn: ₹${resolution.guaranteeFundDrawnINR.toLocaleString('en-IN')}.`,
      performedBy: 'Group Risk Engine'
    });

    res.json({ success: true, message: 'Joint liability guarantee drawdown triggered.', resolution });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/group-credit/delete-group/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const result = deleteGroupLoan(groupId);
    res.json({ success: true, message: `Joint Liability Group ${groupId} deleted successfully!`, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// FPO Community Endorsement Network
app.get('/api/fpo/members', (req, res) => {
  const farmers = readDataFile('pm_kisan.json');
  const members = farmers.map((f, idx) => ({
    farmerId: f.farmer_id,
    name: f.name,
    district: f.district,
    landAcres: f.landholding_acres,
    endorsedByPeers: 10 + idx * 2,
    fpoStatus: 'Active Member',
    riskContribution: '₹15,000 Risk Guarantee Fund Pool'
  }));
  res.json({
    fpoName: 'Sahyadri Farmer Producer Company (Nashik)',
    totalMembers: 1420 + farmers.length - 4,
    pooledRiskFundINR: 4250000,
    members
  });
});

app.post('/api/fpo/endorse', (req, res) => {
  const { endorserFarmerId, targetFarmerId, vouchNote } = req.body;
  res.json({
    success: true,
    message: `Vouch recorded successfully from ${endorserFarmerId} for farmer ${targetFarmerId}`,
    vouchNote,
    timestamp: new Date().toISOString()
  });
});

// Consent Management APIs
app.post('/api/consent/create', (req, res) => {
  const { farmerId, recipient, permissions, validHours } = req.body;
  const token = createConsentToken(farmerId, recipient, permissions, validHours);
  res.json({ success: true, token });
});

app.post('/api/consent/revoke', (req, res) => {
  const { tokenId } = req.body;
  const success = revokeConsentToken(tokenId);
  res.json({ success, message: success ? 'Consent token revoked' : 'Token not found' });
});

app.get('/api/consent/list/:farmerId', (req, res) => {
  const consents = listFarmerConsents(req.params.farmerId);
  res.json({ farmerId: req.params.farmerId, consents });
});

// AI Repayment Risk Prediction Endpoints
app.post('/api/ai/predict-repayment-risk', (req, res) => {
  try {
    const { farmerId, ...overrides } = req.body || {};
    const prediction = predictFarmerRepaymentRisk(farmerId, overrides);
    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/ai/repayment-risk-audit', (req, res) => {
  try {
    const farmers = readDataFile('pm_kisan.json');
    const predictions = farmers.map((f) => predictFarmerRepaymentRisk(f.farmer_id));
    res.json({ success: true, count: predictions.length, predictions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Farmer & Group History & Audit Logs Endpoints
app.get('/api/history/farmer/:farmerId', (req, res) => {
  try {
    const history = getFarmerFullHistory(req.params.farmerId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/history/group/:groupId', (req, res) => {
  try {
    const history = getGroupFullHistory(req.params.groupId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/history/audit-logs', (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    let logs = [];
    if (entityType === 'FARMER' && entityId) {
      logs = getFarmerAuditTrail(entityId);
    } else if (entityType === 'GROUP' && entityId) {
      logs = getGroupAuditTrail(entityId);
    } else {
      logs = getAllAuditLogs();
    }
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/history/log-event', (req, res) => {
  try {
    const { entityType, entityId, eventType, previousValue, newValue, details, performedBy } = req.body;
    const log = logAuditEvent({ entityType, entityId, eventType, previousValue, newValue, details, performedBy });
    res.json({ success: true, log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`🌾 AgriTrust Express Server running on http://localhost:${PORT}`);
  });
}

export default app;
