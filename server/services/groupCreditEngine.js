import fs from 'fs';
import path from 'path';
import { calculateFarmerCreditProfile } from './creditScoringEngine.js';

const dataDir = path.resolve('server/data');

const loadJSON = (fileName) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, fileName), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${fileName}:`, err);
    return [];
  }
};

const writeJSON = (fileName, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${fileName}:`, err);
  }
};

/**
 * Community Joint Credit & Group Loan Engine
 * Computes Group Trust Score & Joint Liability sub-limits for 3-10 farmer groups.
 * Individual credit scores remain completely separate and unmodified.
 */
export function calculateGroupTrustScore(memberIds, groupMeta = {}) {
  const pmKisan = loadJSON('pm_kisan.json');

  if (!memberIds || memberIds.length < 3 || memberIds.length > 10) {
    throw new Error('Joint Liability Group must consist of 3 to 10 farmer members.');
  }

  // 1. Resolve member profiles and individual scores (unmodified)
  const memberProfiles = memberIds.map((id) => {
    const farmerRecord = pmKisan.find((f) => f.farmer_id === id) || {
      farmer_id: id,
      name: `Farmer ${id}`,
      district: 'Nashik',
      state: 'Maharashtra',
      landholding_acres: 3.0,
      pm_kisan_status: 'Active Beneficiary',
      khatuni_verified: true
    };

    const profile = calculateFarmerCreditProfile(farmerRecord.farmer_id);
    return {
      farmerId: farmerRecord.farmer_id,
      name: farmerRecord.name,
      individualScore: profile.creditMetrics.score,
      landAcres: farmerRecord.landholding_acres || 3.0,
      crop: farmerRecord.current_crop || 'Onion',
      individualRecommendedLimit: profile.creditMetrics.recommendedLimit,
      pmKisanVerified: farmerRecord.pm_kisan_status === 'Active Beneficiary',
      khatuniVerified: farmerRecord.khatuni_verified === true
    };
  });

  // 2. Statistical Aggregates for Group Trust Score
  const scores = memberProfiles.map((m) => m.individualScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  const verifiedCount = memberProfiles.filter((m) => m.pmKisanVerified && m.khatuniVerified).length;
  const verificationRatio = verifiedCount / memberProfiles.length;

  // 3. Formula: 60% Average Score + 40% Weakest Link Score Penalty * Verification Multiplier
  const baseGroupScore = (0.60 * avgScore) + (0.40 * minScore);
  const verificationMultiplier = 0.85 + (0.15 * verificationRatio);
  const rawGroupScore = Math.round(baseGroupScore * verificationMultiplier);

  // Group Trust Score bounded between 350 and 900
  const groupTrustScore = Math.min(890, Math.max(350, rawGroupScore));

  // Risk Rating & LTV Ceiling
  let riskTier = 'Tier A+ (Prime Joint Credit)';
  let ltvMultiplier = 1.15; // 15% group credit boost due to joint liability guarantee

  if (groupTrustScore >= 800) {
    riskTier = 'Tier A+ (Prime Joint Credit)';
    ltvMultiplier = 1.20;
  } else if (groupTrustScore >= 720) {
    riskTier = 'Tier A (Low Risk Joint Credit)';
    ltvMultiplier = 1.12;
  } else if (groupTrustScore >= 640) {
    riskTier = 'Tier B (Moderate Risk Joint Credit)';
    ltvMultiplier = 1.05;
  } else {
    riskTier = 'Tier C (High Risk Joint Credit)';
    ltvMultiplier = 0.90;
  }

  // 4. Calculate Aggregate Group Credit Ceiling & Individual Member Sub-limits
  const totalIndividualCeilings = memberProfiles.reduce((sum, m) => sum + m.individualRecommendedLimit, 0);
  const totalGroupLoanCeilingINR = Math.round(totalIndividualCeilings * ltvMultiplier);

  // Allocate sub-limits based on member landholding & individual score ratio
  const totalLand = memberProfiles.reduce((sum, m) => sum + m.landAcres, 0);
  const memberSubLimits = memberProfiles.map((m) => {
    const weight = (0.5 * (m.landAcres / totalLand)) + (0.5 * (m.individualScore / (avgScore * memberProfiles.length)));
    const subLimitINR = Math.round(totalGroupLoanCeilingINR * weight);

    return {
      ...m,
      subLimitINR,
      verificationStatus: m.pmKisanVerified ? 'PM-KISAN Verified' : 'Pending Verification',
      repaymentStatus: 'ON_TIME'
    };
  });

  return {
    groupName: groupMeta.groupName || `Joint Liability Group (${memberProfiles.length} Members)`,
    membersCount: memberProfiles.length,
    members: memberSubLimits,
    groupMetrics: {
      groupTrustScore,
      averageMemberScore: avgScore,
      weakestLinkScore: minScore,
      highestMemberScore: maxScore,
      verificationCoveragePct: Math.round(verificationRatio * 100),
      totalGroupLoanCeilingINR,
      riskTier,
      jointLiabilityStatus: 'ACTIVE_HEALTHY',
      gracePeriodDays: groupMeta.gracePeriodDays || 30,
      fpoRiskReserveBackstopINR: Math.round(totalGroupLoanCeilingINR * 0.25)
    }
  };
}

/**
 * Register a new Joint Liability Group in server data
 */
export function createGroupLoan(groupData) {
  const groups = loadJSON('group_loans.json');

  const memberIds = groupData.memberIds || [];
  const calculated = calculateGroupTrustScore(memberIds, {
    groupName: groupData.groupName,
    gracePeriodDays: groupData.gracePeriodDays || 30
  });

  const newGroup = {
    groupId: `JLG-MH-2026-${Math.floor(10 + Math.random() * 90)}`,
    groupName: calculated.groupName,
    village: groupData.village || 'Pimplad',
    district: groupData.district || 'Nashik',
    state: groupData.state || 'Maharashtra',
    createdAt: new Date().toISOString().split('T')[0],
    membersCount: calculated.membersCount,
    members: calculated.members,
    groupMetrics: calculated.groupMetrics,
    history: [
      {
        date: new Date().toISOString().split('T')[0],
        event: 'Joint Liability Group Created & Approved',
        status: 'ACTIVE'
      }
    ]
  };

  groups.unshift(newGroup);
  writeJSON('group_loans.json', groups);
  return newGroup;
}

/**
 * Trigger Joint Liability Resolution / Default Mechanism
 */
export function triggerJointLiabilityDefault(groupId, defaultingFarmerId, gracePeriodDays = 30) {
  const groups = loadJSON('group_loans.json');
  const groupIndex = groups.findIndex((g) => g.groupId === groupId);

  if (groupIndex === -1) {
    // If group not found in JSON, select first group as fallback
    if (groups.length === 0) throw new Error('No active Joint Liability Groups found.');
  }

  const group = groupIndex !== -1 ? groups[groupIndex] : groups[0];

  // 1. Mark member status as REPAYMENT_DELAYED
  let targetMember = group.members.find((m) => m.farmerId === defaultingFarmerId);
  if (!targetMember && group.members.length > 0) {
    targetMember = group.members[group.members.length - 1]; // pick last member as target
  }

  if (targetMember) {
    targetMember.repaymentStatus = 'DEFAULT_WARNING';
  }

  // 2. Activate FPO Pooled Guarantee Fund draw
  const defaultAmount = targetMember ? Math.round(targetMember.subLimitINR * 0.20) : 30000;
  
  // Apply Group Trust Score Penalty (-85 pts for joint liability breach)
  const previousScore = group.groupMetrics.groupTrustScore;
  group.groupMetrics.groupTrustScore = Math.max(350, previousScore - 85);
  group.groupMetrics.riskTier = 'Tier B (Moderate Risk - Active Guarantee Resolution)';
  group.groupMetrics.jointLiabilityStatus = 'GUARANTEE_TRIGGERED';

  group.history.unshift({
    date: new Date().toISOString().split('T')[0],
    event: `Repayment delay by ${targetMember ? targetMember.name : 'Group Member'}. ${gracePeriodDays}-day grace period activated. ₹${defaultAmount.toLocaleString('en-IN')} drawn from FPO Risk Reserve Fund.`,
    status: 'GUARANTEE_DRAWDOWN'
  });

  if (groupIndex !== -1) {
    groups[groupIndex] = group;
  }
  writeJSON('group_loans.json', groups);

  return {
    group,
    defaultingMember: targetMember,
    amountCoveredByGuaranteeINR: defaultAmount,
    newGroupTrustScore: group.groupMetrics.groupTrustScore,
    previousGroupTrustScore: previousScore,
    gracePeriodDays
  };
}

/**
 * List all Joint Liability Groups
 */
export function getGroupLoans() {
  return loadJSON('group_loans.json');
}

/**
 * Delete a Joint Liability Group
 */
export function deleteGroupLoan(groupId) {
  const groups = loadJSON('group_loans.json');
  const filtered = groups.filter((g) => g.groupId !== groupId);
  writeJSON('group_loans.json', filtered);
  return { success: true, remainingCount: filtered.length, remainingGroups: filtered };
}
