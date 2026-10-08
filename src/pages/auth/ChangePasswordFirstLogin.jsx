import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import axiosInstance from "@/Slices/Utils/axiosInstance";
import { getErrorMessage } from "@/lib/utils";
import { logout } from "@/Slices/authSlice";
import nitdaLogo from "@/assets/logos/nitda-logo.png";
import watermark from "@/assets/logos/coat-of-arms-watermark.png";
import nitdaSmallLogo from "@/assets/logos/nitda-small.png";
import dtcnLogo from "@/assets/logos/dtcn.png";
import gizLogo from "@/assets/logos/giz.png";
import euLogo from "@/assets/logos/eu.png";
import germanyLogo from "@/assets/logos/germany.png";
import { Mail } from "lucide-react";

// Password rule checker
const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "At least one number", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "At least one special character (!@#$...)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ChangePasswordFirstLogin = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);

  const ruleResults = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(newPassword),
  }));

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const isFormValid =
    currentPassword.length > 0 &&
    allRulesPassed &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) return;

    setLoading(true);
    try {
      await axiosInstance.post("/auth/change-password-first-login", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      toast.success("Password changed successfully", {
        description: "Please sign in with your new password.",
      });

      // Log out and redirect to login
      dispatch(logout());
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
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
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
                Set Your New Password
              </h1>
              <p className="text-[#64748B] text-sm max-w-sm mx-auto">
                {user?.name
                  ? `Welcome, ${user.name}. `
                  : ""}
                Your account requires a password change before you can continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex-1">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50 text-red-800 py-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#166534]">Current Password*</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 outline-none transition-colors"
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#166534]">New Password*</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 outline-none transition-colors"
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Rules */}
                {newPassword.length > 0 && (
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
                {loading ? "Updating Password..." : "Set New Password"}
              </Button>
            </form>
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
                  Secure Your Account
                </h2>
                <p className="text-[#E9B958] text-lg font-extrabold tracking-tighter">
                  One-time setup required
                </p>
              </div>

              <p className="text-[13px] text-slate-300/90 leading-relaxed font-normal max-w-[280px]">
                For your security, you must set a personal password before accessing the SRAP 2.0 Dashboard.
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
            <div className="bg-white px-6 py-2 rounded-lg flex items-center justify-center gap-8 shadow-2xl overflow-hidden">
              <img src={nitdaSmallLogo} alt="NITDA" className="h-4 w-auto object-contain" />
              <img src={germanyLogo} alt="Germany" className="h-4 w-auto object-contain" />
              <img src={euLogo} alt="European Union" className="h-4 w-auto object-contain" />
              <img src={gizLogo} alt="GIZ" className="h-4 w-auto object-contain" />
              <img src={dtcnLogo} alt="DTCN" className="h-4 w-auto object-contain" />
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

export default ChangePasswordFirstLogin;
