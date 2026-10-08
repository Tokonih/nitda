# Permission Implementation Plan

## Overview
This document outlines the systematic implementation of permission-based access control across the NITDA Dashboard application.

## Permission Mapping

### 1. Audit Logs
- **Route**: `/audit-logs`
- **Permission**: `audit-logs.view`
- **Components**: AuditLogs page

### 2. Authentication
- **Permissions**: 
  - `auth.login` - Login page (public)
  - `auth.logout` - Logout action
  - `auth.register` - Registration page
- **Components**: Login, Register pages

### 3. Dashboard Access Requests
- **Route**: `/access-requests`
- **Permissions**:
  - `dashboard-access-requests.view` - View requests
  - `dashboard-access-requests.approve` - Approve button
  - `dashboard-access-requests.reject` - Reject button
- **Components**: AccessRequestReview page

### 4. Data Inputs (KPI Data Entry)
- **Route**: `/kpi-data-entry`, `/stakeholder-activity-data-entry`
- **Permissions**:
  - `data-inputs.view` - View data entry pages
  - `data-inputs.create` - Create new entries
  - `data-inputs.update` - Update existing entries
  - `data-inputs.delete` - Delete entries
  - `data-inputs.bulk-update` - Bulk operations
- **Components**: KpiCreation, StakeholderActivityDataEntry

### 5. Departments
- **Route**: `/departments`, `/department-creation`, `/edit-department`
- **Permissions**:
  - `departments.view` - View departments list
  - `departments.create` - Create department button/page
  - `departments.update` - Edit department
  - `departments.delete` - Delete department button
- **Components**: Department, DepartmentCreation, EditDepartment

### 6. Infrastructure Projects
- **Permissions**:
  - `infra-projects.view`
  - `infra-projects.create`
  - `infra-projects.update`
  - `infra-projects.delete`

### 7. KPIs
- **Route**: `/kpis`, `/kpi-creation`, `/kpi-review`
- **Permissions**:
  - `kpis.view` - View KPIs list
  - `kpis.create` - Create KPI button/page
  - `kpis.update` - Edit KPI
  - `kpis.delete` - Delete KPI button
  - `kpis.approve` - Approve button in review
  - `kpis.disapprove` - Disapprove button in review
- **Components**: KpiCreation, ApproveKpi, KPIVisualization

### 8. KPI Values
- **Permissions**:
  - `kpi-values.view` - View KPI values
  - `kpi-values.create` - Submit KPI values
  - `kpi-values.update` - Update KPI values
  - `kpi-values.delete` - Delete KPI values
  - `kpi-values.verify` - Verify/approve KPI values
- **Components**: KpiCreation (data entry section)

### 9. Pillars
- **Route**: `/pillars`, `/pillar-creation`, `/edit-pillar`
- **Permissions**:
  - `pillars.view` - View pillars
  - `pillars.create` - Create pillar
  - `pillars.update` - Edit pillar
  - `pillars.delete` - Delete pillar
- **Components**: PillarCreation, EditPillarForm

### 10. Roles & Permissions
- **Route**: `/roles`, `/role-creation`, `/edit-role`
- **Permissions**:
  - `roles.view` - View roles
  - `roles.create` - Create role
  - `roles.update` - Edit role
  - `roles.delete` - Delete role
  - `roles.assign-permissions` - Assign permissions to roles
  - `permissions.view` - View permissions list
- **Components**: Role management pages

### 11. Security Initiatives
- **Permissions**:
  - `security-initiatives.view`
  - `security-initiatives.create`
  - `security-initiatives.update`
  - `security-initiatives.delete`

### 12. SRAP Initiatives
- **Route**: `/srap`, `/srap-initiative-creation`
- **Permissions**:
  - `srap-initiatives.view` - View SRAP initiatives
  - `srap-initiatives.create` - Create initiative
  - `srap-initiatives.update` - Edit initiative
  - `srap-initiatives.delete` - Delete initiative
- **Components**: Srap page

### 13. SRAP Objectives
- **Route**: `/objectives`, `/objective-review`
- **Permissions**:
  - `srap-objectives.view` - View objectives
  - `srap-objectives.create` - Create objective
  - `srap-objectives.update` - Edit objective
  - `srap-objectives.delete` - Delete objective
  - `srap-objectives.approve` - Approve objective
  - `srap-objectives.disapprove` - Disapprove objective
  - `srap-objectives.lock` - Lock objective
  - `srap-objectives.unlock` - Unlock objective
- **Components**: ObjectiveManagement, ObjectiveReview

### 14. SRAP Records
- **Permissions**:
  - `srap-records.view`
  - `srap-records.create`
  - `srap-records.update`
  - `srap-records.delete`

### 15. Stakeholder Activity Values
- **Route**: `/stakeholder-activity-review`
- **Permission**: `stakeholder-activity-values.verify`
- **Components**: ApproveStakeholderActivity

### 16. Startups
- **Permissions**:
  - `startups.view`
  - `startups.create`
  - `startups.update`
  - `startups.delete`

### 17. Training Sessions
- **Permissions**:
  - `training-sessions.view`
  - `training-sessions.create`
  - `training-sessions.update`
  - `training-sessions.delete`

### 18. Users
- **Route**: `/users`, `/user-creation`, `/edit-user`
- **Permissions**:
  - `users.view` - View users list
  - `users.create` - Create user
  - `users.update` - Edit user
  - `users.delete` - Delete user
- **Components**: User management pages

## Implementation Priority

### Phase 1: Critical Routes (High Priority)
1. Sidebar navigation items
2. Main dashboard sections
3. KPI management (view, create, approve)
4. User management
5. Role management

### Phase 2: Data Entry & Review (Medium Priority)
1. KPI data entry
2. Stakeholder activity data entry
3. KPI review/approval
4. Stakeholder activity review

### Phase 3: Configuration & Admin (Medium Priority)
1. Department management
2. Pillar management
3. SRAP initiatives
4. SRAP objectives

### Phase 4: Additional Features (Lower Priority)
1. Audit logs
2. Access requests
3. Training sessions
4. Startups
5. Infrastructure projects

## Implementation Approach

### 1. Sidebar Navigation
- Wrap each navigation item with permission check
- Hide items user doesn't have permission to view

### 2. Page-Level Protection
- Add permission check at page component level
- Show "Access Denied" message if no permission
- Redirect to dashboard if no access

### 3. Button-Level Protection
- Hide/disable action buttons based on permissions
- Create, Edit, Delete, Approve, Reject buttons

### 4. API Call Protection
- Check permission before making API calls
- Show error message if no permission

### 5. Route Protection
- Add permission checks to route definitions
- Redirect unauthorized users

## Next Steps

1. Create PermissionGuard component for route protection
2. Update AppSidebar with permission checks
3. Update individual pages with permission checks
4. Add permission checks to action buttons
5. Test with different role configurations
