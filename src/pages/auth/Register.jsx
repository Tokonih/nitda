import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Building, Phone, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/Slices/Utils/axiosInstance";
import { getErrorMessage } from "@/lib/utils";
import nitdaLogo from "@/assets/logos/nitda-logo.png";
import dtcnLogo from "@/assets/logos/dtcn.png";
import gizLogo from "@/assets/logos/giz.png";
import euLogo from "@/assets/logos/eu.png";
import germanyLogo from "@/assets/logos/germany.png";
import nitdaSmallLogo from "@/assets/logos/nitda-small.png";
import watermark from "@/assets/logos/coat-of-arms-watermark.png";
import logoblock from "@/assets/logos/logoblock.jpeg";


const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone_number: "",
    organisation_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    if (field === "phone_number") {
      const sanitizedValue = value
        .replace(/[^\d+]/g, "")
        .replace(/(?!^)\+/g, "");

      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/dashboard-access-requests', formData);
      toast.success("Request Submitted", {
        description: "NITDA will review your request and send credentials via email.",
      });
      navigate("/login");
    } catch (err) {
      toast.error("Submission Failed", {
        description: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00663B] flex flex-col font-sans relative overflow-hidden">
      {/* Background Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#008751]/20 to-[#06331a]/60 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        {/* Main Container */}
        <div className="w-full max-w-[1100px] h-auto min-h-[750px] bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/20 border-none outline-none ring-0 relative z-10">
          
          {/* Left Section - Form */}
          <div className="w-full md:w-[55%] p-8 md:p-14 flex flex-col">
            <div className="flex justify-center mb-10">
              <img src={nitdaLogo} alt="NITDA" className="h-[65px] w-auto" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#0E3D2B] mb-1">
                Request Dashboard Access
              </h1>
              <p className="text-[#64748B] text-sm max-w-sm mx-auto">
                Submit your details and NITDA will create your profile and send you login credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#00663B]">First Name*</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Amina"
                      value={formData.firstname}
                      onChange={(e) => handleChange("firstname", e.target.value)}
                      className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-[#00663B]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#00663B]">Last Name*</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Ibrahim"
                      value={formData.lastname}
                      onChange={(e) => handleChange("lastname", e.target.value)}
                      className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-[#00663B]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#00663B]">Email Address*</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="amina@gov.ng"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-[#00663B]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#00663B]">Phone Number*</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      inputMode="tel"
                      pattern="^\+?\d{7,15}$"
                      placeholder="+234 800 000 0000"
                      value={formData.phone_number}
                      onChange={(e) => handleChange("phone_number", e.target.value)}
                      className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-[#00663B]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#00663B]">Organisation*</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    placeholder="Federal Ministry of Communications..."
                    value={formData.organisation_name}
                    onChange={(e) => handleChange("organisation_name", e.target.value)}
                    className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-[#00663B]"
                    required
                  />
                </div>
              </div>

              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg p-3 flex gap-3">
                <Info className="h-4 w-4 text-[#166534] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#166534] leading-tight">
                  NITDA will review your request, create your profile, and send your login credentials to your email.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#006138] hover:bg-[#004e2d] text-white font-bold text-base rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                {loading ? "Submitting Request..." : "Submit Access Request"}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-[#64748B]">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#00663B] font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Section - Branding */}
          <div className="w-full md:w-[45%] bg-[#062016] p-12 text-white relative flex flex-col justify-center">
            {/* Watermark */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center p-8 overflow-hidden">
              <img src={watermark} alt="" className="w-full h-auto object-contain scale-[1.3] filter brightness-125" />
            </div>

            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-1 leading-tight">
                  Strategic Roadmap <br />& Action Plan
                </h2>
                <p className="text-[#E9B958] text-2xl font-bold">2024–2027</p>
              </div>

              <p className="text-sm text-slate-200/90 leading-relaxed font-normal">
                Internal dashboard for tracking SRAP 2.0 implementation, performance metrics, and departmental progress toward national digital goals.
              </p>

              <div className="space-y-6">
                <p className="text-[#E9B958] font-bold tracking-[0.2em] text-[10px] uppercase">WHAT HAPPENS NEXT</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#E9B958] text-[#06331a] flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <p className="text-[13px] text-slate-100">NITDA receives and reviews your access request</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#E9B958] text-[#06331a] flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <p className="text-[13px] text-slate-100">Your profile is created with a Data Entry role</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#E9B958] text-[#06331a] flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <p className="text-[13px] text-slate-100">Login credentials are sent to your email</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#E9B958]" />
                    <p className="text-xs font-medium">Submit organizational scorecards and updates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#E9B958]" />
                    <p className="text-xs font-medium">Access restricted to verified stakeholders only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#062016] py-4 px-4 md:px-8 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/70 text-[11px] font-medium">
            © 2026 NITDA. All rights reserved.
          </div>
          
           <div className="flex flex-col md:flex-row items-center gap-4 order-1 md:order-2">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] md:mr-2">Sponsors:</span>
            <div className="bg-white px-4 py-2 rounded-lg flex items-center justify-center shadow-2xl overflow-hidden">
              <img src={logoblock} alt="Sponsors" className="h-10 w-auto object-contain" />
            </div>
          </div>

          <div className="text-white/70 text-[11px] flex items-center gap-2 font-medium">
            <Mail className="h-3 w-3 text-white/50" />
            info@nitda.gov.ng
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;

;
