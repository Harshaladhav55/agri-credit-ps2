import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, RefreshCw, Award, ShieldCheck, Sprout, CheckCircle2, ArrowRight, TrendingUp, Users } from 'lucide-react';

export default function CreditSimulator({ onSimulate, simulatedProfile, profile: initialProfile, theme = 'light' }) {
  const [crop, setCrop] = useState('Onion');
  const [landAcres, setLandAcres] = useState(3.5);
  const [fpoVouched, setFpoVouched] = useState(true);
  const [fpoPeerCount, setFpoPeerCount] = useState(12);
  const [fpoGuaranteePct, setFpoGuaranteePct] = useState(25);
  const [loading, setLoading] = useState(false);

  const isLight = theme === 'light';

  // Crop Yield & Mandi Price Parameters
  const cropData = {
    Onion: { modalPrice: 2200, avgYieldMtAcre: 7.28, inputCostAcre: 32000, market: 'Lasalgaon Mandi' },
    Tomato: { modalPrice: 1550, avgYieldMtAcre: 9.71, inputCostAcre: 28000, market: 'Kolar APMC' },
    Pomegranate: { modalPrice: 6800, avgYieldMtAcre: 4.85, inputCostAcre: 45000, market: 'Solapur APMC' },
    Banana: { modalPrice: 1800, avgYieldMtAcre: 18.21, inputCostAcre: 38000, market: 'Jalgaon Mandi' },
    Cotton: { modalPrice: 5600, avgYieldMtAcre: 3.24, inputCostAcre: 26000, market: 'Rajkot Mandi' }
  };

  const selectedCrop = cropData[crop] || cropData.Onion;

  // Real-time dynamic simulator calculation
  const calculateDynamicScore = () => {
    let baseScore = 550;

    // Direct Benefit Transfer & Khatuni
    baseScore += 85; // PM-KISAN Verified
    baseScore += 65; // Digital Title Verified

    // Crop Yield Impact
    baseScore += 60;

    // FPO Peer Vouching & Guarantee Impact
    if (fpoVouched) {
      baseScore += 50;
      baseScore += Math.min(30, fpoPeerCount * 2);
      baseScore += Math.min(20, Math.round(fpoGuaranteePct * 0.5));
    } else {
      baseScore -= 45;
    }

    // Land Size Scaling Bonus
    baseScore += Math.min(30, Math.round(landAcres * 3));

    const score = Math.min(890, Math.max(340, baseScore));

    // Risk Tier
    let tier = 'Tier A+ (Prime Agricultural Credit)';
    let riskLevel = 'Very Low Risk';
    let ltv = 0.85;

    if (score >= 800) {
      tier = 'Tier A+ (Prime Credit)';
      riskLevel = 'Very Low Risk';
      ltv = 0.85;
    } else if (score >= 720) {
      tier = 'Tier A (Low Risk Farmer)';
      riskLevel = 'Low Risk';
      ltv = 0.75;
    } else if (score >= 640) {
      tier = 'Tier B (Moderate Risk)';
      riskLevel = 'Moderate Risk';
      ltv = 0.65;
    } else {
      tier = 'Tier C (High Risk / Sub-prime)';
      riskLevel = 'High Risk';
      ltv = 0.50;
    }

    const grossRevenue = Math.round(selectedCrop.avgYieldMtAcre * (selectedCrop.modalPrice * 10) * landAcres);
    const totalCost = Math.round(selectedCrop.inputCostAcre * landAcres);
    const netMargin = grossRevenue - totalCost;
    const safeLimit = Math.round(Math.min(totalCost * 1.3, netMargin * ltv));

    const drivers = [
      {
        feature: `Cultivating ${crop} (${landAcres} Acres)`,
        impact: `+${Math.min(30, Math.round(landAcres * 3))}`,
        type: 'positive',
        description: `Projected gross revenue of ₹${grossRevenue.toLocaleString('en-IN')} based on ${selectedCrop.market} modal rate (₹${selectedCrop.modalPrice}/Qtl).`
      },
      {
        feature: fpoVouched ? `FPO Co-Signing & ${fpoPeerCount} Peer Endorsers` : 'No FPO Peer Endorsement',
        impact: fpoVouched ? `+${50 + Math.min(30, fpoPeerCount * 2)}` : '-45',
        type: fpoVouched ? 'positive' : 'negative',
        description: fpoVouched 
          ? `Endorsed by ${fpoPeerCount} member farmers with ${fpoGuaranteePct}% FPO pooled risk fund backstop.`
          : 'Operating independently without collective community risk guarantee.'
      },
      {
        feature: 'PM-KISAN Direct Benefit & Land Title Verification',
        impact: '+150',
        type: 'positive',
        description: 'Direct benefit transfer continuity and digital Khatuni land title verified.'
      }
    ];

    return {
      creditMetrics: {
        score,
        tier,
        riskLevel,
        recommendedLimit: safeLimit,
        projectedGrossIncome: grossRevenue,
        estimatedNetMargin: netMargin,
        totalInputCost: totalCost
      },
      drivers
    };
  };

  const dynamicProfile = calculateDynamicScore();
  const currentProfile = simulatedProfile || initialProfile || dynamicProfile;

  const handleSimulateClick = async () => {
    setLoading(true);
    if (onSimulate) {
      await onSimulate({
        crop,
        landholding_acres: landAcres,
        fpo_vouched: fpoVouched,
        fpo_peer_count: fpoPeerCount,
        fpo_guarantee_pct: fpoGuaranteePct
      });
    }
    setLoading(false);
  };

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800' : 'bg-slate-900 border-slate-800 text-white';
  const innerCardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white border-emerald-700' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-emerald-300" />
            <span>Interactive "What-If" Credit Simulator</span>
          </h1>
          <p className="text-sm text-emerald-100 mt-1">
            Test how crop selection, acreage, peer vouching, and risk pool funds dynamically impact your credit score & safe borrowing ceiling.
          </p>
        </div>

        <button
          onClick={handleSimulateClick}
          disabled={loading}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-xs transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Re-calculating...' : 'Run Simulation Model'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className={`border rounded-2xl p-6 shadow-lg space-y-5 ${cardBg}`}>
          <h3 className={`text-base font-bold border-b pb-3 ${textTitle} border-slate-200 dark:border-slate-800`}>
            Simulation Parameters
          </h3>

          {/* Crop Selector */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Target Agricultural Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600' : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
              }`}
            >
              <option value="Onion">Onion (Lasalgaon Mandi Benchmark)</option>
              <option value="Tomato">Tomato (Kolar APMC Benchmark)</option>
              <option value="Pomegranate">Pomegranate (Solapur APMC Benchmark)</option>
              <option value="Banana">Banana (Jalgaon Mandi Benchmark)</option>
              <option value="Cotton">Cotton (Rajkot Mandi Benchmark)</option>
            </select>
          </div>

          {/* Land Acres Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className={textSub}>Cultivated Land Area</span>
              <span className="text-emerald-600 font-bold">{landAcres} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={landAcres}
              onChange={(e) => setLandAcres(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* FPO Endorsement Toggle */}
          <div className={`p-4 rounded-xl border space-y-3 ${innerCardBg}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${textTitle}`}>FPO Peer Vouching & Co-Signing</span>
              <input
                type="checkbox"
                checked={fpoVouched}
                onChange={(e) => setFpoVouched(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {fpoVouched && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={textSub}>Endorsing Peer Farmers</span>
                    <span className="text-emerald-600 font-bold">{fpoPeerCount} Peers</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={fpoPeerCount}
                    onChange={(e) => setFpoPeerCount(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={textSub}>FPO Risk Fund Backstop</span>
                    <span className="text-emerald-600 font-bold">{fpoGuaranteePct}% Guarantee</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={fpoGuaranteePct}
                    onChange={(e) => setFpoGuaranteePct(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSimulateClick}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Re-calculating Score...' : 'Run Simulation Model'}</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Score */}
            <div className={`border p-5 rounded-2xl shadow-lg ${cardBg}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs uppercase font-bold ${textSub}`}>Simulated Credit Score</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 my-2">
                {currentProfile.creditMetrics?.score || dynamicProfile.creditMetrics.score}
              </div>
              <div className={`text-xs ${textSub}`}>
                {currentProfile.creditMetrics?.tier || dynamicProfile.creditMetrics.tier}
              </div>
            </div>

            {/* Credit Limit */}
            <div className={`border p-5 rounded-2xl shadow-lg ${cardBg}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs uppercase font-bold ${textSub}`}>Safe Credit Ceiling</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className={`text-3xl font-extrabold my-2 ${textTitle}`}>
                ₹{(currentProfile.creditMetrics?.recommendedLimit || dynamicProfile.creditMetrics.recommendedLimit).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-600 font-bold">100% Purpose-Locked</div>
            </div>

            {/* Harvest Revenue */}
            <div className={`border p-5 rounded-2xl shadow-lg ${cardBg}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs uppercase font-bold ${textSub}`}>Projected Harvest Income</span>
                <Sprout className="w-5 h-5 text-green-600" />
              </div>
              <div className={`text-3xl font-extrabold my-2 ${textTitle}`}>
                ₹{(currentProfile.creditMetrics?.projectedGrossIncome || dynamicProfile.creditMetrics.projectedGrossIncome).toLocaleString('en-IN')}
              </div>
              <div className={`text-xs ${textSub}`}>{selectedCrop.market} Rate</div>
            </div>

          </div>

          {/* Drivers Analysis */}
          <div className={`border rounded-2xl p-6 shadow-lg space-y-3 ${cardBg}`}>
            <h4 className={`text-sm font-bold mb-3 ${textTitle}`}>Impact Analysis of Simulated Changes</h4>
            
            {(currentProfile.drivers || dynamicProfile.drivers).map((d, i) => (
              <div key={i} className={`flex justify-between items-center p-3.5 rounded-xl border ${innerCardBg}`}>
                <div>
                  <div className={`font-semibold text-xs ${textTitle}`}>{d.feature}</div>
                  <div className={`text-xs mt-0.5 ${textSub}`}>{d.description}</div>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${
                  d.type === 'positive'
                    ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : isLight ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {d.impact}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
