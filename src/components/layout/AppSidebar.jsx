import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  HelpCircle,
  LogOut,
  Database,
  Settings,
  Layers,
  ChevronRight,
  FileText,
  BarChart3,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  ClipboardList,
  Activity,
  UserPlus,
  Target,
  GitCompare,
  Bell,
  MessageSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Slices/authSlice";
import { fetchPillars } from "../../Slices/pillarSlice";
import nitdaLogo from "@/assets/logos/nitda-horizontal-transparent.png";
import { useSidebar } from "@/components/ui/sidebar";
import { isStakeholder as checkIsStakeholder, isAdmin as checkIsAdmin } from "@/lib/roleLabels";

export const AppSidebar = ({ onItemClick }) => {
  const { user } = useSelector((state) => state.authSlice);
  const userRole = user?.role || "";
  const isDirector = userRole === "Director";
  const dispatch = useDispatch();
  const [showPillars, setShowPillars] = useState(false);
  const { list = [] } = useSelector((state) => state.pillars || {});
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  const isStakeholder = checkIsStakeholder(user);
  const isAdmin = checkIsAdmin(user) && !isStakeholder;

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchPillars());
    }
  }, [dispatch, list.length, isStakeholder]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = "/login";
  };

  const getLinkClasses = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md transition-all duration-200 ${
      isActive
        ? "bg-[#2dd4bf]/10 text-[#5eead4]"
        : "text-[#2dd4bf]/60 hover:text-[#5eead4] hover:bg-[#2dd4bf]/5"
    } ${isCollapsed ? "justify-center" : ""}`;

  const iconClasses = "h-[18px] w-[18px] opacity-70 group-hover:opacity-100";
  const activeIconClasses = "h-[18px] w-[18px]";

  const sectionLabel = (label) =>
    !isCollapsed ? (
      <div className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#2dd4bf]/40">
        {label}
      </div>
    ) : null;

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = () => (
    <div className="shrink-0 px-3 py-3 border-b border-[#2dd4bf]/5 flex items-center justify-between gap-2">
      {!isCollapsed && (
        <img src={nitdaLogo} alt="NITDA Logo" className="h-9 w-auto" />
      )}
      {/* Collapse toggle only */}
      <button
        onClick={onItemClick || toggleSidebar}
        className={`p-2 rounded-md text-[#2dd4bf]/60 hover:text-[#5eead4] hover:bg-[#2dd4bf]/5 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>
    </div>
  );

  // ── STAKEHOLDER SIDEBAR ────────────────────────────────────────────────────
  if (isStakeholder) {
    return (
      <aside
        className={`h-full flex flex-col bg-[#012521] border-r border-[#2dd4bf]/10 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <Header />

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-[#2dd4bf]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#2dd4bf]/40">
          {sectionLabel("ANALYTICS")}

          <NavLink
            to="/dashboard/stakeholder-dashboard"
            end
            className={getLinkClasses}
            title={isCollapsed ? "Dashboard" : ""}
            id="nav-dashboard-sh"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <LayoutGrid className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
              </>
            )}
          </NavLink>

          {sectionLabel("MANAGEMENT")}

          <NavLink
            to="/dashboard/srap"
            className={getLinkClasses}
            title={isCollapsed ? "Activity Management" : ""}
            id="nav-activity-mgmt-sh"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <FileText className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">Activity Management</span>}
              </>
            )}
          </NavLink>

          <NavLink
            to="/dashboard/activity-data"
            className={getLinkClasses}
            title={isCollapsed ? "Activity Data" : ""}
            id="nav-kpi-data-sh"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <Database className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">Activity Data</span>}
              </>
            )}
          </NavLink>

          {sectionLabel("SYSTEM")}

          {/* <button
            className={getLinkClasses({ isActive: false })}
            title={isCollapsed ? "Support" : ""}
          >
            <HelpCircle className={iconClasses} />
            {!isCollapsed && <span className="text-sm font-medium">Support</span>}
          </button> */}

          <button
            onClick={handleLogout}
            className={`${getLinkClasses({ isActive: false })} hover:text-red-400`}
            title={isCollapsed ? "Logout" : ""}
            id="nav-logout-sh"
          >
            <LogOut className={iconClasses} />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>

          {!isCollapsed && (
            <div className="px-3 pt-6 pb-2 text-[10px] text-[#2dd4bf]/40">
              © SRAP 2.0 2024–2027
            </div>
          )}
        </nav>
      </aside>
    );
  }

  // ── ADMIN / STAFF SIDEBAR ──────────────────────────────────────────────────
  return (
    <aside
      className={`h-full flex flex-col bg-[#012521] border-r border-[#2dd4bf]/10 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <Header />

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-[#2dd4bf]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#2dd4bf]/40">
        {sectionLabel("ANALYTICS")}

        <NavLink
          to="/dashboard"
          end
          className={getLinkClasses}
          title={isCollapsed ? "Dashboard" : ""}
          id="nav-dashboard"
          onClick={onItemClick}
        >
          {({ isActive }) => (
            <>
              <LayoutGrid className={isActive ? activeIconClasses : iconClasses} />
              {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
            </>
          )}
        </NavLink>

        <NavLink
          to="/dashboard/pillar-comparison"
          className={getLinkClasses}
          title={isCollapsed ? "Pillar Comparison" : ""}
          id="nav-pillar-comparison"
          onClick={onItemClick}
        >
          {({ isActive }) => (
            <>
              <GitCompare className={isActive ? activeIconClasses : iconClasses} />
              {!isCollapsed && <span className="text-sm font-medium">Pillar Comparison</span>}
            </>
          )}
        </NavLink>

        {/* Strategic Pillars dropdown */}
        {!isCollapsed ? (
          <div>
            <button
              onClick={() => setShowPillars(!showPillars)}
              className="w-full group flex items-center justify-between gap-3 px-3 py-2.5 md:py-2 rounded-md text-[#2dd4bf]/60 hover:text-[#5eead4] hover:bg-[#2dd4bf]/5 transition-all duration-200"
              id="nav-pillars"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
                <span className="text-sm font-medium">Strategic Pillars</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 opacity-50 transition-transform ${showPillars ? "rotate-90" : ""}`}
              />
            </button>

            {showPillars && (
              <div className="mt-1 ml-4 border-l border-[#2dd4bf]/10 pl-2 space-y-1">
                {list.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-[#2dd4bf]/40">No pillars</div>
                ) : (
                  list.map((pillar) => (
                    <NavLink
                      key={pillar.id}
                      to={`/dashboard/pillar/${pillar.id}`}
                      className={({ isActive }) =>
                        `block px-3 py-2.5 md:py-2 rounded-md text-xs transition-colors ${
                          isActive
                            ? "text-[#5eead4] font-medium bg-[#2dd4bf]/5"
                            : "text-[#2dd4bf]/50 hover:text-[#5eead4]"
                        }`
                      }
                      onClick={onItemClick}
                    >
                      <span className="block leading-tight whitespace-normal">{pillar.name}</span>
                    </NavLink>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/dashboard/pillar" className={getLinkClasses} title="Strategic Pillars">
            {({ isActive }) => (
              <Layers className={isActive ? activeIconClasses : iconClasses} />
            )}
          </NavLink>
        )}

        {sectionLabel("PLANNING MEASURES")}

        {/* {(isAdmin || isDirector) && (
          <NavLink
            to="/dashboard/kpi-definition-review"
            className={getLinkClasses}
            title={isCollapsed ? "KPI Definitions" : ""}
            id="nav-kpi-approvals"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <CheckSquare className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">KPI Definitions</span>}
              </>
            )}
          </NavLink>
        )} */}

        <NavLink
          to="/dashboard/kpi-data"
          className={getLinkClasses}
          title={isCollapsed ? "KPI Data" : ""}
          id="nav-kpi-data"
          onClick={onItemClick}
        >
          {({ isActive }) => (
            <>
              <Database className={isActive ? activeIconClasses : iconClasses} />
              {!isCollapsed && <span className="text-sm font-medium">KPI Data</span>}
            </>
          )}
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/dashboard/dg-kpi-scorecard"
            className={getLinkClasses}
            title={isCollapsed ? "Organizational Scorecard" : ""}
            id="nav-org-scorecard"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <BarChart3 className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">Organizational Scorecard</span>}
              </>
            )}
          </NavLink>
        )}

        <NavLink
          to="/dashboard/srap"
          className={getLinkClasses}
          title={isCollapsed ? "SRAP Management" : ""}
          id="nav-srap-mgmt"
          onClick={onItemClick}
        >
          {({ isActive }) => (
            <>
              <Briefcase className={isActive ? activeIconClasses : iconClasses} />
              {!isCollapsed && <span className="text-sm font-medium">SRAP 2.0 Management</span>}
            </>
          )}
        </NavLink>

        {/* OTHERS — admin only */}
        {isAdmin && (
          <>
            {sectionLabel("OTHERS")}

            <NavLink
              to="/dashboard/access-request-review"
              className={getLinkClasses}
              title={isCollapsed ? "Access Requests" : ""}
              id="nav-access-requests"
              onClick={onItemClick}
            >
              {({ isActive }) => (
                <>
                  <UserPlus className={isActive ? activeIconClasses : iconClasses} />
                  {!isCollapsed && <span className="text-sm font-medium">Access Requests</span>}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/stakeholder-activity-review"
              className={getLinkClasses}
              title={isCollapsed ? "Activities Management" : ""}
              id="nav-activities-mgmt"
              onClick={onItemClick}
            >
              {({ isActive }) => (
                <>
                  <Activity className={isActive ? activeIconClasses : iconClasses} />
                  {!isCollapsed && <span className="text-sm font-medium">Activities Management</span>}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/audit-logs"
              className={getLinkClasses}
              title={isCollapsed ? "Audit Logs" : ""}
              id="nav-audit-logs"
              onClick={onItemClick}
            >
              {({ isActive }) => (
                <>
                  <ClipboardList className={isActive ? activeIconClasses : iconClasses} />
                  {!isCollapsed && <span className="text-sm font-medium">Audit Logs</span>}
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/feedback"
              className={getLinkClasses}
              title={isCollapsed ? "Feedback Inbox" : ""}
              id="nav-feedback"
              onClick={onItemClick}
            >
              {({ isActive }) => (
                <>
                  <MessageSquare className={isActive ? activeIconClasses : iconClasses} />
                  {!isCollapsed && <span className="text-sm font-medium">Feedback Inbox</span>}
                </>
              )}
            </NavLink>
          </>
        )}

        {sectionLabel("SYSTEM")}

        {isAdmin && (
          <NavLink
            to="/dashboard/settings"
            className={getLinkClasses}
            title={isCollapsed ? "Settings" : ""}
            id="nav-settings"
            onClick={onItemClick}
          >
            {({ isActive }) => (
              <>
                <Settings className={isActive ? activeIconClasses : iconClasses} />
                {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
              </>
            )}
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className={`${getLinkClasses({ isActive: false })} hover:text-red-400`}
          title={isCollapsed ? "Logout" : ""}
          id="nav-logout"
        >
          <LogOut className={iconClasses} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="px-3 pt-6 pb-4 text-[10px] text-[#2dd4bf]/40">
            © SRAP 2.0 2024–2027
          </div>
        )}
      </nav>
    </aside>
  );
};
