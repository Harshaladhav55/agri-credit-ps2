import React, { useState, useEffect } from 'react';
import { X, Download, ShieldCheck, CheckCircle2, AlertTriangle, FileText, User, Sprout, Award, Coins, Calendar, Activity, Clock, Layers, Users } from 'lucide-react';
import { generateFarmerPDFReport } from '../utils/reportGenerator';
import { API_BASE } from '../config';

export default function FarmerHistoryModal({ farmerId, farmerName, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'credit', 'loans', 'risk', 'group', 'audit'

  useEffect(() => {
    if (!farmerId) return;
    setLoading(true);
    fetch(`${API_BASE}/history/farmer/${farmerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching farmer full history:', err);
        setLoading(false);
      });
  }, [farmerId]);

  if (!farmerId) return null;

  const handleDownloadPDF = () => {
    if (history) {
      generateFarmerPDFReport(history);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-slate-900 p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-emerald-400" />
                <span>{history?.personalDetails?.name || farmerName || 'Farmer Profile'}</span>
              </h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PM-KISAN Verified
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Farmer ID: <code className="text-emerald-300 font-mono font-bold">{farmerId}</code> | District: {history?.personalDetails?.district || 'Nashik'}, {history?.personalDetails?.state || 'Maharashtra'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={loading || !history}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Report (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-2 bg-slate-950 p-3 border-b border-slate-800 shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: '1. Personal & Farm', icon: User },
            { id: 'credit', label: '2. Credit Scores & Verification', icon: Award },
            { id: 'loans', label: '3. Loans & Repayments', icon: Coins },
            { id: 'risk', label: '4. AI Risk Predictions', icon: Activity },
            { id: 'group', label: '5. Group & Joint Credit', icon: Users },
            { id: 'audit', label: '6. Chronological Audit Trail', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading farmer full historical profile...</div>
          ) : !history ? (
            <div className="py-16 text-center text-rose-400 text-sm">Failed to load farmer record.</div>
          ) : (
            <>
              {/* TAB 1: PERSONAL & FARM */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Personal & Identification Proofs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">Farmer Name</div>
                        <div className="text-white font-bold text-sm mt-0.5">{history.personalDetails.name}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">Mobile Number</div>
                        <div className="text-white font-bold text-sm mt-0.5">{history.personalDetails.mobileNo}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">Aadhaar Number</div>
                        <div className="text-emerald-400 font-mono font-bold mt-0.5">{history.personalDetails.aadhaarNo}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">PM-KISAN Registry ID</div>
                        <div className="text-emerald-400 font-mono font-bold mt-0.5">{history.personalDetails.pmKisanId}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">Location / Village</div>
                        <div className="text-white font-bold mt-0.5">{history.personalDetails.village}, {history.personalDetails.district}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 font-semibold">FPO Membership</div>
                        <div className="text-blue-400 font-bold mt-0.5">{history.personalDetails.fpoName}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Sprout className="w-4 h-4" /> Farm Land & Agronomic Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400">Landholding Area</div>
                        <div className="text-emerald-400 font-extrabold text-base mt-0.5">{history.farmLandDetails.landAcres} Cultivated Acres</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400">Land Title Status</div>
                        <div className="text-white font-semibold mt-0.5">{history.farmLandDetails.ownershipStatus}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400">Soil Health Test</div>
                        <div className="text-white font-semibold mt-0.5">{history.farmLandDetails.soilHealthCard}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400">Irrigation Network</div>
                        <div className="text-white font-semibold mt-0.5">{history.farmLandDetails.irrigationSource}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT & VERIFICATION */}
              {activeTab === 'credit' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Alternative Credit Score & Verification Records
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Current Credit Score</div>
                        <div className="text-3xl font-black text-emerald-400 mt-1">{history.creditScoreRecords.currentScore} <span className="text-xs text-slate-400 font-normal">/ 900</span></div>
                        <div className="text-xs text-emerald-400 font-bold mt-1">{history.creditScoreRecords.tier}</div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">ML Authenticity Score</div>
                        <div className="text-3xl font-black text-purple-400 mt-1">{history.verificationRecords.authenticityScore}%</div>
                        <div className="text-xs text-purple-300 font-bold mt-1">Multi-Gov Cross-Verified</div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">PM-KISAN DBT Record</div>
                        <div className="text-2xl font-extrabold text-white mt-1">{history.verificationRecords.installmentsReceived} Installments</div>
                        <div className="text-xs text-emerald-400 font-bold mt-1">{history.verificationRecords.pmKisanStatus}</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-300">Historical Credit Score Trajectory</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {history.creditScoreRecords.scoreHistory.map((s, idx) => (
                          <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-center">
                            <div className="text-slate-400">{s.quarter}</div>
                            <div className="text-lg font-bold text-emerald-400 mt-0.5">{s.score}</div>
                            <div className="text-[10px] text-slate-500">{s.tier}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOANS & REPAYMENTS */}
              {activeTab === 'loans' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Active & Previous Loan Records
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Loan ID</th>
                            <th className="p-3">Lender Institution</th>
                            <th className="p-3">Loan Type / Purpose</th>
                            <th className="p-3">Sanctioned Amount</th>
                            <th className="p-3">Repayment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {history.loanRecords.map((l, i) => (
                            <tr key={i} className="hover:bg-slate-900/50">
                              <td className="p-3 font-mono font-bold text-emerald-400">{l.loanId}</td>
                              <td className="p-3 font-medium text-white">{l.lender}</td>
                              <td className="p-3 text-slate-300">{l.loanType}</td>
                              <td className="p-3 font-extrabold text-white">₹{l.principalINR.toLocaleString('en-IN')}</td>
                              <td className="p-3">
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-md font-bold">
                                  {l.repaymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI RISK PREDICTIONS */}
              {activeTab === 'risk' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> AI Repayment Risk Predictions & DSCR
                      </h3>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
                        {history.aiRiskAssessment.repaymentRiskScore}/100 — {history.aiRiskAssessment.riskCategory} RISK
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Next Installment Success Probability</div>
                        <div className="text-3xl font-black text-emerald-400 mt-1">{history.aiRiskAssessment.nextInstallmentSuccessProb}%</div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Debt Service Coverage (DSCR) Ratio</div>
                        <div className="text-3xl font-black text-indigo-400 mt-1">{history.repaymentHistory.dscrRatio}x</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-emerald-300 uppercase">Positive Credit Factors (✓)</div>
                        <ul className="space-y-1 text-xs text-emerald-200">
                          {history.aiRiskAssessment.positiveFactors.map((pf, i) => (
                            <li key={i}>{pf}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-950/40 border border-amber-800 p-4 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-amber-300 uppercase">Risk Warning Factors (⚠)</div>
                        {history.aiRiskAssessment.riskFactors.length === 0 ? (
                          <p className="text-xs text-amber-400 italic">No warning risk factors detected.</p>
                        ) : (
                          <ul className="space-y-1 text-xs text-amber-200">
                            {history.aiRiskAssessment.riskFactors.map((rf, i) => (
                              <li key={i}>{rf}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: GROUP HISTORY */}
              {activeTab === 'group' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> Joint Liability Group (JLG) Memberships
                    </h3>
                    {history.associatedGroups.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Farmer is currently not enrolled in a Joint Liability Group.</p>
                    ) : (
                      <div className="space-y-3">
                        {history.associatedGroups.map((grp, i) => (
                          <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white text-sm">{grp.groupName}</div>
                              <div className="text-xs text-slate-400 mt-0.5">Group ID: <code className="text-blue-400 font-mono">{grp.groupId}</code></div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-extrabold text-emerald-400">Trust Score: {grp.groupTrustScore} / 900</div>
                              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                                {grp.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: CHRONOLOGICAL AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Chronological System Audit Log
                    </h3>
                    {history.auditLogs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No chronological audit entries found.</p>
                    ) : (
                      <div className="space-y-3">
                        {history.auditLogs.map((l, i) => (
                          <div key={i} className="bg-slate-900 border-l-4 border-emerald-500 p-4 rounded-r-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{l.eventType}</span>
                              <span className="text-slate-400 text-[11px] font-mono">{new Date(l.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-300">{l.details}</p>
                            {(l.previousValue || l.newValue) && (
                              <div className="text-[11px] text-slate-400 pt-1">
                                Change: <span className="line-through text-slate-500">{l.previousValue || 'N/A'}</span> → <strong className="text-emerald-400">{l.newValue}</strong>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 font-semibold pt-0.5">By: {l.performedBy}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500">
            AgriTrust Protocol • Immutable Historical Audit Log Record
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
