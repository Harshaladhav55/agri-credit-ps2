import React, { useState } from 'react';
import { ShieldCheck, Hand, Sprout, ArrowRight, UserPlus, LogIn as LogInIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Login Form State
  const [loginMobile, setLoginMobile] = useState('9823011223');
  const [loginOtp, setLoginOtp] = useState('123456');

  // Register Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Nashik');
  const [regAadhaar, setRegAadhaar] = useState('');

  // Regex rules
  const mobileRegex = /^[6-9]\d{9}$/;
  const nameRegex = /^[A-Za-z\s]{2,30}$/;
  const aadhaarRegex = /^\d{4}-\d{4}-\d{4}$|^\d{12}$/;

  // Auto-formatters
  const formatMobileInput = (val) => {
    return val.replace(/\D/g, '').slice(0, 10);
  };

  const formatAadhaarInput = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    if (raw.length <= 4) return raw;
    if (raw.length <= 8) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
  };

  // Validation routines
  const validateLoginForm = () => {
    const errors = {};
    const cleanMobile = loginMobile.replace(/\D/g, '');

    if (!cleanMobile) {
      errors.loginMobile = 'Mobile number is required.';
    } else if (!mobileRegex.test(cleanMobile)) {
      errors.loginMobile = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }

    if (!loginOtp.trim()) {
      errors.loginOtp = 'OTP or password is required.';
    } else if (loginOtp.length < 6) {
      errors.loginOtp = 'OTP / Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!regFirstName.trim()) {
      errors.regFirstName = 'First name is required.';
    } else if (!nameRegex.test(regFirstName.trim())) {
      errors.regFirstName = 'First name must contain only letters (min 2 characters).';
    }

    if (!regLastName.trim()) {
      errors.regLastName = 'Last name is required.';
    } else if (!nameRegex.test(regLastName.trim())) {
      errors.regLastName = 'Last name must contain only letters (min 2 characters).';
    }

    if (!regPassword) {
      errors.regPassword = 'Password is required.';
    } else if (regPassword.length < 6) {
      errors.regPassword = 'Password must be at least 6 characters long.';
    }

    const cleanMobile = regMobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.regMobile = 'Mobile number is required.';
    } else if (!mobileRegex.test(cleanMobile)) {
      errors.regMobile = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }

    if (!regState || regState === 'Select State') {
      errors.regState = 'Please select a valid State.';
    }

    if (!regDistrict || regDistrict === 'Select District') {
      errors.regDistrict = 'Please select a valid District.';
    }

    const cleanAadhaar = regAadhaar.replace(/\D/g, '');
    if (!cleanAadhaar) {
      errors.regAadhaar = 'Aadhaar number is required.';
    } else if (cleanAadhaar.length !== 12) {
      errors.regAadhaar = 'Aadhaar number must be exactly 12 digits (XXXX-XXXX-XXXX).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: loginMobile, password: loginOtp, role: 'farmer' })
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || 'Invalid Mobile number or OTP.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to login server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    setError('');

    try {
      const fullName = `${regFirstName} ${regLastName}`.trim();
      const res = await fetch('http://localhost:5000/api/auth/register-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || 'New Farmer',
          mobileNo: regMobile,
          aadhaarNo: regAadhaar,
          state: regState,
          district: regDistrict,
          village: regDistrict + ' Village',
          landAcres: '0',
          currentCrop: 'Not Specified',
          previousCrop: 'None'
        })
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Registration error. Make sure server is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role, demoId, demoName) => {
    setLoading(true);
    setFieldErrors({});
    setError('');
    setTimeout(() => {
      onLoginSuccess({
        id: demoId,
        name: demoName,
        role: role,
        village: 'Pimplad',
        district: 'Nashik',
        state: 'Maharashtra',
        landAcres: 3.5,
        currentCrop: 'Onion',
        previousCrop: 'Cotton',
        pmKisanVerified: true
      }, 'DEMO-TOKEN');
      setLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-green-600 selection:text-white">
      
      {/* LEFT HERO COLUMN: Farm Background & Heading Overlay */}
      <div className="lg:w-[60%] min-h-[400px] lg:min-h-screen relative flex items-center justify-center p-8 lg:p-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop')`
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/70 via-black/50 to-black/30" />

        <div className="relative z-10 max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-lime-200 leading-[1.15] tracking-tight drop-shadow-lg">
            Growing Dreams, Cultivating Prosperity – Smart Loans for Every Farmer
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium drop-shadow">
            Convert verified agricultural activity, MANDI prices, and community trust into an instant credit score.
          </p>
        </div>
      </div>

      {/* RIGHT FORM COLUMN: White Card with AgroLoan Trust Branding */}
      <div className="lg:w-[40%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-12 z-20">
        
        {/* Top Branding Section */}
        <div className="flex flex-col items-center pt-4">
          <div className="flex items-center space-x-2 text-green-700 mb-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-green-600 flex items-center justify-center shadow-md">
              <Sprout className="w-7 h-7 text-white" />
            </div>
          </div>
          <span className="text-emerald-800 font-extrabold text-lg tracking-wider uppercase font-serif">
            AGROLOAN TRUST
          </span>
          <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
            BUILDING TRUST, ENABLING CREDIT
          </span>
        </div>

        {/* FORM CONTENT */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6 py-6">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOG IN FORM */
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-emerald-700 text-center">
                Log in
              </h2>

              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={loginMobile}
                    onChange={(e) => {
                      setLoginMobile(formatMobileInput(e.target.value));
                      if (fieldErrors.loginMobile) {
                        setFieldErrors(prev => ({ ...prev, loginMobile: '' }));
                      }
                    }}
                    maxLength={10}
                    placeholder="Enter 10-digit Mobile number"
                    className={`w-full bg-white border ${
                      fieldErrors.loginMobile ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 font-mono`}
                  />
                  {fieldErrors.loginMobile && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.loginMobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    OTP / Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={loginOtp}
                    onChange={(e) => {
                      setLoginOtp(e.target.value);
                      if (fieldErrors.loginOtp) {
                        setFieldErrors(prev => ({ ...prev, loginOtp: '' }));
                      }
                    }}
                    placeholder="Enter 6-digit OTP"
                    className={`w-full bg-white border ${
                      fieldErrors.loginOtp ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 font-mono`}
                  />
                  {fieldErrors.loginOtp && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.loginOtp}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md active:scale-[0.99]"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFieldErrors({});
                    setError('');
                  }}
                  className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-3.5 rounded-xl transition-all text-sm"
                >
                  Create new user account
                </button>
              </div>

              {/* Quick Demo Access Bar */}
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <span className="text-xs font-semibold text-slate-400 block text-center uppercase tracking-wider">
                  Instant 1-Click Demo Login
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('farmer', 'FARM-MH-8821', 'Ramesh Tukaram Patil')}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] text-emerald-800 font-bold p-2.5 rounded-xl transition-all text-center"
                  >
                    Farmer Demo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('fpo', 'FPO-MH-01', 'Sanjay Deshmukh (FPO)')}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] text-emerald-800 font-bold p-2.5 rounded-xl transition-all text-center"
                  >
                    FPO Demo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('bank', 'BANK-SBI-991', 'Anil Kulkarni (SBI Officer)')}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] text-emerald-800 font-bold p-2.5 rounded-xl transition-all text-center"
                  >
                    Bank Demo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* CREATE ACCOUNT FORM */
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-emerald-700 text-center">
                Create account
              </h2>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => {
                      setRegFirstName(e.target.value);
                      if (fieldErrors.regFirstName) {
                        setFieldErrors(prev => ({ ...prev, regFirstName: '' }));
                      }
                    }}
                    placeholder="Enter Firstname"
                    className={`w-full bg-white border ${
                      fieldErrors.regFirstName ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400`}
                  />
                  {fieldErrors.regFirstName && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.regFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => {
                      setRegLastName(e.target.value);
                      if (fieldErrors.regLastName) {
                        setFieldErrors(prev => ({ ...prev, regLastName: '' }));
                      }
                    }}
                    placeholder="Enter Lastname"
                    className={`w-full bg-white border ${
                      fieldErrors.regLastName ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400`}
                  />
                  {fieldErrors.regLastName && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.regLastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (fieldErrors.regPassword) {
                        setFieldErrors(prev => ({ ...prev, regPassword: '' }));
                      }
                    }}
                    placeholder="Enter Password (min 6 characters)"
                    className={`w-full bg-white border ${
                      fieldErrors.regPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400`}
                  />
                  {fieldErrors.regPassword && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.regPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => {
                      setRegMobile(formatMobileInput(e.target.value));
                      if (fieldErrors.regMobile) {
                        setFieldErrors(prev => ({ ...prev, regMobile: '' }));
                      }
                    }}
                    maxLength={10}
                    placeholder="Enter 10-digit Mobile number"
                    className={`w-full bg-white border ${
                      fieldErrors.regMobile ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 font-mono`}
                  />
                  {fieldErrors.regMobile && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.regMobile}
                    </p>
                  )}
                </div>

                {/* State & District Side-by-Side */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                    <select
                      value={regState}
                      onChange={(e) => {
                        setRegState(e.target.value);
                        if (fieldErrors.regState) {
                          setFieldErrors(prev => ({ ...prev, regState: '' }));
                        }
                      }}
                      className={`w-full bg-white border ${
                        fieldErrors.regState ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                      } rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none transition-all`}
                    >
                      <option value="Select State">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                    {fieldErrors.regState && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors.regState}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => {
                        setRegDistrict(e.target.value);
                        if (fieldErrors.regDistrict) {
                          setFieldErrors(prev => ({ ...prev, regDistrict: '' }));
                        }
                      }}
                      className={`w-full bg-white border ${
                        fieldErrors.regDistrict ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                      } rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none transition-all`}
                    >
                      <option value="Select District">Select District</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Kolar">Kolar</option>
                      <option value="Solapur">Solapur</option>
                      <option value="Jalgaon">Jalgaon</option>
                      <option value="Rajkot">Rajkot</option>
                    </select>
                    {fieldErrors.regDistrict && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors.regDistrict}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Aadhaar Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regAadhaar}
                    onChange={(e) => {
                      setRegAadhaar(formatAadhaarInput(e.target.value));
                      if (fieldErrors.regAadhaar) {
                        setFieldErrors(prev => ({ ...prev, regAadhaar: '' }));
                      }
                    }}
                    maxLength={14}
                    placeholder="XXXX-XXXX-XXXX (12 digits)"
                    className={`w-full bg-white border ${
                      fieldErrors.regAadhaar ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 font-mono`}
                  />
                  {fieldErrors.regAadhaar && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors.regAadhaar}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md active:scale-[0.99]"
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setFieldErrors({});
                      setError('');
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-700 font-semibold"
                  >
                    Already have an account? <span className="underline text-emerald-600">Log in</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 pb-2">
          AgroLoan Trust — Building Trust, Enabling Credit
        </div>

      </div>

    </div>
  );
}
