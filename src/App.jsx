import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ThemeProvider } from "@/hooks/useTheme";
import { useSelector } from "react-redux";
import AuthInitializer from "./Slices/Utils/AuthInitializer";
import { useState, createContext, useContext, lazy, Suspense } from "react";
import { TourProvider } from "@/context/TourContext";
import Loading from "./components/ui/Loading";

// Pages (Lazy Loaded)
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

// Work Package A Pages
const ProjectInitiation = lazy(() => import("./pages/work-package-a/ProjectInitiation"));
const DataSourceValidation = lazy(() => import("./pages/work-package-a/DataSourceValidation"));
const ComplianceScalability = lazy(() => import("./pages/work-package-a/ComplianceScalability"));

// Work Package B Pages
const DataModelArchitecture = lazy(() => import("./pages/work-package-b/DataModelArchitecture"));
const WireframesPrototypes = lazy(() => import("./pages/work-package-b/WireframesPrototypes"));
const DashboardUIUX = lazy(() => import("./pages/work-package-b/DashboardUIUX"));
const DataEntry = lazy(() => import("./pages/work-package-b/DataEntry"));
const ProjectsList = lazy(() => import("./pages/work-package-b/ProjectsList"));
const ProjectDetail = lazy(() => import("./pages/work-package-b/ProjectDetail"));

const KPIDataSourceValidation = lazy(() => import("./pages/work-package-a/KPIVisualization"));
const UserManagement = lazy(() => import("./pages/Users"));
const UserCreation = lazy(() => import("./pages/UserCreation"));
const PillarManagement = lazy(() => import("./pages/Pillars"));
const PillarCreation = lazy(() => import("./pages/PillarCreation"));
const SrapManagement = lazy(() => import("./pages/Srap"));
const SrapCreation = lazy(() => import("./pages/SrapCreation"));
const DepartmentManagement = lazy(() => import("./pages/Department"));

