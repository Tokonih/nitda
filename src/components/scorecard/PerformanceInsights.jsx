import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { Layers, Target, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { getGradeHex } from "@/lib/gradeColors";

// ── Grade colours (canonical) ─────────────────────────────────────────────────
const gradeColors = {
    "A+": "#155535",
    A:   "#22C55E",
    B:   "#3B82F6",
    C:   "#F59E0B",
    D:   "#F97316",
    E:   "#EF4444",
};

// ── Client-side fallback calculator ──────────────────────────────────────────
const calculateStats = (dataList, selectedQuarter = "all") => {
    if (!dataList || !Array.isArray(dataList)) return {
        pillars: 0, objectives: 0, kpis: 0,
        averageScore: 0, averageScoreFixed: "0.0", overallGrade: "E",
        gradeCounts: { "A+": 0, A: 0, B: 0, C: 0, D: 0, E: 0 },
        totalTarget: 0, totalActual: 0,
    };

    let pillarsCount = dataList.length;
    let objectivesCount = 0;
    let kpisCount = 0;
    let totalScore = 0;
    let validKpis = 0;
    let totalTarget = 0;
    let totalActual = 0;
    const gradeCounts = { "A+": 0, A: 0, B: 0, C: 0, D: 0, E: 0 };

    dataList.forEach((pillar) => {
        pillar.initiatives?.forEach((initiative) => {
            initiative.objectives?.forEach((objective) => {
                objectivesCount++;
                objective.kpis?.forEach((kpi) => {
                    kpisCount++;
                    let completion = 0;
                    let threshold = "E";

                    if (selectedQuarter === "all" || !selectedQuarter) {
                        const ann = kpi.annual || {};
                        totalTarget += parseFloat(ann.target_annual || 0);
                        totalActual += parseFloat(ann.actual_annual || 0);
                        if (ann.annual_percentage_target_completion != null) {
                            completion = parseFloat(ann.annual_percentage_target_completion || 0);
                        } else {
                            const t = parseFloat(ann.target_annual || 0);
                            const a = parseFloat(ann.actual_annual || 0);
                            if (t > 0) completion = (a / t) * 100;
                        }
                        threshold = ann.performance_threshold || "E";
                    } else {
                        const qNum = selectedQuarter.replace("Q", "");
                        const qObj = kpi[`quartar${qNum}`] || kpi[`q${qNum}`] || kpi;
                        const t = parseFloat(qObj[`target_q${qNum}`] || qObj.target || 0);
                        const a = parseFloat(qObj[`actual_q${qNum}`] || qObj.actual || 0);
                        totalTarget += t;
                        totalActual += a;
                        if (qObj[`q${qNum}_percentage_target_completion`] != null) {
                            completion = parseFloat(qObj[`q${qNum}_percentage_target_completion`] || 0);
                        } else if (qObj.percentage_target_completion != null) {
                            completion = parseFloat(qObj.percentage_target_completion || 0);
                        } else if (t > 0) {
                            completion = (a / t) * 100;
                        }
                        threshold = qObj.performance_threshold || "E";
                    }

                    totalScore += completion;
                    validKpis++;
                    const grade = (threshold || "E").toUpperCase();
                    if (gradeCounts[grade] !== undefined) gradeCounts[grade]++;
                    else gradeCounts["E"]++;
                });
            });
        });
    });

    const averageScore = validKpis > 0 ? totalScore / validKpis : 0;
    let overallGrade = "E";
    if (averageScore >= 90) overallGrade = "A+";
    else if (averageScore >= 80) overallGrade = "A";
    else if (averageScore >= 70) overallGrade = "B";
    else if (averageScore >= 60) overallGrade = "C";
    else if (averageScore >= 50) overallGrade = "D";

    return {
        pillars: pillarsCount,
        objectives: objectivesCount,
        kpis: kpisCount,
        averageScore,
        averageScoreFixed: averageScore.toFixed(1),
        overallGrade,
        gradeCounts,
        totalTarget,
        totalActual,
    };
};

// ── Component ─────────────────────────────────────────────────────────────────
const PerformanceInsights = ({
    data = [],
    prevYearList = [],
    trajectoryData = {},
    selectedYear = "2025",
    selectedQuarter = "all",
    infographic = null,   // meta.infographic from API
}) => {
    // ── Derive summary — prefer API meta, fall back to client calc ────────────
    const summary = useMemo(() => {
        if (infographic) {
            const op = infographic.overall_performance || {};
            const ec = infographic.entity_counts || {};
            const gd = infographic.kpi_grade_distribution || {};
            const counts = gd.counts || {};
            const pct = Number(op.overall_percentage ?? 0);
            let overallGrade = "E";
            if (pct >= 90) overallGrade = "A+";
            else if (pct >= 80) overallGrade = "A";
            else if (pct >= 70) overallGrade = "B";
            else if (pct >= 60) overallGrade = "C";
            else if (pct >= 50) overallGrade = "D";

            return {
                pillars: ec.pillars ?? 0,
                objectives: ec.objectives ?? 0,
                kpis: ec.kpis ?? 0,
                averageScore: pct,
                averageScoreFixed: pct.toFixed(1),
                overallGrade: op.performance_threshold || overallGrade,
                gradeCounts: {
                    "A+": counts["A+"] ?? 0,
                    A:   counts["A"]  ?? 0,
                    B:   counts["B"]  ?? 0,
                    C:   counts["C"]  ?? 0,
                    D:   counts["D"]  ?? 0,
                    E:   counts["E"]  ?? 0,
                },
                totalTarget: Number(op.total_target ?? 0),
                totalActual: Number(op.total_actual ?? 0),
                criticalKpis: gd.critical_kpis || null,
            };
        }
        return { ...calculateStats(data, selectedQuarter), criticalKpis: null };
    }, [infographic, data, selectedQuarter]);

    // ── Previous year for trend ───────────────────────────────────────────────
    const prevSummary = useMemo(() => calculateStats(prevYearList, selectedQuarter), [prevYearList, selectedQuarter]);
    const trendDiff = summary.averageScore - prevSummary.averageScore;
    const hasPrevData = prevYearList && prevYearList.length > 0;

    // ── Year-to-year trajectory ───────────────────────────────────────────────
    const trendData = useMemo(() => {
        // Prefer API trajectory if available
        if (infographic?.year_to_year_performance_trajectory?.length) {
            return infographic.year_to_year_performance_trajectory.map((entry) => ({
                name: String(entry.year),
                score: Number(entry.overall_percentage ?? 0),
                grade: entry.performance_threshold || "E",
            }));
        }
        // Fallback: client-side calc across known years
        const years = ["2024", "2025", "2026", "2027"];
        return years.map((year) => {
            const yearData = trajectoryData[year] || [];
            const sourceData = (year === selectedYear && yearData.length === 0) ? data : yearData;
            const stats = calculateStats(sourceData, selectedQuarter);
            return { name: year, score: parseFloat(stats.averageScoreFixed), grade: stats.overallGrade };
        });
    }, [infographic, trajectoryData, data, selectedYear, selectedQuarter]);

    // ── Grade distribution for donut ─────────────────────────────────────────
    const distributionData = Object.entries(summary.gradeCounts)
        .filter(([, count]) => count > 0)
        .map(([grade, count]) => ({ name: grade, value: count, color: gradeColors[grade] }));

    const criticalCount = summary.criticalKpis?.count ?? summary.gradeCounts["E"] ?? 0;

    return (
        <div className="mb-8" id="dg-scorecard-insights">
            <h2 className="text-xl font-bold text-foreground mb-4">
                Performance Insights &amp; Details
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Card 1: Overall Performance ─────────────────────────────── */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col relative min-h-[280px]">
                    <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
                        OVERALL PERFORMANCE
                    </h3>

                    {/* Entity counts — top right */}
                    <div className="absolute top-5 right-5 flex flex-col gap-0.5 items-end z-10">
                        <div className="flex items-center gap-2 bg-[#155535]/10 px-2 py-1 rounded border border-[#155535]/20 min-w-[100px]">
                            <Layers className="w-3.5 h-3.5 text-[#155535]" />
                            <span className="text-xs font-bold text-foreground">{summary.pillars} Pillars</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded border border-green-100 min-w-[100px]">
                            <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                            <span className="text-xs font-bold text-foreground">{summary.objectives} Obj</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded border border-blue-100 min-w-[100px]">
                            <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span className="text-xs font-bold text-foreground">{summary.kpis} KPIs</span>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex-1 flex flex-col justify-center mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-5xl font-bold text-foreground">
                                {summary.averageScoreFixed}%
                            </span>
                            <span
                                className="flex items-center justify-center w-12 h-12 rounded-lg text-white text-xl font-bold border-2 border-card shadow-sm"
                                style={{ backgroundColor: gradeColors[summary.overallGrade] }}
                            >
                                {summary.overallGrade}
                            </span>
                        </div>

                        {/* Target vs Actual — shown when meta provides it */}
                        {(summary.totalTarget > 0 || summary.totalActual > 0) && (
                            <div className="flex gap-4 mt-2 mb-3">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Target</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {Number(summary.totalTarget).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Actual</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {Number(summary.totalActual).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-md text-xs font-bold inline-block uppercase">
                                {Number(summary.averageScore) >= 50 ? "SATISFACTORY PERFORMANCE" : "NEEDS IMPROVEMENT"}
                            </div>
                        </div>
                    </div>

                    {/* Trend footer */}
                    {hasPrevData ? (
                        <div className="mt-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-full ${trendDiff >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {trendDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{trendDiff >= 0 ? "+" : ""}{trendDiff.toFixed(1)}% vs Last Year</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <p className="text-xs text-muted-foreground italic">No data for previous year comparison.</p>
                        </div>
                    )}
                </div>

                {/* ── Card 2: Year-to-Year Trajectory ─────────────────────────── */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col min-h-[280px]">
                    <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">
                        YEAR-TO-YEAR PERFORMANCE TRAJECTORY
                    </h3>

                    <div className="flex-1 w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false} tickLine={false} dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false} tickLine={false}
                                    domain={[0, 100]} ticks={[0, 25, 50, 75, 100]}
                                />
                                <Tooltip
                                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                                    contentStyle={{
                                        borderRadius: "8px", border: "none",
                                        backgroundColor: "hsl(var(--popover))",
                                        color: "hsl(var(--popover-foreground))",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value, name, props) => [
                                        `${value}% (${props.payload?.grade || ""})`,
                                        "Performance",
                                    ]}
                                />
                                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                    {trendData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === selectedYear
                                                ? (gradeColors[entry.grade] || "#22C55E")
                                                : "#86efac"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Year labels with grade badges */}
                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {trendData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1 text-[10px]">
                                <span
                                    className="inline-block w-2 h-2 rounded-sm"
                                    style={{ backgroundColor: gradeColors[entry.grade] || "#86efac" }}
                                />
                                <span className="text-muted-foreground font-medium">{entry.name}</span>
                                {entry.score > 0 && (
                                    <span className="font-bold" style={{ color: gradeColors[entry.grade] }}>
                                        {entry.grade}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground text-center">
                        * Performance overview across strategic cycle
                    </div>
                </div>

                {/* ── Card 3: KPI Grade Distribution ───────────────────────────── */}
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col min-h-[280px]">
                    <div className="mb-2">
                        <h3 className="text-foreground text-sm font-bold">KPI Grade Distribution</h3>
                        <p className="text-xs text-muted-foreground">Total KPIs: {summary.kpis}</p>
                    </div>

                    <div className="flex flex-1 items-center gap-4">
                        {/* Donut */}
                        <div className="w-[120px] h-[120px] relative shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData.length > 0 ? distributionData : [{ name: "E", value: 1, color: "#EF4444" }]}
                                        innerRadius={40} outerRadius={55}
                                        paddingAngle={2} dataKey="value" stroke="none"
                                    >
                                        {(distributionData.length > 0 ? distributionData : [{ name: "E", value: 1, color: "#EF4444" }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-muted-foreground font-medium relative top-[-4px]">SRAP</span>
                                <span className="text-lg font-bold text-foreground relative top-[-4px]">{summary.averageScoreFixed}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                            {["A+", "A", "B", "C", "D", "E"].map((grade) => (
                                <div key={grade} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gradeColors[grade] }} />
                                    <div>
                                        <span className="text-xs font-bold text-foreground block leading-none mb-0.5">{grade}</span>
                                        <span className="text-[10px] font-semibold text-muted-foreground block">
                                            {summary.gradeCounts[grade] ?? 0} KPIs
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <span>{criticalCount} Critical KPI{criticalCount !== 1 ? "s" : ""} (Grade E)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceInsights;
