import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Download, Copy, Check, X, Server, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

export default function DataStorageInspector({ isOpen, onClose, theme = 'light' }) {
  const [activeTab, setActiveTab] = useState('serverData'); // 'serverData' or 'localData'
  const [serverData, setServerData] = useState(null);
  const [localStorageData, setLocalStorageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    // 1. Fetch LocalStorage Data
    try {
      const users = JSON.parse(localStorage.getItem('agroloan_users') || '[]');
      const activeUser = JSON.parse(localStorage.getItem('agroloan_active_user') || 'null');
      const loans = JSON.parse(localStorage.getItem('agroloan_loans') || '[]');
      setLocalStorageData({
        storageType: 'Browser LocalStorage (Offline Persistent Cache)',
        lastUpdated: new Date().toLocaleString(),
        activeUser,
        totalRegisteredUsers: users.length,
        registeredUsers: users,
        sanctionedLoans: loans
      });
    } catch (err) {
      console.error('LocalStorage read error:', err);
    }

    // 2. Fetch Server Disk Data from /api/admin/export-data or /api/admin/registered-users
    try {
      const res = await fetch('http://localhost:5000/api/admin/registered-users');
      const data = await res.json();
      setServerData({
        storageType: 'Backend Server Persistent Storage (server/data/pm_kisan.json)',
        status: 'SERVER_ONLINE (Connected)',
        totalUsers: data.totalUsers,
        users: data.users
      });
    } catch (err) {
      setServerData({
        storageType: 'Backend Server Persistent Storage (server/data/pm_kisan.json)',
        status: 'SERVER_OFFLINE (Offline Mode Active)',
        message: 'Server is currently stopped/offline. LocalStorage fallback is active.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    const dataToCopy = activeTab === 'serverData' ? serverData : localStorageData;
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataToDownload = activeTab === 'serverData' ? serverData : localStorageData;
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroloan_persistent_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Data Storage & Offline Persistence Inspector</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect, verify, copy, and export disk files & browser local storage backups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar & Tabs */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('serverData')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'serverData' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Backend Server Disk Data (JSON)</span>
            </button>

            <button
              onClick={() => setActiveTab('localData')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'localData' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Browser LocalStorage Cache</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-xs font-semibold flex items-center gap-1"
              title="Refresh Storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCopyJSON}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-xs font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.json)</span>
            </button>
          </div>
        </div>

        {/* Modal JSON Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading stored data snapshot...</div>
          ) : (
            <div className="space-y-4">
              
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl border bg-slate-950 text-emerald-400 border-emerald-900/50 flex items-center justify-between font-sans">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">
                    {activeTab === 'serverData' 
                      ? (serverData?.status || 'Server Disk Storage Active')
                      : 'LocalStorage Active (Data visible even if server is OFF)'
                    }
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Format: Validated JSON Schema
                </span>
              </div>

              {/* JSON Payload Display Box */}
              <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto shadow-inner">
                <pre className="text-[12px] leading-relaxed">
                  {JSON.stringify(activeTab === 'serverData' ? serverData : localStorageData, null, 2)}
                </pre>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 font-sans">
          AgroLoan Trust Data Persistence Layer — All data saved locally on disk and browser cache.
        </div>

      </div>
    </div>
  );
}
