import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Minus,
  Plus,
  ArrowRight,
  Download,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  GraduationCap,
  Sprout,
  Cpu,
  Zap,
  Rocket,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import srapPillarsImage from "@/assets/srap-pillars.png";
import coreValuesImage from "@/assets/core-values.png";
import waveLeft from "@/assets/wave-left.png";
import waveRight from "@/assets/wave-right.png";
import heroBgImage from "@/assets/hero-bg-srap.png";
import { getPublicSummary } from "../Slices/Utils/Api/publicSummary";
import LandingNavbar from "@/components/layout/LandingNavbar";
import FeedbackModal from "@/components/modals/FeedbackModal";
import dtcnLogo from "@/assets/logos/dtcn.png";
import gizLogo from "@/assets/logos/giz.png";
import euLogo from "@/assets/logos/eu.png";
import germanyLogo from "@/assets/logos/germany.png";
import nitdaLogo from "@/assets/logos/nitda-horizontal-transparent.png";

// --- ANIMATION HELPER COMPONENT ---
// This component fades in its children when they scroll into view
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const SrapLandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'general', subject: '' });

  // Helper for internal buttons
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler for downloading the SRAP 2.0 PDF
  const handleDownloadPDF = () => {
    const pdfUrl = 'https://nitda.gov.ng/wp-content/uploads/2024/02/SRAP-2.O.pdf';
    window.open(pdfUrl, '_blank');
  };

  const faqs = [
    {
      question: "What exactly is SRAP 2.0?",
      answer: "SRAP 2.0 is NITDA's Strategic Roadmap & Action Plan for 2024-2027. It guides Nigeria's digital transformation across 8 focus pillars.",
    },
    {
      question: "Who is responsible for implementing SRAP 2.0?",
      answer: "NITDA leads the implementation in collaboration with MDAs, private sector partners, and civil society organizations to ensure coordinated execution across all sectors.",
    },
    {
      question: "Is SRAP 2.0 different from SRAP 1.0?",
      answer: "Yes, SRAP 2.0 takes a more comprehensive, data driven approach with enhanced stakeholder engagement, clearer KPIs, and stronger alignment with national development priorities.",
    },
    {
      question: "How is progress measured?",
      answer: "Through a robust M&E framework with quarterly reviews, KPI dashboards, stakeholder surveys, and impact assessments aligned with national and international standards.",
    },
    {
      question: "How can citizens or organisations get involved?",
      answer: "Join our digital skills programs, participate in innovation challenges, engage in policy consultations, or partner through our stakeholder engagement portal. Contact our outreach team for specific opportunities.",
    },
  ];

  useEffect(() => {
    const PublicSummary = async () => {
      try {
        const publicSummary = await getPublicSummary({
          year,
          period_type: "annual",
          limit: 10,
        });
        const firstSix = publicSummary?.data?.slice(0, 6);
        setSummary(firstSix);
      } catch (error) {
        // Error fetching summaries
      }
    };

    PublicSummary();
  }, [year]);

  const pillarsAlignment = [
    {
      icon: Lightbulb,
      title: "KNOWLEDGE",
      description: "SRAP 2.0's focus on fostering digital literacy and cultivating talents complements the Ministry's Knowledge Pillar. By establishing a robust technology research ecosystem, we are setting the stage for a society enriched with digital competencies, driving innovation and development.",
    },
    {
      icon: BookOpen,
      title: "POLICY",
      description: "This Strategy is closely aligned with the Policy Pillar of the Ministry, focusing on strengthening policy implementation and legal frameworks. Crucially, SRAP 2.0 is the instrument of executing seven key policies out of the nine policies identified in the Ministry's plan.",
    },
    {
      icon: Target,
      title: "INFRASTRUCTURE",
      description: "SRAP 2.0's commitment to enhancing DPI through standards, guidelines, and frameworks aligns with the Ministry's Infrastructure pillar. This strategic move is aimed at fostering the development of the Nigeria Stack, ensuring seamless and inclusive access to digital services.",
    },
    {
      icon: TrendingUp,
      title: "INNOVATION, ENTREPRENEURSHIP, AND CAPITAL",
      description: "Aligning with the Ministry, SRAP 2.0 seeks to nurture an innovative and entrepreneurial ecosystem. We aim to support startups, foster creativity, and encourage the development of solutions that address local and global challenges.",
    },
    {
      icon: Shield,
      title: "TRADE",
      description: "This pillar focuses on enhancing Nigeria's global digital economy competitiveness. SRAP 2.0 supports this through strategic partnerships and collaborations, aiming to open new markets for Nigerian innovations and integrate our digital economy into global trade networks.",
    },
  ];

  const nigerianBenefits = [
    {
      title: "Better Services",
      description: "Access government services digitally from anywhere, anytime. No more long queues or paperwork.",
    },
    {
      title: "More Jobs",
      description: "Thousands of new opportunities in the digital economy. Get trained and employed in high demand tech roles.",
    },
    {
      title: "Digital Security",
      description: "Your data and digital identity protected by world-class cybersecurity infrastructure.",
    },
  ];

  const presidentialPriorities = [
    {
      icon: TrendingUp,
      title: "Reforming the Economy for Growth",
      description: "Strengthening productivity, attracting investment, and expanding digital driven opportunities that create jobs and inclusive growth.",
    },
    {
      icon: Users,
      title: "Infrastructure & Transportation",
      description: "Building resilient, physical and digital infrastructure that connects people, markets and services nationwide.",
    },
    {
      icon: Shield,
      title: "National Security & Prosperity",
      description: "Protecting people, infrastructure and the digital space, while ensuring a safe environment for innovation and commerce.",
    },
    {
      icon: GraduationCap,
      title: "Education, Health & Social Investment",
      description: "Strengthening human capital through better access to education, healthcare and social protection, powered by technology.",
    },
    {
      icon: Sprout,
      title: "Boosting Agriculture & Food Security",
      description: "Using data and emerging technologies to improve yields, stabilize food systems and support farmers across the value chain.",
    },
    {
      icon: Cpu,
      title: "Industrialisation & Innovation",
      description: "Supporting local manufacturing, the creative economy and home grown digital solutions that compete globally.",
    },
    {
      icon: Zap,
      title: "Energy & Natural Resources",
      description: "Leveraging digital tools for transparency, efficiency and sustainability in the management of energy and natural resources.",
    },
    {
      icon: Rocket,
      title: "Governance & Service Delivery",
      description: "Improving public sector performance through better policies, data driven decision making and citizen centred digital services.",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* 1. Top Info Bar */}
      <div className="bg-[#0E3D2B] py-2.5 text-white relative z-50">
        <div className="w-full flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 text-center md:text-left">
          <p className="font-[400] text-[10px] md:text-[11px]">
            <strong>SRAP 2.0</strong>{" "}
            Strategic Roadmap and Action Plan (SRAP 2.0) 2024-2027
          </p>
          {/* <p className="font-[400] text-[10px] md:text-[11px] mt-1 md:mt-0">
            Aligned with the <strong>Renewed Hope Agenda</strong> and the
            Ministry of Communications, Innovation & Digital Economy.
          </p> */}
        </div>
      </div>

      {/* 2. Imported Navbar */}
      <LandingNavbar />

      {/* 3. Hero Section (Animated & Left Aligned) */}
      <section
        id="home"
        className="relative text-white py-20 px-4 bg-cover bg-center bg-no-repeat min-h-[650px] flex items-center"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full pt-4">
          {/* LEFT ALIGNED CONTENT */}
          <div className="max-w-3xl text-left animate-in fade-in slide-in-from-left-8 duration-1000">
            <p className="mb-[6.1px] font-[700] text-[13px] text-[#C9A24A] uppercase tracking-wider">
              NIGERIA’S DIGITAL TRANSFORMATION
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] drop-shadow-sm tracking-tight text-white">
              Strategic Roadmap <br /> 
              <span className="text-white/80 font-semibold">& Action Plan 2.0</span>
            </h1>
            <p className="text-[16px] md:text-[18px] mb-10 text-white/90 font-normal leading-relaxed max-w-xl drop-shadow-sm">
              Nigeria's definitive blueprint for a resilient, inclusive, and prosperous digital economy. Driving innovation, building capacity, and securing our digital future across the federation.
            </p>

            {/* LEFT ALIGNED BUTTONS */}
            <div className="flex flex-wrap gap-4 justify-start mt-8">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-[#C9A24A] hover:bg-[#b08d3e] px-8 py-7 rounded-md text-black font-bold text-base transition-all hover:scale-105"
              >
                Register as Stakeholder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {/* <Button
                size="lg"
                onClick={handleDownloadPDF}
                className="bg-white hover:bg-white/90 text-black px-8 py-7 rounded-md font-bold text-base transition-all hover:scale-105 shadow-xl"
              >
                Download Full Report
              </Button> */}
            </div>
          </div>
        </div>
      </section>


      {/* Journey Section (Animated) */}
      <section id="about" className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The SRAP 2.0 Journey: From Vision To Impact
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base leading-relaxed">
                Our journey is not just about technology; it's about transforming
                lives. Through strategic planning, inclusive implementation, and
                measurable outcomes, we're building a digital Nigeria where every
                citizen can thrive in the fourth industrial revolution.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex justify-center mb-16">
              <img
                src={coreValuesImage}
                alt="Our Core Values"
                className="max-w-full h-auto hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-16 text-center">
              <blockquote className="text-2xl md:text-3xl font-semibold italic text-foreground max-w-4xl mx-auto">
                "Our journey is not over, our goals are clear, and our commitment
                stronger than ever."
              </blockquote>
              <p className="text-muted-foreground mt-4 text-lg">
                - NITDA Leadership
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Presidential Priorities (Animated) */}
      <section id="priorities" className="py-20 px-4 bg-[#004D2D] text-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Presidential Priorities
              </h2>
              <div className="w-20 h-1 bg-yellow-500 mx-auto mb-6"></div>
              <p className="text-green-50 max-w-4xl mx-auto">
                As we unveil SRAP 2.0, we are mindful of the President's redefined
                priorities, which deeply resonates with our mission and the
                broader aspirations of our people.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {presidentialPriorities.map((priority, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card
                  className="bg-green-900/40 border-green-700/50 hover:bg-green-900/60 transition-all hover:-translate-y-1 hover:shadow-xl duration-300 h-full"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-600/20 p-3 rounded-full flex-shrink-0">
                        <priority.icon className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 text-white">
                          {priority.title}
                        </h3>
                        <p className="text-green-100 text-sm leading-relaxed">
                          {priority.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Alignment (Animated) */}
      <section id="alignment" className="py-20 px-4 bg-[#00663B] text-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How SRAP 2.0 Aligns With The Ministry's Strategic Pillars
              </h2>
              <div className="w-20 h-1 bg-yellow-500 mx-auto mb-6"></div>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-600 transform -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-12">
              {pillarsAlignment.map((pillar, index) => (
                <ScrollReveal key={index} delay={index * 150}>
                  <div
                    className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                  >
                    {/* Card */}
                    <div
                      className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                        }`}
                    >
                      <Card className="bg-white text-foreground hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg flex-shrink-0">
                              <pillar.icon className="h-6 w-6 text-green-700 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground uppercase">
                              {pillar.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {pillar.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline Node */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-600 rounded-full border-4 border-green-800 items-center justify-center z-10 shadow-lg">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Pillars Image (Animated) */}
      <section id="pillars" className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                SRAP 2.0: Strategic Pillars
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base leading-relaxed">
                Eight interconnected pillars forming the foundation of Nigeria's
                digital transformation.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="flex justify-center">
              <img
                src={srapPillarsImage}
                alt="SRAP 2.0 Strategic Pillars Structure"
                className="max-w-full h-auto hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Nigerian Benefits (Animated) */}
      <section id="benefits" className="py-20 px-4 bg-[#004D2D] text-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What this means for Nigerians
              </h2>
              <p className="text-green-50 max-w-3xl mx-auto">
                Real, tangible benefits that will improve daily life for every
                Nigerian citizen
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {nigerianBenefits.map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 150}>
                <Card className="bg-white/10 border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardContent className="p-8 text-center text-white">
                    <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                    <p className="text-green-50">{benefit.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics (Animated) */}
      <section id="impact" className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Measuring Our Impact
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base leading-relaxed">
                Data driven results showing real progress towards our digital
                transformation goals
              </p>
            </div>
          </ScrollReveal>

          {summary && summary.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {summary?.map((metric, index) => (
                <ScrollReveal key={index} delay={index * 100}>
                  <Card
                    className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-green-600"
                  >
                    <CardContent className="p-8">
                      <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
                        {(metric?.annual?.actual_annual ?? 0) > 0 ? (
                          parseFloat(metric?.annual?.actual_annual).toLocaleString()
                        ) : (
                          <span className="text-lg bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium border border-yellow-200">
                            In Progress
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground font-medium">{metric.name}</div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-yellow-100 p-4 rounded-full mb-4 animate-bounce">
                  <img src={srapPillarsImage} className="h-12 w-12 opacity-50" alt="In Progress" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Impact Assessment In Progress</h3>
                <p className="text-muted-foreground max-w-md">
                  Data compilation for the selected period is currently underway. Metrics will be updated as they are verified.
                </p>
              </div>
            </ScrollReveal>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 p-6 text-lg hover:scale-105 transition-transform"
              onClick={() => navigate("/public-dashboard")}
            >
              View Full Dashboard
            </Button>
          </div>
        </div>
      </section>


      {/* 4. Trusted Partners & Stakeholders */}
      <section className="bg-background py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.3em] mb-12">
            TRUSTED PARTNERS & STAKEHOLDERS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            <img src={nitdaLogo} alt="NITDA" className="h-10 md:h-12 w-auto object-contain" />
            <img src={germanyLogo} alt="German Cooperation" className="h-14 md:h-16 w-auto object-contain" />
            <img src={euLogo} alt="European Union" className="h-14 md:h-16 w-auto object-contain" />
            <img src={gizLogo} alt="GIZ" className="h-10 md:h-12 w-auto object-contain" />
            <img src={dtcnLogo} alt="DTCN" className="h-10 md:h-12 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* FAQ (Animated) */}
      <section id="faq" className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Frequently Asked Questions
              </h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto mb-4"></div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                      className="w-full flex items-start justify-between gap-4 text-left group"
                    >
                      <span className="font-semibold text-lg flex-1 group-hover:text-green-700 transition-colors">
                        {faq.question}
                      </span>
                      {openFaq === index ? (
                        <Minus className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                        {faq.answer}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (Animated) */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        style={{ backgroundColor: "#c4a661" }}
      >
        <img
          src={waveLeft}
          alt=""
          className="absolute left-0 top-0 h-full w-auto object-cover opacity-40 animate-pulse"
        />
        <img
          src={waveRight}
          alt=""
          className="absolute right-0 bottom-0 h-full w-auto object-cover opacity-40 animate-pulse"
        />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Get Involved in Nigeria's Digital Future
            </h2>
            <p className="text-lg mb-12 text-gray-800">
              Partner with NITDA to drive innovation, provide feedback, or access
              resources.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {/* <button
                onClick={handleDownloadPDF}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full flex items-center gap-3 font-medium transition-all hover:scale-105 shadow-lg"
              >
                Download SRAP 2.0
                <ExternalLink className="h-5 w-5" />
              </button> */}
              <button
                onClick={() => setFeedbackModal({ open: true, category: 'suggestion', subject: 'Feedback on SRAP 2.0' })}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full flex items-center gap-3 font-medium transition-all hover:scale-105 shadow-lg"
              >
                Submit Feedback
                <ExternalLink className="h-5 w-5" />
              </button>
              <button
            onClick={() => navigate("/register")}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full flex items-center gap-3 font-medium transition-all hover:scale-105 shadow-lg"
              >
                Partner With Us
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#042F1A] text-white py-12 px-4 relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SRAP 2.0</h3>
              <p className="text-green-100 text-sm">
                Building Nigeria's digital future through strategic planning and
                inclusive implementation.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">USEFUL LINKS</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors text-left">
                    About SRAP 2.0
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pillars')} className="hover:text-white transition-colors text-left">
                    Strategic Pillars
                  </button>
                </li>
                <li>
                  <button onClick={handleDownloadPDF} className="hover:text-white transition-colors text-left">
                    Reports &amp; Publications
                  </button>
                </li>
                <li>
                  <a href="mailto:info@nitda.gov.ng" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">CONTACT</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><a href="mailto:info@nitda.gov.ng" className="hover:text-white transition-colors">info@nitda.gov.ng</a></li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><span>+234 (0) 9 461 0360</span></li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>Abuja, Nigeria</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-green-100/60 w-full text-center md:text-left">
              &copy; 2024 NITDA. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>

      {/* Feedback / Contact Modal */}
      <FeedbackModal
        isOpen={feedbackModal.open}
        onClose={() => setFeedbackModal((p) => ({ ...p, open: false }))}
        defaultCategory={feedbackModal.category}
        defaultSubject={feedbackModal.subject}
      />
    </div>
  );
};

export default SrapLandingPage;