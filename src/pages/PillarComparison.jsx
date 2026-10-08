import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar } from "lucide-react";
import axiosInstance from "@/Slices/Utils/axiosInstance";
import { useYears } from "@/hooks/use-years";
import { getGradeHex, getGradeBadgeClasses } from "@/lib/gradeColors";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { isAdmin as checkIsAdmin } from "@/lib/roleLabels";
import { useGlobalFilter } from "@/hooks/useGlobalFilter";

// ── Helpers ───────────────────────────────────────────────────────────────────
const truncate = (str, n = 24) =>
  str && str.length > n ? str.slice(0, n) + "…" : str;

// Distinct palette for up to 6 years
const YEAR_COLORS = ["#155535", "#22C55E", "#3B82F6", "#F59E0B", "#F97316", "#8B5CF6"];

const DeltaBadge = ({ delta }) => {
  if (delta === null || delta === undefined) return <span className="text-muted-foreground text-xs">—</span>;
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-semibold">
        <TrendingUp className="h-3 w-3" />+{delta.toFixed(1)}%
      </span>
    );
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500 text-xs font-semibold">
        <TrendingDown className="h-3 w-3" />{delta.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-gray-400 text-xs font-semibold">
      <Minus className="h-3 w-3" />0%
    </span>
  );
};

