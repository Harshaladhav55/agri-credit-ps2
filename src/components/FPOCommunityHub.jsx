import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, HeartHandshake, TrendingUp, DollarSign, CheckCircle2, AlertTriangle, Plus, RefreshCw, Award, Scale, ArrowRight, Clock, ShieldAlert, AlertCircle, Trash2 } from 'lucide-react';
import FarmerHistoryModal from './FarmerHistoryModal';
import GroupHistoryModal from './GroupHistoryModal';

export default function FPOCommunityHub({ fpoData, onEndorsePeer, theme = 'light' }) {
  const [activeTab, setActiveTab] = useState('vouching'); // 'vouching' or 'jlgGroups'
  const [selectedMember, setSelectedMember] = useState(null);
  const [vouchReason, setVouchReason] = useState('Known honest producer with consistent 5-year onion harvest track record in Pimplad village.');

  // History Modal States
  const [historyFarmer, setHistoryFarmer] = useState(null);
  const [historyGroup, setHistoryGroup] = useState(null);

  // JLG Group Credit State
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState('');

  // Group Builder Form
  const [newGroupName, setNewGroupName] = useState('Pimplad Horticulture Joint Credit Group');
  const [selectedMemberIds, setSelectedMemberIds] = useState(['FARM-MH-8821', 'FARM-MH-9103', 'FARM-KA-4419']);
  const [gracePeriodDays, setGracePeriodDays] = useState(30);

  // Default Resolution Simulation
  const [simulatingDefault, setSimulatingDefault] = useState(false);
  const [defaultResolutionData, setDefaultResolutionData] = useState(null);

  const isLight = theme === 'light';

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch('http://localhost:5000/api/group-credit/list-groups');
      const data = await res.json();
      if (data.success && data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        if (!selectedGroup) {
          setSelectedGroup(data.groups[0]);
        }
      } else {
        // Fallback default initial group if backend is offline
        const initialDefaultGroup = computeLocalGroupScore(['FARM-MH-8821', 'FARM-MH-9103', 'FARM-KA-4419'], 'Sahyadri Onion Growers Joint Liability Group', 30);
        setGroups([initialDefaultGroup]);
        setSelectedGroup(initialDefaultGroup);
      }
    } catch (err) {
      console.warn('Fetch groups offline fallback:', err);
      const initialDefaultGroup = computeLocalGroupScore(['FARM-MH-8821', 'FARM-MH-9103', 'FARM-KA-4419'], 'Sahyadri Onion Growers Joint Liability Group', 30);
      setGroups([initialDefaultGroup]);
      setSelectedGroup(initialDefaultGroup);
    } finally {
      setLoadingGroups(false);
    }
  };

  if (!fpoData) return <div className="p-8 text-center text-slate-400">Loading FPO community network...</div>;

  const { fpoName, totalMembers, pooledRiskFundINR, members } = fpoData;

  // Local Group Score Calculator for Instant Preview & Offline Support
  const computeLocalGroupScore = (memberIds, groupName, graceDays) => {
    const selectedMembers = members.filter(m => memberIds.includes(m.farmerId));
    const memberProfiles = (selectedMembers.length > 0 ? selectedMembers : members.slice(0, 3)).map(m => ({
      farmerId: m.farmerId,
      name: m.name,
      individualScore: 740 + (m.farmerId.charCodeAt(m.farmerId.length - 1) % 75),
      landAcres: m.landAcres || 3.0,
      crop: 'Onion',
      individualRecommendedLimit: Math.round((m.landAcres || 3.0) * 45000),
      pmKisanVerified: true,
      khatuniVerified: true,
      verificationStatus: 'PM-KISAN Verified',
      repaymentStatus: 'ON_TIME'
    }));

    const scores = memberProfiles.map(m => m.individualScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    const groupTrustScore = Math.round((0.60 * avgScore) + (0.40 * minScore));
    const totalIndividual = memberProfiles.reduce((sum, m) => sum + m.individualRecommendedLimit, 0);
    const totalGroupLoanCeilingINR = Math.round(totalIndividual * 1.15);

    const totalLand = memberProfiles.reduce((sum, m) => sum + m.landAcres, 0);
    const membersWithSubLimits = memberProfiles.map(m => {
      const weight = (0.5 * (m.landAcres / totalLand)) + (0.5 * (m.individualScore / (avgScore * memberProfiles.length)));
      return {
        ...m,
        subLimitINR: Math.round(totalGroupLoanCeilingINR * weight)
      };
    });

    return {
      groupId: `JLG-MH-2026-${Math.floor(10 + Math.random() * 90)}`,
      groupName: groupName || `Joint Liability Group (${memberProfiles.length} Members)`,
      village: 'Pimplad',
      district: 'Nashik',
      state: 'Maharashtra',
      createdAt: new Date().toISOString().split('T')[0],
      membersCount: memberProfiles.length,
      members: membersWithSubLimits,
      groupMetrics: {
        groupTrustScore,
        averageMemberScore: avgScore,
        weakestLinkScore: minScore,
        highestMemberScore: maxScore,
        verificationCoveragePct: 100,
        totalGroupLoanCeilingINR,
        riskTier: groupTrustScore >= 800 ? 'Tier A+ (Prime Joint Credit)' : 'Tier A (Low Risk Joint Credit)',
        jointLiabilityStatus: 'ACTIVE_HEALTHY',
        gracePeriodDays: graceDays || 30,
        fpoRiskReserveBackstopINR: Math.round(totalGroupLoanCeilingINR * 0.25)
      },
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          event: 'Joint Liability Group Created & Approved',
          status: 'ACTIVE'
        }
      ]
    };
  };

  // Preview score calculation inside modal
  const modalPreview = computeLocalGroupScore(selectedMemberIds, newGroupName, gracePeriodDays);

  const handleVouchSubmit = () => {
    if (onEndorsePeer && selectedMember) {
      onEndorsePeer(selectedMember.farmerId, vouchReason);
      setSelectedMember(null);
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    if (e) e.preventDefault();
    setCreatingGroup(true);
    setCreateGroupError('');

    if (selectedMemberIds.length < 3 || selectedMemberIds.length > 10) {
      setCreateGroupError('A Joint Liability Group must consist of 3 to 10 member farmers.');
      setCreatingGroup(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/group-credit/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: newGroupName,
          memberIds: selectedMemberIds,
          village: 'Pimplad',
          district: 'Nashik',
          state: 'Maharashtra',
          gracePeriodDays
        })
      });

      const data = await res.json();
      if (data.success && data.group) {
        setGroups(prev => [data.group, ...prev]);
        setSelectedGroup(data.group);
        setShowCreateGroupModal(false);
      } else {
        // Fallback local group creation
        const localGroup = computeLocalGroupScore(selectedMemberIds, newGroupName, gracePeriodDays);
        setGroups(prev => [localGroup, ...prev]);
        setSelectedGroup(localGroup);
        setShowCreateGroupModal(false);
      }
    } catch (err) {
      console.warn('API Error (Creating group locally):', err);
      const localGroup = computeLocalGroupScore(selectedMemberIds, newGroupName, gracePeriodDays);
      setGroups(prev => [localGroup, ...prev]);
      setSelectedGroup(localGroup);
      setShowCreateGroupModal(false);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm(`Are you sure you want to delete Joint Liability Group "${selectedGroup?.groupName}" (${groupId})?`)) {
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/group-credit/delete-group/${groupId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('API Delete Error (Deleting group locally):', err);
    }

    const updated = groups.filter(g => g.groupId !== groupId);
    setGroups(updated);
    if (updated.length > 0) {
      setSelectedGroup(updated[0]);
    } else {
      setSelectedGroup(null);
    }
    setDefaultResolutionData(null);
  };

  const handleTriggerDefaultSimulation = async (defaultingFarmerId) => {
    if (!selectedGroup) return;
    setSimulatingDefault(true);
    try {
      const res = await fetch('http://localhost:5000/api/group-credit/trigger-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup.groupId,
          defaultingMemberId: defaultingFarmerId,
          gracePeriodDays: selectedGroup.groupMetrics.gracePeriodDays || 30
        })
      });

      const data = await res.json();
      if (data.success && data.resolution) {
        setDefaultResolutionData(data.resolution);
        setSelectedGroup(data.resolution.group);
        fetchGroups();
      } else {
        // Local simulation fallback
        triggerLocalDefaultSimulation(defaultingFarmerId);
      }
    } catch (err) {
      console.warn('Trigger default error (Using local simulation):', err);
      triggerLocalDefaultSimulation(defaultingFarmerId);
    } finally {
      setSimulatingDefault(false);
    }
  };

  const triggerLocalDefaultSimulation = (defaultingFarmerId) => {
    if (!selectedGroup) return;
    const updatedMembers = selectedGroup.members.map(m => {
      if (m.farmerId === defaultingFarmerId) {
        return { ...m, repaymentStatus: 'DEFAULT_WARNING' };
      }
      return m;
    });

    const previousScore = selectedGroup.groupMetrics.groupTrustScore;
    const newScore = Math.max(350, previousScore - 85);
    const coveredAmount = 35000;

    const updatedGroup = {
      ...selectedGroup,
      members: updatedMembers,
      groupMetrics: {
        ...selectedGroup.groupMetrics,
        groupTrustScore: newScore,
        riskTier: 'Tier B (Moderate Risk - Active Guarantee Resolution)',
        jointLiabilityStatus: 'GUARANTEE_TRIGGERED'
      }
    };

    setSelectedGroup(updatedGroup);
    setDefaultResolutionData({
      group: updatedGroup,
      defaultingMember: selectedGroup.members.find(m => m.farmerId === defaultingFarmerId),
      amountCoveredByGuaranteeINR: coveredAmount,
      newGroupTrustScore: newScore,
      previousGroupTrustScore: previousScore,
      gracePeriodDays: selectedGroup.groupMetrics.gracePeriodDays || 30
    });
  };

  const toggleMemberSelection = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length <= 3) return; // Maintain min 3
      setSelectedMemberIds(selectedMemberIds.filter(m => m !== id));
    } else {
      if (selectedMemberIds.length >= 10) return; // Max 10
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const cardBg = isLight ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800' : 'bg-slate-900 border-slate-800 text-white';
  const innerCardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      
      {/* FPO Header */}
      <div className={`border rounded-2xl p-6 relative overflow-hidden shadow-xl ${
        isLight ? 'bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white border-emerald-700' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white">{fpoName}</h1>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                NABARD & SFAC Registered FPO
              </span>
            </div>
            <p className="text-sm text-emerald-100 mt-1">
              Community-Owned Digital Credit Network & Joint Liability Group (JLG) Hub
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-xs text-emerald-200 block uppercase font-bold">Pooled Risk Guarantee Fund</span>
              <span className="text-2xl font-extrabold text-emerald-300">₹{(pooledRiskFundINR / 100000).toFixed(2)} Lakhs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className={`border p-5 rounded-2xl flex items-center justify-between shadow-lg ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase ${textSub}`}>Active FPO Farmer Members</div>
            <div className={`text-3xl font-extrabold mt-1 ${textTitle}`}>{totalMembers}</div>
            <div className="text-xs text-emerald-600 font-bold mt-1">100% PM-KISAN & Title Verified</div>
          </div>
          <Users className="w-8 h-8 text-emerald-600 shrink-0" />
        </div>

        <div className={`border p-5 rounded-2xl flex items-center justify-between shadow-lg ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase ${textSub}`}>Joint Liability Default Rate</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">0.42%</div>
            <div className={`text-xs mt-1 ${textSub}`}>vs 8.5% regional banking baseline</div>
          </div>
          <Shield className="w-8 h-8 text-blue-500 shrink-0" />
        </div>

        <div className={`border p-5 rounded-2xl flex items-center justify-between shadow-lg ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase ${textSub}`}>Active Joint Credit Groups</div>
            <div className="text-3xl font-extrabold text-amber-500 mt-1">{groups.length} JLGs</div>
            <div className={`text-xs mt-1 ${textSub}`}>3–10 Farmers per Joint Group</div>
          </div>
          <Users className="w-8 h-8 text-amber-500 shrink-0" />
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('vouching')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'vouching'
              ? 'bg-emerald-600 text-white shadow-md'
              : isLight ? 'bg-white text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Peer Endorsement Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('jlgGroups')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'jlgGroups'
              ? 'bg-emerald-600 text-white shadow-md'
              : isLight ? 'bg-white text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community Joint Credit / Group Loans</span>
        </button>
      </div>

      {activeTab === 'vouching' ? (
        /* Member Peer Endorsement Roster */
        <div className={`border rounded-2xl p-6 shadow-lg space-y-4 ${cardBg}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Community Peer Endorsement & Vouch Roster</span>
              </h3>
              <p className={`text-xs mt-0.5 ${textSub}`}>
                Farmers co-signing peer trust profiles to unlock better credit limits without formal collateral.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {members.map((m) => (
              <div key={m.farmerId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-base ${textTitle}`}>{m.name}</span>
                    <span className={`text-xs ${textSub}`}>({m.farmerId})</span>
                  </div>
                  <div className={`text-xs mt-1 ${textSub}`}>
                    District: {m.district} | Land: {m.landAcres} Acres | Risk Reserve Contribution: {m.riskContribution}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {m.endorsedByPeers} Peer Endorsements
                    </span>
                    <span className={`text-xs ${textSub}`}>Joint Liability Group Verified</span>
                  </div>

                  <button
                    onClick={() => setSelectedMember(m)}
                    className="bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Vouch & Endorse</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Joint Liability Group Loans (JLG) Feature Manager */
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${textTitle}`}>Joint Liability Group (JLG) Credit Manager</h2>
              <p className={`text-xs ${textSub}`}>
                Separate **Group Trust Score** engine for 3–10 member farmer groups with sub-limit allocation & joint risk guarantees.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCreateGroupModal(true);
                setCreateGroupError('');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center space-x-2 transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Form New JLG Credit Group (3–10 Farmers)</span>
            </button>
          </div>

          {/* Group Roster Selector */}
          {groups.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {groups.map((g) => (
                <button
                  key={g.groupId}
                  onClick={() => setSelectedGroup(g)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                    selectedGroup?.groupId === g.groupId
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{g.groupName} ({g.membersCount} Members)</span>
                  <span className="text-[10px] opacity-80 font-mono">({g.groupMetrics.groupTrustScore} Pts)</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Group Details & Metrics */}
          {selectedGroup ? (
            <div className={`border rounded-2xl p-6 shadow-lg space-y-6 ${cardBg}`}>
              
              {/* Group Overview Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className={`text-xl font-bold ${textTitle}`}>{selectedGroup.groupName}</h3>
                    <span className="text-xs font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 font-bold">
                      {selectedGroup.groupId}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${textSub}`}>
                    Location: {selectedGroup.village}, {selectedGroup.district}, {selectedGroup.state} | Formed: {selectedGroup.createdAt}
                  </p>
                </div>

                {/* Group Trust Score & Delete Group Button */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setHistoryGroup({ groupId: selectedGroup.groupId, name: selectedGroup.groupName })}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
                  >
                    <Clock className="w-4 h-4 text-white" />
                    <span>Group History & Audit Log</span>
                  </button>

                  <div className="text-right">
                    <span className={`text-xs font-semibold uppercase ${textSub}`}>Group Trust Score</span>
                    <div className="text-3xl font-black text-emerald-600">
                      {selectedGroup.groupMetrics.groupTrustScore} <span className={`text-xs font-normal ${textSub}`}>/ 900</span>
                    </div>
                    <div className="text-xs text-emerald-600 font-bold">{selectedGroup.groupMetrics.riskTier}</div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteGroup(selectedGroup.groupId)}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-center"
                    title="Delete this Joint Liability Group"
                  >
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </button>
                </div>
              </div>

              {/* Group Financial Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
                  <span className={`text-xs font-bold uppercase ${textSub}`}>Total Group Loan Ceiling</span>
                  <div className={`text-2xl font-extrabold ${textTitle}`}>
                    ₹{selectedGroup.groupMetrics.totalGroupLoanCeilingINR.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-600 font-bold">15% Joint Credit Boost</div>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
                  <span className={`text-xs font-bold uppercase ${textSub}`}>Weakest Member Score Penalty</span>
                  <div className="text-2xl font-extrabold text-amber-500">
                    {selectedGroup.groupMetrics.weakestLinkScore} Pts
                  </div>
                  <div className={`text-xs ${textSub}`}>Group Avg: {selectedGroup.groupMetrics.averageMemberScore} Pts</div>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
                  <span className={`text-xs font-bold uppercase ${textSub}`}>FPO Risk Reserve Guarantee</span>
                  <div className="text-2xl font-extrabold text-blue-600">
                    ₹{selectedGroup.groupMetrics.fpoRiskReserveBackstopINR.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs ${textSub}`}>25% Collective Backstop</div>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
                  <span className={`text-xs font-bold uppercase ${textSub}`}>Joint Guarantee Status</span>
                  <div className={`text-sm font-extrabold ${
                    selectedGroup.groupMetrics.jointLiabilityStatus === 'ACTIVE_HEALTHY' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {selectedGroup.groupMetrics.jointLiabilityStatus}
                  </div>
                  <div className={`text-xs ${textSub}`}>Grace Period: {selectedGroup.groupMetrics.gracePeriodDays} Days</div>
                </div>

              </div>

              {/* Member Sub-Limits Allocation Table */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-extrabold flex items-center gap-2 ${textTitle}`}>
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Individual Member Sub-Limit Allocations ({selectedGroup.membersCount} Farmers)</span>
                  </h4>
                  <span className={`text-xs ${textSub}`}>
                    Individual scores remain completely separate from Group Trust Score.
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`uppercase font-bold border-b ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      <tr>
                        <th className="p-3">Farmer Name & ID</th>
                        <th className="p-3">Individual Score (Separate)</th>
                        <th className="p-3">Cultivated Land</th>
                        <th className="p-3">Allocated Sub-Limit (INR)</th>
                        <th className="p-3">Repayment Status</th>
                        <th className="p-3 text-right">Joint Guarantee Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {selectedGroup.members.map((m) => (
                        <tr key={m.farmerId} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                          <td className="p-3">
                            <div className={`font-bold text-sm ${textTitle}`}>{m.name}</div>
                            <div className={`text-xs font-mono ${textSub}`}>{m.farmerId}</div>
                          </td>

                          <td className="p-3">
                            <span className="font-extrabold text-emerald-600 text-sm bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                              {m.individualScore} Pts
                            </span>
                          </td>

                          <td className={`p-3 font-semibold ${textTitle}`}>
                            {m.landAcres} Acres ({m.crop})
                          </td>

                          <td className="p-3">
                            <div className="font-black text-sm text-emerald-600">
                              ₹{m.subLimitINR.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              m.repaymentStatus === 'ON_TIME'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}>
                              {m.repaymentStatus === 'ON_TIME' ? 'On-Time Clean Repayer' : 'Repayment Warning'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleTriggerDefaultSimulation(m.farmerId)}
                              disabled={simulatingDefault}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Simulate Delay & Trigger Guarantee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Default Resolution Event Log Panel if triggered */}
              {defaultResolutionData && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Joint Liability Mechanism Activated
                    </span>
                    <span className="font-mono text-rose-700 dark:text-rose-300 font-bold">
                      Grace Period: {defaultResolutionData.gracePeriodDays} Days
                    </span>
                  </div>
                  <p className="text-rose-700 dark:text-rose-300">
                    Repayment delay logged for <strong>{defaultResolutionData.defaultingMember?.name}</strong>. Drawn <strong>₹{defaultResolutionData.amountCoveredByGuaranteeINR.toLocaleString('en-IN')}</strong> from FPO Pooled Guarantee Reserve. Group Trust Score adjusted from {defaultResolutionData.previousGroupTrustScore} Pts to <strong>{defaultResolutionData.newGroupTrustScore} Pts</strong>.
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className={`p-12 text-center rounded-2xl border ${cardBg}`}>
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className={`text-base font-bold ${textTitle}`}>No Active Joint Liability Groups</h3>
              <p className={`text-xs ${textSub} mt-1`}>Click "Form New JLG Credit Group" to build a 3–10 farmer joint credit group.</p>
            </div>
          )}

        </div>
      )}

      {/* Vouch Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border ${cardBg}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <span>Endorse Peer: {selectedMember.name}</span>
              </h3>
              <button onClick={() => setSelectedMember(null)} className={`text-sm ${textSub}`}>✕</button>
            </div>

            <p className={`text-xs ${textSub}`}>
              By endorsing this peer farmer, you confirm your personal trust in their crop production integrity. Your endorsement boosts their credit score by up to <strong>+95 points</strong>.
            </p>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Community Vouch Justification</label>
              <textarea
                value={vouchReason}
                onChange={(e) => setVouchReason(e.target.value)}
                rows={3}
                className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-all ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Backstop Coverage: {selectedMember.name} is covered by the ₹42.5 Lakh FPO Collective Guarantee Fund.</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedMember(null)}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs border ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleVouchSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                Confirm Endorsement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form New JLG Credit Group Modal (3-10 Farmers) */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border ${cardBg}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Form New Joint Liability Group (3–10 Farmers)</span>
              </h3>
              <button onClick={() => setShowCreateGroupModal(false)} className={`text-sm ${textSub}`}>✕</button>
            </div>

            {createGroupError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{createGroupError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  placeholder="e.g. Nashik Horticulture Growers Group"
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                  Select Member Farmers ({selectedMemberIds.length} Selected - Min 3, Max 10)
                </label>
                <div className="max-h-44 overflow-y-auto border rounded-xl p-3 space-y-2 dark:border-slate-800">
                  {members.map((m) => (
                    <label key={m.farmerId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950/50 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(m.farmerId)}
                          onChange={() => toggleMemberSelection(m.farmerId)}
                          className="accent-emerald-600 rounded"
                        />
                        <span className={`text-xs font-semibold ${textTitle}`}>{m.name}</span>
                        <span className={`text-[11px] ${textSub}`}>({m.farmerId})</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{m.landAcres} Acres</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>
                  Configurable Joint Liability Grace Period (Days)
                </label>
                <select
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(parseInt(e.target.value))}
                  className={`w-full border rounded-xl p-2.5 text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value={15}>15 Days Grace Resolution Period</option>
                  <option value={30}>30 Days Grace Resolution Period</option>
                  <option value={45}>45 Days Grace Resolution Period</option>
                </select>
              </div>

              {/* Instant Calculated Score Preview Box */}
              <div className={`p-4 rounded-xl border space-y-2 ${innerCardBg}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold uppercase ${textSub}`}>Live Calculated Group Trust Score Preview</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {modalPreview.groupMetrics.groupTrustScore} <span className="text-xs font-normal text-slate-400">/ 900</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Weakest Member Score Penalty: <strong className="text-amber-500">{modalPreview.groupMetrics.weakestLinkScore} Pts</strong></span>
                  <span>Eligible Group Ceiling: <strong className="text-emerald-600">₹{modalPreview.groupMetrics.totalGroupLoanCeilingINR.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className={`flex-1 font-bold py-2.5 rounded-xl text-xs border ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${creatingGroup ? 'animate-spin' : ''}`} />
                  <span>{creatingGroup ? 'Calculating Score...' : 'Create JLG Group & Calculate Score'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History & Audit Log Modals */}
      {historyFarmer && (
        <FarmerHistoryModal
          farmerId={historyFarmer.farmerId}
          farmerName={historyFarmer.name}
          onClose={() => setHistoryFarmer(null)}
        />
      )}

      {historyGroup && (
        <GroupHistoryModal
          groupId={historyGroup.groupId}
          groupName={historyGroup.name}
          onClose={() => setHistoryGroup(null)}
          onSelectFarmer={(farmerId, name) => setHistoryFarmer({ farmerId, name })}
        />
      )}

    </div>
  );
}
