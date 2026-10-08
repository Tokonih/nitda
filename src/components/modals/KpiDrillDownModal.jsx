import React, { useState, useEffect } from 'react';
import {
    X,
    Target,
    BarChart3,
    TrendingUp,
    BarChart2,
    Info
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getKpiValuesApi } from "@/Slices/Utils/Api/kpi";

const KpiDrillDownModal = ({ isOpen, onClose, data }) => {
    const [monthlyValues, setMonthlyValues] = useState([]);
    const [fetchedData, setFetchedData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            if (!isOpen || !data?.kpi_id) return;

            setLoading(true);
            try {
                const response = await getKpiValuesApi({
                    kpi_id: data.kpi_id,
                    year: data.year || 2026,
                    department_id: data.department_id
                });

                if (response.data && response.data.length > 0) {
                    const record = response.data[0];
                    setFetchedData(record);

                    // Extract monthly values
                    const monthKeys = [
                        'jan_value', 'feb_value', 'mar_value', 'apr_value', 'may_value', 'jun_value',
                        'jul_value', 'aug_value', 'sep_value', 'oct_value', 'nov_value', 'dec_value'
                    ];
                    const reconciledMonths = monthKeys.map(key => parseFloat(record[key] || 0));

                    // Calculate running total for accumulation trend
                    let runningTotal = 0;
                    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const accumulation = reconciledMonths.map((val, idx) => {
                        runningTotal += val;
                        return {
                            month: monthLabels[idx],
                            value: val,
                            accumulated: runningTotal
                        };
                    });

                    setMonthlyValues(accumulation);
                }
            } catch (error) {
                // Error fetching monthly KPI values
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchMonthlyData();
        } else {
            setMonthlyValues([]);
            setFetchedData(null);
        }
    }, [isOpen, data?.kpi_id, data?.year]);

    if (!isOpen) return null;

    // Numerical extraction and helpers
    const formatValue = (num, commas = true) => {
        const val = typeof num === 'string' ? parseFloat(num) : num;
        if (num === undefined || num === null || isNaN(val)) return "0";
        const roundedNum = Math.round((val + Number.EPSILON) * 100) / 100;
        if (!commas) return roundedNum.toString();
        return new Intl.NumberFormat('en-US').format(roundedNum);
    };

    const title = data?.kpi_name || data?.name || "KPI Details";
    const unit = data?.unit || "";

    // SOURCE OF TRUTH HIERARCHY:
    // 1. Quarterly bars & Annual metrics → Use scorecard props (quartar1-4)
    // 2. Monthly accumulation trend → Use kpi-values API (fetchedData)

    // Extract quarterly data from scorecard props for the bar chart
    const quarters = [1, 2, 3, 4].map(q => {
        const quartarKey = `quartar${q}`;
        const qData = data?.[quartarKey] || {};
        return {
            name: `Q${q}`,
            target: parseFloat(qData[`target_q${q}`] || 0),
            actual: parseFloat(qData[`actual_q${q}`] || 0)
        };
    });

    // PRIORITY: Use annual object if available (from annual scorecard API)
    // FALLBACK: Sum quarterly data (from quarterly scorecard API)
    let annualTarget, annualActual, completion;

    if (data?.annual) {
        // Use backend-calculated annual metrics
        annualTarget = parseFloat(data.annual.target_annual || 0);
        annualActual = parseFloat(data.annual.actual_annual || 0);
        completion = parseFloat(data.annual.annual_percentage_target_completion || 0);
    } else {
        // Fallback: Calculate from quarterly data
        annualTarget = quarters.reduce((acc, q) => acc + q.target, 0);
        annualActual = quarters.reduce((acc, q) => acc + q.actual, 0);
        completion = annualTarget > 0 ? (annualActual / annualTarget) * 100 : 0;
    }

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return "#7C3AED"; // Purple (A+)
        if (percentage >= 80) return "#3B82F6"; // Blue (A)
        if (percentage >= 70) return "#22C55E"; // Green (B)
        if (percentage >= 60) return "#F59E0B"; // Yellow (C)
        if (percentage >= 50) return "#F97316"; // Orange (D)
        return "#EF4444"; // Red (E)
    };

    // Use backend performance threshold for color if available
    const performanceThreshold = data?.annual?.performance_threshold || data?.performance_threshold;
    const gradeColor = performanceThreshold ?
        (performanceThreshold === 'A+' ? "#7C3AED" :
            performanceThreshold === 'A' ? "#3B82F6" :
                performanceThreshold === 'B' ? "#22C55E" :
                    performanceThreshold === 'C' ? "#F59E0B" :
                        performanceThreshold === 'D' ? "#F97316" : "#EF4444") :
        getGradeColor(completion);

    // Chart Scaling - Unified
    const chartHeight = 180;
    const allNumericValues = [
        ...quarters.map(q => q.target),
        ...quarters.map(q => q.actual),
        ...(monthlyValues.length > 0 ? monthlyValues.map(m => m.accumulated) : []),
        annualTarget,
        annualActual,
        1
    ].filter(v => typeof v === 'number' && !isNaN(v));

    const rawMax = Math.max(...allNumericValues);
    const chartMax = rawMax === 0 ? 100 : rawMax;

    // Trend calculation
    const xPointsTrend = Array.from({ length: 12 }, (_, i) => (i * 100) / 11);
    let trendLinePath = "";
    if (monthlyValues.length === 12) {
        const trendPoints = monthlyValues.map((m, i) => {
            const hPercent = (m.accumulated / chartMax) * 100;
            const y = 100 - Math.min(100, hPercent);
            return `${xPointsTrend[i]},${y}`;
        });
        trendLinePath = `M${trendPoints.join(' L')}`;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                            <Badge variant="outline" className="font-extrabold text-[10px] px-3 py-0.5" style={{ color: gradeColor, borderColor: gradeColor + '40', backgroundColor: gradeColor + '08' }}>
                                {performanceThreshold === "A+" || (annualActual >= annualTarget && annualTarget > 0) || completion >= 90 ? "EXCEPTIONAL (A+)" :
                                    (performanceThreshold === "A" || completion >= 80 ? "HIGHLY EFFICIENT (A)" :
                                        (performanceThreshold === "B" || completion >= 70 ? "EFFICIENT (B)" :
                                            (performanceThreshold === "C" || completion >= 60 ? "AVERAGE (C)" :
                                                (performanceThreshold === "D" || completion >= 50 ? "FAIR (D)" : "BELOW TARGET (E)"))))}
                            </Badge>
                        </div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">KPI Deep Dive & Trend Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-4 h-4 text-gray-400" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Annual Target</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-gray-900 leading-none">{formatValue(annualTarget)}</span>
                                <span className="text-xs font-medium text-gray-500">{unit}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current Actual</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold text-gray-900 leading-none">{formatValue(annualActual)}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4" style={{ color: gradeColor }} />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overall Progress</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-semibold leading-none" style={{ color: gradeColor }}>{completion.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                        {/* Bar Chart Container */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-8">
                                <BarChart2 className="w-4 h-4 text-gray-500" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Quarterly Target vs Actual</h3>
                            </div>

                            <div className="relative w-full" style={{ height: `${chartHeight + 40}px` }}>
                                {/* Horizontal Grid Lines (Shared) */}
                                <div className="absolute inset-0" style={{ height: `${chartHeight}px` }}>
                                    {[1, 0.75, 0.5, 0.25, 0].map((level, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full flex items-center h-0"
                                            style={{ top: `${(1 - level) * 100}%` }}
                                        >
                                            <span className="w-12 text-right pr-2 text-[10px] font-bold text-gray-400">
                                                {formatValue(chartMax * level)}
                                            </span>
                                            <div className={`flex-1 border-t ${level === 0 ? 'border-gray-300' : 'border-dashed border-gray-100'}`}></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Area (Anchored to shared baseline) */}
                                <div className="absolute inset-x-0 top-0 ml-12 h-full overflow-hidden" style={{ height: `${chartHeight}px` }}>
                                    <div className="flex items-end justify-around h-full w-full px-4">
                                        {quarters.map((q) => (
                                            <div key={q.name} className="flex items-end justify-center w-20 gap-1.5 h-full relative">
                                                {/* Target Bar */}
                                                <div
                                                    className="w-5 bg-gray-100/90 rounded-t-sm hover:bg-gray-200 transition-colors relative group"
                                                    style={{ height: `${Math.max(1, (q.target / chartMax) * 100)}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl z-20 pointer-events-none">
                                                        T: {formatValue(q.target)}
                                                    </div>
                                                </div>
                                                {/* Actual Bar */}
                                                <div
                                                    className="w-5 rounded-t-sm relative group transition-all"
                                                    style={{ height: `${Math.max(1, (q.actual / chartMax) * 100)}%`, backgroundColor: gradeColor }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl z-20 pointer-events-none">
                                                        A: {formatValue(q.actual)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* X-Axis Labels */}
                                <div className="absolute left-12 right-0 bottom-0 h-8 flex justify-around items-center">
                                    {quarters.map(q => (
                                        <span key={q.name} className="text-[10px] font-extrabold text-gray-400 uppercase w-20 text-center">{q.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: gradeColor }}></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actual</span>
                                </div>
                            </div>
                        </div>

                        {/* Trend Chart Container */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Monthly Accumulation Trend</h3>
                            </div>

                            <div className="relative w-full" style={{ height: `${chartHeight + 40}px` }}>
                                {/* Shared Grid Lines */}
                                <div className="absolute inset-0" style={{ height: `${chartHeight}px` }}>
                                    {[1, 0.75, 0.5, 0.25, 0].map((level, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full flex items-center h-0"
                                            style={{ top: `${(1 - level) * 100}%` }}
                                        >
                                            <span className="w-12 text-right pr-2 text-[10px] font-bold text-gray-400">
                                                {formatValue(chartMax * level)}
                                            </span>
                                            <div className={`flex-1 border-t ${level === 0 ? 'border-gray-300' : 'border-dashed border-gray-100'}`}></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Trend Area */}
                                <div className="absolute inset-x-0 top-0 ml-12" style={{ height: `${chartHeight}px` }}>
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full relative">
                                            {trendLinePath && (
                                                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                    <path
                                                        d={trendLinePath}
                                                        fill="none"
                                                        stroke={gradeColor}
                                                        strokeWidth="2"
                                                        vectorEffect="non-scaling-stroke"
                                                        className="transition-all duration-700"
                                                    />
                                                </svg>
                                            )}

                                            {monthlyValues.map((m, i) => {
                                                const yPercent = 100 - ((m.accumulated / chartMax) * 100);
                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute w-2.5 h-2.5 bg-white border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 group transition-all hover:scale-125 cursor-pointer"
                                                        style={{
                                                            left: `${xPointsTrend[i]}%`,
                                                            top: `${Math.max(0, Math.min(100, yPercent))}%`,
                                                            borderColor: gradeColor
                                                        }}
                                                    >
                                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl z-20 pointer-events-none whitespace-nowrap">
                                                            <div className="font-bold">{m.month}</div>
                                                            <div>{formatValue(m.accumulated)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* X-Axis Labels */}
                                <div className="absolute left-12 right-0 bottom-0 h-8">
                                    {monthlyValues.map((m, i) => (
                                        <div
                                            key={i}
                                            className="absolute flex flex-col items-center"
                                            style={{
                                                left: `${xPointsTrend[i]}%`,
                                                width: '40px',
                                                marginLeft: '-20px'
                                            }}
                                        >
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                                                {m.month}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#052e23] rounded-lg p-5 flex items-center gap-3 shadow-md border border-[#0a4d3a]">
                        <Info className="w-5 h-5 text-emerald-300" />
                        <span className="text-white font-semibold text-sm">Detailed Data Sync: This deep dive synchronizes quarterly scorecard actuals with granular monthly submission data.</span>
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-[#052e23] hover:bg-[#0a4d3a] text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all active:scale-95"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KpiDrillDownModal;
