import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublicScorecard, getOverallPerformance, getPublicSummary } from "../Slices/Utils/Api/publicSummary";
import { useYears } from "@/hooks/use-years";
import { useDispatch } from "react-redux";
import { fetchScorecardConfig } from "../Slices/scoreCardConfigSlice";

const PublicDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { years: yearsList } = useYears();
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  const [pillars, setPillars] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState([]);
  const [overallPerformance, setOverallPerformance] = useState({ percentage: 0, average: '-' });
  const [loading, setLoading] = useState(true);

  const handleDownloadPDF = () => {
    window.open('https://nitda.gov.ng/wp-content/uploads/2024/02/SRAP-2.O.pdf', '_blank');
  };

  const getStatusColor = (scoreVal) => {
    const score = parseFloat(scoreVal) || 0;
    if (score >= 90) return 'bg-purple-100 text-purple-700';
    if (score >= 80) return 'bg-blue-100 text-blue-700';
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 50) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getProgressColor = (scoreVal) => {
    const score = parseFloat(scoreVal) || 0;
    if (score >= 90) return 'bg-[#7C3AED]';
    if (score >= 80) return 'bg-[#3B82F6]';
    if (score >= 70) return 'bg-[#22C55E]';
    if (score >= 60) return 'bg-[#F59E0B]';
    if (score >= 50) return 'bg-[#F97316]';
    return 'bg-[#EF4444]';
  };

  useEffect(() => {
    const fetchPillars = async () => {
      try {
        setLoading(true);
        // Reset stale data immediately so previous year's data doesn't linger
        setPillars([]);
        setOverallPerformance({ percentage: 0, average: '-' });
        setImpactMetrics([]);

        const isQuarter = selectedQuarter !== 'all';
        const periodType = isQuarter ? 'quarterly' : 'annual';
        const quarterNum = isQuarter ? parseInt(selectedQuarter) : undefined;

        const [scorecardResponse, overallResponse, summaryResponse] = await Promise.all([
          getPublicScorecard({
            year: selectedYear,
            period_type: periodType,
            ...(isQuarter ? { quarter: quarterNum } : {}),
          }),
          getOverallPerformance({
            year: selectedYear,
            period_type: 'annual',
          }),
          getPublicSummary({ year: selectedYear, limit: 10 })
        ]);

        if (summaryResponse?.data) setImpactMetrics(summaryResponse.data);

        if (overallResponse?.data) {
          const avg = overallResponse.data.overall_percentage || 0;
          setOverallPerformance({
            percentage: parseFloat(avg).toFixed(1),
            average: overallResponse.data.performance_threshold || '-',
          });
        }

        if (scorecardResponse?.data) {
          const mappedPillars = scorecardResponse.data.map((pillar, index) => {
            const pillarPct = parseFloat(pillar.annual_percentage_target_completion ?? 0);

            let remark = 'Needs Improvement';
            if (pillarPct >= 90) remark = 'Exceptional';
            else if (pillarPct >= 80) remark = 'Highly Efficient';
            else if (pillarPct >= 70) remark = 'Efficient';
            else if (pillarPct >= 60) remark = 'Average';
            else if (pillarPct >= 50) remark = 'Fair';

            const allKpis = [];
            const allObjectives = [];
            pillar.initiatives?.forEach(initiative => {
              initiative.objectives?.forEach(objective => {
                allObjectives.push(objective.name);
                objective.kpis?.forEach(kpi => {
                  allKpis.push({ ...kpi, objectiveName: objective.name, initiativeName: initiative.name });
                });
              });
            });

            const activityValues = (pillar.stakeholder_activities_values || []).map(av => ({
              stakeholderName: av.stakeholder_name,
              activityTitle: av.activity_title,
              value: av.value,
              dateUploaded: av.date_uploaded,
            }));

            const metrics = allKpis.map(kpi => {
              let kpiComp = 0;
              let actualAnnual = 0;
              if (isQuarter) {
                const qKey = `quartar${quarterNum}`;
                const qObj = kpi[qKey] || kpi[`q${quarterNum}`] || {};
                const targetVal = parseFloat(qObj[`target_q${quarterNum}`] || 0);
                actualAnnual = parseFloat(qObj[`actual_q${quarterNum}`] || 0);
                if (qObj[`q${quarterNum}_percentage_target_completion`] != null) {
                  kpiComp = parseFloat(qObj[`q${quarterNum}_percentage_target_completion`]);
                } else if (targetVal > 0) {
                  kpiComp = (actualAnnual / targetVal) * 100;
                }
              } else {
                kpiComp = parseFloat(kpi.annual?.annual_percentage_target_completion ?? 0);
                actualAnnual = parseFloat(kpi.annual?.actual_annual ?? 0);
                const targetVal = parseFloat(kpi.annual?.target_annual ?? 0);
                if (kpiComp === 0 && actualAnnual > 0 && targetVal > 0) {
                  kpiComp = (actualAnnual / targetVal) * 100;
                }
              }

              return {
                metric: kpi.name,
                unit: kpi.unit || '',
                actualAnnual,
                percentage: kpiComp,
                statusColor: getStatusColor(kpiComp),
                progressColor: getProgressColor(kpiComp),
              };
            });

            return {
              id: pillar.id || index + 1,
              pillarNumber: `PILLAR 0${pillar.order || (index + 1)}`,
              title: pillar.name || 'Unknown Pillar',
              score: `${pillarPct.toFixed(0)}%`,
              scoreNum: pillarPct,
              status: remark,
              statusColor: getStatusColor(pillarPct),
              progressColor: getProgressColor(pillarPct),
              objectives: allObjectives,
              activityValues,
              metrics,
            };
          });
          setPillars(mappedPillars);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchPillars();
    dispatch(fetchScorecardConfig());
  }, [selectedYear, selectedQuarter, dispatch]);

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'What exactly is SRAP 2.0?',
      answer: "SRAP 2.0 is NITDA's Strategic Roadmap & Action Plan for 2025-2027. It guides Nigeria's digital transformation across 8 focus pillars.",
    },
    {
      question: 'Who is responsible for implementing SRAP 2.0?',
      answer: 'NITDA leads the implementation with support from government ministries, private sector partners, and civil society organisations.',
    },
    {
      question: 'How is progress measured?',
      answer: 'Progress is measured through KPIs and metrics tracked in real-time across all strategic pillars, with quarterly and annual reviews.',
    },
    {
      question: 'How can citizens or organisations get involved?',
      answer: 'Citizens and organisations can partner with NITDA, provide feedback, or access resources. Contact us at info@nitda.gov.ng.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-[#00663B] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-1 px-2 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium border border-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
                Go Back
              </button>
              <h1 className="text-xl font-heading font-bold text-white border-l border-white/20 pl-4 ml-2">SRAP 2.0</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/srap-landing" className="text-sm text-gray-300 hover:text-[#c4a661] transition-colors font-medium">
                Home
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#2dd4bf]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs text-white/90 font-medium">
            SRAP 2.0: Strategic Roadmap &amp; Action Plan (2025-2027)
            <span className="ml-8 text-white/80">Aligned with the Renewed Hope Agenda and the Federal Ministry of Communications, Innovation &amp; Digital Economy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Performance Tracker</h2>
              <p className="text-gray-600 text-sm">Real-time data measuring the execution of the Strategic Roadmap (SRAP 2.0).</p>
            </div>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                  <SelectTrigger className="w-[110px] h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsList?.length > 0
                      ? yearsList.map((y) => (
                          <SelectItem key={y.id || y.year} value={y.year.toString()}>{y.year}</SelectItem>
                        ))
                      : <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Quarter:</label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="w-[130px] h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="All Quarters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
              <div className="bg-gray-300 p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-3 bg-gray-400 rounded w-1/2 mb-4" />
                <div className="h-10 bg-gray-400 rounded w-2/3" />
              </div>
            </>
          ) : (
            <>
              {impactMetrics.map((metric, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">{metric.name}</div>
                  <div className="text-3xl font-heading font-bold text-gray-900 mb-2">
                    {(metric?.annual?.actual_annual ?? 0) > 0
                      ? parseFloat(metric?.annual?.actual_annual).toLocaleString()
                      : <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium border border-yellow-200">In Progress</span>
                    }
                  </div>
                </div>
              ))}
              {/* <div className="bg-[#00663B] p-6 rounded-lg shadow-sm relative overflow-hidden text-white">
                <div className="text-xs text-[#c4a661] mb-2 uppercase tracking-wider font-bold opacity-90">Overall Performance</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-heading font-bold text-white">{overallPerformance.percentage}%</div>
                    <div className="text-xs font-medium mt-2 text-gray-300">On-Plan Average ({overallPerformance.average})</div>
                  </div>
                  <div className="w-20 h-20 relative flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#c4a661" strokeWidth="3" strokeDasharray={`${overallPerformance.percentage}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">
                      {overallPerformance.average}
                    </div>
                  </div>
                </div>
              </div> */}
            </>
          )}
        </div>

        {/* Strategic Pillars */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Real-time progress across all Pillars</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-2 bg-gray-200 rounded-full w-full mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : pillars.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-lg font-semibold text-gray-700 mb-2">No data available for {selectedYear}</p>
              <p className="text-sm text-gray-500">Try selecting a different year or quarter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  onClick={() => { setSelectedPillar(pillar); setIsFullscreen(false); }}
                  className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-2">{pillar.pillarNumber}</div>
                      <h4 className="text-base font-heading font-semibold text-gray-900 mb-3">{pillar.title}</h4>
                    </div>
                    {/* <div className={`text-2xl font-heading font-bold ml-4 ${pillar.statusColor.split(' ')[1]}`}>
                      {pillar.score}
                    </div> */}
                  </div>
                  {/* <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${pillar.progressColor}`} style={{ width: pillar.score }} />
                    </div>
                  </div> */}
                  {/* <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${pillar.statusColor}`}>
                      {pillar.status}
                    </span>
                    <button className="text-xs text-primary hover:text-primary-dark font-medium">
                      View Details →
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h3 className="text-2xl font-heading font-bold text-foreground text-center mb-2">Frequently Asked Questions</h3>
          <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6" />
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-lg border border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <span className="text-muted-foreground text-xl ml-4 shrink-0">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-border pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      {/* <div className="py-20 px-4 text-center" style={{ backgroundColor: '#c4a661' }}>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-heading font-bold text-gray-900 mb-2">Get Involved in</h3>
          <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">Nigeria's Digital Future</h3>
          <p className="text-gray-800 mb-8 max-w-2xl mx-auto font-medium">
            Partner with NITDA to drive innovation, provide feedback, or access resources.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Download SRAP 2.0
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button
              onClick={() => window.open('mailto:info@nitda.gov.ng?subject=Feedback%20on%20SRAP%202.0', '_blank')}
              className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Submit Feedback
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
            <button
              onClick={() => window.open('mailto:info@nitda.gov.ng?subject=Partnership%20Inquiry%20-%20SRAP%202.0', '_blank')}
              className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Partner With Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>
      </div> */}

      {/* Footer */}
      <footer className="bg-[#004D2D] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-heading font-bold mb-4">NITDA</h4>
              <p className="text-sm text-green-100 leading-relaxed">
                National Information Technology Development Agency. Driving Nigeria's digital transformation through innovative policies and strategic planning.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-heading font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-green-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>National Information Technology Development Agency, Abuja, Nigeria</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>+234 (0) 9 461 0360</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:info@nitda.gov.ng" className="hover:text-[#c4a661] transition-colors">info@nitda.gov.ng</a>
                </div>
              </div>
            </div>
            {/* <div>
              <h4 className="text-sm font-heading font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li>
                  <a href="mailto:info@nitda.gov.ng?subject=NITDA%20Enquiry" className="hover:text-[#c4a661] transition-colors">Contact NITDA</a>
                </li>
                <li>
                  <button onClick={handleDownloadPDF} className="hover:text-[#c4a661] transition-colors text-left">SRAP 2.0 Full Report</button>
                </li>
                <li>
                  <Link to="/srap-landing" className="hover:text-[#c4a661] transition-colors">Landing Page</Link>
                </li>
                <li>
                  <a href="mailto:info@nitda.gov.ng?subject=Partnership%20Inquiry%20-%20SRAP%202.0" className="hover:text-[#c4a661] transition-colors">Partner With Us</a>
                </li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-green-100/70">
            &copy; 2025 National Information Technology Development Agency (NITDA). All rights reserved.
          </div>
        </div>
      </footer>

      {/* Pillar Detail Modal */}
      {selectedPillar && (
        <div
          className={`fixed inset-0 bg-black/50 z-50 flex ${isFullscreen ? '' : 'items-center justify-center p-4'}`}
          onClick={() => { if (!isFullscreen) { setSelectedPillar(null); setIsFullscreen(false); } }}
        >
          <div
            className={`bg-card flex flex-col overflow-hidden transition-all duration-200 ${
              isFullscreen ? 'w-full h-full rounded-none' : 'rounded-xl max-w-4xl w-full max-h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{selectedPillar.pillarNumber}</div>
                <h3 className="text-xl font-heading font-bold text-foreground">{selectedPillar.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setSelectedPillar(null); setIsFullscreen(false); }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Achievement overview */}
              {/* <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-muted/30 rounded-xl border border-border">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Achievement Score</div>
                  <div className={`text-4xl font-heading font-bold ${selectedPillar.statusColor.split(' ')[1]}`}>
                    {selectedPillar.score}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedPillar.statusColor}`}>
                  {selectedPillar.status}
                </span>
              </div> */}

              {/* Stakeholder Activities */}
              {selectedPillar.activityValues?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-heading font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Stakeholder Activities ({selectedPillar.activityValues.length})
                  </h4>
                  <div className="border border-border rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-muted">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stakeholder</th>
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity</th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Value</th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedPillar.activityValues.map((av, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{av.stakeholderName}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate" title={av.activityTitle}>{av.activityTitle}</td>
                            <td className="px-4 py-2.5 text-xs font-bold text-right text-foreground">{Number(av.value).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-xs text-right text-muted-foreground whitespace-nowrap">{av.dateUploaded}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* KPI Breakdown */}
              {selectedPillar.metrics?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-heading font-semibold text-foreground mb-3 uppercase tracking-wide">KPI Breakdown</h4>
                  <div className="border border-border rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[480px]">
                      <thead className="bg-muted">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Key Performance Indicator</th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-32">Actual</th>
                          {/* <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-36">Achievement</th> */}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedPillar.metrics.map((metric, index) => {
                          const pct = Math.min(metric.percentage || 0, 100);
                          const hasActual = metric.actualAnnual > 0;
                          return (
                            <tr key={index} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-sm text-foreground font-medium">{metric.metric}</td>
                              <td className="px-4 py-3 text-right">
                                {hasActual ? (
                                  <span className="text-sm font-semibold text-foreground">
                                    {metric.actualAnnual.toLocaleString()}
                                    {/* {metric.unit
                                      ? <span className="text-xs text-muted-foreground ml-1">{metric.unit.replace(/_/g, ' ')}</span>
                                      : null} */}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              {/* <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`text-sm font-bold ${metric.statusColor.split(' ')[1]}`}>
                                    {pct.toFixed(0)}%
                                  </span>
                                  <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${metric.progressColor}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!selectedPillar.activityValues?.length && !selectedPillar.metrics?.length && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-base font-medium mb-1">No data available</p>
                  <p className="text-sm">No activity or KPI data has been recorded for this pillar yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
