"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

import { useRouter } from "next/navigation";

const CAPTCHA_LENGTH = 5;

const AuthForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Field State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New State
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- CAPTCHA LOGIC ---
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    let result = "";
    for (let i = 0; i < CAPTCHA_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput(""); 
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#f4f4f5"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (dots)
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width, 
        Math.random() * canvas.height, 
        1, 0, 2 * Math.PI
      );
      ctx.fill();
    }

    // Add noise (lines)
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw Text
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const charWidth = canvas.width / CAPTCHA_LENGTH;
    
    for (let i = 0; i < CAPTCHA_LENGTH; i++) {
      const char = captchaCode[i];
      const x = (i * charWidth) + (charWidth / 2);
      const y = canvas.height / 2;
      
      ctx.save();
      ctx.translate(x, y);
      const angle = (Math.random() - 0.5) * 0.4; 
      ctx.rotate(angle);
      ctx.fillStyle = "#18181b"; 
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    drawCaptcha();
  }, [captchaCode]);

  // --- AUTH HANDLER ---
  const handleAuth = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Validate Passwords Match (Signup Only)
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Validate Captcha
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError("Incorrect security code. Please try again.");
      generateCaptcha(); 
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      
      const payload = isLogin 
        ? { email, password } 
        : { email, password, fullName }; // You usually don't send confirmPassword to API

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setSuccessMsg(isLogin 
        ? "Welcome back! Redirecting..." 
        : "Account created successfully! Check your email."
      );

      if (isLogin) {
        // --- NEW REDIRECT LOGIC ---
        const redirectUrl = searchParams.get("redirect");

        setTimeout(() => {
          router.refresh();
          if (redirectUrl) {
            // Decode the URL (since we encoded it in the previous step) and redirect there
            router.push(decodeURIComponent(redirectUrl));
          } else {
            // Default behavior
            router.push("/dashboard"); 
          }
        }, 1000);
        // ---------------------------
      } else {
        // Signup success logic remains the same
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        generateCaptcha();
      }

    } catch (err) {
      const error = err as Error;
      const msg = error.message === "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON" 
        ? "API endpoint not found (Expected in Preview)" 
        : error.message || "Something went wrong.";
        
      setError(msg);
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX 1: Layout adjustments
    // Changed 'items-center' to 'items-start' to prevent upward growth
    // Added 'pt-24' (approx 96px) to push the form down below standard navbars
    <div className="min-h-screen flex items-start justify-center bg-white p-4 pt-24 pb-10 font-sans text-zinc-900">
      
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px]"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 mb-4 border border-zinc-200">
            <Lock className="h-6 w-6 text-zinc-900" />
          </div>
          <motion.h1 
            key={isLogin ? "h1-login" : "h1-signup"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            {isLogin ? "Welcome back" : "Create an account"}
          </motion.h1>
          <motion.p 
            key={isLogin ? "p-login" : "p-signup"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-zinc-500"
          >
            {isLogin 
              ? "Enter your details to access your workspace." 
              : "Start your 30-day free trial today."}
          </motion.p>
        </div>

        {/* Card */}
        <div className="border border-zinc-200 rounded-2xl p-1 bg-white shadow-sm">
          <form onSubmit={handleAuth} className="flex flex-col gap-4 p-6">
            
            {/* Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 flex items-center gap-2 overflow-hidden"
                >
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-600 border border-green-100 flex items-center gap-2 overflow-hidden"
                >
                  <CheckCircle2 size={16} className="shrink-0" /> {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pb-4">
                    <label className="text-xs font-medium text-zinc-500 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                      <input
                        type="text"
                        required={!isLogin}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* FIX 3: Confirm Password Field */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-4">
                    <label className="text-xs font-medium text-zinc-500 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!isLogin}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full rounded-lg border bg-white px-10 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-zinc-100 ${
                          confirmPassword && confirmPassword !== password 
                            ? "border-red-300 focus:border-red-400" 
                            : "border-zinc-200 focus:border-zinc-400"
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FIX 2: Captcha Layout Fix */}
            <div className="pt-2">
              <label className="text-xs font-medium text-zinc-500 ml-1 block mb-1.5">Security Check</label>
              <div className="flex gap-2 items-center">
                {/* Canvas - Button removed from inside to prevent overlap */}
                <div className="relative h-11 w-32 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                  <canvas 
                    ref={canvasRef} 
                    width={128} 
                    height={44}
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>
                
                {/* Refresh Button - Moved outside */}
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  title="Refresh Code"
                >
                  <RefreshCw size={16} />
                </button>

                {/* Captcha Input */}
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm uppercase tracking-widest outline-none transition-all focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 placeholder:normal-case placeholder:tracking-normal"
                  placeholder="Code"
                  maxLength={CAPTCHA_LENGTH}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? "Sign In" : "Create Account"} 
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 text-center rounded-b-2xl">
            <p className="text-xs text-zinc-500">
              {isLogin ? "New to the platform?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setIsLogin(!isLogin);
                  setConfirmPassword(""); // Clear confirm password on toggle
                  generateCaptcha(); 
                }}
                className="font-medium text-zinc-900 hover:underline underline-offset-4 decoration-zinc-300"
              >
                {isLogin ? "Sign up now" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;