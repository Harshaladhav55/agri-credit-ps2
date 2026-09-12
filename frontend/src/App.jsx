import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import FarmerVault from './components/FarmerVault';
import FPOCommunityHub from './components/FPOCommunityHub';
import BankCreditPortal from './components/BankCreditPortal';
import MarketAnalytics from './components/MarketAnalytics';
import CreditSimulator from './components/CreditSimulator';
import AdminUsersAudit from './components/AdminUsersAudit';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  Leaf, 
  Users, 
  Landmark, 
  TrendingUp, 
  SlidersHorizontal, 
  LogOut, 
  ShieldCheck, 
  Database,
  Sun,
  Moon
} from 'lucide-react';

import { API_BASE } from './config';

export default function App() {
  // Initialize state from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agroloan_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('farmer');
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('agroloan_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [marketData, setMarketData] = useState(null);
  const [fpoData, setFpoData] = useState(null);
  const [simulatedProfile, setSimulatedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (user) {
      loadDashboardData(user.role === 'farmer' ? user.id : 'FARM-MH-8821');
    }
  }, [user?.id]);

  const loadDashboardData = async (farmerId) => {
    if (!farmerId) return;
    setLoading(true);
    try {
      const [profileRes, marketRes, fpoRes] = await Promise.all([
        fetch(`${API_BASE}/credit-profile/${farmerId}`),
        fetch(`${API_BASE}/market-intelligence`),
        fetch(`${API_BASE}/fpo/members`)
      ]);

      const profileJson = await profileRes.json();
      const marketJson = await marketRes.json();
      const fpoJson = await fpoRes.json();

      setProfile(profileJson);
      setSimulatedProfile(profileJson);
      setMarketData(marketJson);
      setFpoData(fpoJson);

      // Persist to localStorage
      localStorage.setItem('agroloan_active_profile', JSON.stringify(profileJson));
    } catch (err) {
      console.warn('API Load Warning (Operating in Offline LocalStorage Mode):', err);
      // Generate fallback local profile if server is offline
      const fallbackProfile = generateFallbackProfile(farmerId, user);
      setProfile(fallbackProfile);
      setSimulatedProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackProfile = (farmerId, userData) => {
    const name = userData?.name || 'Farmer';
    const district = userData?.district || 'Nashik';
    const state = userData?.state || 'Maharashtra';
    const village = userData?.village || 'Pimplad';
    const landAcres = parseFloat(userData?.landAcres) || 0;
    const crop = userData?.currentCrop || 'Not Specified';

    const isNewUser = userData?.pmKisanVerified === false || landAcres === 0;

    if (isNewUser) {
      return {
        farmer: {
          id: farmerId,
          name,
          village,
          district,
          state,
          landAcres: 0,
          crop,
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
        drivers: [],
        purposeAllocation: [],
        datasetsIntegrated: {
          agmarknet: { mandi: district + ' Mandi', commodity: crop, modalPrice: 0 },
          nhb: { district, crop, yieldBenchmark: 0 },
          pmKisan: { verified: false, installments: 0 },
          pmfby: { enrolled: false, sumInsured: 0 },
          icar: { healthConfidence: 0, vigor: 0 },
          kcc: { sentiment: 0, advisory: 'Pending Setup' }
        },
        challengeAnswers: []
      };
    }

    return {
      farmer: {
        id: farmerId,
        name,
        village,
        district,
        state,
        landAcres,
        crop,
        pmKisanStatus: 'Active Beneficiary',
        installments: 17
      },
      creditMetrics: {
        score: 785,
        tier: 'Tier A (Low Risk Farmer)',
        riskLevel: 'Low Risk',
        recommendedLimit: Math.round(landAcres * 45000),
        projectedGrossIncome: Math.round(landAcres * 78000),
        estimatedNetMargin: Math.round(landAcres * 48000),
        totalInputCost: Math.round(landAcres * 30000),
        maxLTVPct: 0.75
      },
      datasetsIntegrated: {
        agmarknet: { mandi: 'Lasalgaon APMC', commodity: crop, modalPrice: 2200 },
        nhb: { district, crop, yieldBenchmark: 18.0 },
        pmKisan: { verified: true, installments: 17 },
        pmfby: { enrolled: true, sumInsured: 45000 },
        icar: { healthConfidence: 94, vigor: 0.85 },
        kcc: { sentiment: 8.5, advisory: 'Optimal Weather' }
      },
      purposeAllocation: [
        { purpose: 'High-Quality Certified Seeds & Bio-Inputs', pct: 40, amount: Math.round(landAcres * 18000) },
        { purpose: 'Micro-Irrigation & Drip Sub-system', pct: 30, amount: Math.round(landAcres * 13500) },
        { purpose: 'Solar Crop Protection & Storage', pct: 20, amount: Math.round(landAcres * 9000) },
        { purpose: 'Emergency Working Capital', pct: 10, amount: Math.round(landAcres * 4500) }
      ],
      drivers: [
        { feature: 'PM-KISAN Verified Beneficiary', impact: '+85', type: 'positive', description: '17 verified direct benefit transfer installments received from Ministry of Agriculture' },
        { feature: 'Land Title & Khatuni Digitally Verified', impact: '+65', type: 'positive', description: 'State land registry ownership confirmed digitally without physical collateral paper requirement' },
        { feature: 'NHB High Horticultural Yield District', impact: '+70', type: 'positive', description: `District ${district} averages high yield benchmark according to NHB records` }
      ],
      challengeAnswers: []
    };
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setProfile(null);
    setSimulatedProfile(null);
    localStorage.setItem('agroloan_active_user', JSON.stringify(userData));
    localStorage.removeItem('agroloan_active_profile');

    // Save to user registry in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('agroloan_users') || '[]');
      const filtered = existing.filter(u => u.farmerId !== userData.id);
      filtered.unshift({
        farmerId: userData.id,
        name: userData.name,
        mobileNo: userData.mobileNo || '',
        aadhaarNo: userData.aadhaarNo || '',
        pmKisanId: userData.pmKisanId || `PM-KISAN-${userData.id}`,
        village: userData.village || '',
        district: userData.district || '',
        state: userData.state || '',
        landAcres: userData.landAcres || 0,
        currentCrop: userData.currentCrop || 'Not Specified',
        previousCrop: userData.previousCrop || 'None',
        peer1: userData.peer1 || { name: '', mobile: '' },
        peer2: userData.peer2 || { name: '', mobile: '' }
      });
      localStorage.setItem('agroloan_users', JSON.stringify(filtered));
    } catch (e) {
      console.error('LocalStorage user save error:', e);
    }

    if (userData.role === 'fpo') {
      setActiveTab('fpo');
    } else if (userData.role === 'bank') {
      setActiveTab('bank');
    } else {
      setActiveTab('farmer');
    }

    const farmerIdToFetch = userData.role === 'farmer' ? userData.id : 'FARM-MH-8821';
    loadDashboardData(farmerIdToFetch);
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setSimulatedProfile(null);
    localStorage.removeItem('agroloan_active_user');
    localStorage.removeItem('agroloan_active_profile');
  };

  const handleProfileUpdate = (updatedUser, updatedProfile) => {
    const newUserData = { ...user, ...updatedUser };
    setUser(newUserData);
    setProfile(updatedProfile);
    setSimulatedProfile(updatedProfile);

    localStorage.setItem('agroloan_active_user', JSON.stringify(newUserData));
    localStorage.setItem('agroloan_active_profile', JSON.stringify(updatedProfile));
  };

  const handleDeleteAccount = async (farmerId) => {
    try {
      await fetch(`${API_BASE}/farmer/delete-account/${farmerId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('API Delete Account Warning (Operating offline):', err);
    }

    try {
      const savedUsers = JSON.parse(localStorage.getItem('agroloan_users') || '[]');
      const filtered = savedUsers.filter(u => u.farmerId !== farmerId);
      localStorage.setItem('agroloan_users', JSON.stringify(filtered));
    } catch (e) {
      console.error('LocalStorage clean error:', e);
    }

    handleLogout();
  };

  const handleLoginAsFarmer = (farmerId, farmerName) => {
    const newUser = {
      id: farmerId,
      name: farmerName,
      role: 'farmer',
      village: 'Pimplad',
      district: 'Nashik',
      state: 'Maharashtra',
      landAcres: 3.5,
      currentCrop: 'Onion',
      previousCrop: 'Cotton',
      pmKisanVerified: true
    };
    handleLoginSuccess(newUser, 'DEMO-TOKEN');
  };

  const handleEndorsePeer = async (targetFarmerId, vouchNote) => {
    try {
      await fetch(`${API_BASE}/fpo/endorse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endorserFarmerId: user ? user.id : 'FARM-MH-8821',
          targetFarmerId,
          vouchNote
        })
      });

      const fpoRes = await fetch(`${API_BASE}/fpo/members`);
      const fpoJson = await fpoRes.json();
      setFpoData(fpoJson);
    } catch (err) {
      console.error('Endorse Error:', err);
    }
  };

  const handleSimulate = async (params) => {
    try {
      const res = await fetch(`${API_BASE}/credit-profile/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          farmerId: user && user.role === 'farmer' ? user.id : 'FARM-MH-8821'
        })
      });
      const json = await res.json();
      setSimulatedProfile(json);
    } catch (err) {
      console.warn('Simulate API Warning (Using Local Calculation):', err);
      // Fallback calculation
      const cropPrices = { Onion: 2200, Tomato: 1550, Pomegranate: 6800, Banana: 1800, Cotton: 5600 };
      const selectedPrice = cropPrices[params.crop] || 2200;
      const acres = parseFloat(params.landholding_acres) || 3.5;
      const grossRevenue = Math.round(selectedPrice * 10 * 7.28 * acres);
      const safeLimit = Math.round(grossRevenue * 0.65);

      setSimulatedProfile(prev => ({
        ...prev,
        creditMetrics: {
          ...prev?.creditMetrics,
          score: params.fpo_vouched !== false ? 815 : 690,
          recommendedLimit: safeLimit,
          projectedGrossIncome: grossRevenue
        }
      }));
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Filter Sidebar Items strictly according to User Role
  const allMenuItems = [
    { id: 'farmer', name: 'Farmer Data Vault', icon: Leaf, roles: ['farmer'] },
    { id: 'fpo', name: 'FPO Community Hub', icon: Users, roles: ['farmer', 'fpo'] },
    { id: 'bank', name: 'Bank Credit Portal', icon: Landmark, roles: ['bank'] },
    { id: 'market', name: 'Market Intelligence', icon: TrendingUp, roles: ['farmer', 'fpo', 'bank'] },
    { id: 'simulator', name: 'Credit Simulator', icon: SlidersHorizontal, roles: ['farmer', 'fpo', 'bank'] },
    { id: 'audit', name: 'Registered Accounts Audit', icon: Database, roles: ['bank'] }
  ];

  const userRole = user.role || 'farmer';
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl border shadow-xl transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 h-full border-r transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 shadow-xl flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-emerald-800 dark:text-emerald-400 uppercase font-serif">
                    AGROLOAN TRUST
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wide">
                    BUILDING TRUST
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* User Info Card in Sidebar */}
          {!isSidebarCollapsed && user && (
            <div className="m-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{user.role} Account</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{user.id}</div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={item.name}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Controls in Sidebar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {isLight ? <Moon className="w-4 h-4 text-amber-600 shrink-0" /> : <Sun className="w-4 h-4 text-amber-400 shrink-0" />}
            {!isSidebarCollapsed && <span>{isLight ? 'Dark Theme' : 'Light Theme'}</span>}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'farmer' && (
            <FarmerVault
              profile={profile}
              user={user}
              onProfileUpdate={handleProfileUpdate}
              onDeleteAccount={handleDeleteAccount}
              theme={theme}
            />
          )}

          {activeTab === 'fpo' && (
            <FPOCommunityHub
              fpoData={fpoData}
              user={user}
              onEndorsePeer={handleEndorsePeer}
              theme={theme}
            />
          )}

          {activeTab === 'bank' && (
            <BankCreditPortal
              profile={profile}
              theme={theme}
            />
          )}

          {activeTab === 'market' && (
            <MarketAnalytics
              marketData={marketData}
              theme={theme}
            />
          )}

          {activeTab === 'simulator' && (
            <CreditSimulator
              profile={simulatedProfile || profile}
              onSimulate={handleSimulate}
              theme={theme}
            />
          )}

          {activeTab === 'audit' && (
            <AdminUsersAudit
              onLoginAsFarmer={handleLoginAsFarmer}
              theme={theme}
            />
          )}
        </main>
      </div>

    </div>
  );
}
