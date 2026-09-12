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

export function calculateFarmerCreditProfile(farmerId, customOverrides = {}) {
  const pmKisanData = loadJSON('pm_kisan.json');
  const agmarknetData = loadJSON('agmarknet.json');
  const nhbData = loadJSON('nhb_horticulture.json');
  const pmfbyData = loadJSON('pmfby_risk.json');
  const icarData = loadJSON('icar_health.json');
  const kccData = loadJSON('kcc_nlp.json');

  // Strictly match farmer by farmer_id, DO NOT FALLBACK to pmKisanData[0]
  const existingFarmer = pmKisanData.find((f) => f.farmer_id === farmerId);

  const farmer = existingFarmer || {
    farmer_id: farmerId,
    name: customOverrides.name || 'New Registered Farmer',
    district: customOverrides.district || '',
    state: customOverrides.state || '',
    village: customOverrides.village || '',
    landholding_acres: parseFloat(customOverrides.landholding_acres || customOverrides.landAcres) || 0,
    current_crop: customOverrides.crop || 'Not Specified',
    pm_kisan_status: 'Pending Verification',
    installments_received: 0,
    aadhaar_linked: false,
    khatuni_verified: false,
    is_new_farmer: true
  };

  const crop = customOverrides.crop || farmer.current_crop || "Not Specified";
  const landAcres = parseFloat(customOverrides.landholding_acres || customOverrides.landAcres || farmer.landholding_acres || 0);

  // If newly registered farmer with 0 installments and no score calculated yet
  const isBrandNew = farmer.is_new_farmer && (farmer.installments_received === 0) && !customOverrides.calculate;

  if (isBrandNew && landAcres === 0) {
    return {
      farmer: {
        id: farmer.farmer_id,
        name: farmer.name,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landAcres: 0,
        crop: farmer.current_crop,
        pmKisanStatus: 'Pending Verification',
        installments: 0
      },
      creditMetrics: {
        score: null,
        tier: 'Not Calculated',
        riskLevel: 'Pending Data Entry',
        recommendedLimit: 0,
        projectedGrossIncome: 0,
        estimatedNetMargin: 0,
        totalInputCost: 0,
        maxLTVPct: 0
      },
      datasetsIntegrated: {
        agmarknet: { mandi: farmer.district + ' Mandi', commodity: crop, modalPrice: 0 },
        nhb: { district: farmer.district, crop, yieldBenchmark: 0 },
        pmKisan: { verified: false, installments: 0 },
        pmfby: { enrolled: false, sumInsured: 0 },
        icar: { healthConfidence: 0, vigor: 0 },
        kcc: { sentiment: 0, advisory: 'Pending Account Setup' }
      },
      purposeAllocation: [],
      drivers: [],
      challengeAnswers: [
        {
          question: "1. Who is a trustworthy borrower?",
          answer: `${farmer.name} (ID: ${farmer.farmer_id}), newly registered account. Verification and peer endorsements pending.`
        },
        {
          question: "2. How much credit can safely be extended?",
          answer: "Credit limit will be generated once farm acreage and crop details are submitted."
        }
      ]
    };
  }

  // Safe dataset lookups by district/crop (without borrowing index 0 from other farmers)
  const nhb = nhbData.find((d) => (d.district || '').toLowerCase() === (farmer.district || '').toLowerCase() && (d.crop || '').toLowerCase() === (crop || '').toLowerCase()) || { avg_yield_mt_per_ha: 15.0, yield_benchmark_rating: 'Moderate', input_cost_per_acre_inr: 35000, district: farmer.district, crop };
  const mandi = agmarknetData.find((m) => (m.district || '').toLowerCase() === (farmer.district || '').toLowerCase() && (m.commodity || '').toLowerCase() === (crop || '').toLowerCase()) || { modal_price: 2200, price_volatility_idx: 0.12, mandi: (farmer.district || 'District') + ' Mandi', commodity: crop };
  const insurance = pmfbyData.find((p) => (p.district || '').toLowerCase() === (farmer.district || '').toLowerCase()) || { insurance_enrolled: false, sum_insured_per_acre: 0 };
  const health = icarData.find((i) => i.farmer_id === farmer.farmer_id) || { crop_vigor_index: 0.75, health_confidence_score: 80 };
  const kcc = kccData.find((k) => (k.district || '').toLowerCase() === (farmer.district || '').toLowerCase()) || { regional_sentiment_score: 75, advisory_status: 'Standard KCC Advisory' };

  // 1. Base Score calculation (Start at 520)
  let baseScore = 520;
  const drivers = [];

  // PM-KISAN verification
  if (farmer.pm_kisan_status === 'Active Beneficiary') {
    baseScore += 85;
    drivers.push({ feature: 'PM-KISAN Verified Beneficiary', impact: '+85', type: 'positive', description: `${farmer.installments_received || 14} verified direct benefit transfer installments received` });
  } else {
    drivers.push({ feature: 'PM-KISAN Verification Pending', impact: '+0', type: 'neutral', description: 'New registration pending government portal verification' });
  }

  if (farmer.aadhaar_linked && farmer.khatuni_verified) {
    baseScore += 65;
    drivers.push({ feature: 'Land Title & Khatuni Digitally Verified', impact: '+65', type: 'positive', description: 'State land registry ownership confirmed digitally' });
  }

  // NHB Yield Capability
  const effectiveLand = Math.max(0.5, landAcres || 1.0);
  const expectedYieldTonnesPerAcre = (nhb.avg_yield_mt_per_ha / 2.471);
  if (nhb.yield_benchmark_rating && nhb.yield_benchmark_rating.includes('High')) {
    baseScore += 70;
    drivers.push({ feature: 'NHB High Horticultural Yield District', impact: '+70', type: 'positive', description: `District ${farmer.district} averages ${nhb.avg_yield_mt_per_ha} MT/Ha yield benchmark` });
  }

  // AGMARKNET Price stability & Income
  const modalPricePerQuintal = mandi.modal_price || 2000;
  const modalPricePerTonne = modalPricePerQuintal * 10;
  const expectedGrossIncomePerAcre = expectedYieldTonnesPerAcre * modalPricePerTonne;
  const totalProjectedGrossIncome = expectedGrossIncomePerAcre * effectiveLand;

  if (mandi.price_volatility_idx < 0.15) {
    baseScore += 55;
    drivers.push({ feature: 'Stable Mandi Price Trend (AGMARKNET)', impact: '+55', type: 'positive', description: `Modal price at ${mandi.mandi} is ₹${mandi.modal_price}/quintal` });
  }

  // ICAR Crop Health
  if (health && health.crop_vigor_index > 0.8) {
    baseScore += 60;
    drivers.push({ feature: 'ICAR Satellite Crop Vigor', impact: '+60', type: 'positive', description: `Canopy health confidence is ${health.health_confidence_score}%` });
  }

  // PMFBY Insurance Coverage
  if (insurance && insurance.insurance_enrolled) {
    baseScore += 65;
    drivers.push({ feature: 'PMFBY Crop Insurance Coverage', impact: '+65', type: 'positive', description: `Sum insured ₹${insurance.sum_insured_per_acre}/acre active protection` });
  }

  // FPO Peer Vouching
  const fpoVouched = customOverrides.fpo_vouched !== undefined ? customOverrides.fpo_vouched : true;
  const fpoPeerCount = customOverrides.fpo_peer_count || 12;
  const fpoGuaranteePct = customOverrides.fpo_guarantee_pct || 25;

  if (fpoVouched) {
    const fpoBonus = 95;
    baseScore += fpoBonus;
    drivers.push({ feature: 'FPO Co-Signing & Peer Endorsement', impact: `+${fpoBonus}`, type: 'positive', description: `Endorsed by ${fpoPeerCount} member farmers with ${fpoGuaranteePct}% risk-pool backstop` });
  }

  // Final Credit Score bounded 300 - 900
  const finalCreditScore = Math.min(Math.max(Math.round(baseScore), 320), 890);

  // Risk Rating & Tier
  let tier = 'Tier A+ (Prime Agricultural Credit)';
  let riskLevel = 'Very Low Risk';
  let maxLTVPct = 0.85;

  if (finalCreditScore >= 800) {
    tier = 'Tier A+ (Prime Agricultural Credit)';
    riskLevel = 'Very Low Risk';
    maxLTVPct = 0.85;
  } else if (finalCreditScore >= 720) {
    tier = 'Tier A (Low Risk Farmer)';
    riskLevel = 'Low Risk';
    maxLTVPct = 0.75;
  } else if (finalCreditScore >= 640) {
    tier = 'Tier B (Moderate Risk)';
    riskLevel = 'Moderate Risk';
    maxLTVPct = 0.65;
  } else {
    tier = 'Tier C (High Risk / Sub-prime)';
    riskLevel = 'High Risk';
    maxLTVPct = 0.50;
  }

  const inputCostPerAcre = nhb.input_cost_per_acre_inr || 35000;
  const totalInputCost = inputCostPerAcre * effectiveLand;
  const netEstimatedMargin = Math.max(0, totalProjectedGrossIncome - totalInputCost);
  const recommendedCreditLimit = Math.round(Math.min(totalInputCost * 1.25, netEstimatedMargin * maxLTVPct));

  const purposeAllocation = [
    { purpose: 'High-Quality Certified Seeds & Bio-Inputs', pct: 40, amount: Math.round(recommendedCreditLimit * 0.40) },
    { purpose: 'Micro-Irrigation & Drip Sub-system', pct: 30, amount: Math.round(recommendedCreditLimit * 0.30) },
    { purpose: 'Solar Crop Protection & Storage', pct: 20, amount: Math.round(recommendedCreditLimit * 0.20) },
    { purpose: 'Emergency Working Capital', pct: 10, amount: Math.round(recommendedCreditLimit * 0.10) }
  ];

  const challengeAnswers = [
    {
      question: "1. Who is a trustworthy borrower?",
      answer: `${farmer.name} (ID: ${farmer.farmer_id}), ${farmer.pm_kisan_status} with digital verification.`
    },
    {
      question: "2. How much credit can safely be extended?",
      answer: `₹${recommendedCreditLimit.toLocaleString('en-IN')} based on ${effectiveLand} acres of ${crop} cultivation.`
    },
    {
      question: "3. What should the credit be used for?",
      answer: `Purpose-locked agricultural input procurement: 40% certified seeds, 30% drip irrigation, 20% protection, 10% liquidity.`
    },
    {
      question: "4. Can the farmer repay from expected crop/market income?",
      answer: `Yes. Projected gross income is ₹${Math.round(totalProjectedGrossIncome).toLocaleString('en-IN')} based on modal price ₹${mandi.modal_price}/Qtl.`
    },
    {
      question: "5. How can the community reduce lending risk?",
      answer: `Through ${fpoGuaranteePct}% FPO collective risk guarantee buffer fund and joint liability peer vouching.`
    },
    {
      question: "6. How can farmers obtain better credit without surrendering data ownership?",
      answer: `Using AgriTrust Zero-Knowledge Consent Passports.`
    }
  ];

  return {
    farmer: {
      id: farmer.farmer_id,
      name: farmer.name,
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      landAcres: effectiveLand,
      crop,
      pmKisanStatus: farmer.pm_kisan_status,
      installments: farmer.installments_received || 0
    },
    creditMetrics: {
      score: finalCreditScore,
      tier,
      riskLevel,
      recommendedLimit: recommendedCreditLimit,
      projectedGrossIncome: Math.round(totalProjectedGrossIncome),
      estimatedNetMargin: Math.round(netEstimatedMargin),
      totalInputCost: Math.round(totalInputCost),
      maxLTVPct
    },
    datasetsIntegrated: {
      agmarknet: { mandi: mandi.mandi, commodity: mandi.commodity, modalPrice: mandi.modal_price },
      nhb: { district: nhb.district, crop: nhb.crop, yieldBenchmark: nhb.avg_yield_mt_per_ha },
      pmKisan: { verified: farmer.khatuni_verified || false, installments: farmer.installments_received || 0 },
      pmfby: { enrolled: insurance ? insurance.insurance_enrolled : false, sumInsured: insurance ? insurance.sum_insured_per_acre : 0 },
      icar: { healthConfidence: health ? health.health_confidence_score : 0, vigor: health ? health.crop_vigor_index : 0 },
      kcc: { sentiment: kcc ? kcc.regional_sentiment_score : 75, advisory: kcc ? kcc.advisory_status : 'Standard Advisory' }
    },
    purposeAllocation,
    drivers,
    challengeAnswers
  };
}
