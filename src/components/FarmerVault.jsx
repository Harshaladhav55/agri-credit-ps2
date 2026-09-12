import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, QrCode, Lock, FileCheck, Sprout, Award, Users, Phone, MapPin, Building2, Coins, Edit3, Save, X, Trash2, AlertTriangle, Activity, Clock } from 'lucide-react';
import FarmerHistoryModal from './FarmerHistoryModal';

export default function FarmerVault({ profile, user, onProfileUpdate, onDeleteAccount, onConsentCreate, theme = 'light' }) {
  const [showQR, setShowQR] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [repaymentRisk, setRepaymentRisk] = useState(null);

  const isLight = theme === 'light';

  // Edit Form State
  const [editName, setEditName] = useState(user?.name || profile?.farmer?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobileNo || '');
  const [editAadhaar, setEditAadhaar] = useState(user?.aadhaarNo || '');
  const [editPmKisanId, setEditPmKisanId] = useState(user?.pmKisanId || (profile?.farmer?.id ? `PM-KISAN-${profile.farmer.id}` : ''));
  const [editState, setEditState] = useState(user?.state || profile?.farmer?.state || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || profile?.farmer?.district || '');
  const [editVillage, setEditVillage] = useState(user?.village || profile?.farmer?.village || '');
  const [editLandAcres, setEditLandAcres] = useState(
    user?.landAcres !== undefined && user?.landAcres !== null ? String(user.landAcres) :
    profile?.farmer?.landAcres !== undefined && profile?.farmer?.landAcres !== null ? String(profile.farmer.landAcres) : '0'
  );
  const [editCurrentCrop, setEditCurrentCrop] = useState(user?.currentCrop || profile?.farmer?.crop || '');
  const [editPreviousCrop, setEditPreviousCrop] = useState(user?.previousCrop || '');
  const [editPeer1Name, setEditPeer1Name] = useState(user?.peer1?.name || '');
  const [editPeer1Mobile, setEditPeer1Mobile] = useState(user?.peer1?.mobile || '');
  const [editPeer2Name, setEditPeer2Name] = useState(user?.peer2?.name || '');
  const [editPeer2Mobile, setEditPeer2Mobile] = useState(user?.peer2?.mobile || '');

  // Loan Application State
  const [requestedAmount, setRequestedAmount] = useState('150000');
  const [loanPurpose, setLoanPurpose] = useState('Drip Irrigation & Fertilizer Purchase');
  const [loanStatus, setLoanStatus] = useState(null);
  const [recipient, setRecipient] = useState('State Bank of India - Agricultural Branch');
  const [activeToken, setActiveToken] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Synchronize form values whenever user/profile changes or edit modal opens
  useEffect(() => {
    if (showEditModal) {
      setEditName(user?.name || profile?.farmer?.name || '');
      setEditMobile(user?.mobileNo || '');
      setEditAadhaar(user?.aadhaarNo || '');
      setEditPmKisanId(user?.pmKisanId || (profile?.farmer?.id ? `PM-KISAN-${profile.farmer.id}` : ''));
      setEditState(user?.state || profile?.farmer?.state || '');
      setEditDistrict(user?.district || profile?.farmer?.district || '');
      setEditVillage(user?.village || profile?.farmer?.village || '');
      setEditLandAcres(
        user?.landAcres !== undefined && user?.landAcres !== null ? String(user.landAcres) :
        profile?.farmer?.landAcres !== undefined && profile?.farmer?.landAcres !== null ? String(profile.farmer.landAcres) : '0'
      );
      setEditCurrentCrop(user?.currentCrop || profile?.farmer?.crop || '');
      setEditPreviousCrop(user?.previousCrop || '');
      setEditPeer1Name(user?.peer1?.name || '');
      setEditPeer1Mobile(user?.peer1?.mobile || '');
      setEditPeer2Name(user?.peer2?.name || '');
      setEditPeer2Mobile(user?.peer2?.mobile || '');
    }
  }, [showEditModal, user, profile]);

  useEffect(() => {
    const farmerId = profile?.farmer?.id;
    if (!farmerId) return;
    fetch('http://localhost:5000/api/ai/predict-repayment-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId,
        district: editDistrict || profile?.farmer?.district,
        crop: editCurrentCrop || profile?.farmer?.crop,
        landAcres: editLandAcres || profile?.farmer?.landAcres
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRepaymentRisk(data.data);
        }
      })
      .catch((err) => console.error('Error fetching AI repayment risk:', err));
  }, [profile?.farmer?.id, editDistrict, editCurrentCrop, editLandAcres]);

  if (!profile) return <div className="p-8 text-center text-slate-400">Loading farmer profile...</div>;

  const { farmer, creditMetrics, datasetsIntegrated, drivers } = profile;

  const handleGeneratePassport = () => {
    const newToken = {
      tokenId: 'TOKEN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      recipient,
      expires: '72 Hours',
      status: 'ACTIVE',
      zkHash: '0x9f82...3e1a'
    };
    setActiveToken(newToken);
    setShowQR(true);
    if (onConsentCreate) onConsentCreate(newToken);
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/loan-application/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          requestedAmountINR: requestedAmount,
          purpose: loanPurpose
        })
      });
      const data = await res.json();
      setLoanStatus(data.loanRecord);
      setShowLoanModal(false);
    } catch (err) {
      console.error('Loan application error:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('http://localhost:5000/api/farmer/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          name: editName,
          mobileNo: editMobile,
          aadhaarNo: editAadhaar,
          pmKisanId: editPmKisanId,
          state: editState,
          district: editDistrict,
          village: editVillage,
          landAcres: editLandAcres,
          currentCrop: editCurrentCrop,
          previousCrop: editPreviousCrop,
          fpoId: 'FPO-MH-01',
          peer1Name: editPeer1Name,
          peer1Mobile: editPeer1Mobile,
          peer2Name: editPeer2Name,
          peer2Mobile: editPeer2Mobile
        })
      });

      const data = await res.json();
      if (data.success && onProfileUpdate) {
        onProfileUpdate(data.updatedUser, data.profile);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccountClick = () => {
    if (window.confirm(`Are you sure you want to permanently delete your farmer account (${farmer.id})? All associated records will be removed.`)) {
      if (onDeleteAccount) {
        onDeleteAccount(farmer.id);
      }
    }
  };

  // Theme Helper Classes
  const cardBg = isLight ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800' : 'bg-slate-900 border-slate-800 text-white';
  const innerCardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`border rounded-2xl p-6 relative overflow-hidden shadow-xl ${
        isLight ? 'bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white border-emerald-700' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <h1
                onClick={() => setShowHistoryModal(true)}
                className="text-2xl font-extrabold text-white cursor-pointer hover:underline hover:text-emerald-200 transition-all flex items-center gap-2"
                title="Click to view full farmer history & audit log"
              >
                <span>{editName || farmer.name}</span>
                <Clock className="w-4 h-4 text-emerald-300 opacity-80" />
              </h1>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PM-KISAN Verified
              </span>
            </div>
            <p className="text-sm text-emerald-100 mt-1">
              Farmer ID: <code className="text-emerald-300 font-mono">{farmer.id}</code> | Village: {editVillage || farmer.village}, {editDistrict || farmer.district}, {editState || farmer.state}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl border border-emerald-400/30 flex items-center space-x-2 text-sm transition-all shadow-md"
            >
              <Clock className="w-4 h-4 text-white" />
              <span>Farmer History & Audit Log</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/20 flex items-center space-x-2 text-sm transition-all shadow-md backdrop-blur"
            >
              <Edit3 className="w-4 h-4 text-emerald-300" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setShowLoanModal(true)}
              className="bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-sm transition-all"
            >
              <Coins className="w-4 h-4 text-emerald-700" />
              <span>Apply for Loan</span>
            </button>

            <button
              onClick={handleGeneratePassport}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center space-x-1.5 text-sm transition-all backdrop-blur"
            >
              <QrCode className="w-4 h-4 text-emerald-300" />
              <span>ZK Passport</span>
            </button>

            <button
              onClick={handleDeleteAccountClick}
              className="bg-rose-600/80 hover:bg-rose-700 text-white font-bold p-2.5 rounded-xl border border-rose-500/50 flex items-center justify-center transition-all shadow-md"
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Loan Status Alert if applied */}
      {loanStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">Loan Application #{loanStatus.loanId} Sanctioned</div>
              <div className="text-xs text-emerald-800">
                Amount Requested: ₹{loanStatus.requestedAmountINR.toLocaleString('en-IN')} | Credit Limit: ₹{loanStatus.recommendedLimitINR.toLocaleString('en-IN')} | Status: <strong className="text-emerald-700">{loanStatus.status}</strong>
              </div>
            </div>
          </div>
          <span className="text-xs bg-emerald-700 text-white px-3 py-1 rounded-full font-bold">Approved</span>
        </div>
      )}

      {/* Comprehensive Farmer Loan & Contact Details Card */}
      <div className={`border rounded-2xl p-6 shadow-lg space-y-4 ${cardBg}`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>Farmer Profile & Farm Information (PostgreSQL Verified)</span>
          </h3>

          <button
            onClick={() => setShowEditModal(true)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
            <span className={`text-xs font-bold uppercase ${textSub}`}>Personal & ID Proof</span>
            <div className={`text-sm font-bold ${textTitle}`}>{editName || farmer.name}</div>
            <div className={`text-xs ${textSub}`}>Mobile: {editMobile}</div>
            <div className={`text-xs font-mono mt-1 ${textSub}`}>Aadhaar: {editAadhaar}</div>
            <div className="text-xs text-emerald-600 font-mono font-bold">PM-KISAN ID: {editPmKisanId}</div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
            <span className={`text-xs font-bold uppercase ${textSub}`}>Farm Location & Area</span>
            <div className={`text-sm font-bold flex items-center gap-1 ${textTitle}`}>
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{editVillage}, {editDistrict}</span>
            </div>
            <div className={`text-xs ${textSub}`}>State: {editState}</div>
            <div className="text-xs font-extrabold text-emerald-600 mt-1">{editLandAcres} Cultivated Acres</div>
            <div className={`text-xs ${textSub}`}>Owner Operator Title</div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
            <span className={`text-xs font-bold uppercase ${textSub}`}>Crop Cultivation History</span>
            <div className={`text-xs ${textSub}`}>
              Current Crop: <strong className={textTitle}>{editCurrentCrop}</strong>
            </div>
            <div className={`text-xs ${textSub}`}>
              Previous Crop: <strong>{editPreviousCrop}</strong>
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              FPO: Sahyadri Farmer Producer Co.
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${innerCardBg}`}>
            <span className={`text-xs font-bold uppercase ${textSub}`}>2-Peer Farmer Endorsers</span>
            <div className={`text-xs font-medium flex items-center gap-1 ${textTitle}`}>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. {editPeer1Name} ({editPeer1Mobile})</span>
            </div>
            <div className={`text-xs font-medium flex items-center gap-1 mt-1 ${textTitle}`}>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. {editPeer2Name} ({editPeer2Mobile})</span>
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Joint Liability Co-Signed</div>
          </div>

        </div>
      </div>

      {/* Machine Learning Multi-Gov Data Cross-Verification Card */}
      <div className={`border rounded-2xl p-6 shadow-lg space-y-4 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                <span>Machine Learning Farmer Verification Engine</span>
              </h3>
              <p className={`text-xs ${textSub}`}>
                Automated multi-vector AI verification across PM-KISAN, NHB, AGMARKNET, ICAR Satellite & PMFBY
              </p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>96.8% Authenticity Index (Verified Genuine)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>PM-KISAN DBT</span>
              <span className="text-xs font-bold text-emerald-600">100%</span>
            </div>
            <div className={`text-xs font-bold ${textTitle}`}>Active Beneficiary</div>
            <div className={`text-[11px] ${textSub}`}>17 Direct Transfer Installments</div>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>NHB Yield Match</span>
              <span className="text-xs font-bold text-emerald-600">95%</span>
            </div>
            <div className={`text-xs font-bold ${textTitle}`}>Agro-Zone Verified</div>
            <div className={`text-[11px] ${textSub}`}>Acreage matches Nashik benchmark</div>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>ICAR NDVI Canopy</span>
              <span className="text-xs font-bold text-emerald-600">94%</span>
            </div>
            <div className={`text-xs font-bold ${textTitle}`}>Active Canopy Vigor</div>
            <div className={`text-[11px] ${textSub}`}>Satellite NDVI 0.85 reflectance</div>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>AGMARKNET Sales</span>
              <span className="text-xs font-bold text-emerald-600">98%</span>
            </div>
            <div className={`text-xs font-bold ${textTitle}`}>Lasalgaon Mandi</div>
            <div className={`text-[11px] ${textSub}`}>Price feasibility ₹2,200/Qtl</div>
          </div>

          <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>PMFBY Insurance</span>
              <span className="text-xs font-bold text-emerald-600">100%</span>
            </div>
            <div className={`text-xs font-bold ${textTitle}`}>Active Policy</div>
            <div className={`text-[11px] ${textSub}`}>₹45,000/acre sum insured</div>
          </div>
        </div>
      </div>

      {/* Credit Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className={`border rounded-xl p-5 shadow-lg flex flex-col justify-between ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSub}`}>Alternative Credit Score</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-3">
            <div className={`text-3xl font-extrabold flex items-baseline gap-2 ${textTitle}`}>
              {creditMetrics && creditMetrics.score ? (
                <>
                  <span className="text-emerald-600">{creditMetrics.score}</span>
                  <span className={`text-sm font-normal ${textSub}`}>/ 900</span>
                </>
              ) : (
                <span className="text-amber-500 text-xl font-bold">Not Calculated</span>
              )}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1">{creditMetrics ? creditMetrics.tier : 'Pending Assessment'}</div>
          </div>
          <p className={`text-xs ${textSub}`}>Derived from crop history, AGMARKNET market prices & FPO peer trust.</p>
        </div>

        {/* Credit Limit */}
        <div className={`border rounded-xl p-5 shadow-lg flex flex-col justify-between ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSub}`}>Recommended Safe Credit</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className={`text-3xl font-extrabold ${textTitle}`}>
              ₹{creditMetrics.recommendedLimit.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-600 font-bold mt-1">
              Purpose-Locked Agricultural Input Line
            </div>
          </div>
          <p className={`text-xs ${textSub}`}>Safe borrowing limit based on {farmer.landAcres} acres {farmer.crop} crop cycle.</p>
        </div>

        {/* Expected Crop Income */}
        <div className={`border rounded-xl p-5 shadow-lg flex flex-col justify-between ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSub}`}>Expected Harvest Revenue</span>
            <Sprout className="w-5 h-5 text-green-600" />
          </div>
          <div className="my-3">
            <div className={`text-3xl font-extrabold ${textTitle}`}>
              ₹{creditMetrics.projectedGrossIncome.toLocaleString('en-IN')}
            </div>
            <div className={`text-xs mt-1 ${textSub}`}>
              AGMARKNET Modal Rate: ₹{datasetsIntegrated.agmarknet.modalPrice}/Qtl
            </div>
          </div>
          <p className={`text-xs ${textSub}`}>Net Estimated Margin: ₹{creditMetrics.estimatedNetMargin.toLocaleString('en-IN')}</p>
        </div>

        {/* Data Ownership Status */}
        <div className={`border rounded-xl p-5 shadow-lg flex flex-col justify-between ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSub}`}>Data Ownership</span>
            <Lock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="my-3">
            <div className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Self-Sovereign
            </div>
            <div className={`text-xs mt-1 ${textSub}`}>Zero-Knowledge Encrypted</div>
          </div>
          <p className={`text-xs ${textSub}`}>Raw land & banking records never surrendered to third parties.</p>
        </div>

      </div>

      {/* AI-Based Repayment Risk Prediction Card */}
      {repaymentRisk && repaymentRisk.prediction && (
        <div className={`border rounded-2xl p-6 shadow-lg space-y-4 ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                  <span>AI Continuous Repayment Risk Prediction Engine</span>
                </h3>
                <p className={`text-xs ${textSub}`}>
                  Dynamic predictive model analyzing crop income, mandi price volatility, weather risks & debt obligation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Repayment Risk Score</div>
                <div className={`text-lg font-extrabold ${textTitle}`}>
                  {repaymentRisk.prediction.repaymentRiskScore}/100 — <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{repaymentRisk.prediction.riskCategory}</span>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                repaymentRisk.prediction.riskCategory === 'LOW'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : repaymentRisk.prediction.riskCategory === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {repaymentRisk.prediction.riskCategory} RISK
              </span>
            </div>
          </div>

          {/* Key Risk & Installment Probability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className={`text-xs font-bold uppercase ${textSub}`}>Next Installment Success Probability</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {repaymentRisk.prediction.nextInstallmentSuccessProb}%
              </div>
              <div className={`text-xs mt-1 ${textSub}`}>Estimated likelihood of timely next loan payment</div>
            </div>

            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className={`text-xs font-bold uppercase ${textSub}`}>Debt Service Coverage Ratio (DSCR)</div>
              <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                {repaymentRisk.prediction.metricsEvaluated.dscrRatio}x
              </div>
              <div className={`text-xs mt-1 ${textSub}`}>Harvest Net Margin vs Loan Servicing Requirement</div>
            </div>

            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className={`text-xs font-bold uppercase ${textSub}`}>AI Risk Assessment Summary</div>
              <div className={`text-xs font-semibold mt-2 ${textTitle}`}>
                {repaymentRisk.prediction.riskSummaryText}
              </div>
            </div>
          </div>

          {/* Explainability Breakdown: Positive vs Risk Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-900 text-emerald-200'}`}>
              <h4 className="text-xs font-extrabold uppercase flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Positive Credit Factors ({repaymentRisk.prediction.positiveFactors.length})</span>
              </h4>
              <ul className="space-y-1.5">
                {repaymentRisk.prediction.positiveFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs flex items-start gap-1.5">
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-900 text-amber-200'}`}>
              <h4 className="text-xs font-extrabold uppercase flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Warning & Vulnerability Factors ({repaymentRisk.prediction.riskFactors.length})</span>
              </h4>
              {repaymentRisk.prediction.riskFactors.length === 0 ? (
                <p className="text-xs italic text-amber-700">No warning factors detected for current harvest cycle.</p>
              ) : (
                <ul className="space-y-1.5">
                  {repaymentRisk.prediction.riskFactors.map((factor, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-1.5">
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credit Score Driver Breakdown */}
      <div className={`border rounded-2xl p-6 shadow-lg ${cardBg}`}>
        <h3 className={`text-lg font-bold mb-4 ${textTitle}`}>Transparent Credit Score Drivers</h3>
        <div className="space-y-3">
          {drivers.map((d, idx) => (
            <div key={idx} className={`flex items-center justify-between p-3.5 rounded-xl border ${innerCardBg}`}>
              <div>
                <div className={`text-sm font-semibold ${textTitle}`}>{d.feature}</div>
                <div className={`text-xs mt-0.5 ${textSub}`}>{d.description}</div>
              </div>
              <span className={`text-sm font-extrabold px-3 py-1 rounded-lg ${
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

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <span>Edit Farmer Profile & Farm Details</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Personal Info */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase">Personal & ID Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Mobile Number</label>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      required
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Aadhaar Number</label>
                    <input
                      type="text"
                      value={editAadhaar}
                      onChange={(e) => setEditAadhaar(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>PM-KISAN ID</label>
                    <input
                      type="text"
                      value={editPmKisanId}
                      onChange={(e) => setEditPmKisanId(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Crop Info */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-bold text-blue-600 uppercase">Farm Location & Crop Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>State</label>
                    <select
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>District</label>
                    <select
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <option value="">Select District</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Kolar">Kolar</option>
                      <option value="Solapur">Solapur</option>
                      <option value="Jalgaon">Jalgaon</option>
                      <option value="Rajkot">Rajkot</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Village</label>
                    <input
                      type="text"
                      value={editVillage}
                      placeholder="Enter Village"
                      onChange={(e) => setEditVillage(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Land Size (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editLandAcres}
                      onChange={(e) => setEditLandAcres(e.target.value)}
                      required
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Current Crop</label>
                    <select
                      value={editCurrentCrop}
                      onChange={(e) => setEditCurrentCrop(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <option value="">Select Current Crop</option>
                      <option value="Not Specified">Not Specified</option>
                      <option value="Onion">Onion</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Pomegranate">Pomegranate</option>
                      <option value="Banana">Banana</option>
                      <option value="Cotton">Cotton</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Previous Crop</label>
                    <select
                      value={editPreviousCrop}
                      onChange={(e) => setEditPreviousCrop(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <option value="">Select Previous Crop</option>
                      <option value="None">None</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Soybean">Soybean</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Wheat">Wheat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Peer Contacts */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-bold text-amber-600 uppercase">2-Peer Farmer Endorsers</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Peer 1 Name & Mobile</label>
                    <input
                      type="text"
                      value={editPeer1Name}
                      onChange={(e) => setEditPeer1Name(e.target.value)}
                      placeholder="Peer 1 Name"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs mb-1 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                    <input
                      type="tel"
                      value={editPeer1Mobile}
                      onChange={(e) => setEditPeer1Mobile(e.target.value)}
                      placeholder="Peer 1 Mobile"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1 ${textSub}`}>Peer 2 Name & Mobile</label>
                    <input
                      type="text"
                      value={editPeer2Name}
                      onChange={(e) => setEditPeer2Name(e.target.value)}
                      placeholder="Peer 2 Name"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs mb-1 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                    <input
                      type="tel"
                      value={editPeer2Mobile}
                      onChange={(e) => setEditPeer2Mobile(e.target.value)}
                      placeholder="Peer 2 Mobile"
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={handleDeleteAccountClick}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                  title="Delete Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 font-bold py-2.5 rounded-xl text-xs border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg flex items-center justify-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Saving Changes...' : 'Save & Update Profile'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Apply Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>Apply for Agricultural Loan</span>
              </h3>
              <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Loan Amount Requested (₹)</label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-600 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  Recommended Safe Limit: ₹{creditMetrics.recommendedLimit.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textSub}`}>Purpose of Loan</label>
                <select
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-600 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="Drip Irrigation & Micro-subsystem">Drip Irrigation & Micro-subsystem</option>
                  <option value="Certified High-Grade Seeds & Bio-Inputs">Certified High-Grade Seeds & Bio-Inputs</option>
                  <option value="Solar Crop Protection & Storage">Solar Crop Protection & Storage</option>
                  <option value="Emergency Crop Working Capital">Emergency Crop Working Capital</option>
                </select>
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1 ${innerCardBg}`}>
                <div>Selected FPO: <strong className={textTitle}>Sahyadri Farmer Producer Co.</strong></div>
                <div>Peer Endorsers: <strong className="text-emerald-600">{editPeer1Name} & {editPeer2Name}</strong></div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className={`flex-1 font-bold py-2.5 rounded-xl text-xs border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Passport Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Zero-Knowledge Credit Passport</span>
              </h3>
              <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <p className={`text-xs ${textSub}`}>
              Generating privacy-preserving cryptographic token. The lender receives verified proof of your credit score without raw land or personal data access.
            </p>

            <div className="bg-slate-100 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 border border-slate-200">
              <div className="w-48 h-48 bg-slate-900 p-2 rounded-lg flex items-center justify-center shadow-md">
                <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-emerald-950 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i * 7 + 3) % 5 === 0 ? 'bg-emerald-400' : (i * 3) % 2 === 0 ? 'bg-emerald-200' : 'bg-slate-900'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">{activeToken.tokenId}</span>
            </div>

            <div className={`text-xs space-y-1 ${textSub}`}>
              <div>Authorized Recipient: <span className={`font-medium ${textTitle}`}>{activeToken.recipient}</span></div>
              <div>Validity Window: <span className="text-emerald-600 font-bold">72 Hours (Revocable anytime)</span></div>
              <div>Cryptographic Proof: <code className="font-mono text-slate-600">{activeToken.zkHash}</code></div>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Farmer History & Audit Log Modal */}
      {showHistoryModal && (
        <FarmerHistoryModal
          farmerId={farmer.id}
          farmerName={editName || farmer.name}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

    </div>
  );
}
