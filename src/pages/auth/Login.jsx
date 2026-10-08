import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import watermark from "@/assets/logos/coat-of-arms-watermark.png";
import dtcnLogo from "@/assets/logos/dtcn.png";
import gizLogo from "@/assets/logos/giz.png";
import euLogo from "@/assets/logos/eu.png";
import germanyLogo from "@/assets/logos/germany.png";
import nitdaLogo from "@/assets/logos/nitda-logo.png";
import nitdaSmallLogo from "@/assets/logos/nitda-small.png";
import logoblock from "@/assets/logos/logoblock.jpeg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser } from "../../Slices/authSlice";
import { isStakeholder } from "@/lib/roleLabels";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.authSlice);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((data) => {
        // First-time login: must change password before accessing dashboard
        if (data?.must_change_password === true) {
          navigate("/change-password", { replace: true });
          return;
        }
        if (from !== "/") {
          navigate(from, { replace: true });
        } else if (isStakeholder(data?.user)) {
          navigate("/dashboard/stakeholder-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      })
      .catch(() => { });
  };

  return (
    <div className="min-h-screen bg-[#00663B] flex flex-col font-sans relative overflow-hidden">
      {/* Background Geometric Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#008751]/20 to-[#06331a]/60 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#E9B958]/10 blur-[150px] rounded-full" />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        {/* Main Card */}
        <div className="w-full max-w-[1100px] h-auto min-h-[650px] bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/20 border-none outline-none ring-0 relative z-10">

          {/* Left Section - Form */}
          <div className="w-full md:w-[50%] p-10 md:p-16 flex flex-col">
            <div className="flex justify-center mb-5">
              <img src={nitdaLogo} alt="NITDA" className="h-[200px] w-auto" />
              {/* <img src={logoblock} alt="Sponsors" className="h-[200px] w-auto object-contain" /> */}

            </div>

            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-[#0E3D2B] mb-2 tracking-tight">
                NITDA&apos;s SRAP 2.0 Dashboard
              </h1>
              <p className="text-[#64748B] text-sm tracking-wide">
                Sign in to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50 text-red-800 py-2">
                  <AlertDescription className="text-xs">
                    {getErrorMessage(error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-[#166534]">Email*</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-13 bg-white border-slate-200 rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-[#166534]">Password*</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-13 bg-white border-slate-200 rounded-xl focus:ring-[#00663B] text-slate-700 placeholder:text-slate-300"
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
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 bg-[#015F33] hover:bg-[#014d29] text-white font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-sm text-[#00663B] font-bold hover:underline tracking-tight">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          {/* Right Section - Branding */}
          <div className="w-full md:w-[50%] bg-[#062016] p-12 text-white relative flex flex-col justify-center overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none flex items-center justify-center p-8">
              <img src={watermark} alt="" className=" h-auto object-contain scale-[2.4] filter brightness-150" />
            </div>
            

            {/* Geometric Highlight */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1 leading-tight text-white tracking-tight">
                  Strategic Roadmap and Action Plan
                </h2>
                <p className="text-[#E9B958] text-2xl font-extrabold tracking-tighter">2024–2027</p>
              </div>

              <p className="text-[13px] text-slate-300/90 leading-relaxed font-normal max-w-[280px]">
                Internal dashboard for tracking SRAP 2.0 implementation, performance metrics, and departmental progress toward national digital goals.
              </p>
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

export default Login;
