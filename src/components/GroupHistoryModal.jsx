import React, { useState, useEffect } from 'react';
import { X, Download, ShieldCheck, Users, Award, Coins, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { generateGroupPDFReport } from '../utils/reportGenerator';

export default function GroupHistoryModal({ groupId, groupName, onClose, onSelectFarmer }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('governance'); // 'governance', 'members', 'scores', 'joint-liability', 'audit'

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/history/group/${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching group full history:', err);
        setLoading(false);
      });
  }, [groupId]);

  if (!groupId) return null;

  const handleDownloadPDF = () => {
    if (history) {
      generateGroupPDFReport(history);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                <span>{history?.groupName || groupName || 'Joint Liability Group'}</span>
              </h2>
              <span className="bg-blue-950 text-blue-300 border border-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {history?.riskTier || 'Tier A+ Joint Credit'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Group ID: <code className="text-blue-300 font-mono font-bold">{groupId}</code> | Location: {history?.village || 'Pimplad'}, {history?.district || 'Nashik'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={loading || !history}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-blue-950 disabled:opacity-50"
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
            { id: 'governance', label: '1. Group Governance & Ceiling', icon: ShieldCheck },
            { id: 'members', label: '2. Members & Sub-Limits', icon: Users },
            { id: 'scores', label: '3. Group Trust Score Trajectory', icon: Award },
            { id: 'joint-liability', label: '4. Joint Liability Events', icon: AlertTriangle },
            { id: 'audit', label: '5. Chronological Group Audit Log', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
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
            <div className="py-16 text-center text-slate-400 text-sm">Loading group full history & governance logs...</div>
          ) : !history ? (
            <div className="py-16 text-center text-rose-400 text-sm">Failed to load group record.</div>
          ) : (
            <>
              {/* TAB 1: GOVERNANCE & CEILING */}
              {activeTab === 'governance' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Group Credit Overview & Ceiling
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Group Trust Score</div>
                        <div className="text-3xl font-black text-blue-400 mt-1">{history.groupTrustScore} <span className="text-xs text-slate-400 font-normal">/ 900</span></div>
                        <div className="text-xs text-blue-300 font-bold mt-1">{history.riskTier}</div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Aggregate Loan Ceiling</div>
                        <div className="text-2xl font-black text-emerald-400 mt-1">₹{(history.totalGroupLoanCeilingINR || 0).toLocaleString('en-IN')}</div>
                        <div className="text-xs text-emerald-400 font-bold mt-1">Joint Liability Backstopped</div>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">Grace Resolution Period</div>
                        <div className="text-2xl font-black text-amber-400 mt-1">{history.gracePeriodDays} Days</div>
                        <div className="text-xs text-amber-300 font-bold mt-1">Resolution Window</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEMBERS & SUB-LIMITS */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> Current Group Members ({history.members.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Farmer Name & ID</th>
                            <th className="p-3">Landholding</th>
                            <th className="p-3">Crop</th>
                            <th className="p-3">Individual Sub-Limit</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {history.members.map((m, i) => (
                            <tr key={i} className="hover:bg-slate-900/50">
                              <td className="p-3">
                                <div className="font-bold text-white text-sm">{m.name}</div>
                                <div className="text-blue-400 font-mono text-[11px]">{m.farmerId}</div>
                              </td>
                              <td className="p-3 text-slate-300">{m.landAcres} Acres</td>
                              <td className="p-3 text-slate-300">{m.crop}</td>
                              <td className="p-3 font-bold text-emerald-400">₹{(m.individualSubLimitINR || 0).toLocaleString('en-IN')}</td>
                              <td className="p-3">
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">
                                  {m.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {onSelectFarmer && (
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onSelectFarmer(m.farmerId, m.name);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs"
                                  >
                                    View Farmer Profile
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCORES */}
              {activeTab === 'scores' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Group Trust Score Trajectory
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {history.scoreHistory.map((s, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                          <div className="text-xs text-slate-400">{s.quarter}</div>
                          <div className="text-2xl font-black text-blue-400 mt-1">{s.score} / 900</div>
                          <div className="text-xs text-slate-400 mt-1">{s.tier}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: JOINT LIABILITY EVENTS */}
              {activeTab === 'joint-liability' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Joint Liability & Guarantee Events
                    </h3>
                    <div className="space-y-3">
                      {history.jointLiabilityEvents.map((evt, i) => (
                        <div key={i} className="bg-slate-900 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center font-bold text-white">
                            <span>{evt.eventType}</span>
                            <span className="text-slate-400 text-[11px] font-mono">{evt.date}</span>
                          </div>
                          <p className="text-slate-300">{evt.details}</p>
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-1">
                            {evt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT LOG */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Chronological Group Audit Trail
                    </h3>
                    {history.auditLogs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No group audit log entries recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {history.auditLogs.map((l, i) => (
                          <div key={i} className="bg-slate-900 border-l-4 border-blue-500 p-4 rounded-r-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{l.eventType}</span>
                              <span className="text-slate-400 text-[11px] font-mono">{new Date(l.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-300">{l.details}</p>
                            {(l.previousValue || l.newValue) && (
                              <div className="text-[11px] text-slate-400 pt-1">
                                Change: <span className="line-through text-slate-500">{l.previousValue || 'N/A'}</span> → <strong className="text-blue-400">{l.newValue}</strong>
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
            AgriTrust Community Guarantee Protocol • Immutable Audit Record
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all"
          >
            Close Group Profile
          </button>
        </div>

      </div>
    </div>
  );
}
