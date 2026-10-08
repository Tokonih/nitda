import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  User,
  Code,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../Slices/Utils/axiosInstance";
import { getErrorMessage } from "@/lib/utils";
import * as XLSX from 'xlsx'; // Install with: npm install xlsx

// --- HELPER FUNCTIONS ---

// Format ISO date to readable format like "Jan 27 – 2026, 2:00 AM"
const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  try {
    const date = new Date(isoDate);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options).replace(',', ' –');
  } catch {
    return isoDate;
  }
};

// Map HTTP status code to display status
const getStatusLabel = (statusCode) => {
  const code = parseInt(statusCode);
  if (code >= 200 && code < 300) return "Success";
  if (code >= 400 && code < 500) return "User error";
  if (code >= 500) return "System error";
  return "Success";
};

// Function to export data to CSV
const exportToCSV = (data, filename = 'audit-logs.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Prepare CSV data
  const csvData = data.map(log => ({
    'User Name': log.user?.name || 'Unknown',
    'User Email': log.user?.email || 'N/A',
    'User Role': log.user?.role || 'N/A',
    'Action': log.action || 'N/A',
    'Controller': log.controller || 'N/A',
    'Method': log.method || 'N/A',
    'Path': log.path || 'N/A',
    'Route Name': log.route_name || 'N/A',
    'Status Code': log.status_code || 'N/A',
    'Status': getStatusLabel(log.status_code),
    'IP Address': log.ip_address || 'N/A',
    'User Agent': log.user_agent || 'N/A',
    'Date & Time': formatDate(log.created_at),
    'Timestamp': log.created_at
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(csvData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

  // Generate and download file
  XLSX.writeFile(wb, filename);
};

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
  let styles = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  let dotStyles = "bg-emerald-500";

  if (status === "User error") {
    styles = "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    dotStyles = "bg-amber-500";
  } else if (status === "System error") {
    styles = "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    dotStyles = "bg-red-500";
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`}></span>
      {status}
    </span>
  );
};

// Custom Tooltip for Dark Mode support
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-lg rounded-lg p-3">
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {payload[0].value} events
        </p>
      </div>
    );
  }
  return null;
};

const DetailModal = ({ log, onClose }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Details</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-1">ID: {log.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center mb-8">
            <StatusBadge status={getStatusLabel(log.status_code)} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 text-center">{log.action}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 text-center">
              Action performed by <span className="font-semibold text-gray-900 dark:text-slate-200">{log.user?.name || "Unknown"}</span> on {formatDate(log.created_at)}
            </p>
          </div>

          {/* Actor Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-slate-200">
              <User className="w-4 h-4" />
              Actor Details
            </div>
            <div className="bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-1 space-y-0.5">
              <DetailRow label="NAME" value={log.user?.name || "N/A"} />
              <DetailRow label="EMAIL" value={log.user?.email || "N/A"} />
              <DetailRow label="ROLE" value={log.user?.role || "N/A"} />
              <DetailRow label="IP ADDRESS" value={log.ip_address || "N/A"} isMono />
            </div>
          </div>

          {/* Advanced Details Toggle */}
          <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-200">
                <Code className="w-4 h-4" />
                Advanced Details
              </div>
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E3D2B] focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${isAdvancedOpen ? 'bg-[#0E3D2B]' : 'bg-gray-200 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isAdvancedOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {isAdvancedOpen && (
              <div className="bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                <DetailRow label="METHOD" value={log.method || "GET"} />
                <DetailRow label="PATH" value={log.path || "N/A"} isMono />
                <DetailRow label="ROUTE NAME" value={log.route_name || "N/A"} isMono />
                <DetailRow label="CONTROLLER" value={log.controller || "N/A"} isMono className="break-all" />
                <DetailRow label="ACTION" value={log.action || "N/A"} />
                <DetailRow label="STATUS CODE" value={log.status_code || "N/A"} />
                <DetailRow label="MESSAGE" value={log?.response_body?.message || ""} />
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg m-1 border border-transparent dark:border-slate-800">
                  <span className="block text-[10px] uppercase font-semibold text-gray-400 dark:text-slate-500 mb-1">USER AGENT</span>
                  <div className="text-xs text-gray-600 dark:text-slate-300 font-mono break-words">
                    {log.user_agent || "N/A"}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#012521] hover:bg-[#023b33] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, isMono, className = "" }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-slate-900 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors">
    <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-slate-500 tracking-wider mb-1 sm:mb-0">{label}</span>
    <span className={`text-sm text-gray-900 dark:text-slate-200 font-medium ${isMono ? 'font-mono text-xs' : ''} ${className}`}>
      {value}
    </span>
  </div>
);

// Helper function to get date 30 days ago
const getLast30Days = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
};

// Helper function to format date for API (YYYY-MM-DD HH:MM:SS)
const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Helper function to format date for input (YYYY-MM-DD)
const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- MAIN PAGE ---
const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 15,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0
  });

  // Date range state - default to last 30 days
  const defaultDates = getLast30Days();
  const [dateFrom, setDateFrom] = useState(formatDateForInput(defaultDates.from));
  const [dateTo, setDateTo] = useState(formatDateForInput(defaultDates.to));

  // Fetch all audit logs for search and export
  const [allAuditData, setAllAuditData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch audit logs with pagination
  const fetchAuditLogs = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      // Format dates for API
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      const fromFormatted = formatDateForAPI(fromDate);
      const toFormatted = formatDateForAPI(toDate);

      let url = `/audit-logs?from=${encodeURIComponent(fromFormatted)}&to=${encodeURIComponent(toFormatted)}&per_page=15&page=${page}`;
      // let url = `/audit-logs?from=2026-01-01 00:00:00&to=2026-01-30 23:59:59&per_page=15&page=${page}`;

      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      // Add action filter if not "All Actions"
      if (selectedAction !== "All Actions") {
        url += `&action=${encodeURIComponent(selectedAction)}`;
      }

      const response = await axiosInstance.get(url);

      const data = response.data;
      const logs = data?.data || data || [];
      setAuditData(logs);
      setFilteredData(logs);

      // Set pagination
      const paginationData = data?.meta?.pagination || data?.meta;
      if (paginationData) {
        setPagination({
          total: paginationData.total || 0,
          perPage: paginationData.per_page || 15,
          currentPage: paginationData.current_page || page,
          lastPage: paginationData.last_page || 1,
          from: paginationData.from || 0,
          to: paginationData.to || 0
        });
      }
      setCurrentPage(page);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data for export (without pagination)
  const fetchAllAuditLogsForExport = async () => {
    setExportLoading(true);
    try {
      // Format dates for API
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      const fromFormatted = formatDateForAPI(fromDate);
      const toFormatted = formatDateForAPI(toDate);

      let url = `/audit-logs?from=${encodeURIComponent(fromFormatted)}&to=${encodeURIComponent(toFormatted)}&per_page=1000`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedAction !== "All Actions") {
        url += `&action=${encodeURIComponent(selectedAction)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;
      const allLogs = data?.data || data || [];
      setAllAuditData(allLogs);
      return allLogs;
    } catch (err) {
      console.error("Error fetching all audit logs:", err);
      return [];
    } finally {
      setExportLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If you want instant search on the client side:
    if (value.trim() === "") {
      setFilteredData(auditData);
    } else {
      const filtered = auditData.filter(log =>
        log.user?.name?.toLowerCase().includes(value.toLowerCase()) ||
        log.user?.email?.toLowerCase().includes(value.toLowerCase()) ||
        log.action?.toLowerCase().includes(value.toLowerCase()) ||
        log.ip_address?.includes(value) ||
        log.status_code?.toString().includes(value) ||
        log.controller?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }

    // Or if you want server-side search, call fetchAuditLogs:
    // fetchAuditLogs(1, value);
  };

  // Handle search submission (Enter key or search button)
  const handleSearchSubmit = () => {
    fetchAuditLogs(1, searchTerm);
  };

  // Handle export to CSV
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Fetch all data for export
      const allLogs = await fetchAllAuditLogsForExport();

      if (allLogs.length === 0) {
        alert('No data available to export');
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-logs-${timestamp}.csv`;

      // Export to CSV
      exportToCSV(allLogs, filename);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle action filter change
  const handleActionFilterChange = (action) => {
    setSelectedAction(action);
    // Reset to page 1 when filter changes
    fetchAuditLogs(1, searchTerm);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedAction("All Actions");
    const defaultDates = getLast30Days();
    setDateFrom(formatDateForInput(defaultDates.from));
    setDateTo(formatDateForInput(defaultDates.to));
    fetchAuditLogs(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchAuditLogs(currentPage - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.lastPage) {
      fetchAuditLogs(currentPage + 1, searchTerm);
    }
  };

  // Get unique actions for dropdown
  const getUniqueActions = () => {
    const actions = auditData.map(log => log.action).filter(Boolean);
    return ["All Actions", ...new Set(actions)];
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [dateFrom, dateTo]);

  // Optional: Add debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchAuditLogs(1, searchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="p-6 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
      </div>

      {/* <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 mb-8 relative transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">ACTIVITY VOLUME (6H)</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">350</span>
              <span className="text-sm text-gray-500 dark:text-slate-400">events recorded</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100 dark:border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Updates
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-slate-800" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickCount={5} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* --- STICKY SEARCH & CONTROLS BAR --- */}
      <div className="sticky top-0 z-30 bg-[#F9FAFB] dark:bg-slate-950 transition-colors duration-300 pb-4">
        {/* Date Range Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            <span>Date Range:</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              onClick={() => {
                const defaultDates = getLast30Days();
                setDateFrom(formatDateForInput(defaultDates.from));
                setDateTo(formatDateForInput(defaultDates.to));
              }}
              className="px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by activity, user, or IP..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all">
                {selectedAction} <ChevronDown className="w-4 h-4 text-gray-400" />
              </button> */}
              {/* <div className="absolute hidden group-hover:block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg mt-1 z-40 min-w-[200px]">
                {getUniqueActions().map((action) => (
                  <button
                    key={action}
                    onClick={() => handleActionFilterChange(action)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    {action}
                  </button>
                ))}
              </div> */}
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <RotateCcw className="w-4 h-4 text-gray-500 dark:text-slate-400 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              )}
              Export CSV
            </button>

            <button
              onClick={handleResetFilters}
              className="p-2.5 bg-[#012A25] text-white rounded-lg hover:bg-[#023b33] shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RotateCcw className="w-6 h-6 text-gray-400 animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-slate-400">Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm text-red-500">{error}</span>
                      <button
                        onClick={() => fetchAuditLogs(1, searchTerm)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <span className="text-sm text-gray-500 dark:text-slate-400">No audit logs found</span>
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          fetchAuditLogs(1);
                        }}
                        className="block mx-auto mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredData.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.user?.name || "Unknown"}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{log.user?.role || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 font-medium">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={getStatusLabel(log.status_code)} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400" />
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{pagination.from || 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{pagination.to || filteredData.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || loading}
              className="p-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Page {currentPage} of {pagination.lastPage || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= pagination.lastPage || loading}
              className="p-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