const GradeBadge = ({ grade }) => {
  if (!grade) return <span className="text-muted-foreground">—</span>;
  const cls = getGradeBadgeClasses(grade);
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cls.bg} ${cls.text} ${cls.border}`}
    >
      {grade}
    </span>
  );
};

// Custom bar chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[220px]">
      <p className="font-semibold text-gray-800 mb-2 leading-tight">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-900">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PillarComparison = () => {
  const { user } = useSelector((state) => state.authSlice);
  const isAdmin = checkIsAdmin(user);
  const { years: yearsList } = useYears();
  const globalFilter = useGlobalFilter();

  const currentYear = new Date().getFullYear();

  const [fromYear, setFromYear] = useState(String(currentYear - 1));
  const [toYear, setToYear] = useState(String(currentYear));
  // Seed department from global filter (dashboard selection)
  const [departmentId, setDepartmentId] = useState(globalFilter.department || "");

  const [data, setData] = useState(null); // full API response data object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const yearError =
    Number(fromYear) > Number(toYear)
      ? `"From" year (${fromYear}) cannot be later than "To" year (${toYear}).`
      : null;

  const fetchData = useCallback(async () => {
    if (yearError) return;
    setLoading(true);
    setError(null);
    try {
      const params = { from_year: fromYear, to_year: toYear };
      if (isAdmin && departmentId) params.department_id = departmentId;
      const res = await axiosInstance.get("/pillars/selected-year-summary", { params });
      setData(res.data?.data || null);
    } catch (err) {
      setError("Failed to load comparison data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fromYear, toYear, departmentId, isAdmin, yearError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const yearOptions = [...yearsList].sort((a, b) => a.year - b.year).map((y) => String(y.year));

  // years array from response
  const years = data?.years || [];

  // Sorted year numbers present in response
  const yearNums = years.map((y) => y.year).sort((a, b) => a - b);

  // Color map: year → color
  const yearColorMap = {};
  yearNums.forEach((y, i) => {
    yearColorMap[y] = YEAR_COLORS[i % YEAR_COLORS.length];
  });

  // Build pillar-keyed chart data
  // Each row: { pillar_id, fullName, name, [year]: pct, grade_[year]: grade, kpi_[year]: count }
  const chartData = (() => {
    const map = {};
    years.forEach((yearObj) => {
      (yearObj.pillar_detail || []).forEach((p) => {
        if (!map[p.pillar_id]) {
          map[p.pillar_id] = {
            pillar_id: p.pillar_id,
            fullName: p.pillar_name,
            name: truncate(p.pillar_name),
          };
        }
        map[p.pillar_id][yearObj.year] = Number(p.progress_percentage ?? 0);
        map[p.pillar_id][`grade_${yearObj.year}`] = p.grade;
        map[p.pillar_id][`kpi_${yearObj.year}`] = p.kpi_count;
        map[p.pillar_id][`target_${yearObj.year}`] = p.total_target;
        map[p.pillar_id][`actual_${yearObj.year}`] = p.total_actual;
      });
    });
    return Object.values(map);
  })();

  // Radar data uses radar_overview from each year
  const radarData = (() => {
    const map = {};
    years.forEach((yearObj) => {
      (yearObj.radar_overview || []).forEach((p) => {
        if (!map[p.pillar_id]) {
          map[p.pillar_id] = {
            pillar_id: p.pillar_id,
            subject: truncate(p.pillar_name, 20),
          };
        }
        map[p.pillar_id][yearObj.year] = Number(p.progress_percentage ?? 0);
      });
    });
    return Object.values(map);
  })();

  // Year-on-year delta: last year vs first year in range
  const firstYear = yearNums[0];
  const lastYear = yearNums[yearNums.length - 1];
  const firstOverall = years.find((y) => y.year === firstYear)?.overall;
  const lastOverall = years.find((y) => y.year === lastYear)?.overall;
  const overallDelta =
    firstOverall && lastOverall && firstYear !== lastYear
      ? Number(lastOverall.percentage) - Number(firstOverall.percentage)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pillar Year-on-Year Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare pillar performance across a range of years
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          {/* From Year */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">From</span>
            <Select value={fromYear} onValueChange={setFromYear}>
              <SelectTrigger className="w-[110px] h-9 text-sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Year */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">To </span>
            <Select value={toYear} onValueChange={setToYear}>
              <SelectTrigger className="w-[110px] h-9 text-sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department — admin only */}
          {isAdmin && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Department</span>
              <DepartmentSelect
                value={departmentId}
                onChange={setDepartmentId}
                className="w-[200px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Year validation error */}
      {yearError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
          <span>⚠</span> {yearError}
        </div>
      )}

      {/* API error */}
      {error && !yearError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Overall summary cards — one per year + delta */}
      {!yearError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-border shadow-sm">
                  <CardContent className="p-5">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded mb-3" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            : years.map((yearObj) => {
                const color = yearColorMap[yearObj.year];
                const overall = yearObj.overall;
                const pct = Number(overall?.percentage ?? 0);
                const grade = overall?.grade;
                return (
                  <Card key={yearObj.year} className="border border-border shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {yearObj.year} Overall
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold" style={{ color }}>
                          {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
                        </span>
                        {grade && <GradeBadge grade={grade} />}
                      </div>
                      {overall?.label && (
                        <p className="text-[10px] text-muted-foreground mt-1">{overall.label}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

          {/* Delta card: last vs first */}
          {/* {!loading && yearNums.length >= 2 && (
            <Card className="border border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {firstYear} → {lastYear} 
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {overallDelta !== null
                      ? `${overallDelta > 0 ? "+" : ""}${overallDelta.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="mt-1">
                  <DeltaBadge delta={overallDelta} />
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>
      )}

      {/* Grouped Bar Chart */}
      {!yearError && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-[#155535]" />
              Pillar Progress by Year
            </CardTitle>
            <CardDescription>Side-by-side progress % per pillar across selected years</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#155535]" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No data available for the selected range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 90 }}
                  barCategoryGap="20%"
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: "#6B7280" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={90}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
                  />
                  {yearNums.map((y) => (
                    <Bar
                      key={y}
                      dataKey={y}
                      name={String(y)}
                      fill={yearColorMap[y]}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={36}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Radar Chart */}
      {!yearError && !loading && radarData.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Radar Overview</CardTitle>
            <CardDescription>Relative performance shape across all pillars per year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#6B7280" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${v}%`}
                />
                {yearNums.map((y, i) => (
                  <Radar
                    key={y}
                    name={String(y)}
                    dataKey={y}
                    stroke={yearColorMap[y]}
                    fill={yearColorMap[y]}
                    fillOpacity={i === 0 ? 0.25 : 0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-pillar detail table */}
      {!yearError && !loading && chartData.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Pillar Detail</CardTitle>
            <CardDescription>
              Progress %, grade, KPI count, and year-on-year change per pillar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      Pillar
                    </th>
                    {yearNums.map((y) => (
                      <th
                        key={y}
                        colSpan={2}
                        className="text-center py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap border-l border-border/40"
                        style={{ color: yearColorMap[y] }}
                      >
                        {y}
                      </th>
                    ))}
                    {/* {yearNums.length >= 2 && (
                      <th className="text-center py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap border-l border-border/40">
                        Change ({firstYear}→{lastYear})
                      </th>
                    )} */}
                  </tr>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="py-2 px-4" />
                    {yearNums.map((y) => (
                      <>
                        <th key={`${y}-pct`} className="py-2 px-2 text-[9px] font-semibold text-muted-foreground text-center border-l border-border/40">
                          Progress
                        </th>
                        <th key={`${y}-grade`} className="py-2 px-2 text-[9px] font-semibold text-muted-foreground text-center">
                          Grade
                        </th>
                      </>
                    ))}
                    {yearNums.length >= 2 && <th className="py-2 px-4 border-l border-border/40" />}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => {
                    const firstVal = row[firstYear] ?? null;
                    const lastVal = row[lastYear] ?? null;
                    const delta =
                      firstVal !== null && lastVal !== null && firstYear !== lastYear
                        ? lastVal - firstVal
                        : null;

                    return (
                      <tr
                        key={row.pillar_id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-foreground max-w-[240px]">
                          <span title={row.fullName} className="line-clamp-2 leading-snug text-xs">
                            {row.fullName}
                          </span>
                        </td>
                        {yearNums.map((y) => {
                          const val = row[y] ?? null;
                          const grade = row[`grade_${y}`];
                          const color = yearColorMap[y];
                          return (
                            <>
                              <td key={`${row.pillar_id}-${y}-pct`} className="py-3 px-2 text-center border-l border-border/40">
                                {val !== null && val > 0 ? (
                                  <span className="font-bold text-xs" style={{ color }}>
                                    {val.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </td>
                              <td key={`${row.pillar_id}-${y}-grade`} className="py-3 px-2 text-center">
                                <GradeBadge grade={grade} />
                              </td>
                            </>
                          );
                        })}
                        {/* {yearNums.length >= 2 && (
                          <td className="py-3 px-4 text-center border-l border-border/40">
                            <DeltaBadge delta={delta} />
                          </td>
                        )} */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!yearError && !loading && !error && years.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <BarChart3 className="h-10 w-10 opacity-30" />
          <p className="text-sm">No data found for the selected range.</p>
        </div>
      )}
    </div>
  );
};

export default PillarComparison;
