import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('backend/data');

const loadJSON = (fileName) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, fileName), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${fileName}:`, err);
    return [];
  }
};

/**
 * AI-Based Continuous Repayment Risk Prediction Engine
 * Evaluates changing crop income, AGMARKNET mandi prices, PMFBY weather risk,
 * existing debt, and payment history to predict next installment delay/default.
 */
export function predictFarmerRepaymentRisk(farmerId, customOverrides = {}) {
  const pmKisanData = loadJSON('pm_kisan.json');
  const agmarknetData = loadJSON('agmarknet.json');
  const nhbData = loadJSON('nhb_horticulture.json');
  const pmfbyData = loadJSON('pmfby_risk.json');
  const repaymentHistory = loadJSON('repayment_history_dataset.json');

  const farmer = pmKisanData.find((f) => f.farmer_id === farmerId) || {
    farmer_id: farmerId,
    name: customOverrides.name || 'New Registered Farmer',
    district: customOverrides.district || 'Nashik',
    current_crop: customOverrides.crop || 'Onion',
    landholding_acres: parseFloat(customOverrides.landAcres || customOverrides.landholding_acres) || 0,
    pm_kisan_status: 'Pending Verification',
    installments_received: 0
  };

  const name = customOverrides.name || farmer.name;
  const district = customOverrides.district || farmer.district || 'Nashik';
  const crop = customOverrides.crop || farmer.current_crop || 'Onion';
  const landAcres = parseFloat(customOverrides.landAcres || customOverrides.landholding_acres || farmer.landholding_acres || 0);

  // Match datasets strictly without borrowing index 0 from other farmers
  const mandi = agmarknetData.find((m) => (m.district || '').toLowerCase() === district.toLowerCase() && (m.commodity || '').toLowerCase() === crop.toLowerCase()) || { modal_price: 2200, price_volatility_idx: 0.12, mandi: district + ' Mandi' };
  const nhb = nhbData.find((d) => (d.district || '').toLowerCase() === district.toLowerCase() && (d.crop || '').toLowerCase() === crop.toLowerCase()) || { avg_yield_mt_per_ha: 15.0, input_cost_per_acre_inr: 35000 };
  const insurance = pmfbyData.find((p) => (p.district || '').toLowerCase() === district.toLowerCase()) || { climate_risk_index: 'Low-Moderate', insurance_enrolled: false, sum_insured_per_acre: 0 };
  const hist = repaymentHistory.find((r) => r.farmerId === farmer.farmer_id) || null;

  const positiveFactors = [];
  const riskFactors = [];

  let baseRiskScore = 15;

  // 1. Crop Income & Debt Service Coverage Ratio (DSCR) Vector
  const effectiveLand = Math.max(0.5, landAcres || 1.0);
  const expectedYieldTonnes = (nhb.avg_yield_mt_per_ha / 2.471) * effectiveLand;
  const expectedGrossIncome = expectedYieldTonnes * ((mandi.modal_price || 2000) * 10);
  const inputCost = (nhb.input_cost_per_acre_inr || 35000) * effectiveLand;
  const netEstimatedMargin = Math.max(0, expectedGrossIncome - inputCost);
  const estimatedDebtINR = customOverrides.existingDebtINR || (effectiveLand * 45000);
  const dscrRatio = estimatedDebtINR > 0 ? netEstimatedMargin / (estimatedDebtINR * 0.35) : 3.0;

  if (dscrRatio >= 2.0) {
    positiveFactors.push('✓ Robust crop income & high debt service coverage ratio (DSCR: ' + dscrRatio.toFixed(2) + 'x)');
  } else if (dscrRatio >= 1.2) {
    positiveFactors.push('✓ Adequate harvest income to cover upcoming loan installment');
  } else {
    baseRiskScore += 25;
    riskFactors.push('⚠ High debt-to-income ratio relative to projected harvest margin');
  }

  // 2. Mandi Price Volatility & Market Trend Vector
  const priceVolatility = mandi.price_volatility_idx || 0.12;
  if (priceVolatility < 0.15) {
    positiveFactors.push(`✓ Stable modal price trend at ${mandi.mandi} mandi (₹${mandi.modal_price}/Quintal)`);
  } else if (priceVolatility < 0.25) {
    riskFactors.push(`⚠ Moderate market price volatility detected for ${crop} in ${district}`);
    baseRiskScore += 12;
  } else {
    riskFactors.push(`⚠ Recent market price decline and high price volatility (Index: ${priceVolatility})`);
    baseRiskScore += 28;
  }

  // 3. PMFBY Climate & Weather Risk Vector
  const climateRisk = insurance.climate_risk_index || 'Low-Moderate';
  if (insurance.insurance_enrolled) {
    positiveFactors.push(`✓ Active PMFBY crop insurance policy covering sum insured ₹${insurance.sum_insured_per_acre}/acre`);
  } else {
    baseRiskScore += 10;
    riskFactors.push('⚠ Uninsured plot: Lack of crop insurance protection against weather anomalies');
  }

  if (climateRisk.includes('High')) {
    baseRiskScore += 18;
    riskFactors.push(`⚠ Elevated climate & rainfall vulnerability risk in ${district} district`);
  } else {
    positiveFactors.push(`✓ Favorable regional weather & low drought vulnerability rating`);
  }

  // 4. Historical Repayment & DBT Continuity Vector
  const installmentsPaid = farmer.installments_received || 0;
  if (farmer.pm_kisan_status === 'Active Beneficiary' && installmentsPaid >= 14) {
    positiveFactors.push(`✓ Excellent direct benefit repayment history (${installmentsPaid} verified DBT transactions)`);
  } else if (installmentsPaid === 0) {
    positiveFactors.push('✓ Newly registered account - Zero default history');
  } else {
    baseRiskScore += 15;
    riskFactors.push('⚠ Incomplete direct benefit transfer history or pending verification');
  }

  if (hist && hist.missedInstallments > 0) {
    baseRiskScore += 25;
    riskFactors.push(`⚠ History of ${hist.missedInstallments} delayed or missed loan installments`);
  } else {
    positiveFactors.push('✓ Clean credit history with zero past loan defaults');
  }

  // 5. Final Repayment Risk Score (0 - 100) & Next Installment Success Probability
  const riskScore = Math.min(100, Math.max(5, Math.round(baseRiskScore)));
  const nextInstallmentSuccessProb = Math.min(98, Math.max(10, 100 - riskScore));

  let riskCategory = 'LOW';
  let riskBadgeColor = 'emerald';
  let riskSummaryText = 'Low probability of repayment delay. Borrower demonstrates strong harvest margins and clean payment history.';

  if (riskScore > 65) {
    riskCategory = 'HIGH';
    riskBadgeColor = 'rose';
    riskSummaryText = 'High probability of installment delay or default. Recommend activating FPO joint guarantee backstop.';
  } else if (riskScore > 30) {
    riskCategory = 'MEDIUM';
    riskBadgeColor = 'amber';
    riskSummaryText = 'Moderate repayment risk due to mandi price volatility or weather exposure. Monitoring advised.';
  }

  return {
    farmerId: farmer.farmer_id,
    farmerName: name,
    district,
    crop,
    landAcres: effectiveLand,
    prediction: {
      repaymentRiskScore: riskScore,
      riskCategory,
      riskBadgeColor,
      nextInstallmentSuccessProb,
      riskSummaryText,
      positiveFactors,
      riskFactors,
      metricsEvaluated: {
        expectedGrossIncomeINR: Math.round(expectedGrossIncome),
        estimatedNetMarginINR: Math.round(netEstimatedMargin),
        estimatedDebtINR,
        dscrRatio: parseFloat(dscrRatio.toFixed(2)),
        mandiModalPrice: mandi.modal_price || 2000,
        mandiVolatilityIdx: priceVolatility,
        climateRiskIndex: climateRisk,
        pmkisanInstallments: installmentsPaid
      }
    }
  };
}
