import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllKpiOpenPeriod,
  bulkCloseKpiPeriods,
  bulkOpenKpiPeriods,
} from "../Slices/kpiSlice";
import { fetchScorecardConfig, updateScorecardConfig } from "../Slices/scoreCardConfigSlice";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PillarManagement from "./Pillars";
import RolesManagement from "./Roles";
import UserManagement from "./Users";
import DepartmentManagement from "./Department";
import VersionManagement from "./VersionManagement";
import YearManagement from "./YearManagement";
import DeletedUsers from "./DeletedUsers";
import { useYears } from "@/hooks/use-years";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [togglingQuarters, setTogglingQuarters] = useState([]); // Track which quarters are currently being toggled
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { openPeriods, loading } = useSelector((state) => state.kpi);
  const { config: scorecardConfig, updateLoading: configUpdating } = useSelector((state) => state.scoreCardConfig);
  const { years: availableYears, loading: loadingYears } = useYears();

  useEffect(() => {
    dispatch(fetchAllKpiOpenPeriod({ year: selectedYear, period_type: "quarter" }));
    dispatch(fetchScorecardConfig());
  }, [dispatch, selectedYear]);



  const quarters = [
    { id: 1, name: "Q1", period: "Jan - Mar", months: [1, 2, 3] },
    { id: 2, name: "Q2", period: "Apr - Jun", months: [4, 5, 6] },
    { id: 3, name: "Q3", period: "Jul - Sep", months: [7, 8, 9] },
    { id: 4, name: "Q4", period: "Oct - Dec", months: [10, 11, 12] },
  ];

  // Check if a quarter is locked based on quarters array from API
  // Locked = is_open: false, Unlocked = is_open: true
  const isQuarterLocked = (quarterNumber) => {
    // Check if openPeriods has the new structure with quarters array
    if (openPeriods?.quarters && Array.isArray(openPeriods.quarters)) {
      const quarter = openPeriods.quarters.find((q) => q.quarter === quarterNumber);
      // is_open = true means unlocked
      // is_open = false means locked
      // If quarter data is missing, default to locked (true)
      return !(quarter?.is_open);
    }

    // Fallback to old logic or default to locked
    const periodsData = Array.isArray(openPeriods)
      ? openPeriods
      : (openPeriods?.data && Array.isArray(openPeriods.data))
        ? openPeriods.data
        : [];

    if (periodsData.length === 0) return true;

    // Old logic: A quarter is LOCKED if ALL KPIs have is_open: false
    const quarterOpenStates = periodsData.map((kpiData) => {
      const quarterData = kpiData.quarters?.find(q => q.quarter === quarterNumber);
      return quarterData?.is_open ?? false;
    });

    return quarterOpenStates.every(isOpen => isOpen === false);
  };

  const handleToggleTargetVisibility = async () => {
    try {
      const newStatus = !scorecardConfig?.show_target_annual;
      await dispatch(
        updateScorecardConfig({
          ...scorecardConfig,
          show_target_annual: newStatus,
          show_target_q1: newStatus,
          show_target_q2: newStatus,
          show_target_q3: newStatus,
          show_target_q4: newStatus,
          show_target_month: newStatus
        })
      ).unwrap();

      toast({
        title: "Configuration Updated",
        description: `Target values are now ${newStatus ? 'visible' : 'hidden'} on the dashboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleToggleLock = async (quarter) => {
    const isLocked = isQuarterLocked(quarter.id);

    // Add to toggling list
    setTogglingQuarters(prev => [...prev, quarter.id]);

    try {
      if (isLocked) {
        // Unlock: Bulk open all periods in this quarter
        await dispatch(
          bulkOpenKpiPeriods({
            year: selectedYear,
            period_type: "quarter",
            periods: [quarter.id],
          })
        ).unwrap();

        toast({
          title: "Quarter Unlocked",
          description: `${quarter.name} (${quarter.period}) is now open for KPI entry.`,
        });
      } else {
        // Lock: Bulk close all periods in this quarter
        await dispatch(
          bulkCloseKpiPeriods({
            year: selectedYear,
            period_type: "quarter",
            periods: [quarter.id],
          })
        ).unwrap();

        toast({
          title: "Quarter Locked",
          description: `${quarter.name} (${quarter.period}) is now locked.`,
        });
      }

      // Refresh the data
      await dispatch(fetchAllKpiOpenPeriod({ year: selectedYear, period_type: "quarter" })).unwrap();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      // Remove from toggling list
      setTogglingQuarters(prev => prev.filter(id => id !== quarter.id));
    }
  };

  return (
    <div className="max-w-[1232px] mx-auto space-y-10">
      {/* Page Header */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto sm:overflow-visible">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-[10px] h-10 min-w-max sm:w-full" id="settings-tabs">
          {[
            { key: "users", label: "Users" },
            { key: "roles", label: "Roles" },
            { key: "department", label: "Department" },
            { key: "pillars", label: "Pillars" },
            { key: "access-control", label: "KPI Access" },
            { key: "versions", label: "Versions" },
            { key: "years", label: "Years" },
            { key: "deleted-users", label: "Deleted Users" },
          ].map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`
          whitespace-nowrap
          px-3
          h-full
          flex
          items-center
          justify-center
          text-sm
          font-medium
          rounded-[8px]
          transition-all
          duration-200
          sm:flex-1
          ${activeTab === tab.key
                  ? "text-foreground bg-card shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }
        `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "roles" && <RolesManagement />}
        {activeTab === "department" && <DepartmentManagement />}
        {activeTab === "pillars" && <PillarManagement />}
        {activeTab === "versions" && <VersionManagement />}
        {activeTab === "years" && <YearManagement />}
        {activeTab === "deleted-users" && <DeletedUsers />}

        {activeTab === "access-control" && (
          <div className="flex flex-col gap-6">
            {/* Dashboard Settings Section - Separated Container */}
            <div className="bg-card rounded-[12px] shadow-sm border border-border overflow-hidden w-full">
              <div className="px-8 py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Dashboard Display Settings</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Configure what data is shown on the global dashboard views.</p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-3 bg-muted px-4 py-2 rounded-lg border border-border w-full sm:w-auto">
                      {configUpdating ? (
                        <div className="flex items-center justify-center w-[44px] h-[24px]">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleToggleTargetVisibility}
                          className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer flex-shrink-0 ${scorecardConfig?.show_target_annual ? 'bg-success' : 'bg-muted-foreground/30'}`}
                          aria-label="Toggle target visibility"
                        >
                          <span
                            className={`absolute left-0.5 top-0.5 w-[20px] h-[20px] bg-card rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${scorecardConfig?.show_target_annual ? 'translate-x-[20px]' : 'translate-x-0'}`}
                          ></span>
                        </button>
                      )}
                      <span className="text-xs font-bold text-foreground select-none sm:min-w-[125px]">
                        {scorecardConfig?.show_target_annual ? 'Target values shown' : 'Target values hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Access Control Container */}
            <div id="settings-access-control" className="bg-card rounded-[12px] shadow-sm border border-border overflow-hidden w-full min-h-[502.6px] flex flex-col">
              <div className="p-4 sm:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">KPI Access Control</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">Lock or unlock KPI entry for each reporting quarter. Locked quarters are read-only for everyone.</p>
                </div>
                <div className="w-full sm:w-[120px]" id="settings-access-year">
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingYears ? (
                        <SelectItem value="loading" disabled>Loading years...</SelectItem>
                      ) : (
                        availableYears.map((y) => (
                          <SelectItem key={y.id} value={String(y.year)}>
                            {y.year}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading && (!openPeriods?.quarters || openPeriods.quarters.length === 0) ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-sm text-muted-foreground animate-pulse">Loading access controls...</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider" id="settings-access-table">
                    <div className="col-span-3">Quarter</div>
                    <div className="col-span-4">Period</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2 text-right">Lock</div>
                  </div>

                  {quarters.map((quarter) => {
                    const locked = isQuarterLocked(quarter.id);
                    return (
                      <div key={quarter.id} className="grid grid-cols-2 sm:grid-cols-12 gap-y-4 sm:gap-4 px-4 sm:px-8 py-6 items-center border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <div className="col-span-1 sm:col-span-3">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground sm:hidden block mb-1">Quarter</span>
                          <span className="text-sm font-bold text-foreground">{quarter.name}</span>
                        </div>
                        <div className="col-span-1 sm:col-span-4 px-4 sm:px-0 text-right sm:text-left">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground sm:hidden block mb-1">Period</span>
                          <span className="text-sm text-muted-foreground font-medium">{quarter.period}</span>
                        </div>
                        <div className="col-span-1 sm:col-span-3">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground sm:hidden block mb-1">Status</span>
                          {locked ? (
                            <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-border">
                              <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Unlocked
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 sm:col-span-2 flex justify-end">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground sm:hidden block">Actions</span>
                            <div className="flex items-center gap-3 min-w-[44px] justify-center">
                              {togglingQuarters.includes(quarter.id) ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                              ) : (
                                <button
                                  id={`lock-toggle-${quarter.id}`}
                                  onClick={() => handleToggleLock(quarter)}
                                  className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer flex-shrink-0 ${locked ? 'bg-success' : 'bg-muted-foreground/30'}`}
                                  aria-label={`Toggle lock for ${quarter.name}`}
                                >
                                  <span
                                    className={`absolute left-0.5 top-0.5 w-[20px] h-[20px] bg-card rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${locked ? 'translate-x-[20px]' : 'translate-x-0'}`}
                                  ></span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-muted px-8 py-5 border-t border-border">
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="font-bold text-foreground">Hint:</span> When a quarter is <span className="text-foreground font-bold">Locked</span>, KPI entry is disabled system-wide. Unlock to reopen data entry.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
