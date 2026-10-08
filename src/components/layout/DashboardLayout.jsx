import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  CheckCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useTour } from "@/context/TourContext";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../Slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Slices/Utils/axiosInstance";

export const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { startTour } = useTour();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);

  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = "/login";
  };

  // Map notification type → dashboard route
  const getNotificationRoute = (n) => {
    const type = n?.data?.type || n?.type || "";
    switch (type) {
      // KPI value approved/disapproved for a specific month → go to KPI data entry
      case "kpi_value_month_approved":
      case "kpi_value_month_disapproved":
        return "/dashboard/create-kpi";

      // KPI definition approved/disapproved → go to KPI data page
      case "kpi_approved":
      case "kpi_disapproved":
        return "/dashboard/kpi-data";

      // Dashboard access request submitted → go to access request review
      case "dashboard_access_request_submitted_for_approval":
        return "/dashboard/access-request-review";

      // Stakeholder activity approved/disapproved → go to activity data
      case "stakeholder_activity_approved":
      case "stakeholder_activity_disapproved":
        return "/dashboard/activity-data";

      default:
        return null;
    }
  };

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifPagination, setNotifPagination] = useState(null);
  const notifRef = useRef(null);

  // User menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const fetchNotifications = async (page = 1) => {
    setNotifLoading(true);
    try {
      const res = await axiosInstance.get(`/notifications?unread=1&per_page=15&page=${page}`);
      setNotifications(res.data?.data || []);
      setNotifPagination(res.data?.meta?.pagination || null);
      setNotifPage(page);
    } catch (e) {
      // silently fail
    } finally {
      setNotifLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleNotif = () => {
    if (!notifOpen) fetchNotifications(1);
    setNotifOpen(prev => !prev);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-border px-3 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          {/* <img src={nitdaLogo} alt="NITDA Logo" className="h-8 w-auto" /> */}
          <h1 className="font-semibold text-lg text-primary">
            NITDA Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className="flex items-center bg-muted rounded-full p-1 border border-border"
            id="theme-toggle"
          >
            <button
              className={`p-1.5 rounded-full transition-colors ${theme === "light" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              className={`p-1.5 rounded-full transition-colors ${theme === "dark" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile notification bell — same logic as desktop */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotif}
              className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-[380px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[70vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => { setNotifOpen(false); navigate("/dashboard/notifications"); }}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
                    >
                      View all
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-10 text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.read_at) markAsRead(n.id);
                          const route = getNotificationRoute(n);
                          if (route) {
                            setNotifOpen(false);
                            navigate(route);
                          }
                        }}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read_at ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? "bg-green-500" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-snug">{n.data?.message || "New notification"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {notifPagination && notifPagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                    <button
                      disabled={notifPage <= 1 || notifLoading}
                      onClick={() => fetchNotifications(notifPage - 1)}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 font-medium"
                    >
                      ← Prev
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      {notifPage} / {notifPagination.last_page}
                    </span>
                    <button
                      disabled={notifPage >= notifPagination.last_page || notifLoading}
                      onClick={() => fetchNotifications(notifPage + 1)}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 font-medium"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile user avatar dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(p => !p)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-[#155535] text-white text-xs font-bold"
            >
              {user?.name
                ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
                : <User className="h-4 w-4" />}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5" title={user?.department?.name}>
                    {user?.department?.name?.length > 20 ? `${user?.department?.name.slice(0, 20)}…` : user?.department?.name}
                  </p>
                  {user?.role && (
                    <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide bg-[#155535]/10 text-[#155535] px-2 py-0.5 rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {/* <div className="hidden lg:block"  style={{ border: "2px solid red", width:"200px" }}>
          <AppSidebar />
        </div> */}
        <div
          className={`hidden lg:block fixed top-0 left-0 h-screen z-0 ${collapsed ? "w-16" : "w-64"
            } transition-all duration-300`}
        >
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-[#012521]">
              <AppSidebar onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <div
          className={`flex-1 min-h-screen flex flex-col min-w-0 w-full
      ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}
        >
          {/* Desktop Header */}

          {/* <header className="hidden lg:flex border-b border-border px-6 py-4 items-center justify-between  nitda-card">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                Performance Management System Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                className="flex items-center space-x-2 nitda-button-primary border rounded p-1 "
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header> */}
          <header className="hidden lg:flex border-b border-border px-6 py-4 items-center justify-between bg-card">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-primary tracking-tight">
                Performance Management System Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => startTour(true)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                title="Restart Tour"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              
              <div
                className="flex items-center bg-muted rounded-full p-1 border border-border"
                id="theme-toggle"
              >
                <button
                  className={`p-1.5 rounded-full transition-colors ${theme === "light" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded-full transition-colors ${theme === "dark" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4" />
                </button>
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-card">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col max-h-[520px]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => { setNotifOpen(false); navigate("/dashboard/notifications"); }}
                          className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
                        >
                          View all
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                      {notifLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-10 text-sm text-muted-foreground">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.read_at) markAsRead(n.id);
                              const route = getNotificationRoute(n);
                              if (route) {
                                setNotifOpen(false);
                                navigate(route);
                              }
                            }}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read_at ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}
                          >
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? "bg-green-500" : "bg-transparent"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground leading-snug">{n.data?.message || "New notification"}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {notifPagination && notifPagination.last_page > 1 && (
                      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                        <button
                          disabled={notifPage <= 1 || notifLoading}
                          onClick={() => fetchNotifications(notifPage - 1)}
                          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 font-medium"
                        >
                          ← Prev
                        </button>
                        <span className="text-[10px] text-muted-foreground">
                          {notifPage} / {notifPagination.last_page}
                        </span>
                        <button
                          disabled={notifPage >= notifPagination.last_page || notifLoading}
                          onClick={() => fetchNotifications(notifPage + 1)}
                          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 font-medium"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User avatar dropdown */}
              <div className="relative pl-2 border-l border-border" ref={userMenuRef} id="user-profile">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-[#155535] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.name
                      ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : <User className="h-4 w-4" />}
                  </div>
                  <div className="hidden md:block text-left">
                    {/* <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p> */}
                    {/* <p className="text-xs text-muted-foreground mt-0.5" title={user?.department?.name}>
                      {user?.department?.name?.length > 20 ? `${user.department.name.slice(0, 20)}…` : user?.department?.name}
                    </p> */}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5" title={user?.department?.name}>
                        {user?.department?.name?.length > 20 ? `${user.department.name.slice(0, 20)}…` : user?.department?.name}
                      </p>
                      {user?.role && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide bg-[#155535]/10 text-[#155535] px-2 py-0.5 rounded-full">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 w-full p-2 sm:p-4 lg:p-6 bg-muted/30">
            <Outlet />
          </main>

          <footer className="border-t border-border py-4 px-6 bg-card flex justify-center lg:justify-end">
            <a
              href="/srap-landing"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <span>SRAP 2.0 Overview</span>
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};
