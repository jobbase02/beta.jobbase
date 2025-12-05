"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck,
  Check,
  Sparkles,
  Clock
} from 'lucide-react';

export default function EmployerAuth() {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Validation State
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Signup State
  const [signupStep, setSignupStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Registration Details
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Domain Blacklist
  const genericDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'live.com', 'msn.com', 'aol.com', 'icloud.com', 
    'me.com', 'protonmail.com', 'mail.com', 'yandex.com'
  ];

  const validateBusinessEmail = (emailToCheck: string) => {
    if (!emailToCheck) return false;
    const parts = emailToCheck.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return !genericDomains.includes(domain.toLowerCase());
  };

  const handleEmailChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setEmail(e.target.value);
  };

  // --- HANDLERS ---

  const handleSendOtpClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!email) { setMessage({ type: 'error', text: 'Please enter an email address first.' }); return; }
    if (!email.includes('@')) { setMessage({ type: 'error', text: 'That doesn\'t look like a valid email.' }); return; }
    if (!validateBusinessEmail(email)) { setMessage({ type: 'error', text: 'Personal emails (Gmail, Yahoo) are not allowed. Please use your Company Email.' }); return; }
    sendOtp();
  };

  const handleVerifyOtpClick = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      if(!otp) { setMessage({ type: 'error', text: 'Please enter the code sent to your email.' }); return; }
      if(otp.length < 6) { setMessage({ type: 'error', text: 'The code must be 6 digits long.' }); return; }
      verifyOtp();
  }

  const handleSignupValidation = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      if(!fullName) return setMessage({ type: 'error', text: 'Full Name is required.' });
      if(!companyName) return setMessage({ type: 'error', text: 'Company Name is required.' });
      if(!position) return setMessage({ type: 'error', text: 'Position is required.' });
      if(!password || password.length < 6) return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      handleSignup();
  }

  const handleLoginValidation = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      if(!loginEmail) return setMessage({ type: 'error', text: 'Please enter your email.' });
      if(!loginPassword) return setMessage({ type: 'error', text: 'Please enter your password.' });
      handleLogin();
  }

  const handleLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/employer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      
      setTimeout(() => {
        router.refresh(); 
        router.push('/dashboard/employer');
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setSignupStep(2);
      setMessage({ type: 'success', text: `OTP sent to ${email}` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setIsEmailVerified(true);
      setSignupStep(3); 
      setMessage({ type: 'success', text: 'Email verified! Please complete your profile.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/employer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName, company_name: companyName, position: position }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setMessage({ type: '', text: '' }); 
      setSignupStep(4); 
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderMessage = () => {
    if (!message.text) return null;
    const isError = message.type === 'error';
    return (
      <div className={`p-4 rounded-lg text-sm font-medium flex items-start gap-3 mb-6 animate-in slide-in-from-top-1 fade-in duration-300 ${isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
        {isError ? <AlertCircle className="shrink-0 mt-0.5" size={18} /> : <CheckCircle className="shrink-0 mt-0.5" size={18} />}
        <span>{message.text}</span>
      </div>
    );
  };

  // --- STYLES ---
  const inputClasses = "w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium";
  const labelClasses = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1";
  const primaryButtonClasses = "w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20";

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      
      {/* --- LEFT SIDE: Sticky Sidebar --- */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] lg:w-[42%] bg-[#111] p-12 xl:p-20 text-white h-screen sticky top-0 overflow-hidden">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 pt-20"> 
            {/* Tagline */}
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold tracking-wide text-emerald-300">
                    <Sparkles size={12} />
                    <span>Always Free for Employers</span>
                </div>
                
                <h1 className="text-4xl xl:text-5xl font-bold tracking-tighter leading-[1.1]">
                    Hire the top 1% <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">without the cost.</span>
                </h1>
                
                <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                    Join thousands of companies building their dream teams. Access a community of verified talent ready to work.
                </p>
            </div>
        </div>

        {/* Feature List & Trust */}
        <div className="relative z-10 space-y-8">
             <ul className="space-y-4">
                <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Check size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-zinc-200 font-medium">Post unlimited jobs for free</span>
                </li>
                <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Check size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-zinc-200 font-medium">Access verified developer profiles</span>
                </li>
                <li className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Check size={14} className="text-purple-400" />
                    </div>
                    <span className="text-zinc-200 font-medium">Smart candidate filtering & tracking</span>
                </li>
             </ul>

             {/* Trusted By Section */}
             <div className="pt-8 border-t border-white/10">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">Trusted by industry giants</p>
                <div className="flex gap-6 opacity-40 grayscale">
                    {/* Placeholder logos - You can replace these with SVGs */}
                    <div className="h-8 w-24 bg-white/10 rounded-md"></div>
                    <div className="h-8 w-24 bg-white/10 rounded-md"></div>
                    <div className="h-8 w-24 bg-white/10 rounded-md"></div>
                </div>
             </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Scrollable Content --- */}
      <div className="w-full lg:w-[58%] flex flex-col items-center justify-start pt-28 lg:pt-32 px-6 lg:px-12 xl:px-24 min-h-screen">
        <div className="max-w-[480px] w-full pb-20">
            
            {/* Mobile Header (Only shows on mobile) */}
            <div className="lg:hidden text-center mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">Hire Top Talent</h1>
                <p className="text-gray-500">Post jobs for free and find your next hire.</p>
            </div>

            {signupStep !== 4 && (
                <>
                    {/* Toggle Switch */}
                    <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-10">
                        <button 
                        type="button"
                        onClick={() => { setView('login'); setMessage({type:'', text:''}); }}
                        className={`py-3 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${view === 'login' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                        Log In
                        </button>
                        <button 
                        type="button"
                        onClick={() => { setView('signup'); setMessage({type:'', text:''}); }}
                        className={`py-3 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${view === 'signup' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                        Sign Up <span className="hidden sm:inline-block bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wide">Free</span>
                        </button>
                    </div>

                    {/* Form Title */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {view === 'login' ? 'Welcome back' : 'Create your employer account'}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {view === 'login' ? 'Enter your credentials to access your dashboard.' : 'Start hiring the best talent in minutes.'}
                        </p>
                    </div>
                </>
            )}

            {renderMessage()}

            {view === 'login' ? (
              /* --- LOGIN FORM --- */
              <form className="space-y-6">
                <div className="relative group">
                  <label className={labelClasses}>Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputClasses}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                
                <div className="relative group">
                  <label className={labelClasses}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={handleLoginValidation} 
                    disabled={loading} 
                    className={primaryButtonClasses}
                  >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                  </button>
                </div>

                <div className="text-center">
                    <a href="#" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Forgot your password?</a>
                </div>
              </form>
            ) : (
              /* --- SIGNUP FLOW --- */
              <div className="space-y-6">
                
                {signupStep === 4 ? (
                   /* --- STEP 4: APPROVAL / SUCCESS --- */
                   <div className="text-center py-6 animate-in zoom-in duration-300">
                     <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                       <CheckCircle className="text-emerald-600" size={48} />
                     </div>
                     
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Completed</h3>
                     <p className="text-gray-600 font-medium mb-8 text-lg">
                        Your employer account has been sent for approval.
                     </p>

                     <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                        <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-bold">Further details will be sent to</p>
                        <p className="text-lg font-bold text-gray-900 break-all">{email}</p>
                     </div>

                     <div className="inline-flex items-center gap-2.5 px-5 py-3 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 mb-8">
                        <Clock size={18} />
                        Our team approves accounts under 24 hours
                     </div>

                     <div>
                        <button 
                            onClick={() => router.push('/')}
                            className="text-gray-400 hover:text-gray-900 text-sm font-semibold hover:underline"
                        >
                            Return to Home
                        </button>
                     </div>
                   </div>
                ) : (
                  <>
                    {/* Step 1 & 2: Email and OTP */}
                    {signupStep <= 2 && (
                      <div className="space-y-6">
                        
                        {/* Company Email Input */}
                        <div className="relative group">
                          <label className={labelClasses}>Company Email</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                            <input
                              type="email"
                              value={email}
                              disabled={isEmailVerified || otpSent}
                              onChange={handleEmailChange}
                              className={`${inputClasses} ${email && !validateBusinessEmail(email) ? '!border-red-300 !text-red-900 !bg-red-50 focus:!border-red-500 focus:!ring-red-500' : ''}`}
                              placeholder="name@company.com"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1.5 ml-1 flex items-center gap-1">
                             <ShieldCheck size={10} /> We verify business domains to prevent spam.
                          </p>
                        </div>

                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOtpClick}
                            disabled={loading}
                            className={primaryButtonClasses}
                          >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Get Verification Code <ArrowRight size={18} /></>}
                          </button>
                        ) : (
                          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            
                            {/* OTP Display/Input Box */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                              <div className="flex justify-between items-center mb-4">
                                  <label className={labelClasses}>Verification Code</label>
                                  <span className="text-xs font-medium text-gray-500">Sent to {email}</span>
                              </div>
                              <input
                                  type="text"
                                  maxLength={6}
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none text-center tracking-[0.5em] font-mono text-2xl font-bold text-gray-900 transition-all"
                                  placeholder="000000"
                              />
                            </div>
                            
                            {/* Verify Button */}
                            <button
                              type="button"
                              onClick={handleVerifyOtpClick}
                              disabled={loading}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                            >
                              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Continue <ShieldCheck size={18} /></>}
                            </button>
                            
                            <button 
                              type="button"
                              onClick={() => { setOtpSent(false); setOtp(''); setMessage({type:'', text:''}); }} 
                              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-6 font-semibold transition-colors cursor-pointer hover:underline"
                            >
                              Entered wrong email? Go back
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Registration Details */}
                    {signupStep === 3 && (
                      <form className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                        
                        {/* Full Name Field */}
                        <div className="relative group">
                          <label className={labelClasses}>Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className={inputClasses}
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Company Name Field */}
                            <div className="relative group">
                              <label className={labelClasses}>Company</label>
                              <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className={inputClasses}
                                    placeholder="Acme Inc"
                                  />
                              </div>
                            </div>
                            
                            {/* Position Field */}
                            <div className="relative group">
                              <label className={labelClasses}>Position</label>
                              <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    className={inputClasses}
                                    placeholder="HR Lead"
                                  />
                              </div>
                            </div>
                        </div>

                        {/* Password Creation Field */}
                        <div className="relative group">
                          <label className={labelClasses}>Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClasses} pr-12`} // Extra padding for eye icon
                                placeholder="Min 6 characters"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={handleSignupValidation} 
                            disabled={loading} 
                            className={primaryButtonClasses}
                          >
                              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}