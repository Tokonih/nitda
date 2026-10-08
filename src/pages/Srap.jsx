import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomDialog } from "@/components/ui/CustomDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Target,
  Download,
  Printer,
  BarChart3,
  BookOpen,
  Server,
  Lightbulb,
  Cpu,
  ShieldCheck,
  Globe,
  TrendingUp,
  RefreshCw,
  Briefcase,
  Layers,
  Zap,
  PenTool,
  Database,
  Activity,
  Award,
  Layout,
} from "lucide-react";
import srapPillarsImage from "@/assets/srap-pillars.png";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { useYears } from "@/hooks/use-years";
import { fetchPillars, fetchPillarEntityCounts } from "../Slices/pillarSlice";
import { formatNumberWithCommas, stripCommas, getErrorMessage } from "@/lib/utils";
import {
  fetchSrapInitiatives,
  createSrapInitiative,
  updateSrapInitiative,
  deleteSrapInitiative,
} from "../Slices/srapSlice";
import {
  fetchObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
  bulkUpdateObjectiveVisibility,
} from "../Slices/objectiveSlice";
import {
  fetchAllKpi,
  createKpi,
  updateKpi,
  deleteKpi,
} from "../Slices/kpiSlice";
import {
  getActivitiesApi,
  createActivityApi,
  updateActivityApi,
  deleteActivityApi,
  uploadMonthActivityValueApi,
} from "../Slices/Utils/Api/activity";
import {
  fetchStakeholderObjectives,
  fetchAllStakeholderObjectives,
  createStakeholderObjective,
  updateStakeholderObjective,
  deleteStakeholderObjective,
} from "../Slices/stakeholderObjectivesSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import {
  isAdmin,
  isStakeholder,
  getKpiLabel,
  getKpiLabelPlural,
} from "../lib/roleLabels";
import { fetchDepartments } from "../Slices/departmentSlice";
import { fetchStakeholderSrapInitiatives } from "../Slices/stakeholderSrapSlice";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { saveFilterCookie, readFilterCookie } from "@/lib/filterCookies";
const pillarIcons = [
  <BookOpen className="w-full h-full" />,
  <Server className="w-full h-full" />,
  <Lightbulb className="w-full h-full" />,
  <Cpu className="w-full h-full" />,
  <ShieldCheck className="w-full h-full" />,
  <Globe className="w-full h-full" />,
  <TrendingUp className="w-full h-full" />,
  <RefreshCw className="w-full h-full" />,
  <Briefcase className="w-full h-full" />,
  <Layers className="w-full h-full" />,
  <Zap className="w-full h-full" />,
  <PenTool className="w-full h-full" />,
  <Database className="w-full h-full" />,
  <Activity className="w-full h-full" />,
  <Award className="w-full h-full" />,
  <Layout className="w-full h-full" />,
];

const SrapManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.authSlice);
  const userDepartment = user?.department?.id || "";
  const isStakeholderUser = isStakeholder(user);
  const isAdminUser = isAdmin(user) && !isStakeholderUser;

  const { list: pillars, loading: pillarsLoading, entityCounts, entityCountsLoading } = useSelector(
    (state) => state.pillars
  );
  const { list: initiatives, loading: initiativesLoading } = useSelector(
    (state) => state.sraps
  );
  const {
    list: stakeholderInitiatives,
    loading: stakeholderInitiativesLoading,
  } = useSelector((state) => state.stakeholderSraps);

  const { list: stakeholderAllObjectives, loading: stakeholderObjectivesLoading } = useSelector(
    (state) => state.stakeholderObjectives
  );

  const { list: stakeholderActivitiesList } = useSelector(
    (state) => state.stakeholderActivities
  );


  // Department management for admin
  const { list: departments } = useSelector((state) => state.departments);
  // Keep the selected reporting year when the user moves between SRAP actions.
  // Department selection remains an admin-only preference.
  const _cookie = readFilterCookie();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    isAdminUser ? (_cookie.department || userDepartment) : userDepartment
  );

  // Use selected department for admin, user's department for others
  const activeDepartmentFilter = isAdminUser ? selectedDepartmentId : userDepartment;

  // Find the selected department object
  const selectedDepartment = departments?.find(
    (dept) => dept.id === (isAdminUser ? selectedDepartmentId : userDepartment)
  );

  // Determine if we should use stakeholder APIs:
  // 1. If user is a stakeholder (by role), use stakeholder APIs
  // 2. If admin has selected a department with 'stakeholder' in the name, use stakeholder APIs
  const shouldUseStakeholderApis =
    isStakeholderUser ||
    (isAdminUser && selectedDepartment?.name?.toLowerCase().includes("stakeholder"));

  const { years: yearsList } = useYears();
  const [selectedPillar, setSelectedPillar] = useState(null);
  const activeLabelContext = isAdminUser ? { department: selectedDepartment } : user;
  const [selectedYear, setSelectedYear] = useState(
    parseInt(_cookie.year, 10) || new Date().getFullYear()
  );
  const initiativesForSelectedYear = initiatives.filter(
    (initiative) => String(initiative.year) === String(selectedYear)
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [pillarInitiatives, setPillarInitiatives] = useState([]);
  const [objectives, setObjectives] = useState({});
  const [kpis, setKpis] = useState({});
  const [loadingObjectives, setLoadingObjectives] = useState({});

  const [loadingKpis, setLoadingKpis] = useState({});
  const [selectedObjective, setSelectedObjective] = useState(null);

  // Modal states
  const [initiativeModal, setInitiativeModal] = useState({
    open: false,
    data: null,
  });
  const [objectiveModal, setObjectiveModal] = useState({
    open: false,
    data: null,
    initiativeId: null,
  });
  const [kpiModal, setKpiModal] = useState({
    open: false,
    data: null,
    objectiveId: null,
    objective: null,
  });

  // Child records inherit their parent/year context. Falling back to the page
  // selection prevents the browser's current year from silently taking over.
  const getContextYear = (record) => {
    const recordYear = Number(record?.year);
    return Number.isInteger(recordYear) && recordYear > 0
      ? recordYear
      : selectedYear;
  };

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null, // 'initiative', 'objective', 'kpi'
    id: null,
    parentId: null, // initiativeId or objectiveId depending on type
    title: "",
    description: ""
  });

  // Form states
  const [initiativeForm, setInitiativeForm] = useState({
    name: "",
    description: "",
    department: "",
    year: selectedYear,
    pillar_id: "",
  });
  const [objectiveForm, setObjectiveForm] = useState({
    name: "",
    description: "",
    visible_to_stakeholders: false,
  });

  // Bulk visibility state
  const [bulkVisibilityOpen, setBulkVisibilityOpen] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [bulkVisibilityValue, setBulkVisibilityValue] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [allObjectivesForBulk, setAllObjectivesForBulk] = useState([]);
  const [loadingAllObjectives, setLoadingAllObjectives] = useState(false);
  const [bulkSearchTerm, setBulkSearchTerm] = useState("");
  const [kpiForm, setKpiForm] = useState({
    name: "",
    description: "",
    unit: "",
    frequency: "quarterly",
    target: 0,
    value: 0, // used for stakeholder simplified form (single value field)

    // Stakeholder upload-month fields
    title: "", // Title field for stakeholder activities
    month: "",
    reporting_period: "",
    year: selectedYear,
    remarks: "",
    evidence: null, // File

    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,

    department: "",

    // New location/date fields
    tracking_date_start: "",
    tracking_date_end: "",
    address: "",
    state_id: "",
    lga_id: "",
  });

  // Nigeria States & LGAs
  const [nigeriaStates, setNigeriaStates] = useState([]);
  const [nigeriaLgas, setNigeriaLgas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  // Inline date validation errors for the activity form
  const [dateErrors, setDateErrors] = useState({ start: "", end: "" });

  const validateTrackingDates = (start, end, _year, validYears = validYearNumbers) => {
    const errors = { start: "", end: "" };
    const yearsLabel = validYears.length > 0 ? validYears.join(", ") : "the available years";
    const minD = validYears.length > 0 ? `${Math.min(...validYears)}-01-01` : null;
    const maxD = validYears.length > 0 ? `${Math.max(...validYears)}-12-31` : null;

    if (start) {
      const startYear = parseInt(start.substring(0, 4), 10);
      if (validYears.length > 0 && !validYears.includes(startYear))
        errors.start = `Start date year (${startYear}) is not an active year. Allowed years: ${yearsLabel}.`;
      else if (minD && maxD && (start < minD || start > maxD))
        errors.start = `Start date must be between ${minD} and ${maxD}.`;
    }
    if (end) {
      const endYear = parseInt(end.substring(0, 4), 10);
      if (validYears.length > 0 && !validYears.includes(endYear))
        errors.end = `End date year (${endYear}) is not an active year. Allowed years: ${yearsLabel}.`;
      else if (minD && maxD && (end < minD || end > maxD))
        errors.end = `End date must be between ${minD} and ${maxD}.`;
      else if (start && end < start)
        errors.end = "End date cannot be before the start date.";
    }
    return errors;
  };

  // ── Plan Export ────────────────────────────────────────────────────────────
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportYear, setExportYear] = useState(String(selectedYear));
  const [exportDeptId, setExportDeptId] = useState("");
  const [exportPreview, setExportPreview] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDownloading, setExportDownloading] = useState(false);

  const fetchExportPreview = async (year, deptId) => {
    setExportLoading(true);
    setExportPreview(null);
    try {
      const { makeRequest } = await import('../Slices/Utils/makeRequest');
      const params = new URLSearchParams({ year });
      if (deptId) params.append("department_id", deptId);
      const res = await makeRequest("get", `departments/plan-export?${params.toString()}`);
      setExportPreview(res?.data || null);
    } catch (e) {
      toast.error("Failed to load export preview");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportDownload = async () => {
    setExportDownloading(true);
    try {
      const { BASE_URL } = await import('../Slices/Utils/variables');
      const params = new URLSearchParams({ year: exportYear });
      if (exportDeptId) params.append("department_id", exportDeptId);
      const token = localStorage.getItem("token") || "";
      const url = `${BASE_URL}/departments/plan-export/download?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `plan-export-${exportYear}${exportDeptId ? `-dept${exportDeptId}` : ""}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      toast.error("Export download failed");
    } finally {
      setExportDownloading(false);
    }
  };

  const openExportModal = () => {
    const yr = String(selectedYear);
    const dept = activeDepartmentFilter || "";
    setExportYear(yr);
    setExportDeptId(dept);
    setExportPreview(null);
    setExportModalOpen(true);
    fetchExportPreview(yr, dept);
  };

  const fetchNigeriaStates = async () => {
    if (nigeriaStates.length > 0) return; // already loaded
    setLoadingStates(true);
    try {
      const { makeRequest } = await import('../Slices/Utils/makeRequest');
      const json = await makeRequest('get', 'nigeria-states?search=');
      setNigeriaStates(json?.data || []);
    } catch (e) {
      console.error('Failed to fetch Nigeria states', e);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchNigeriaLgas = async (stateId) => {
    if (!stateId) { setNigeriaLgas([]); return; }
    setLoadingLgas(true);
    try {
      const { makeRequest } = await import('../Slices/Utils/makeRequest');
      const json = await makeRequest('get', `nigeria-states/${stateId}/lgas?search=`);
      setNigeriaLgas(json?.data || []);
    } catch (e) {
      console.error('Failed to fetch LGAs', e);
    } finally {
      setLoadingLgas(false);
    }
  };

  // Resolve plain-text state/LGA names (from API response) to their numeric IDs
  // and populate the form dropdowns when editing an activity.
  const resolveStateAndLgaByName = async (stateName, lgaName) => {
    if (!stateName) return;
    let states = nigeriaStates;
    if (states.length === 0) {
      setLoadingStates(true);
      try {
        const { makeRequest } = await import('../Slices/Utils/makeRequest');
        const json = await makeRequest('get', 'nigeria-states?search=');
        states = json?.data || [];
        setNigeriaStates(states);
      } catch (e) {
        console.error('Failed to fetch states for edit pre-fill', e);
      } finally {
        setLoadingStates(false);
      }
    }
    const matchedState = states.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    if (!matchedState) return;
    setKpiForm((prev) => ({ ...prev, state_id: String(matchedState.id), lga_id: "" }));
    if (!lgaName) return;
    setLoadingLgas(true);
    try {
      const { makeRequest } = await import('../Slices/Utils/makeRequest');
      const json = await makeRequest('get', `nigeria-states/${matchedState.id}/lgas?search=`);
      const lgas = json?.data || [];
      setNigeriaLgas(lgas);
      const matchedLga = lgas.find(
        (l) => l.name.toLowerCase() === lgaName.toLowerCase()
      );
      if (matchedLga) {
        setKpiForm((prev) => ({ ...prev, lga_id: String(matchedLga.id) }));
      }
    } catch (e) {
      console.error('Failed to fetch LGAs for edit pre-fill', e);
    } finally {
      setLoadingLgas(false);
    }
  };

  // Persist the reporting year for every user. The department preference is
  // only relevant to admins, who can change the department filter.
  useEffect(() => {
    saveFilterCookie({
      year: String(selectedYear),
      ...(isAdminUser && { department: String(selectedDepartmentId || '') }),
    });
  }, [selectedYear, selectedDepartmentId, isAdminUser]);

  useEffect(() => {
    dispatch(fetchPillars());
    // Fetch departments for admin users
    if (isAdminUser) {
      dispatch(fetchDepartments());
    }
  }, [dispatch, isAdminUser]);

  useEffect(() => {
    if (shouldUseStakeholderApis) {
      // Stakeholders now work with pillars directly
      dispatch(fetchPillars({ visible_to_stakeholders: true, per_page: 100 }));
      // Fetch all initiatives for the year to resolve names
      dispatch(
        fetchSrapInitiatives({
          year: selectedYear,
          per_page: 500,
        })
      );
    }
  }, [dispatch, shouldUseStakeholderApis, selectedYear, activeDepartmentFilter]);

  useEffect(() => {
    // Fetch entity counts for NITDA users only (they have the summary card)
    // Stakeholders don't have/need the summary card, so skip for them
    if (!shouldUseStakeholderApis && selectedPillar?.id) {
      dispatch(
        fetchPillarEntityCounts({
          pillarId: selectedPillar.id,
          year: selectedYear,
          department_id: activeDepartmentFilter,
          visible_to_stakeholders_only: false,
        })
      );
    }
  }, [
    dispatch,
    selectedPillar,
    selectedYear,
    activeDepartmentFilter,
    shouldUseStakeholderApis,
  ]);

  const validYearNumbers = yearsList.length > 0 ? yearsList.map(y => parseInt(y.year, 10)) : [];
  const minTrackYear = validYearNumbers.length > 0 ? Math.min(...validYearNumbers) : new Date().getFullYear();
  const maxTrackYear = validYearNumbers.length > 0 ? Math.max(...validYearNumbers) : new Date().getFullYear();
  const minTrackDate = `${minTrackYear}-01-01`;
  const maxTrackDate = `${maxTrackYear}-12-31`;
  useEffect(() => {
    // Only fetch pillar-specific initiatives for NITDA flow
    // Stakeholders fetch all initiatives globally once (see useEffect above)
    if (selectedPillar?.id && !shouldUseStakeholderApis) {
      // Clear current data when switching pillar or department
      setObjectives({});
      setKpis({});

      dispatch(
        fetchSrapInitiatives({
          pillar_id: selectedPillar.id,
          year: selectedYear,
          department_id: activeDepartmentFilter,
        })
      );
    }
  }, [dispatch, selectedPillar, shouldUseStakeholderApis, selectedYear, activeDepartmentFilter]);

  const [saving, setSaving] = useState({
    initiative: false,
    objective: false,
    kpi: false,
  });

  const [deleting, setDeleting] = useState({
    initiative: {},
    objective: {},
    kpi: {},
  });
  // Fetch objectives for an initiative
  const fetchObjectivesForInitiative = async (initiativeId, force = false) => {
    if (shouldUseStakeholderApis) {
      // For stakeholders, use dedicated fetchStakeholderObjectives
      dispatch(
        fetchStakeholderObjectives({
          department_id: activeDepartmentFilter,
          srap_initiative_id: initiativeId,
        })
      );
    } else {
      // For NITDA, use local state
      if (!force && objectives[initiativeId]) return; // Already loaded
      setLoadingObjectives((prev) => ({ ...prev, [initiativeId]: true }));
      try {
        const responseData = await dispatch(
          fetchObjectives({
            srap_initiative_id: initiativeId,
            department_id: activeDepartmentFilter,
          })
        ).unwrap();
        setObjectives((prev) => ({
          ...prev,
          [initiativeId]: Array.isArray(responseData) ? responseData : (responseData?.data || []),
        }));
      } catch (error) {
        setObjectives((prev) => ({ ...prev, [initiativeId]: [] }));
      } finally {
        setLoadingObjectives((prev) => ({ ...prev, [initiativeId]: false }));
      }
    }
  };

  // Fetch KPIs/Activities for an objective/pillar
  const fetchKpisForObjective = async (objectiveId, force = false) => {
    if (!force && kpis[objectiveId]) return;
    setLoadingKpis((prev) => ({ ...prev, [objectiveId]: true }));
    try {
      let responseData;
      if (shouldUseStakeholderApis) {
        // For stakeholders, use stakeholder-activity-values endpoint with pillar_id and department_id
        const { getStakeholderActivityValuesApi } = await import('../Slices/Utils/Api/stakeholderActivities');
        responseData = await getStakeholderActivityValuesApi({
          pillar_id: objectiveId,
          department_id: userDepartment, // Use logged-in user's department
          year: selectedYear,
          per_page: 100,
        });
      } else {
        // For NITDA, use regular KPI API via Thunk
        responseData = await dispatch(fetchAllKpi({
          srap_objective_id: objectiveId,
          department_id: activeDepartmentFilter,
          year: selectedYear,
        })).unwrap();
      }
      setKpis((prev) => ({
        ...prev,
        [objectiveId]: Array.isArray(responseData) ? responseData : (responseData?.data || [])
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      setKpis((prev) => ({ ...prev, [objectiveId]: [] }));
    } finally {
      setLoadingKpis((prev) => ({ ...prev, [objectiveId]: false }));
    }
  };

  // Initiative handlers
  const handleAddInitiative = () => {
    setInitiativeForm({
      name: "",
      description: "",
      department: "",
      year: selectedYear,
      pillar_id: "",
    });
    setInitiativeModal({ open: true, data: null });
  };

  const handleEditInitiative = (initiative) => {
    setInitiativeForm({
      name: initiative.name,
      description: initiative.description,
      department: initiative.department,
      year: initiative.year,
      pillar_id: initiative.pillar_id,
    });
    setInitiativeModal({ open: true, data: initiative });
  };

  const handleSaveInitiative = async () => {
    if (!initiativeForm.name.trim()) {
      toast.warning("Initiative name is required");
      return;
    }
    setSaving((prev) => ({ ...prev, initiative: true }));
    try {
      const payload = {
        name: initiativeForm.name,
        pillar_id: selectedPillar.id,
        year: parseInt(initiativeForm.year),
      };

      // Add department_id for all users (both NITDA and stakeholders)
      if (userDepartment) {
        payload.department_id = userDepartment;
      }

      if (initiativeModal.data) {
        // Update existing
        if (shouldUseStakeholderApis) {
          await dispatch(
            updateStakeholderSrapInitiative({
              id: initiativeModal.data.id,
              data: payload,
            })
          ).unwrap();
        } else {
          await dispatch(
            updateSrapInitiative({
              id: initiativeModal.data.id,
              data: payload,
            })
          ).unwrap();
        }
        toast.success("Initiative updated successfully");
      } else {
        // Create new
        if (shouldUseStakeholderApis) {
          await dispatch(createStakeholderSrapInitiative(payload)).unwrap();
        } else {
          await dispatch(createSrapInitiative(payload)).unwrap();
        }
        toast.success("Initiative created successfully");
      }
      setInitiativeModal({ open: false, data: null });

      // Refresh the list - wait for it to complete
      if (shouldUseStakeholderApis) {
        await dispatch(
          fetchStakeholderSrapInitiatives({
            pillar_id: selectedPillar.id,
            department_id: userDepartment,
            year: selectedYear,
            
          })
        ).unwrap();
      } else {
        await dispatch(fetchSrapInitiatives({
          pillar_id: selectedPillar.id,
          department_id: activeDepartmentFilter,
          year: selectedYear,
        })).unwrap();
      }

      /*
      // Refresh entity counts
      dispatch(fetchPillarEntityCounts({
        pillarId: selectedPillar.id,
        year: selectedYear,
        department_id: activeDepartmentFilter,
        visible_to_stakeholders_only: shouldUseStakeholderApis
      }));
      */
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving((prev) => ({ ...prev, initiative: false }));
    }
  };

  const handleDeleteInitiative = (id) => {
    setConfirmModal({
      open: true,
      type: "initiative",
      id,
      title: "Delete Initiative",
      description: "Are you sure you want to delete this initiative? This action cannot be undone."
    });
  };

  // Objective handlers
  const handleAddObjective = (initiativeId) => {
    setObjectiveForm({
      name: "",
      description: "",
      visible_to_stakeholders: false,
      year: getContextYear(initiativeId),
      department_id: initiativeId?.department?.id,
      srap_initiative_id: initiativeId.id,
    });
    setObjectiveModal({ open: true, data: null, initiativeId });
  };

  const handleEditObjective = (objective, initiativeId) => {
    setObjectiveForm({
      name: objective.name,
      description: objective.description,
      visible_to_stakeholders: objective.visible_to_stakeholders ?? false,
      year: getContextYear(objective) || getContextYear(initiativeId),
    });
    setObjectiveModal({ open: true, data: objective, initiativeId });
  };

  // Fetch all objectives for bulk visibility management
  const fetchAllObjectivesForBulk = async () => {
    setLoadingAllObjectives(true);
    try {
      const responseData = await dispatch(
        fetchObjectives({ year: selectedYear, per_page: 500 })
      ).unwrap();
      const list = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      setAllObjectivesForBulk(list);
    } catch (error) {
      setAllObjectivesForBulk([]);
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAllObjectives(false);
    }
  };

  const handleOpenBulkVisibility = () => {
    setBulkSelectedIds([]);
    setBulkVisibilityValue(true);
    setBulkSearchTerm("");
    setBulkVisibilityOpen(true);
    fetchAllObjectivesForBulk();
  };

  const handleBulkUpdateVisibility = async () => {
    if (bulkSelectedIds.length === 0) {
      toast.warning("Please select at least one objective.");
      return;
    }
    setBulkUpdating(true);
    try {
      await dispatch(
        bulkUpdateObjectiveVisibility({
          objective_ids: bulkSelectedIds,
          visible_to_stakeholders: bulkVisibilityValue,
        })
      ).unwrap();
      toast.success(
        `${bulkSelectedIds.length} objective(s) updated — visible to stakeholders: ${bulkVisibilityValue ? "Yes" : "No"}`
      );
      setBulkVisibilityOpen(false);
      setBulkSelectedIds([]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleSaveObjective = async () => {
    if (!objectiveForm.name.trim()) {
      toast.warning("Objective name is required");
      return;
    }

    setSaving((prev) => ({ ...prev, objective: true }));
    try {
      const payload = {
        name: objectiveForm.name,
        year: objectiveForm.year || getContextYear(objectiveModal.initiativeId),
        visible_to_stakeholders: objectiveForm.visible_to_stakeholders,
      };

      if (shouldUseStakeholderApis) {
        // For stakeholders
        payload.srap_initiative_id = objectiveModal.initiativeId.id;
        // Include department_id like NITDA does. Prefer initiative's department, fallback to user's department.
        const deptId =
          objectiveModal.initiativeId?.department?.id || userDepartment;
        if (deptId) payload.department_id = deptId;

        if (objectiveModal.data) {
          await dispatch(
            updateStakeholderObjective({
              id: objectiveModal.data.id,
              data: payload,
            })
          ).unwrap();
        } else {
          await dispatch(createStakeholderObjective(payload)).unwrap();
        }
      } else {
        // For NITDA
        payload.srap_initiative_id = objectiveModal.initiativeId.id;
        payload.department_id = objectiveModal.initiativeId?.department?.id || activeDepartmentFilter;

        if (objectiveModal.data) {
          await dispatch(updateObjective({ id: objectiveModal.data.id, data: payload })).unwrap();
        } else {
          await dispatch(createObjective(payload)).unwrap();
        }
      }
      toast.success(objectiveModal.data ? "Objective updated successfully" : "Objective created successfully");

      setObjectiveModal({ open: false, data: null, initiativeId: null });

      // Clear cache and refresh objectives to show the new/updated objective immediately
      const initiativeId = objectiveModal.initiativeId.id;
      if (shouldUseStakeholderApis) {
        // For stakeholders, refresh the flat sidebar list
        await dispatch(
          fetchStakeholderObjectives({
            department_id: activeDepartmentFilter,
            year: selectedYear,
            srap_initiative_id: initiativeId,
            // visible_to_stakeholders: true,
          })
        ).unwrap();

        // If we updated the currently selected objective, update it in state too
        if (objectiveModal.data && selectedObjective?.id === objectiveModal.data.id) {
          setSelectedObjective({ ...selectedObjective, ...payload });
        }
      } else {
        // For NITDA, clear local cache then refetch
        setObjectives((prev) => {
          const newObj = { ...prev };
          delete newObj[initiativeId];
          return newObj;
        });
        await fetchObjectivesForInitiative(initiativeId, true);
      }

      /*
      // Refresh entity counts
      dispatch(fetchPillarEntityCounts({
        pillarId: selectedPillar?.id,
        year: selectedYear,
        department_id: activeDepartmentFilter,
        visible_to_stakeholders_only: shouldUseStakeholderApis
      }));
      */
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving((prev) => ({ ...prev, objective: false }));
    }
  };

  const handleDeleteObjective = (objectiveId, initiativeId) => {
    setConfirmModal({
      open: true,
      type: "objective",
      id: objectiveId,
      parentId: initiativeId,
      title: "Delete Objective",
      description: "Are you sure you want to delete this objective? "
    });
  };

  // KPI handlers
  const handleAddKpi = (objectiveOrPillar) => {
    setKpiForm({
      name: "",
      description: "",
      unit: "",
      frequency: "quarterly",
      target: 0,
      value: 0, // stakeholder simplified value field
      // Stakeholder upload-month fields
      title: "",
      month: "",
      reporting_period: "",
      year: getContextYear(objectiveOrPillar),
      remarks: "",
      evidence: null,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      planned_measurement: "",
      timeline: "Q1",
      department: isStakeholderUser ? userDepartment : (objectiveOrPillar?.department?.id || objectiveOrPillar?.department_id || ""),
      // New location/date fields
      tracking_date_start: "",
      tracking_date_end: "",
      address: "",
      state_id: "",
      lga_id: "",
    });
    // Pre-load states if stakeholder; clear any stale date errors
    if (shouldUseStakeholderApis) {
      fetchNigeriaStates();
      setNigeriaLgas([]);
      setDateErrors({ start: "", end: "" });
    }
    setKpiModal({
      open: true,
      data: null,
      objectiveId: objectiveOrPillar?.id || null,
      objective: objectiveOrPillar,
    });
  };

  const handleEditKpi = (kpi, objectiveOrPillar) => {
    if (shouldUseStakeholderApis) {
      // For stakeholder activity values, populate form with value data
      setKpiForm({
        name: kpi.pillar?.name || kpi.name || "",
        description: kpi.pillar?.description || kpi.description || "",
        unit: kpi.unit || "",
        frequency: (kpi.frequency || "Quarterly").toLowerCase(),
        target: formatNumberWithCommas(kpi.value || 0),
        value: formatNumberWithCommas(kpi.value || 0),
        title: kpi.title || "",
        month: kpi.month || "",
        reporting_period: kpi.reporting_period || "",
        year: kpi.year || selectedYear,
        remarks: kpi.remarks || "",
        evidence: null, // File input will be empty for edit
        q1: formatNumberWithCommas(kpi.actual_q1 || 0),
        q2: formatNumberWithCommas(kpi.actual_q2 || 0),
        q3: formatNumberWithCommas(kpi.actual_q3 || 0),
        q4: formatNumberWithCommas(kpi.actual_q4 || 0),
        planned_measurement: kpi.planned_measurement || "",
        timeline: kpi.timeline || "Q1",
        department: kpi.department?.id || kpi.department_id || userDepartment || "",
        // New location/date fields
        // Slice ISO datetime strings to YYYY-MM-DD for <input type="date">
        tracking_date_start: kpi.tracking_date_start ? kpi.tracking_date_start.substring(0, 10) : "",
        tracking_date_end: kpi.tracking_date_end ? kpi.tracking_date_end.substring(0, 10) : "",
        address: kpi.address || "",
        // The API returns plain names; IDs are resolved asynchronously below
        state_id: "",
        lga_id: "",
      });
      // Resolve state name → state_id, then LGA name → lga_id for the dropdowns
      resolveStateAndLgaByName(kpi.state || "", kpi.lga || "");
    } else {
      // For NITDA KPIs
      setKpiForm({
        name: kpi.name || "",
        description: kpi.description || "",
        unit: kpi.unit || "",
        frequency: (kpi.frequency || "Quarterly").toLowerCase(),
        target: formatNumberWithCommas(kpi.target_value || 0),
        value: formatNumberWithCommas(kpi.target_value || 0),
        year: kpi.year || selectedYear,
        q1: formatNumberWithCommas(kpi.target_q1 || 0),
        q2: formatNumberWithCommas(kpi.target_q2 || 0),
        q3: formatNumberWithCommas(kpi.target_q3 || 0),
        q4: formatNumberWithCommas(kpi.target_q4 || 0),
        planned_measurement: kpi.planned_measurement || "",
        timeline: kpi.timeline || "Q1",
        department: kpi.department_id || objectiveOrPillar?.department?.id || objectiveOrPillar?.department_id || "",
      });
    }
    setKpiModal({
      open: true,
      data: kpi,
      objectiveId: objectiveOrPillar?.id || null,
      objective: objectiveOrPillar,
    });
  };

  const handleSaveKpi = async () => {
    // ── Stakeholder-specific validation ──────────────────────────────────
    if (shouldUseStakeholderApis) {
      if (!kpiForm.title.trim()) {
        toast.warning("Please enter a title.");
        return;
      }
      if (!kpiForm.year) {
        toast.warning("Please select a year.");
        return;
      }
      if (!kpiForm.value || parseFloat(stripCommas(kpiForm.value)) === 0) {
        toast.warning("Please enter a value.");
        return;
      }
      if (!kpiForm.remarks.trim()) {
        toast.warning("Remarks are required.");
        return;
      }
      if (!kpiForm.address.trim()) {
        toast.warning("Address is required.");
        return;
      }
      if (!kpiForm.state_id) {
        toast.warning("Please select a state.");
        return;
      }
      if (!kpiForm.lga_id) {
        toast.warning("Please select an LGA.");
        return;
      }
      if (!kpiForm.evidence) {
        toast.warning("Please attach an evidence file.");
        return;
      }
      // Validate tracking dates are within the selected year
      const errs = validateTrackingDates(
        kpiForm.tracking_date_start,
        kpiForm.tracking_date_end
      );
      setDateErrors(errs);
      if (errs.start) {
        toast.error(errs.start);
        return;
      }
      if (errs.end) {
        toast.error(errs.end);
        return;
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    setSaving((prev) => ({ ...prev, kpi: true }));
    try {
      let payload;

      if (!shouldUseStakeholderApis) {
        // NITDA — build KPI payload
        payload = {
          name: kpiForm.name,
          target_annual: parseFloat(stripCommas(kpiForm.target)) || 0,
          target_value: parseFloat(stripCommas(kpiForm.target)) || 0,
          target_q1: parseFloat(stripCommas(kpiForm.q1)) || 0,
          target_q2: parseFloat(stripCommas(kpiForm.q2)) || 0,
          target_q3: parseFloat(stripCommas(kpiForm.q3)) || 0,
          target_q4: parseFloat(stripCommas(kpiForm.q4)) || 0,
          unit: kpiForm.unit,
          frequency: kpiForm.frequency,
          planned_measurement: kpiForm.planned_measurement,
          timeline: kpiForm.timeline,
          year: kpiForm.year || selectedYear,
          srap_objective_id: kpiModal.objectiveId,
          department_id: kpiForm.department || activeDepartmentFilter,
        };
      }

      if (shouldUseStakeholderApis) {
        // Stakeholder: POST to upload-month endpoint (create or update)
        const fd = new FormData();
        fd.append("pillar_id", selectedPillar?.id ?? "");
        fd.append("value", parseFloat(stripCommas(kpiForm.value)) || 0);
        fd.append("year", kpiForm.year || selectedYear);
        fd.append("title", kpiForm.title ?? "");
        fd.append("remarks", kpiForm.remarks ?? "");
        fd.append("address", kpiForm.address ?? "");
        fd.append("state_id", kpiForm.state_id ?? "");
        fd.append("lga_id", kpiForm.lga_id ?? "");
        if (kpiForm.tracking_date_start) fd.append("tracking_date_start", kpiForm.tracking_date_start);
        if (kpiForm.tracking_date_end) fd.append("tracking_date_end", kpiForm.tracking_date_end);
        if (kpiForm.evidence) {
          if (Array.isArray(kpiForm.evidence)) {
            kpiForm.evidence.forEach((f) => fd.append("evidences[]", f));
          } else {
            fd.append("evidence", kpiForm.evidence);
          }
        }
        
        // Import the API functions
        const { createStakeholderActivityValueUploadMonthApi, updateStakeholderActivityValueApi } = await import('../Slices/Utils/Api/stakeholderActivities');
        
        let response;
        if (kpiModal.data) {
          // Update existing activity value
          response = await updateStakeholderActivityValueApi(kpiModal.data.id, fd);
          if (response?.status === 'success' || response?.code === 200) {
            toast.success("Activity values updated successfully");
          } else {
            throw new Error(response?.message || "Failed to update activity values");
          }
        } else {
          // Create new activity value
          response = await createStakeholderActivityValueUploadMonthApi(fd);
          if (response?.status === 'success' || response?.code === 200) {
            toast.success("Activity values uploaded successfully");
          } else {
            throw new Error(response?.message || "Failed to upload activity values");
          }
        }

        // Close modal and refresh data only after successful API call
        setKpiModal({ open: false, data: null, objectiveId: null, objective: null });
        
        // Clear local state and refresh
        setKpis((prev) => {
          const newKpis = { ...prev };
          delete newKpis[kpiModal.objectiveId];
          return newKpis;
        });
        await fetchKpisForObjective(kpiModal.objectiveId, true);
      } else if (kpiModal.data) {
        // NITDA — Update existing KPI
        await dispatch(updateKpi({ id: kpiModal.data.id, data: payload })).unwrap();
        toast.success("KPI updated successfully");
        
        // Close modal and refresh data only after successful API call
        setKpiModal({ open: false, data: null, objectiveId: null, objective: null });
        
        // Clear local state and refresh
        setKpis((prev) => {
          const newKpis = { ...prev };
          delete newKpis[kpiModal.objectiveId];
          return newKpis;
        });
        await fetchKpisForObjective(kpiModal.objectiveId, true);
      } else {
        // NITDA — Create new KPI
        await dispatch(createKpi(payload)).unwrap();
        toast.success("KPI created successfully");
        
        // Close modal and refresh data only after successful API call
        setKpiModal({ open: false, data: null, objectiveId: null, objective: null });
        
        // Clear local state and refresh
        setKpis((prev) => {
          const newKpis = { ...prev };
          delete newKpis[kpiModal.objectiveId];
          return newKpis;
        });
        await fetchKpisForObjective(kpiModal.objectiveId, true);
      }

      /*
      // Refresh entity counts
      dispatch(fetchPillarEntityCounts({
        pillarId: selectedPillar.id,
        year: selectedYear,
        department_id: activeDepartmentFilter,
        visible_to_stakeholders_only: shouldUseStakeholderApis
      }));
      */
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving((prev) => ({ ...prev, kpi: false }));
    }
  };

  const handleDeleteKpi = (kpiId, objectiveId) => {
    setConfirmModal({
      open: true,
      
      type: "kpi",
      id: kpiId,
      parentId: objectiveId,
      title: shouldUseStakeholderApis ? "Delete Activity" : "Delete KPI",
      description: shouldUseStakeholderApis
        ? "Are you sure you want to delete this activity?"
        : "Are you sure you want to delete this KPI?",
    });
  };

  const executeDelete = async () => {
    const { type, id, parentId } = confirmModal;
    // Don't close modal yet if dealing with deletion (though ConfirmModal handles loading via props usually,
    // but here we are using separate 'deleting' state to disable buttons in the UI).
    // Wait, the requirement was to show loaders on the *delete action*.
    // For the modal delete, it's better to pass a loading prop to ConfirmModal or keep it open.
    // However, the original code had 'deleting' state for the list items buttons.
    // If we want the modal to show loading, we need to pass a loading prop.
    // BUT the requirement was "loader should also be there if i click on a pillar... also for initiatives..."
    // AND "loader should be there if i click on a pillar...".
    // For the delete button specifically, we are setting state 'deleting' which we used in the list view.
    // The ConfirmModal should also probably reflect this or stay open.
    // Let's set the deleting state first so the list item button shows a spinner (if visible behind modal)
    // AND we should probably modify ConfirmModal to accept a loading state, OR just handle it here.

    // Set local deleting state for the specific item (so even if modal closes or if we trigger from elsewhere)
    setDeleting(prev => ({
      ...prev,
      [type]: { ...prev[type], [id]: true }
    }));

    // We'll close the modal AFTER success, or keep it open if we want to show loading ON the modal button.
    // But since ConfirmModal implementation isn't fully visible (it might not support loading prop),
    // let's assume we want to show it on the UI button primarily.
    // Actually, widespread pattern is closing modal then showing global loader or list loader.
    // Let's keep modal open ideally but without modifying ConfirmModal it's risky.
    // Let's close it for now to follow previous pattern but rely on the list item loader we just added.
    setConfirmModal((prev) => ({ ...prev, open: false }));

    try {
      if (type === "initiative") {
        await dispatch(deleteSrapInitiative(id)).unwrap();
        toast.success("Initiative deleted successfully");
        if (!isStakeholderUser) {
          dispatch(fetchSrapInitiatives({ pillar_id: selectedPillar.id, year: selectedYear, department_id: activeDepartmentFilter }));
        } else {
          dispatch(fetchPillars());
        }
      } else if (type === "objective") {
        if (shouldUseStakeholderApis) {
          await dispatch(deleteStakeholderObjective(id)).unwrap();
        } else {
          await dispatch(deleteObjective(id)).unwrap();
        }
        toast.success("Objective deleted successfully");

        // If we deleted the currently selected objective, clear selection
        if (shouldUseStakeholderApis && selectedObjective?.id === id) {
          setSelectedObjective(null);
        }

        // Clear cache and refresh objectives
        if (!isStakeholderUser && !shouldUseStakeholderApis) {
          setObjectives((prev) => {
            const newObj = { ...prev };
            delete newObj[parentId];
            return newObj;
          });
          await fetchObjectivesForInitiative(parentId, true);
        } else {
          // For stakeholders, refresh the sidebar list
          dispatch(fetchStakeholderObjectives({
            department_id: activeDepartmentFilter,
            year: selectedYear,
            srap_initiative_id: parentId,
            // visible_to_stakeholders: true,
          }));
        }
      } else if (type === "kpi") {
        if (shouldUseStakeholderApis) {
          // Delete stakeholder activity value
          const { deleteStakeholderActivityValueApi } = await import('../Slices/Utils/Api/stakeholderActivities');
          await deleteStakeholderActivityValueApi(id);
        } else {
          await dispatch(deleteKpi(id)).unwrap();
        }
        toast.success(shouldUseStakeholderApis ? "Activity deleted successfully" : "KPI deleted successfully");
        setKpis((prev) => {
          const newKpis = { ...prev };
          delete newKpis[parentId];
          return newKpis;
        });
        await fetchKpisForObjective(parentId, true);
      }

      // Refresh entity counts
      // dispatch(fetchPillarEntityCounts({
      //   pillarId: selectedPillar.id,
      //   year: selectedYear,
      //   // department_id: activeDepartmentFilter,
      //   visible_to_stakeholders_only: shouldUseStakeholderApis
      // }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      // Clear deleting state
      setDeleting(prev => ({
        ...prev,
        [type]: { ...prev[type], [id]: false }
      }));
    }
  };

  // Summary calculations
  // Removed local calculations in favor of fetchPillarEntityCounts from Redux


  if (pillarsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {/* Breadcrumb */}
        {!shouldUseStakeholderApis && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-4" id="srap-breadcrumb">
            <span
              onClick={() => navigate(shouldUseStakeholderApis ? "/dashboard/stakeholder-dashboard" : "/dashboard")}
              className="hover:text-foreground cursor-pointer"
            >
              Home
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span
              onClick={() => setSelectedPillar(null)}
              className="hover:text-foreground cursor-pointer"
            >
              {shouldUseStakeholderApis ? "Activity Management" : "SRAP Management"}
            </span>
            {selectedPillar && (
              <>
                <span className="text-muted-foreground/50">/</span>
                <span className="font-medium text-[#008000] dark:text-green-500">
                  {selectedPillar.name}
                </span>
              </>
            )}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {shouldUseStakeholderApis ? "Activity Management" : "SRAP Management"}

          </h1>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Admin Department Selector */}
            {isAdminUser && (
              <div className="w-full md:w-96" id="srap-admin-dept-select">
                <Select
                  value={selectedDepartmentId?.toString()}
                  onValueChange={(val) => setSelectedDepartmentId(parseInt(val))}
                >
                  <SelectTrigger className="w-full bg-background border-border text-left justify-between px-3">
                    <div className="truncate pr-2">
                      <SelectValue placeholder="Select Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.filter((d) => d.type === "nitda").map((dept) => (
                      <SelectItem
                        key={dept.id}
                        value={dept.id?.toString()}
                        className="text-left justify-start pl-2"
                      >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year Filter */}
            <div className="w-full md:w-40" id="srap-year-select">
              <Select
                value={selectedYear.toString()}
                onValueChange={(val) => setSelectedYear(parseInt(val))}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList?.map((yr) => (
                    <SelectItem key={yr.id} value={yr.year.toString()}>
                      {yr.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Visibility Button — admin / NITDA only */}
            {/* {!isStakeholderUser && (
              <Button
                id="srap-bulk-visibility-btn"
                variant="outline"
                className="w-full md:w-auto border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 flex-shrink-0"
                onClick={handleOpenBulkVisibility}
              >
                <Layers className="h-4 w-4 mr-2" />
                Bulk Visibility
              </Button>
            )} */}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse xl:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          {/* Select Pillar Section */}

          {!shouldUseStakeholderApis ? (
            <>
              {/* NITDA Flow: Select Pillar Section */}
              <section className="mb-8" id="srap-pillar-selection">
                <h2 className="text-xl font-semibold text-foreground mb-4">Select Pillar</h2>
                <div className={`grid ${pillars?.length > 0 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`} id="srap-pillar-grid">
                  {pillars?.length > 0 ? (
                    pillars.map((pillar, index) => (
                      <button
                        key={pillar.id}
                        onClick={() => setSelectedPillar(pillar)}
                        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl transition-all shadow-sm min-h-[100px] ${selectedPillar?.id === pillar.id
                          ? "bg-[#008000] text-white shadow-md ring-4 ring-[#008000]/20"
                          : "bg-card text-muted-foreground border border-border hover:border-foreground/20 hover:shadow-md hover:text-foreground"
                          }`}
                      >
                        <div
                          className={`w-7 h-7 flex-shrink-0 ${selectedPillar?.id === pillar.id
                            ? "text-white"
                            : "text-muted-foreground group-hover:text-[#008000]"
                            }`}
                        >
                          {pillarIcons[index % pillarIcons.length]}
                        </div>

                        <span className="text-xs font-semibold text-center leading-tight break-words w-full">
                          {pillar.name}
                        </span>
                      </button>
                    ))
                  ) : !pillarsLoading && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed border-border text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 p-2">
                        <img src={srapPillarsImage} alt="Pillars" className="w-full h-full object-contain opacity-60" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">No pillars found</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                        No strategic pillars have been created yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {selectedPillar && (
                <section className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                  {/* Pillar Header */}
                  <div className="bg-[#008000] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Pillar {pillars.findIndex((p) => p.id === selectedPillar.id) + 1}:
                      <span className="block sm:inline ml-0 sm:ml-2 truncate max-w-[200px] sm:max-w-none">{selectedPillar.name}</span>
                    </h2>
                  </div>

                  <div className="p-6">
                    {/* Search & Add */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search initiatives, objectives..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 bg-muted/50 border-transparent rounded-lg focus:bg-background focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <Button
                        onClick={handleAddInitiative}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Initiative
                      </Button>
                    </div>

                    <h4 className="text-lg font-bold text-muted-foreground mb-5">Initiatives</h4>

                    {/* Initiatives Accordion (Same as before) */}
                    {initiativesForSelectedYear.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                        <p className="text-muted-foreground text-lg mb-6">No initiatives added yet</p>
                        <Button onClick={handleAddInitiative} className="bg-green-600 text-white">
                          <Plus className="h-5 w-5 mr-2" />
                          Add Your First Initiative
                        </Button>
                      </div>
                    ) : initiativesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : (
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-4"
                        onValueChange={(value) => {
                          if (value) {
                            const id = parseInt(value.replace('initiative-', ''));
                            fetchObjectivesForInitiative(id);
                          }
                        }}
                      >
                        {initiativesForSelectedYear.map((initiative) => (
                          <AccordionItem key={initiative.id} value={`initiative-${initiative.id}`} className="border border-border rounded-lg px-4">
                            {/* Accordion Trigger Content (Initiative) */}
                            <AccordionTrigger className="hover:no-underline border-0" actions={
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditInitiative(initiative); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteInitiative(initiative.id); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            }>
                              <div className="flex items-start gap-3 text-left p-4">
                                <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div>
                                  <h4 className="font-semibold">{initiative.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{initiative.description}</p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                              {/* Objectives (Accordion nested) */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold">Objectives</h4>
                                  <Button size="sm" onClick={() => handleAddObjective(initiative)} className="bg-primary text-white">
                                    <Plus className="h-4 w-4 mr-2" /> Add Objective
                                  </Button>
                                </div>
                                {loadingObjectives[initiative.id] ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                ) : (objectives[initiative.id] || []).length === 0 ? (
                                  <p className="text-sm text-center text-muted-foreground py-4">No objectives added yet</p>
                                ) : (
                                  <Accordion type="single" collapsible className="space-y-3" onValueChange={(val) => {
                                    if (val) fetchKpisForObjective(parseInt(val.replace('objective-', '')));
                                  }}>
                                    {objectives[initiative.id].map((obj) => (
                                      <AccordionItem key={obj.id} value={`objective-${obj.id}`} className="border border-border rounded-lg">
                                        <AccordionTrigger className="px-4 hover:bg-muted/30" actions={
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditObjective(obj, initiative.id); }}>
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteObjective(obj.id, initiative.id); }}>
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        }>
                                          <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-medium text-left">{obj.name}</span>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 px-4 pb-4">
                                          {/* KPIs (Cards) */}
                                          <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                              <h5 className="font-semibold text-sm">KPIs</h5>
                                              <Button size="sm" onClick={() => handleAddKpi(obj)} className="bg-primary text-white">
                                                <Plus className="h-4 w-4 mr-2" /> Add KPI
                                              </Button>
                                            </div>
                                            {loadingKpis[obj.id] ? (
                                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                            ) : (kpis[obj.id] || []).length === 0 ? (
                                              <p className="text-xs text-center text-muted-foreground py-2">No KPIs added yet</p>
                                            ) : (
                                              <div className="grid grid-cols-1 gap-3">
                                                {kpis[obj.id].map((kpi) => (
                                                  <Card key={kpi.id} className="p-0 border-border bg-card shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                                    <div className="p-5">
                                                      <div className="flex justify-between items-start mb-1">
                                                        <div className="flex-1 min-w-0">
                                                          <h6 className="font-bold text-foreground transition-colors text-sm">
                                                            {kpi.name}
                                                          </h6>
                                                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed italic">
                                                            {kpi.description}
                                                          </p>
                                                        </div>
                                                        <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                          <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            onClick={() => handleEditKpi(kpi, obj)}
                                                            disabled={kpi.is_approved === true || kpi.approved === true}
                                                            title={kpi.is_approved || kpi.approved ? "This KPI has been approved and cannot be edited" : "Edit KPI"}
                                                          >
                                                            <Pencil className="h-3 w-3" />
                                                          </Button>
                                                          <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                            onClick={() => handleDeleteKpi(kpi.id, obj.id)}
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </div>

                                                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 mt-3 text-[10px]">
                                                        <div className="flex gap-1">
                                                          <span className="text-muted-foreground">Target:</span>
                                                          <span className="font-bold text-foreground">{(parseFloat(kpi.target_annual) || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                          <span className="text-muted-foreground">Unit:</span>
                                                          <span className="font-bold text-foreground capitalize">{kpi.unit?.replace(/_/g, ' ') || "N/A"}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                          <span className="text-muted-foreground">Frequency:</span>
                                                          <span className="font-bold text-foreground capitalize">{kpi.frequency}</span>
                                                        </div>
                                                      </div>

                                                      <div className="space-y-2">
                                                        <p className="text-[9px] font-bold text-green-700/80 uppercase tracking-widest">Period Targets:</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                          {[
                                                            { label: "Q1", value: kpi.target_q1 },
                                                            { label: "Q2", value: kpi.target_q2 },
                                                            { label: "Q3", value: kpi.target_q3 },
                                                            { label: "Q4", value: kpi.target_q4 }
                                                          ].map((q, idx) => (
                                                            <div key={idx} className="bg-green-50 border border-green-100/50 rounded py-1.5 px-2 flex items-center justify-center gap-1">
                                                              <span className="text-[9px] font-bold text-green-700">{q.label}:</span>
                                                              <span className="text-[10px] font-bold text-green-800">{(parseFloat(q.value) || 0).toLocaleString()}</span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      {/* Department label removed as per request */}
                                                    </div>
                                                  </Card>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Stakeholder Flow: Master-Detail Layout - Now using Pillars */
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-250px)] min-h-[600px] lg:min-h-[600px]">
              {/* Left Sidebar: Pillars List */}
              <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-sm h-[400px] lg:h-auto">
                <div className="p-4 border-b border-border bg-muted/20">
                  <h3 className="font-bold text-foreground mb-3">Pillars</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search pillars..."
                      className="pl-9 h-9 text-xs bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {(pillars || []).length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-muted-foreground">
                      No pillars found for this department/year.
                    </div>
                  ) : (() => {
                    const filtered = (pillars || []).filter(pillar =>
                      pillar.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="py-8 px-4 text-center text-xs text-muted-foreground">
                          <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                          No pillar found for &ldquo;{searchTerm}&rdquo;.
                        </div>
                      );
                    }
                    return filtered.map((pillar, index) => (
                      <button
                        key={pillar.id}
                        onClick={() => {
                          setSelectedPillar(pillar);
                          fetchKpisForObjective(pillar.id);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all group ${selectedPillar?.id === pillar.id
                          ? "bg-green-600 text-white shadow-md active-pillar"
                          : "hover:bg-muted/50 text-foreground"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-4 w-4 mt-0.5 flex-shrink-0 ${selectedPillar?.id === pillar.id ? "text-white" : "text-green-600"}`}>
                            {pillarIcons[index % pillarIcons.length]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold leading-tight line-clamp-2">{pillar.name}</p>
                          </div>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Right Content: Pillar Details & Activities */}
              <div className="flex-1 min-w-0 bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm">
                {selectedPillar ? (
                  <>
                    {/* Detail Header */}
                    <div className="p-6 border-b border-border bg-muted/5">
                      {/* Dynamic Breadcrumb for Stakeholders */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground mb-4" id="stakeholder-breadcrumb">
                        <span onClick={() => navigate(shouldUseStakeholderApis ? "/dashboard/stakeholder-dashboard" : "/dashboard")} className="hover:text-foreground cursor-pointer transition-colors">Home</span>
                        <span className="text-muted-foreground/40 font-normal">/</span>
                        <span onClick={() => { setSelectedPillar(null); }} className="hover:text-foreground cursor-pointer transition-colors">
                          {shouldUseStakeholderApis ? "Activity Management" : "SRAP Management"}
                        </span>
                        <span className="text-muted-foreground/40 font-normal">/</span>
                        <span className="font-semibold text-green-700 dark:text-green-400 truncate max-w-[180px]">{selectedPillar.name}</span>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-foreground leading-tight">
                          {selectedPillar.name}
                        </h2>
                      </div>

                      {/* Information Block */}
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div className="bg-white border border-border shadow-sm rounded-lg p-4">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Pillar Description</label>
                          <p className="text-sm text-foreground mt-1 leading-relaxed">
                            {selectedPillar.description || "No description available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activities Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          Activities
                        </h3>
                        <Button
                          onClick={() => handleAddKpi(selectedPillar)}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </div>

                      {loadingKpis[selectedPillar.id] ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                          <p className="text-sm text-muted-foreground">Loading activities...</p>
                        </div>
                      ) : (kpis[selectedPillar.id] || []).length === 0 ? (
                        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center bg-muted/10">
                          <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground font-medium mb-4">No activities created for this pillar yet.</p>
                          <Button onClick={() => handleAddKpi(selectedPillar)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            Create First Activity
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {kpis[selectedPillar.id].map((activityValue) => {
                            // For stakeholder activity values, the structure is different
                            // It contains pillar info and monthly values
                            const pillarInfo = activityValue.pillar || {};
                            const displayName = pillarInfo.name || activityValue.title || "Activity";
                            const displayDescription = pillarInfo.description || activityValue.remarks || "";
                            
                            // Calculate total value from actual_annual
                            const totalValue = activityValue.actual_annual || activityValue.value || 0;
                            
                            return (
                              <Card key={activityValue.id} className="p-0 border-border bg-card shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-foreground transition-colors text-base">
                                        {displayName}
                                      </h4>uu     
                                      {displayDescription && (
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">
                                          {displayDescription}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                                        onClick={() => handleEditKpi(activityValue, selectedPillar)}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                        onClick={() => handleDeleteKpi(activityValue.id, selectedPillar.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Display quarterly breakdown and total value */}
                                  <div className="mt-4 space-y-3">
                                    {/* Total Annual Value */}
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground font-medium">Total Value:</span>
                                      <span className="font-bold text-green-700 text-lg">
                                        {parseFloat(totalValue).toLocaleString()}
                                      </span>
                                    </div>

                                    {/* Quarterly Values Summary */}
                                    {/* <div className="grid grid-cols-4 gap-2">
                                      {[
                                        { label: 'Q1', value: activityValue.actual_q1 },
                                        { label: 'Q2', value: activityValue.actual_q2 },
                                        { label: 'Q3', value: activityValue.actual_q3 },
                                        { label: 'Q4', value: activityValue.actual_q4 }
                                      ].map((quarter, idx) => (
                                        <div key={idx} className="bg-green-50 border border-green-100 rounded px-2 py-1.5 text-center">
                                          <div className="text-[9px] font-bold text-green-700 uppercase">{quarter.label}</div>
                                          <div className="text-xs font-bold text-green-800">
                                            {parseFloat(quarter.value || 0).toLocaleString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div> */}

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pt-2 border-t border-border">
                                      <span>Year: <strong className="text-foreground">{activityValue.year}</strong></span>
                                      <span>Uploaded by: <strong className="text-foreground">{activityValue.uploaded_by || 'Unknown'}</strong></span>
                                      <span>Status: <strong className={activityValue.verified ? "text-green-600" : "text-amber-600"}>{activityValue.verified ? 'Approved' : 'Pending'}</strong></span>
                                      {activityValue.evidence_url && (
                                        <a 
                                          href={activityValue.evidence_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:text-green-700 flex items-center gap-1"
                                        >
                                          <FileText className="inline h-3 w-3" />
                                          View Evidence
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <Target className="h-12 w-12 text-green-600 opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Select a Pillar</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-lg leading-relaxed">
                      Choose a pillar from the sidebar to create activities, view its details and manage linked activities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div >

        {/* Summary Sidebar — NITDA flow only, shown when a pillar is selected */}
        {!shouldUseStakeholderApis && (
          <div className="w-full xl:w-64 flex-shrink-0">
            <div className="sticky top-6 bg-card border border-border rounded-xl shadow-sm p-5 space-y-3">
              <h3 className="text-base font-bold text-green-700">Summary</h3>

              {/* Initiatives */}
              <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Initiatives:</span>
                </div>
                <span className="font-bold text-foreground text-sm">
                  {entityCountsLoading ? '—' : (entityCounts?.initiatives_count ?? entityCounts?.initiatives ?? 0)}
                </span>
              </div>

              {/* Objectives */}
              <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Objectives:</span>
                </div>
                <span className="font-bold text-foreground text-sm">
                  {entityCountsLoading ? '—' : (entityCounts?.objectives_count ?? entityCounts?.objectives ?? 0)}
                </span>
              </div>

              {/* Activities / KPIs */}
              <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>KPI's:</span>
                </div>
                <span className="font-bold text-foreground text-sm">
                  {entityCountsLoading ? '—' : (entityCounts?.activities_count ?? entityCounts?.kpis_count ?? entityCounts?.kpis ?? entityCounts?.activities ?? 0)}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={openExportModal}
                  className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Preview
                </button>
              
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Preview Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setExportModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#155535] rounded-t-xl">
              <div>
                <h2 className="text-base font-semibold text-white">Export Preview</h2>
                <p className="text-xs text-white/70">Review data before downloading as Excel</p>
              </div>
              <button onClick={() => setExportModalOpen(false)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Year</label>
                <select
                  value={exportYear}
                  onChange={e => { setExportYear(e.target.value); fetchExportPreview(e.target.value, exportDeptId); }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {(yearsList || []).map(y => (
                    <option key={y.id ?? y.year} value={String(y.year)}>{y.year}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Department</label>
                <DepartmentSelect
                  value={exportDeptId}
                  onChange={val => { setExportDeptId(val); fetchExportPreview(exportYear, val); }}
                  className="w-[220px]"
                  type="nitda"
                />
              </div>
              <div className="ml-auto pt-5">
                <button
                  onClick={handleExportDownload}
                  disabled={exportDownloading || exportLoading || !exportPreview}
                  className="flex items-center gap-2 bg-[#155535] hover:bg-[#0e3d26] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {exportDownloading ? "Downloading…" : "Download Excel"}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-auto px-6 py-4">
              {exportLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#155535]" />
                </div>
              ) : !exportPreview ? (
                <div className="text-center py-16 text-gray-400">No data available</div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">{exportPreview.rows?.length ?? 0} row(s) found</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#155535] text-white">
                          {(exportPreview.columns || []).map(col => (
                            <th key={col} className="px-3 py-2 text-left font-semibold whitespace-nowrap border border-[#0e3d26]">
                              {col.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(exportPreview.rows || []).map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {(exportPreview.columns || []).map(col => (
                              <td key={col} className="px-3 py-2 border border-gray-200 whitespace-nowrap max-w-[200px] truncate" title={String(row[col] ?? "")}>
                                {row[col] ?? "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {(exportPreview.rows || []).length === 0 && (
                          <tr><td colSpan={(exportPreview.columns || []).length} className="text-center py-8 text-gray-400">No rows found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Initiative Modal */}
      < CustomDialog
        open={initiativeModal.open}
        onOpenChange={(open) => setInitiativeModal({ open, data: null })}
        title={
          < span className="text-green-700" >
            {initiativeModal.data ? "Edit Initiative" : "New Initiative"}
          </span >
        }
        description={
          initiativeModal.data
            ? `Edit the initiative under ${selectedPillar?.name}`
            : `Add a new initiative under ${selectedPillar?.name}`
        }
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="initiative-name">Initiative Name *</Label>
            <Input
              id="initiative-name"
              placeholder="e.g., Train 10,000 citizens"
              value={initiativeForm.name}
              onChange={(e) =>
                setInitiativeForm({ ...initiativeForm, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="initiative-year">Year *</Label>
            <Select
              value={initiativeForm.year?.toString()}
              onValueChange={(value) =>
                setInitiativeForm({ ...initiativeForm, year: value })
              }
            >
              <SelectTrigger id="initiative-year" className="w-full mt-1">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>

              <SelectContent>
                {yearsList?.map((yr) => (
                  <SelectItem key={yr.id} value={yr.year.toString()}>
                    {yr.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setInitiativeModal({ open: false, data: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveInitiative}
              disabled={
                saving.initiative ||
                !initiativeForm.name ||
                !initiativeForm.year
              }
              className="bg-green-600 hover:bg-green-700 text-white flex items-center"
            >
              {saving.initiative ? (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : null}
              {initiativeModal.data ? "Update" : "Add"} Initiative
            </Button>
          </div>
        </div>
      </CustomDialog >

      {/* Objective Modal */}
      < CustomDialog
        open={objectiveModal.open}
        onOpenChange={(open) =>
          setObjectiveModal({ open, data: null, initiativeId: null })
        }
        title={
          < span className="text-green-700" >
            {objectiveModal.data ? "Edit Objective" : "New Objective"}
          </span >
        }
        description={
          objectiveModal.data
            ? "Edit the objective"
            : "Add a new objective under the selected initiative"
        }
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="objective-name">Objective Name *</Label>
            <Input
              id="objective-name"
              placeholder="e.g., Achieve defined digital literacy level"
              value={objectiveForm.name}
              onChange={(e) =>
                setObjectiveForm({ ...objectiveForm, name: e.target.value })
              }
            />
          </div>

          {/* Visible to Stakeholders Only Toggle */}
          <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Visible to Stakeholders Only</p>
              <p className="text-xs text-muted-foreground mt-0.5">When enabled, this objective will be visible to stakeholder users.</p>
            </div>
            <button
              type="button"
              onClick={() => setObjectiveForm({ ...objectiveForm, visible_to_stakeholders: !objectiveForm.visible_to_stakeholders })}
              className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer flex-shrink-0 ${objectiveForm.visible_to_stakeholders ? 'bg-success' : 'bg-muted-foreground/30'}`}
              aria-label="Toggle stakeholder visibility"
            >
              <span
                className={`absolute left-0.5 top-0.5 w-[20px] h-[20px] bg-card rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${objectiveForm.visible_to_stakeholders ? 'translate-x-[20px]' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                setObjectiveModal({
                  open: false,
                  data: null,
                  initiativeId: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveObjective}
              disabled={
                saving.objective ||
                !objectiveForm.name
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving.objective && (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {objectiveModal.data ? "Update" : "Add"} Objective
            </Button>
          </div>
        </div >
      </CustomDialog >

      {/* KPI / Activity Modal */}
      <CustomDialog
        open={kpiModal.open}
        onOpenChange={(open) =>
          setKpiModal({ open, data: null, objectiveId: null, objective: null })
        }
        title={
          <span className="text-green-700">
            {kpiModal.data
              ? `Edit ${getKpiLabel(activeLabelContext)}`
              : `New ${shouldUseStakeholderApis ? "Activity" : "KPI"}`}
          </span>
        }
        className="!max-w-[560px] !max-h-[90vh] overflow-y-auto !pt-[18px] !pr-[24px] !pb-[18px] !pl-[24px]"
      >
        {shouldUseStakeholderApis ? (
          // ── STAKEHOLDER upload-month form: Title, Value, Reporting Period, Year, Remarks, Evidence ──
          <div className="flex flex-col gap-5 py-1">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-title" className="text-sm font-semibold">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kpi-title"
                type="text"
                placeholder="e.g., Q1 Digital Literacy Training"
                value={kpiForm.title}
                onChange={(e) =>
                  setKpiForm({ ...kpiForm, title: e.target.value })
                }
                className="h-10"
              />
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-value" className="text-sm font-semibold">
                Value <span className="text-red-500">*</span> This should be a numeric value.
              </Label>
              <Input
                id="kpi-value"
                type="number"
                placeholder="e.g., 200"
                value={kpiForm.value}
                onChange={(e) =>
                  setKpiForm({ ...kpiForm, value: e.target.value })
                }
                className="h-10"
              />
            </div>



            {/* Year */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-year" className="text-sm font-semibold">
                Year <span className="text-red-500">*</span>
              </Label>
              <Select
                value={kpiForm.year ? String(kpiForm.year) : ""}
                onValueChange={(val) =>
                  setKpiForm({
                    ...kpiForm,
                    year: val,
                    // Clear dates that fall outside the newly selected year
                    tracking_date_start:
                      kpiForm.tracking_date_start?.startsWith(val)
                        ? kpiForm.tracking_date_start
                        : "",
                    tracking_date_end:
                      kpiForm.tracking_date_end?.startsWith(val)
                        ? kpiForm.tracking_date_end
                        : "",
                  })
                }
              >
                <SelectTrigger id="kpi-year" className="h-10">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList?.map((yr) => (
                    <SelectItem key={yr.year} value={String(yr.year)}>
                      {yr.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Date Start & End */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kpi-tracking-date-start" className="text-sm font-semibold">
                  Tracking Date Start
                </Label>
                <Input
                  id="kpi-tracking-date-start"
                  type="date"
                  value={kpiForm.tracking_date_start}
                  min={minTrackDate}
                  max={maxTrackDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setKpiForm({ ...kpiForm, tracking_date_start: val });
                    setDateErrors(validateTrackingDates(val, kpiForm.tracking_date_end));
                  }}
                  className={`h-10 ${dateErrors.start ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {dateErrors.start && (
                  <p className="text-xs text-red-600 mt-1">{dateErrors.start}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kpi-tracking-date-end" className="text-sm font-semibold">
                  Tracking Date End
                </Label>
                <Input
                  id="kpi-tracking-date-end"
                  type="date"
                  value={kpiForm.tracking_date_end}
                  min={kpiForm.tracking_date_start || minTrackDate}
                  max={maxTrackDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setKpiForm({ ...kpiForm, tracking_date_end: val });
                    setDateErrors(validateTrackingDates(kpiForm.tracking_date_start, val));
                  }}
                  className={`h-10 ${dateErrors.end ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {dateErrors.end && (
                  <p className="text-xs text-red-600 mt-1">{dateErrors.end}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-address" className="text-sm font-semibold">
                Address <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-muted-foreground">(Venue/address, max 500 chars)</span>
              </Label>
              <Input
                id="kpi-address"
                type="text"
                placeholder="e.g., No. 5 Herbert Macaulay Way, Abuja"
                value={kpiForm.address}
                maxLength={500}
                onChange={(e) => setKpiForm({ ...kpiForm, address: e.target.value })}
                className="h-10"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-state" className="text-sm font-semibold">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={kpiForm.state_id}
                onValueChange={(val) => {
                  setKpiForm({ ...kpiForm, state_id: val, lga_id: "" });
                  fetchNigeriaLgas(val);
                }}
              >
                <SelectTrigger id="kpi-state" className="h-10">
                  {loadingStates ? (
                    <span className="text-muted-foreground text-sm">Loading states…</span>
                  ) : (
                    <SelectValue placeholder="Select state" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {nigeriaStates.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LGA */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-lga" className="text-sm font-semibold">
                LGA <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-muted-foreground">(Select state first)</span>
              </Label>
              <Select
                value={kpiForm.lga_id}
                disabled={!kpiForm.state_id || loadingLgas}
                onValueChange={(val) => setKpiForm({ ...kpiForm, lga_id: val })}
              >
                <SelectTrigger id="kpi-lga" className="h-10">
                  {loadingLgas ? (
                    <span className="text-muted-foreground text-sm">Loading LGAs…</span>
                  ) : (
                    <SelectValue placeholder={kpiForm.state_id ? "Select LGA" : "Select a state first"} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {nigeriaLgas.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-remarks" className="text-sm font-semibold">
                Remarks <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="kpi-remarks"
                placeholder="Required remarks…"
                value={kpiForm.remarks}
                onChange={(e) => setKpiForm({ ...kpiForm, remarks: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Evidence (file) */}
            <div className="space-y-1.5">
              <Label htmlFor="kpi-evidence" className="text-sm font-semibold">
                Evidence
                <span className="ml-1 text-xs font-normal text-muted-foreground">(Required evidence file)</span>
              </Label>
              <input
                id="kpi-evidence"
                type="file"
                multiple
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border border-border rounded-lg p-1"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) {
                    setKpiForm({ ...kpiForm, evidence: null });
                  } else if (files.length === 1) {
                    setKpiForm({ ...kpiForm, evidence: files[0] });
                  } else {
                    setKpiForm({ ...kpiForm, evidence: Array.from(files) });
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setKpiModal({ open: false, data: null, objectiveId: null, objective: null })
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveKpi}
                disabled={
                  saving.kpi ||
                  !kpiForm.title.trim() ||
                  !kpiForm.value ||
                  !kpiForm.remarks.trim() ||
                  !kpiForm.address.trim() ||
                  !kpiForm.state_id ||
                  !kpiForm.lga_id ||
                  !kpiForm.evidence
                }
                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
              >
                {saving.kpi ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving…
                  </div>
                ) : (
                  <>{kpiModal.data ? "Update" : "Add"} Activity</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // ── NITDA full form: Name, Description, Unit, Frequency, Target, Period Targets ──
          <div className="flex flex-col gap-[16px]">
            <div className="space-y-2">
              <Label htmlFor="kpi-name">
                KPI Name *{" "}
                <span className="text-xs text-muted-foreground">(What to measure)</span>
              </Label>
              <Input
                id="kpi-name"
                placeholder="e.g., Number of citizens trained"
                value={kpiForm.name}
                onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
              />
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-unit">
                  Unit *{" "}
                  <span className="text-xs text-muted-foreground">(Measurement type)</span>
                </Label>
                <Select
                  value={kpiForm.unit}
                  onValueChange={(value) => setKpiForm({ ...kpiForm, unit: value })}
                >
                  <SelectTrigger id="kpi-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value_of">Value Of</SelectItem>
                    <SelectItem value="number_of">Number Of</SelectItem>
                    <SelectItem value="percentage_of">Percentage Of</SelectItem>
                    <SelectItem value="level_of">Level Of</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-frequency">
                  Frequency *{" "}
                  <span className="text-xs text-muted-foreground">(Review period)</span>
                </Label>
                <Select
                  value={kpiForm.frequency}
                  onValueChange={(value) => setKpiForm({ ...kpiForm, frequency: value })}
                >
                  <SelectTrigger id="kpi-frequency">
                    <SelectValue placeholder="Quarterly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpi-year">
                Year *{" "}
                <span className="text-xs text-muted-foreground">(Target year)</span>
              </Label>
              <Select
                value={kpiForm.year ? String(kpiForm.year) : String(selectedYear)}
                onValueChange={(value) => setKpiForm({ ...kpiForm, year: parseInt(value) })}
              >
                <SelectTrigger id="kpi-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList.map((y) => (
                    <SelectItem key={y.id ?? y.year} value={String(y.year)}>
                      {y.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpi-target">
                Target{" "}
                <span className="text-xs text-muted-foreground">(Expected value)</span>
              </Label>
              <Input
                id="kpi-target"
                type="text"
                placeholder="0"
                value={kpiForm.target}
                onChange={(e) =>
                  setKpiForm({ ...kpiForm, target: formatNumberWithCommas(e.target.value) })
                }
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Period Targets{kpiForm.unit !== "level_of" && " *"}{" "}
                <span className="text-xs text-muted-foreground">
                  {kpiForm.unit === "level_of"
                    ? "(Optional — not required for Level Of unit)"
                    : "(Set targets for each quarterly period)"}
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {["q1", "q2", "q3", "q4"].map((q) => (
                  <div key={q} className="space-y-1">
                    <Label htmlFor={q} className="text-xs font-medium text-muted-foreground">
                      {q.toUpperCase()}
                    </Label>
                    <Input
                      id={q}
                      type="text"
                      placeholder="0"
                      value={kpiForm[q]}
                      onChange={(e) =>
                        setKpiForm({ ...kpiForm, [q]: formatNumberWithCommas(e.target.value) })
                      }
                    />
                  </div>
                ))}
              </div>
              {kpiForm.unit !== "level_of" && (
                <>
                  <div
                    className={`mt-2 text-xs font-medium flex justify-between items-center ${((parseFloat(stripCommas(kpiForm.target)) || 0) -
                      (["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0))) === 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    <span>
                      Sum of Quarters:{" "}
                      {formatNumberWithCommas(
                        ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)
                      )}
                    </span>
                    {((parseFloat(stripCommas(kpiForm.target)) || 0) -
                      ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)) !== 0 ? (
                      <span>
                        {((parseFloat(stripCommas(kpiForm.target)) || 0) -
                          ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)) > 0
                          ? `Remaining: ${formatNumberWithCommas((parseFloat(stripCommas(kpiForm.target)) || 0) - ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0))}`
                          : `Exceeded by: ${formatNumberWithCommas(Math.abs((parseFloat(stripCommas(kpiForm.target)) || 0) - ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)))}`}
                      </span>
                    ) : (
                      <span>✓ Matches Target</span>
                    )}
                  </div>
                  {((parseFloat(stripCommas(kpiForm.target)) || 0) -
                    ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)) !== 0 && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded text-center">
                        <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
                          ⚠️ Submission disabled: The sum of quarterly targets must exactly match the Annual Target.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setKpiModal({ open: false, data: null, objectiveId: null, objective: null })
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveKpi}
                disabled={
                  saving.kpi ||
                  !kpiForm.name ||
                  !kpiForm.unit ||
                  !kpiForm.frequency ||
                  (kpiForm.unit !== "level_of" &&
                    ((parseFloat(stripCommas(kpiForm.target)) || 0) -
                      ["q1", "q2", "q3", "q4"].reduce((s, q) => s + (parseFloat(stripCommas(kpiForm[q])) || 0), 0)) !== 0)
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving.kpi && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                {kpiModal.data ? "Update" : "Add"} KPI
              </Button>
            </div>
          </div>
        )}
      </CustomDialog>
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={executeDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Bulk Visibility Dialog */}
      <CustomDialog
        open={bulkVisibilityOpen}
        onOpenChange={(open) => { setBulkVisibilityOpen(open); if (!open) setBulkSelectedIds([]); }}
        title={<span className="text-green-700">Bulk Stakeholder Visibility</span>}
        description="Select objectives and set their stakeholder visibility in one request."
        className="!max-w-[700px]"
      >
        <div className="space-y-4 py-2">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Make selected objectives visible to stakeholders?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle ON to mark as visible, OFF to hide from stakeholders.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBulkVisibilityValue((v) => !v)}
              className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer flex-shrink-0 ${bulkVisibilityValue ? 'bg-success' : 'bg-muted-foreground/30'}`}
              aria-label="Toggle bulk visibility"
            >
              <span
                className={`absolute left-0.5 top-0.5 w-[20px] h-[20px] bg-card rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${bulkVisibilityValue ? 'translate-x-[20px]' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search objectives..."
              className="pl-9 bg-muted/50 border-transparent focus:bg-background"
              value={bulkSearchTerm}
              onChange={(e) => setBulkSearchTerm(e.target.value)}
            />
          </div>

          {/* Objectives List */}
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Select All Row */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/60 border-b border-border">
              <input
                id="bulk-select-all"
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-green-600 cursor-pointer"
                checked={allObjectivesForBulk.filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase())).length > 0 &&
                  allObjectivesForBulk.filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase())).every(o => bulkSelectedIds.includes(o.id))}
                onChange={(e) => {
                  const filtered = allObjectivesForBulk.filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase()));
                  if (e.target.checked) {
                    setBulkSelectedIds(prev => [...new Set([...prev, ...filtered.map(o => o.id)])]);
                  } else {
                    const filteredIds = filtered.map(o => o.id);
                    setBulkSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
                  }
                }}
              />
              <label htmlFor="bulk-select-all" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                Select All ({allObjectivesForBulk.filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase())).length})
              </label>
              {bulkSelectedIds.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                  {bulkSelectedIds.length} selected
                </span>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-border custom-scrollbar">
              {loadingAllObjectives ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                </div>
              ) : allObjectivesForBulk.filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase())).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No objectives found{bulkSearchTerm ? ` for "${bulkSearchTerm}"` : ""}.
                </div>
              ) : (
                allObjectivesForBulk
                  .filter(o => o.name?.toLowerCase().includes(bulkSearchTerm.toLowerCase()))
                  .map((obj) => (
                    <label
                      key={obj.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-0.5 rounded border-border accent-green-600 cursor-pointer flex-shrink-0"
                        checked={bulkSelectedIds.includes(obj.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelectedIds(prev => [...prev, obj.id]);
                          } else {
                            setBulkSelectedIds(prev => prev.filter(id => id !== obj.id));
                          }
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">{obj.name}</p>
                        {obj.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{obj.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${obj.visible_to_stakeholders
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-muted text-muted-foreground border-border'
                            }`}>
                            {obj.visible_to_stakeholders ? 'Visible to stakeholders' : 'Hidden from stakeholders'}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setBulkVisibilityOpen(false); setBulkSelectedIds([]); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdateVisibility}
              disabled={bulkUpdating || bulkSelectedIds.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {bulkUpdating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
              Apply to {bulkSelectedIds.length > 0 ? `${bulkSelectedIds.length} Objective${bulkSelectedIds.length > 1 ? 's' : ''}` : 'Objectives'}
            </Button>
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};

export default SrapManagement;