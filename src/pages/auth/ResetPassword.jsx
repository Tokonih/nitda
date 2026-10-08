import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/Slices/Utils/axiosInstance";
import { getErrorMessage } from "@/lib/utils";
import nitdaLogo from "@/assets/logos/nitda-logo.png";
import watermark from "@/assets/logos/coat-of-arms-watermark.png";
import dtcnLogo from "@/assets/logos/dtcn.png";
import gizLogo from "@/assets/logos/giz.png";
import euLogo from "@/assets/logos/eu.png";
import germanyLogo from "@/assets/logos/germany.png";
import nitdaSmallLogo from "@/assets/logos/nitda-small.png";
import logoblock from "@/assets/logos/logoblock.jpeg";


const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "At least one number", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "At least one special character (!@#$...)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setInvalidLink(true);
    }
  }, [token, email]);

  const ruleResults = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = allRulesPassed && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      toast.success("Password reset successful", {
        description: "You can now sign in with your new password.",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00663B] flex flex-col font-sans relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: "30px 30px" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#008751]/20 to-[#06331a]/60 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#E9B958]/10 blur-[150px] rounded-full" />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-[1100px] bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/20 border-none outline-none ring-0 relative z-10">

          {/* Left — Form */}
          <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col">
            <div className="flex justify-center mb-8">
              <img src={nitdaLogo} alt="NITDA" className="h-[65px] w-auto" />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F0FDF4] mb-4">
                <ShieldCheck className="h-7 w-7 text-[#00663B]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0E3D2B] mb-2 tracking-tight">
                Reset Your Password
              </h1>
              <p className="text-[#64748B] text-sm max-w-sm mx-auto">
                Create a new password for{" "}
                <span className="font-semibold text-[#0E3D2B]">{email}</span>
              </p>
            </div>

            {invalidLink ? (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-[#0E3D2B]">Invalid or expired link</p>
                  <p className="text-sm text-slate-500">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="flex items-center text-sm text-[#00663B] font-bold hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                {error && (
                  <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50 text-red-800 py-2">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#166534]">New Password*</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Password Rules */}
                  {password.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 mt-2">
                      {ruleResults.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-2">
                          {rule.passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className={`text-xs ${rule.passed ? "text-[#166534]" : "text-slate-400"}`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#166534]">Confirm New Password*</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-12 pr-12 h-12 bg-white rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300 ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? "border-green-400"
                            : "border-red-400"
                          : "border-slate-200"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 outline-none transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword.length > 0 && passwordsMatch && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full h-12 bg-[#015F33] hover:bg-[#014d29] text-white font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>

                <div className="text-center pt-1">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm text-[#00663B] font-bold hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Right — Branding */}
          <div className="w-full md:w-[45%] bg-[#062016] p-12 text-white relative flex flex-col justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none flex items-center justify-center p-8">
              <img
                src={watermark}
                alt=""
                className="h-auto object-contain scale-[2.4] filter brightness-150"
              />
            </div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-1 leading-tight text-white tracking-tight">
                  Strategic Roadmap and Action Plan
                </h2>
                <p className="text-[#E9B958] text-2xl font-extrabold tracking-tighter">2024–2027</p>
              </div>

              <p className="text-[13px] text-slate-300/90 leading-relaxed font-normal max-w-[280px]">
                Internal dashboard for tracking SRAP 2.0 implementation, performance metrics, and departmental progress toward national digital goals.
              </p>

              <div className="space-y-4">
                <p className="text-[#E9B958] font-bold tracking-[0.2em] text-[10px] uppercase">
                  Password Requirements
                </p>
                {passwordRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E9B958] shrink-0" />
                    <p className="text-[13px] text-slate-200">{rule.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#042F1A] py-6 px-4 md:px-12 mt-auto relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/40 text-[10px] uppercase font-bold tracking-[0.1em] order-3 md:order-1">
            © 2026 NITDA. All rights reserved.
          </div>
           <div className="flex flex-col md:flex-row items-center gap-4 order-1 md:order-2">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] md:mr-2">Sponsors:</span>
            <div className="bg-white px-4 py-2 rounded-lg flex items-center justify-center shadow-2xl overflow-hidden">
              <img src={logoblock} alt="Sponsors" className="h-10 w-auto object-contain" />
            </div>
          </div>
          <div className="text-white/50 text-[11px] flex items-center gap-2 font-medium tracking-wide order-2 md:order-3">
            <Mail className="h-3.5 w-3.5 text-white/30" />
            info@nitda.gov.ng
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