const RolesManagement = lazy(() => import("./pages/Roles"));
const RoleCreation = lazy(() => import("./pages/RoleCreation"));
const DepartmentCreation = lazy(() => import("./pages/DepartmentCreation"));
const EditDepartmentForm = lazy(() => import("./pages/EditDepartment"));
const EditRoleForm = lazy(() => import("./pages/EditRole"));
const EditPillarForm = lazy(() => import("./pages/EditPillarForm"));
const SrapInitiativesManagement = lazy(() => import("./pages/SrapInitiatives"));
const SrapInitiativeCreation = lazy(() => import("./pages/SrapInitiativeCreation"));
const EditSrapInitiativeForm = lazy(() => import("./pages/EditSrapInitiativeForm"));
const EditSrap = lazy(() => import("./pages/EditSrap"));
const Pillar1 = lazy(() => import("./pages/Pillar1"));
const ObjectiveManagement = lazy(() => import("./pages/ObjectiveManagement"));
const SrapObjectiveCreation = lazy(() => import("./pages/SrapObjectiveCreation"));
const SrapKpiCreation = lazy(() => import("./pages/KpiCreation"));
const SrapObjectiveEdit = lazy(() => import("./pages/SrapObjectiveEdit"));
const KpiScorecard = lazy(() => import("./pages/kpi-scorecard"));
const DGKpiScorecard = lazy(() => import("./pages/DGscoreCard"));
const Settings = lazy(() => import("./pages/Settings"));
const SrapLandingPage = lazy(() => import("./pages/SrapLandingPage"));
const UserEdit = lazy(() => import("./pages/EditUser"));
const StakeHoldersDashboard = lazy(() => import("./pages/StakeHoldersDashboard"));
const KpiReview = lazy(() => import("./pages/ApproveKpi"));
const KpiDefinitionReview = lazy(() => import("./pages/KpiDefinitionReview"));
const Analytics = lazy(() => import("./pages/Analytics"));
const PublicDashboard = lazy(() => import("./pages/PublicDashboard"));
const StakeholderActivityDataEntry = lazy(() => import("./pages/StakeholderActivityDataEntry"));
const StakeholderActivityReview = lazy(() => import("./pages/ApproveStakeholderActivity"));
const AccessRequestReview = lazy(() => import("./pages/AccessRequestReview"));
const KpiOverview = lazy(() => import("./pages/KpiOverview"));
const PillarComparison = lazy(() => import("./pages/PillarComparison"));
const ChangePasswordFirstLogin = lazy(() => import("./pages/auth/ChangePasswordFirstLogin"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FeedbackManagement = lazy(() => import("./pages/FeedbackManagement"));
import { isStakeholder } from "@/lib/roleLabels";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.authSlice);
  const location = useLocation();

  if (loading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const DefaultRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.authSlice);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Stakeholder → go to their dashboard
  if (isStakeholder(user)) {
    return <Navigate to="/dashboard/stakeholder-dashboard" replace />;
  }

  // Staff → normal dashboard
  return <Navigate to="/dashboard" replace />;
};
const StakeholderRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.authSlice);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isStakeholder(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="nitda-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>

        <AuthInitializer>
          <Sonner position="top-right" richColors closeButton />
          <BrowserRouter>
            <TourProvider>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Default route — always shows the public landing page */}
                  <Route path="/" element={<Navigate to="/srap-landing" replace />} />

                  {/* Public routes */}
                  <Route path="/srap-landing" element={<SrapLandingPage />} />
                  <Route path="/public-dashboard" element={<PublicDashboard />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/change-password" element={<ChangePasswordFirstLogin />} />

                  {/* Protected dashboard routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <SidebarProvider>
                          <DashboardLayout>
                            <Outlet />
                          </DashboardLayout>
                        </SidebarProvider>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Index />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="feedback" element={<FeedbackManagement />} />

                    {/* Work Package A */}
                    <Route
                      path="work-package-a/project-initiation"
                      element={<ProjectInitiation />}
                    />
                    <Route path="create-kpi" element={<SrapKpiCreation />} />
                    <Route path="create-activity" element={<SrapKpiCreation />} />
                    <Route path="kpi-data" element={<KPIDataSourceValidation />} />
                    <Route path="activity-data" element={<KPIDataSourceValidation />} />
                    <Route path="kpi-review" element={<KpiReview />} />
                    <Route path="kpi-definition-review" element={<KpiDefinitionReview />} />
                    <Route path="stakeholder-activity-review" element={<StakeholderActivityReview />} />
                    <Route path="access-request-review" element={<AccessRequestReview />} />
                    <Route path="kpi-overview" element={<KpiOverview />} />
                    <Route path="pillar-comparison" element={<PillarComparison />} />
                    <Route path="notifications" element={<Notifications />} />

                    <Route path="kpi-scorecard" element={<KpiScorecard />} />
                    <Route path="dg-kpi-scorecard" element={<DGKpiScorecard />} />
                    {/* <Route path="create-kpi" element={<KpiCreation />} /> */}
                    <Route path="pillar/:id" element={<Pillar1 />} />
                    <Route
                      path="stakeholder-dashboard"
                      element={<StakeHoldersDashboard />}
                    />
                    <Route
                      path="stakeholder-activities-data"
                      element={<StakeholderActivityDataEntry />}
                    />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="user/edit/:id" element={<UserEdit />} />
                    <Route path="create-user" element={<UserCreation />} />
                    <Route path="pillar" element={<PillarManagement />} />
                    <Route path="create-pillar" element={<PillarCreation />} />
                    <Route path="pillar/:id/edit" element={<EditPillarForm />} />
                    <Route path="srap" element={<SrapManagement />} />
                    <Route path="create-srap" element={<SrapCreation />} />
                    <Route path="srap/:id/edit" element={<EditSrap />} />
                    <Route path="settings" element={<Settings />} />

                    <Route
                      path="srap-initiatives"
                      element={<SrapInitiativesManagement />}
                    />
                    <Route
                      path="create-srap-initiative"
                      element={<SrapInitiativeCreation />}
                    />
                    <Route
                      path="srap-initiative/:id/edit"
                      element={<EditSrapInitiativeForm />}
                    />
                    <Route path="departments" element={<DepartmentManagement />} />
                    <Route
                      path="create-department"
                      element={<DepartmentCreation />}
                    />
                    <Route path="department/:id" element={<EditDepartmentForm />} />
                    <Route path="roles" element={<RolesManagement />} />
                    <Route path="create-role" element={<RoleCreation />} />
                    <Route path="role/:id" element={<EditRoleForm />} />
                    <Route path="objectives" element={<ObjectiveManagement />} />
                    <Route
                      path="create-objective"
                      element={<SrapObjectiveCreation />}
                    />
                    <Route
                      path="objective/:objectiveId/edit"
                      element={<SrapObjectiveEdit />}
                    />
                    {/* KpiCreation */}
                    <Route
                      path="work-package-a/data-source-validation"
                      element={<DataSourceValidation />}
                    />
                    <Route
                      path="work-package-a/compliance-scalability"
                      element={<ComplianceScalability />}
                    />

                    {/* Work Package B */}
                    <Route
                      path="work-package-b/data-model-architecture"
                      element={<DataModelArchitecture />}
                    />
                    <Route
                      path="work-package-b/wireframes-prototypes"
                      element={<WireframesPrototypes />}
                    />
                    <Route
                      path="work-package-b/dashboard-ui-ux"
                      element={<DashboardUIUX />}
                    />
                    <Route
                      path="work-package-b/data-entry"
                      element={<DataEntry />}
                    />
                    <Route
                      path="work-package-b/projects"
                      element={<ProjectsList />}
                    />
                    <Route
                      path="work-package-b/projects/:id"
                      element={<ProjectDetail />}
                    />
                  </Route>
                  {/* STAKEHOLDER DASHBOARD - Separate from staff layout */}
                  <Route
                    path="/dashboard/stakeholder-dashboard"
                    element={
                      <StakeholderRoute>
                        <StakeHoldersDashboard />
                      </StakeholderRoute>
                    }
                  />
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TourProvider>
          </BrowserRouter>
        </AuthInitializer>
        {/* </AuthProvider> */}
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
