import fs from 'fs';
import path from 'path';
import { calculateFarmerCreditProfile } from './creditScoringEngine.js';
import { predictFarmerRepaymentRisk } from './repaymentRiskAI.js';
import { getFarmerAuditTrail } from './auditLogger.js';

const dataDir = path.resolve('backend/data');

const loadJSON = (fileName) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, fileName), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

/**
 * Aggregates complete historical profile & audit log for an individual farmer
 */
export function getFarmerFullHistory(farmerId) {
  const pmKisan = loadJSON('pm_kisan.json');
  const repaymentDataset = loadJSON('repayment_history_dataset.json');
  const groupLoans = loadJSON('group_loans.json');
  const pmfby = loadJSON('pmfby_risk.json');

  const targetId = farmerId || 'FARM-MH-8821';
  const existingFarmer = pmKisan.find((f) => f.farmer_id === targetId);

  const farmer = existingFarmer || {
    farmer_id: targetId,
    name: 'New Registered Farmer',
    district: 'Nashik',
    state: 'Maharashtra',
    village: 'Pimplad',
    landholding_acres: 0,
    current_crop: 'Not Specified',
    pm_kisan_status: 'Pending Verification',
    installments_received: 0,
    is_new_farmer: true
  };

  const isBrandNew = farmer.is_new_farmer || (farmer.installments_received === 0 && !existingFarmer);

  // 1. Credit Scores & Risk Predictions
  const creditProfile = calculateFarmerCreditProfile(targetId);
  const riskPrediction = predictFarmerRepaymentRisk(targetId);

  // 2. Audit Trail
  const auditLogs = getFarmerAuditTrail(targetId);

  // If brand new farmer with no previous loans/installments
  if (isBrandNew) {
    return {
      farmerId: targetId,
      personalDetails: {
        name: farmer.name,
        mobileNo: farmer.mobile_no || 'Not Specified',
        aadhaarNo: farmer.aadhaar_no || 'Not Specified',
        pmKisanId: farmer.pm_kisan_id || `PM-KISAN-${targetId}`,
        state: farmer.state || 'Maharashtra',
        district: farmer.district || 'Nashik',
        village: farmer.village || 'Pimplad',
        fpoName: 'Sahyadri Farmer Producer Company (Nashik)',
        peer1: { name: farmer.peer_1_name || 'Pending', mobile: farmer.peer_1_mobile || '' },
        peer2: { name: farmer.peer_2_name || 'Pending', mobile: farmer.peer_2_mobile || '' }
      },
      farmLandDetails: {
        landAcres: farmer.landholding_acres || 0,
        ownershipStatus: 'Owner Operator Title',
        soilHealthCard: 'Pending Test',
        irrigationSource: 'Rainfed / Drip'
      },
      verificationRecords: {
        authenticityScore: 50,
        pmKisanStatus: 'Pending Verification',
        installmentsReceived: 0,
        icarCanopyReflectance: 'Pending NDVI Scan',
        pmfbyInsurance: { enrolled: false, sumInsuredPerAcre: 0 }
      },
      creditScoreRecords: {
        currentScore: creditProfile.creditMetrics.score,
        tier: creditProfile.creditMetrics.tier,
        scoreHistory: []
      },
      cropHistory: farmer.current_crop ? [{ season: 'Kharif 2024', crop: farmer.current_crop, yieldMT: 0, grossRevenueINR: 0, status: 'Registered' }] : [],
      loanRecords: [], // EMPTY LOAN RECORDS FOR NEW USER
      repaymentHistory: {
        totalInstallmentsPaid: 0,
        missedInstallments: 0,
        pastDefaultsCount: 0,
        dscrRatio: 0
      },
      aiRiskAssessment: riskPrediction.prediction,
      associatedGroups: [], // EMPTY GROUPS FOR NEW USER
      auditLogs // ONLY THE NEW REGISTRATION EVENT FOR THIS FARMER ID
    };
  }

  // Existing farmer full history
  const district = farmer.district || 'Nashik';
  const insurance = pmfby.find((p) => p.district && p.district.toLowerCase() === district.toLowerCase()) || null;
  const repaymentHist = repaymentDataset.find((r) => r.farmerId === targetId) || null;

  const scoreHistory = [
    { quarter: 'Q1 2024', score: Math.max(350, creditProfile.creditMetrics.score - 45), tier: 'Tier B' },
    { quarter: 'Q2 2024', score: Math.max(350, creditProfile.creditMetrics.score - 20), tier: 'Tier A' },
    { quarter: 'Q3 2024', score: creditProfile.creditMetrics.score, tier: creditProfile.creditMetrics.tier }
  ];

  const loanRecords = [
    {
      loanId: 'LN-2023-881',
      lender: 'State Bank of India - Nashik Branch',
      loanType: 'Kisan Credit Card (KCC) Crop Loan',
      principalINR: 120000,
      sanctionedDate: '2023-05-15',
      repaymentStatus: 'FULLY_REPAID',
      interestRate: '7.0% p.a.',
      missedInstallments: 0
    },
    {
      loanId: 'LN-2024-902',
      lender: 'State Bank of India - Agricultural Branch',
      loanType: 'Drip Irrigation Input Line',
      principalINR: creditProfile.creditMetrics.recommendedLimit || 150000,
      sanctionedDate: '2024-05-12',
      repaymentStatus: 'ACTIVE_GOOD_STANDING',
      interestRate: '7.0% p.a.',
      missedInstallments: repaymentHist ? repaymentHist.missedInstallments : 0
    }
  ];

  const associatedGroups = groupLoans.filter((g) => {
    if (!g.members) return false;
    return g.members.some((m) => (m.farmerId || m) === targetId);
  });

  return {
    farmerId: targetId,
    personalDetails: {
      name: farmer.name,
      mobileNo: farmer.mobile_no || '9823011223',
      aadhaarNo: farmer.aadhaar_no || '4521-8890-1209',
      pmKisanId: farmer.pm_kisan_id || `PM-KISAN-${targetId}`,
      state: farmer.state || 'Maharashtra',
      district: farmer.district || 'Nashik',
      village: farmer.village || 'Pimplad',
      fpoName: 'Sahyadri Farmer Producer Company (Nashik)',
      peer1: { name: farmer.peer_1_name || 'Vithalrao Shinde', mobile: farmer.peer_1_mobile || '9850123456' },
      peer2: { name: farmer.peer_2_name || 'Eknath Jadhav', mobile: farmer.peer_2_mobile || '9822987654' }
    },
    farmLandDetails: {
      landAcres: farmer.landholding_acres || 3.5,
      ownershipStatus: 'Owner Operator Title (Verified Khatuni)',
      soilHealthCard: 'Balanced NPK Ratio (pH 6.8)',
      irrigationSource: 'Borewell & Drip Network'
    },
    verificationRecords: {
      authenticityScore: 96.8,
      pmKisanStatus: farmer.pm_kisan_status || 'Active Beneficiary',
      installmentsReceived: farmer.installments_received || 17,
      icarCanopyReflectance: 'NDVI 0.85 (High Vigor)',
      pmfbyInsurance: {
        enrolled: insurance ? insurance.insurance_enrolled : true,
        sumInsuredPerAcre: insurance ? insurance.sum_insured_per_acre : 40000
      }
    },
    creditScoreRecords: {
      currentScore: creditProfile.creditMetrics.score,
      tier: creditProfile.creditMetrics.tier,
      scoreHistory
    },
    cropHistory: [
      { season: 'Rabi 2023-24', crop: 'Cotton', yieldMT: 4.5, grossRevenueINR: 280000, status: 'Harvested & Sold' },
      { season: 'Kharif 2024', crop: farmer.current_crop || 'Onion', yieldMT: 18.0, grossRevenueINR: creditProfile.creditMetrics.projectedGrossIncome, status: 'Active Standing Harvest' }
    ],
    loanRecords,
    repaymentHistory: {
      totalInstallmentsPaid: farmer.installments_received || 17,
      missedInstallments: repaymentHist ? repaymentHist.missedInstallments : 0,
      pastDefaultsCount: 0,
      dscrRatio: riskPrediction.prediction ? riskPrediction.prediction.metricsEvaluated.dscrRatio : 7.95
    },
    aiRiskAssessment: riskPrediction.prediction,
    associatedGroups: associatedGroups.map((g) => ({
      groupId: g.groupId,
      groupName: g.groupName,
      groupTrustScore: g.groupMetrics ? g.groupMetrics.groupTrustScore : 812,
      status: 'ACTIVE_SANCTIONED',
      joinedDate: g.createdAt
    })),
    auditLogs
  };
}
