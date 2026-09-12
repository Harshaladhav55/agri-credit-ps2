import React, { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight, HelpCircle, FileText, ArrowUpRight, Coins, Activity, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import FarmerHistoryModal from './FarmerHistoryModal';
import { API_BASE } from '../config';

export default function BankCreditPortal({ profile }) {
  const [sanctioned, setSanctioned] = useState(false);
  const [activeTab, setActiveTab] = useState('assessment');
  const [repaymentRisk, setRepaymentRisk] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (profile?.farmer?.id) {
      fetch(`${API_BASE}/ai/predict-repayment-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: profile.farmer.id,
          district: profile.farmer.district,
          crop: profile.farmer.crop,
          landAcres: profile.farmer.landAcres
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRepaymentRisk(data.data);
          }
        })
        .catch((err) => console.error('Error fetching repayment risk in bank portal:', err));
    }
  }, [profile?.farmer?.id]);

  if (!profile) return <div className="p-8 text-center text-slate-400">Loading bank portal...</div>;

  const { farmer, creditMetrics, purposeAllocation, challengeAnswers, drivers } = profile;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Lender Underwriting Workspace</h1>
            <span className="bg-blue-950 text-blue-400 border border-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> NABARD / RBI Compliant API
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Evaluating Alternative Credit Profile for{' '}
            <strong
              onClick={() => setShowHistoryModal(true)}
              className="text-white cursor-pointer hover:underline hover:text-emerald-400 inline-flex items-center gap-1"
              title="Click to view complete borrower history & audit log"
            >
              <span>{farmer.name}</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </strong>{' '}
            ({farmer.id})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 text-sm transition-all"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Borrower History & Audit Log</span>
          </button>
          {sanctioned ? (
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Credit Line Sanctioned: ₹{creditMetrics.recommendedLimit.toLocaleString('en-IN')}</span>
            </span>
          ) : (
            <button
              onClick={() => setSanctioned(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 flex items-center space-x-2 text-sm transition-all"
            >
              <Coins className="w-4 h-4" />
              <span>Sanction Safe Credit Line</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'assessment' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Credit Assessment & Metrics
        </button>
        <button
          onClick={() => setActiveTab('answers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'answers' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          6 Hackathon Core Challenge Answers
        </button>
      </div>

      {activeTab === 'assessment' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Metrics & Radar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Safe Credit Limit Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Underwriting Analysis</span>
                <span className="bg-emerald-950 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-800 font-bold">
                  {creditMetrics.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Credit Score</div>
                  <div className="text-3xl font-black text-emerald-400">{creditMetrics.score}</div>
                  <div className="text-xs text-slate-400 mt-1">{creditMetrics.tier}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Max Safe Credit Ceiling</div>
                  <div className="text-2xl font-bold text-white">₹{creditMetrics.recommendedLimit.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-emerald-400 mt-1">Loan-to-Value: {Math.round(creditMetrics.maxLTVPct * 100)}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Expected Harvest Revenue</div>
                  <div className="text-2xl font-bold text-white">₹{creditMetrics.projectedGrossIncome.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-slate-400 mt-1">From {farmer.landAcres} Acres {farmer.crop}</div>
                </div>
              </div>

              {/* Purpose Allocation Chart */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Purpose-Locked Credit Allocation Plan</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purposeAllocation}
                        dataKey="amount"
                        nameKey="purpose"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={5}
                      >
                        {purposeAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                      />
                      <Legend formatter={(value) => <span className="text-xs text-slate-300">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Credit Score Drivers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white">SHAP Feature Driver Breakdown</h4>
              {drivers.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">{d.feature}</div>
                    <div className="text-slate-400 mt-0.5">{d.description}</div>
                  </div>
                  <span className="font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Underwriting Checklist & AI Repayment Risk */}
          <div className="space-y-6">
            
            {/* AI Repayment Risk Prediction Box */}
            {repaymentRisk && repaymentRisk.prediction && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">AI Repayment Risk Prediction</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                    repaymentRisk.prediction.riskCategory === 'LOW'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : repaymentRisk.prediction.riskCategory === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {repaymentRisk.prediction.repaymentRiskScore}/100 — {repaymentRisk.prediction.riskCategory} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-[11px] text-slate-400">Next Installment Success</div>
                    <div className="text-xl font-bold text-emerald-400">{repaymentRisk.prediction.nextInstallmentSuccessProb}%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">DSCR Coverage Ratio</div>
                    <div className="text-xl font-bold text-indigo-400">{repaymentRisk.prediction.metricsEvaluated.dscrRatio}x</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-300 font-medium">{repaymentRisk.prediction.riskSummaryText}</div>
                  
                  {repaymentRisk.prediction.positiveFactors.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px] uppercase">Positive Factors (✓)</div>
                      {repaymentRisk.prediction.positiveFactors.map((f, i) => (
                        <div key={i} className="text-emerald-300/90 text-[11px]">{f}</div>
                      ))}
                    </div>
                  )}

                  {repaymentRisk.prediction.riskFactors.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-amber-400 font-bold text-[11px] uppercase">Risk Warnings (⚠)</div>
                      {repaymentRisk.prediction.riskFactors.map((f, i) => (
                        <div key={i} className="text-amber-300/90 text-[11px]">{f}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Verification Checklist</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-950/40 rounded-xl border border-purple-800">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-purple-200">ML Authenticity Index: 96.8%</div>
                    <div className="text-xs text-purple-300 mt-0.5">Verified Genuine across PM-KISAN, NHB, ICAR Satellite & PMFBY.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">PM-KISAN Registry Validated</div>
                    <div className="text-xs text-slate-400 mt-0.5">17 direct benefit transfer installments verified.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">AGMARKNET Price Coverage</div>
                    <div className="text-xs text-slate-400 mt-0.5">Lasalgaon Mandi modal rate at ₹2,200/quintal.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">NHB Yield Benchmark</div>
                    <div className="text-xs text-slate-400 mt-0.5">District average yield: 18.0 MT/Ha.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">FPO Peer Guarantee</div>
                    <div className="text-xs text-slate-400 mt-0.5">Backed by Sahyadri FPO 25% risk reserve.</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400 mb-2">Sanction Terms</div>
                <div className="text-xs text-white space-y-1">
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <strong className="text-emerald-400">7.0% p.a. (KCC Subvention Rate)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Repayment Schedule:</span>
                    <strong className="text-white">Bullet Repayment post-harvest (6 Months)</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Hackathon Challenge Answers View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
              <span>Core Hackathon Challenge Answers (Explicit Model Output)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Synthesized by AgriTrust multi-factor scoring engine using verified AGMARKNET, NHB, PM-KISAN, and FPO datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeAnswers.map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl space-y-2">
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{item.question}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l-2 border-emerald-800/60">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farmer History Modal */}
      {showHistoryModal && (
        <FarmerHistoryModal
          farmerId={farmer.id}
          farmerName={farmer.name}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

    </div>
  );
}
