import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import nitdaLogo from "@/assets/logos/nitda-horizontal-transparent.png";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.authSlice);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll handler function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Close mobile menu after clicking
    }
  };

  const NavLink = ({ to, label }) => (
    <button
      onClick={() => scrollToSection(to)}
      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 bg-[#0E3D2B] border-t border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src={nitdaLogo} alt="NITDA" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block border-l border-white/30 pl-3">
              <span className="text-white font-bold text-base tracking-tight leading-none">SRAP 2.0</span>
              <p className="text-white/60 text-[10px] leading-tight">National Information Technology Development Agency</p>
            </div>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="home" label="Home" />
            <NavLink to="about" label="About Us" />
            <NavLink to="pillars" label="Pillars" />
            <NavLink to="alignment" label="Alignment" />
            <NavLink to="faq" label="FAQ" />
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center text-gray-300 hover:text-white cursor-pointer gap-1">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">EN</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            {/* {!isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold text-xs px-5 rounded-md"
              >
                Login
              </Button>
            )} */}
            
            {/* CTA Button */}
            <Button
             onClick={() => navigate(isAuthenticated ? "/public-dashboard" : "/login")}
              className="bg-white text-[#0E3D2B] hover:bg-gray-100 font-semibold text-xs px-5 rounded-md"
            >
              {isAuthenticated ? "Explore Dashboard" : "Login"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#004D2D] border-t border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <NavLink to="home" label="Home" />
            <NavLink to="about" label="About Us" />
            <NavLink to="pillars" label="Pillars" />
            <NavLink to="alignment" label="Alignment" />
            <NavLink to="faq" label="FAQ" />
            <div className="pt-4 border-t border-white/10 mt-2">
              {/* {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full mb-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Login
                </Button>
              )} */}
              <Button
                onClick={() => navigate(isAuthenticated ? "/public-dashboard" : "/login")}
                className="w-full bg-white text-[#0E3D2B] hover:bg-gray-100"
              >
                {isAuthenticated ? "Explore Dashboard" : "Login"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
