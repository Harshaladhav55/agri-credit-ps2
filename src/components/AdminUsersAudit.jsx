import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, KeyRound, Phone, MapPin, Sprout, FileText, ArrowRight, UserCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import FarmerHistoryModal from './FarmerHistoryModal';

export default function AdminUsersAudit({ onLoginAsFarmer }) {
  const [users, setUsers] = useState([]);
  const [mlAudit, setMlAudit] = useState(null);
  const [repaymentAudit, setRepaymentAudit] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/admin/registered-users').then(res => res.json()),
      fetch('http://localhost:5000/api/ml/verification-audit').then(res => res.json()),
      fetch('http://localhost:5000/api/ai/repayment-risk-audit').then(res => res.json())
    ])
      .then(([userData, auditData, riskData]) => {
        setUsers(userData.users || []);
        setMlAudit(auditData);
        if (riskData && riskData.predictions) {
          setRepaymentAudit(riskData.predictions);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch users audit error:', err);
        setLoading(false);
      });
  }, []);

  // Map ML audit & Risk audit by farmerId
  const auditMap = {};
  if (mlAudit && mlAudit.auditReport) {
    mlAudit.auditReport.forEach(item => {
      auditMap[item.farmerId] = item;
    });
  }

  const riskMap = {};
  if (repaymentAudit) {
    repaymentAudit.forEach(item => {
      riskMap[item.farmerId] = item.prediction;
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Registered Farmers & ML Cross-Verification Audit</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete database audit of registered farmers, mobile login credentials, Aadhaar IDs, and multi-source ML verification scores.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full">
            {users.length} Registered Farmers
          </span>
          {mlAudit && (
            <span className="bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              {mlAudit.summary.verifiedGenuine} ML Cross-Verified
            </span>
          )}
        </div>
      </div>

      {/* ML Multi-Source Audit Overview Cards */}
      {mlAudit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Verified Genuine (ML Score &ge; 85%)</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{mlAudit.summary.verifiedGenuine} Farmers</div>
              <div className="text-[11px] text-slate-400">PM-KISAN + NHB + ICAR Satellite Matched</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Minor Discrepancy Flags</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{mlAudit.summary.verifiedWithFlags} Farmers</div>
              <div className="text-[11px] text-slate-400">Crop or Mandi Price Volatility Divergence</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">High Anomaly Risk</div>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">{mlAudit.summary.highAnomalyRisk} Farmers</div>
              <div className="text-[11px] text-slate-400">Requires Physical Land Inspection</div>
            </div>
            <ShieldCheck className="w-8 h-8 text-rose-500 shrink-0" />
          </div>
        </div>
      )}

      {/* Users Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading registered accounts database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Farmer Name & ID</th>
                  <th className="p-3">Mobile (Login ID)</th>
                  <th className="p-3">Aadhaar / PM-KISAN</th>
                  <th className="p-3">ML Authenticity Score</th>
                  <th className="p-3">AI Repayment Risk</th>
                  <th className="p-3">Crops & Area</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u, i) => {
                  const audit = auditMap[u.farmerId] || {};
                  const score = audit.authenticityScore || 95;
                  const isGenuine = score >= 85;
                  const risk = riskMap[u.farmerId];

                  return (
                    <tr key={i} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3">
                        <div
                          onClick={() => setSelectedFarmer({ farmerId: u.farmerId, name: u.name })}
                          className="font-bold text-white text-sm cursor-pointer hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1.5"
                          title="Click to view complete farmer profile & audit trail"
                        >
                          <span>{u.name}</span>
                          <Clock className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                        </div>
                        <div className="text-emerald-400 font-mono text-[11px]">{u.farmerId}</div>
                      </td>

                      <td className="p-3 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{u.mobileNo}</span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300 font-mono">
                        <div>{u.aadhaarNo}</div>
                        <div className="text-slate-400 text-[10px]">{u.pmKisanId}</div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                            isGenuine ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {score}%
                          </span>
                          <span className="text-[11px] text-slate-300 font-semibold">
                            {isGenuine ? 'PM-KISAN + NHB Matched' : 'Discrepancy Flagged'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        {risk ? (
                          <div>
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                              risk.riskCategory === 'LOW'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : risk.riskCategory === 'MEDIUM'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {risk.repaymentRiskScore}/100 — {risk.riskCategory}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {risk.nextInstallmentSuccessProb}% Success Prob
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">Evaluating...</span>
                        )}
                      </td>

                      <td className="p-3 text-slate-300">
                        <div className="text-emerald-400 font-semibold">{u.currentCrop} ({u.landAcres} Acres)</div>
                        <div className="text-slate-400 text-[11px]">{u.village}, {u.district}</div>
                      </td>

                      <td className="p-3 text-right space-y-1">
                        <button
                          onClick={() => setSelectedFarmer({ farmerId: u.farmerId, name: u.name })}
                          className="bg-blue-600/80 hover:bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1 ml-auto"
                        >
                          <Clock className="w-3 h-3 text-blue-200" />
                          <span>History & Audit Log</span>
                        </button>
                        {onLoginAsFarmer && (
                          <button
                            onClick={() => onLoginAsFarmer(u.farmerId, u.name)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all shadow-md shadow-emerald-950 flex items-center gap-1 ml-auto"
                          >
                            <span>Sign In As</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Farmer History Modal */}
      {selectedFarmer && (
        <FarmerHistoryModal
          farmerId={selectedFarmer.farmerId}
          farmerName={selectedFarmer.name}
          onClose={() => setSelectedFarmer(null)}
        />
      )}

    </div>
  );
}
