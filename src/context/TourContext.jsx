import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";
import "@/components/OnboardingTour.css"; // Reuse existing styles
import { useSelector } from 'react-redux';
import { isStakeholder as checkIsStakeholder, isAdmin as checkIsAdmin, getKpiLabel, getKpiLabelPlural } from "@/lib/roleLabels";

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const location = useLocation();
    const driverObj = useRef(null);
    const { user } = useSelector((state) => state.authSlice);

    const getStepsForRoute = (pathname, user) => {
        const isStakeholder = checkIsStakeholder(user);
        const isAdmin = checkIsAdmin(user);
        const isDirector = user?.role === "Director";
        const kpiLabel = getKpiLabel(user);
        const kpiLabelPlural = getKpiLabelPlural(user);

        const helpHintStep = [
            {
                element: "button[title='Restart Tour']",
                popover: {
                    title: "Need Help Later?",
                    description: "You can restart this guide at any time by clicking this help icon in the header.",
                    side: "left", align: "start"
                }
            }
        ];

        // Define steps for different routes
        // We can match exact paths or startsWith

        // Defined below in consolidated block

        // --- KPI ENTRY & MONITORING (/dashboard/create-kpi) ---
        if (pathname.includes('/create-kpi')) {
            const steps = [
                {
                    element: "#kpi-creation-header",
                    popover: {
                        title: "KPI Entry & Monitoring",
                        description: `Welcome! This is your primary workspace for submitting monthly data for your department's ${kpiLabelPlural.toLowerCase()}.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#card-select-kpi",
                    popover: {
                        title: `Step 1: Select ${kpiLabel}`,
                        description: `Choose the specific ${kpiLabel.toLowerCase()} you want to report on from the dropdown list.`,
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#card-period-selection",
                    popover: {
                        title: "Step 2: Choose Period",
                        description: "Select the Fiscal Year, Quarter, and Month you are reporting for. Note: You can only select currently open periods.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#card-kpi-entry",
                    popover: {
                        title: "Step 3: Enter Data",
                        description: "Input your actual achieved value here. You must also provide remarks and upload supporting evidence (PDF, Image, or Excel).",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#card-quarter-overview",
                    popover: {
                        title: "Quarter Status",
                        description: "Quickly check how many of your submissions for each quarter are Approved vs. Pending.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#card-quarterly-aggregation",
                    popover: {
                        title: "Progress Tracker",
                        description: "Visualize your cumulative progress against the quarterly target as you submit monthly data.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#card-submissions-history",
                    popover: {
                        title: "Submission History",
                        description: "A complete log of your submissions. You can filter by year/quarter and click 'View' to see details, evidence, and reviewer feedback.",
                        side: "top", align: "start"
                    }
                }
            ];
            return steps.concat(helpHintStep);
        }

        // --- KPI REVIEW & APPROVAL (/dashboard/kpi-review) ---
        if (pathname.includes('/kpi-review')) {
            const steps = [
                {
                    element: "#approval-page-header",
                    popover: {
                        title: "Review Dashboard",
                        description: "As a reviewer, use this dashboard to validate incoming data submissions from your unit.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#approval-filters",
                    popover: {
                        title: "Filter Controls",
                        description: "Use these dropdowns to narrow down the queue by Year, Quarter, or specific Department.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#approval-queue-sidebar",
                    popover: {
                        title: "Approval Queue",
                        description: "This list shows all pending items requiring your attention. Click any card to load the submission details.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#approval-main-instruction",
                    popover: {
                        title: "Get Started",
                        description: "Select an item from the sidebar to begin reviewing.",
                        side: "top", align: "center"
                    }
                }
            ];

            // If an item is selected, add details steps
            if (document.querySelector("#approval-target-card")) {
                steps.push(
                    {
                        element: "#approval-target-card",
                        popover: {
                            title: "Target vs Actual",
                            description: "Compare the Submitted Value (Green) against the Quarterly Target (White) to assess performance.",
                            side: "bottom", align: "start"
                        }
                    },
                    {
                        element: "#approval-details-card",
                        popover: {
                            title: "Submission Metadata",
                            description: "Review context such as the submitter's remarks, submission date, and department.",
                            side: "top", align: "start"
                        }
                    },
                    {
                        element: "#approval-decision-card",
                        popover: {
                            title: "Make a Decision",
                            description: "Approve valid data or Reject it. If rejecting, you MUST provide a Note explaining why so the user can correct it.",
                            side: "top", align: "start"
                        }
                    },
                    {
                        element: "#approval-action-buttons",
                        popover: {
                            title: "Execute Action",
                            description: "Click Approve to finalize the record or Reject to send it back to the submitter.",
                            side: "top", align: "start"
                        }
                    }
                );
            }

            return steps.concat(helpHintStep);
        }

        // --- KPI DATA REPOSITORY (/dashboard/kpi-data) ---
        if (pathname.includes('/kpi-data')) {
            return [
                {
                    element: "#kpi-page-desc",
                    popover: {
                        title: `${kpiLabel} Data Management`,
                        description: `This central repository allows you to monitor and manage all validated ${kpiLabelPlural.toLowerCase()} for your department.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#kpi-summary-cards",
                    popover: {
                        title: "Metric Snapshot",
                        description: `A quick overview of total ${kpiLabelPlural.toLowerCase()} assigned to your unit and their reporting frequencies.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#kpi-data-table",
                    popover: {
                        title: `${kpiLabel} Inventory`,
                        description: `The master list of all ${kpiLabelPlural.toLowerCase()}. You can see targets, periodic results (Q1-Q4), and the parent strategic objectives here.`,
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#kpi-search-bar",
                    popover: {
                        title: "Quick Search",
                        description: `Find specific ${kpiLabelPlural.toLowerCase()} instantly by typing their name or description.`,
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: document.querySelector("#btn-review-kpi") ? "#btn-review-kpi" : "#btn-add-kpi",
                    popover: {
                        title: "Primary Actions",
                        description: document.querySelector("#btn-review-kpi")
                            ? `Navigate to the Review dashboard to validate pending ${kpiLabelPlural.toLowerCase()}.`
                            : `Start submitting new monthly data for your ${kpiLabelPlural.toLowerCase()}.`,
                        side: "bottom", align: "end"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- STAKEHOLDER DASHBOARD ---
        if (pathname.includes('/stakeholder-dashboard')) {
            return [
                {
                    element: "#sh-year-select",
                    popover: {
                        title: "Analysis Period",
                        description: "Select the fiscal year to view your department's performance and submission history.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#btn-sh-generate-report",
                    popover: {
                        title: "Reporting",
                        description: "Generate a comprehensive PDF or Excel report of your current dashboard view.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#sh-stats-cards",
                    popover: {
                        title: "Performance KPI Cards",
                        description: "Track total activities, average completion rates, and validation statuses at a glance.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#sh-performance-snapshot",
                    popover: {
                        title: "Activity Pulse",
                        description: "Real-time tracking of your key performance indicators against their assigned targets.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#sh-distribution-chart",
                    popover: {
                        title: "Performance Distribution",
                        description: "See how your activities are spread across different grade thresholds (A+ to E).",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#sh-quarterly-summaries",
                    popover: {
                        title: "Quarterly Trends",
                        description: "Compare your performance across the four quarters of the year to identify trends.",
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#sh-submission-history",
                    popover: {
                        title: "Submission Audit Trail",
                        description: "A complete log of all data submitted, review comments from evaluators, and final validation dates.",
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#sh-col-status",
                    popover: {
                        title: "Approval Tracking",
                        description: "Monitor whether your submissions are Pending, Approved, or Rejected by the DG/DGT.",
                        side: "bottom", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- STRATEGIC PILLARS MANAGEMENT (LIST) ---
        if (pathname === '/dashboard/pillar' || pathname === '/dashboard/pillar/') {
            return [
                {
                    element: "#pillar-mgmt-header",
                    popover: {
                        title: "Pillar Governance",
                        description: "Manage the core strategic pillars of the NITDA roadmap here.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#btn-add-pillar",
                    popover: {
                        title: "New Pillar",
                        description: "Add a new strategic focus area to the system.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#pillar-mgmt-search",
                    popover: {
                        title: "Pillar Search",
                        description: "Quickly locate specific pillars by name or description.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#pillar-mgmt-table",
                    popover: {
                        title: "Pillar Inventory",
                        description: "View and edit the existing pillars, their display order, and creation history.",
                        side: "top", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- PILLAR DETAILS ---
        if (pathname.includes('/pillar/')) {
            return [
                {
                    element: "#pillar-controls",
                    popover: {
                        title: "Period & Filter Controls",
                        description: "Standardize your view by selecting the Year, Quarter, and Department you wish to analyze.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#btn-pillar-generate-report",
                    popover: {
                        title: "Actionable Intelligence",
                        description: "Generate a detailed report for this specific pillar based on your current filters.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#pillar-card-completion",
                    popover: {
                        title: "Overall Performance",
                        description: `This Ring Chart shows the average completion rate of all ${kpiLabelPlural.toLowerCase()} under this pillar for the selected period.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#pillar-card-initiatives",
                    popover: {
                        title: "Initiative Count",
                        description: "The total number of high-level strategic actions currently tracked for this pillar.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#pillar-initiative-grid",
                    popover: {
                        title: "Initiative Breakdown",
                        description: `Each card represents a core initiative. Click a card to expand and view its nested Objectives and ${kpiLabelPlural}.`,
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#pillar-kpi-table",
                    popover: {
                        title: `${kpiLabel} Performance Matrix`,
                        description: `Displays granular metrics. You can see Annual Targets vs. actual period results for each ${kpiLabel.toLowerCase()} here.`,
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#pillar-kpi-col-completion",
                    popover: {
                        title: "Completion Progress",
                        description: "A calculated percentage of Target vs. Actual, accompanied by a color-coded status bar.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#pillar-kpi-col-status",
                    popover: {
                        title: "Threshold Status",
                        description: "The official NITDA performance grade based on predefined completion thresholds (A+ to E).",
                        side: "bottom", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- SRAP MANAGEMENT ---
        if (pathname.includes('/srap')) {
            const steps = [
                {
                    element: "#srap-breadcrumb",
                    popover: {
                        title: "Navigation Context",
                        description: "Use these breadcrumbs to quickly jump back to the main dashboard or reset your pillar selection.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#srap-year-select",
                    popover: {
                        title: "Fiscal Year",
                        description: "Select the specific implementation year you wish to manage SRAP items for.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#srap-pillar-grid",
                    popover: {
                        title: "Pillar Selection",
                        description: "Click any tile here to load the Strategic Roadmap Action Plan (SRAP) items associated with that specific pillar.",
                        side: "bottom", align: "start"
                    }
                }
            ];

            // Only add these if a pillar is selected
            if (document.querySelector("#srap-selected-pillar-header")) {
                steps.push(
                    {
                        element: "#srap-selected-pillar-header",
                        popover: {
                            title: "Active Pillar",
                            description: "You are currently viewing and managing items under this strategic pillar.",
                            side: "bottom", align: "start"
                        }
                    },
                    {
                        element: "#srap-search",
                        popover: {
                            title: `Search ${kpiLabelPlural}`,
                            description: `Examines Initiatives, Objectives, and ${kpiLabelPlural} across the entire selected pillar.`,
                            side: "bottom", align: "start"
                        }
                    },
                    {
                        element: "#btn-add-initiative",
                        popover: {
                            title: "New Initiative",
                            description: "Strategic goals start with Initiatives. Click here to define a new high-level action for this pillar.",
                            side: "left", align: "start"
                        }
                    },
                    {
                        element: "#btn-add-objective",
                        popover: {
                            title: "Define Objectives",
                            description: "Break down your Initiatives into measurable Objectives. Each Initiative can have multiple Objectives.",
                            side: "left", align: "start"
                        }
                    },
                    {
                        element: "#btn-add-kpi-activity",
                        popover: {
                            title: `Track ${kpiLabelPlural}`,
                            description: `This is the most granular level. Define specific ${kpiLabelPlural.toLowerCase()} that will prove success for the parent Objective.`,
                            side: "left", align: "start"
                        }
                    }
                );
            }

            steps.push(
                {
                    element: "#srap-summary-sidebar",
                    popover: {
                        title: "Hierarchy Summary",
                        description: `Keep track of your total counts across all levels of the SRAP hierarchy (Initiatives, Objectives, ${kpiLabelPlural}).`,
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#srap-export-actions",
                    popover: {
                        title: "Report Actions",
                        description: "Need your SRAP offline? Use these buttons to Export data to Excel or generate a printable report.",
                        side: "top", align: "start"
                    }
                }
            );

            return steps.concat(helpHintStep);
        }

        // --- SETTINGS ---
        if (pathname.includes('/settings')) {
            return [
                {
                    element: "#settings-tabs",
                    popover: {
                        title: "Management Hub",
                        description: "Access all system configuration areas from this tab bar.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-users",
                    popover: {
                        title: "User Management",
                        description: "Add, edit, or deactivate system users and assign them to specific departments.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-roles",
                    popover: {
                        title: "Access Control",
                        description: "Define what different user levels (Admin, Staff, Stakeholder) can see and do.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-department",
                    popover: {
                        title: "Organizational Structure",
                        description: "Manage the list of departments and units within NITDA.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-pillars",
                    popover: {
                        title: "Strategic Pillars",
                        description: "Configure the 8 core pillars of Nigeria's digital transformation roadmap.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-access-control",
                    popover: {
                        title: "Reporting Lifecycle",
                        description: "Critical area: Lock or Unlock quarterly data entry for the entire organization.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-versions",
                    popover: {
                        title: "SRAP Versions",
                        description: "Manage different versions of the Strategic Roadmap (e.g., SRAP 2021-2024 vs 2.0).",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#tab-years",
                    popover: {
                        title: "Fiscal Cycles",
                        description: "Define the implementation years for tracking performance.",
                        side: "bottom", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- DASHBOARD HOME (Consolidated) ---
        if (pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/dashboard/stakeholder-dashboard') {
            const baseSteps = [
                {
                    element: isStakeholder ? "#nav-dashboard-sh" : "#nav-dashboard",
                    popover: {
                        title: isStakeholder ? "Performance Hub" : "Command Center",
                        description: isStakeholder
                            ? `Track your department's specific ${kpiLabelPlural.toLowerCase()} and overall impact metrics.`
                            : "Welcome to the NITDA SRAP 2.0 Global Monitoring System. This is your central hub for performance analytics.",
                        side: "right", align: "start"
                    }
                }
            ];

            const themeAndUserSteps = [
                {
                    element: "#theme-toggle",
                    popover: {
                        title: "Visual Comfort",
                        description: "Switch between Light and Dark modes to suit your working environment.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#user-profile",
                    popover: {
                        title: "Your Identity",
                        description: "Displays your current role and department assignment within the SRAP ecosystem.",
                        side: "bottom", align: "end"
                    }
                }
            ];

            // Detailed steps for Admin, Director, and Staff (anyone using the main dashboard)
            const mainDashboardSteps = (!isStakeholder) ? [
                {
                    element: "#home-quarterly-summary",
                    popover: {
                        title: "Performance Summary",
                        description: "High-level performance metrics grouped by quarter. Monitor average completion at a glance.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#home-eight-pillars",
                    popover: {
                        title: "The Eight Pillars",
                        description: "Interactive hub for Nigeria's digital transformation journey. Hover for totals, click to explore a specific pillar.",
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#home-pillar-perf-cards",
                    popover: {
                        title: "Pillar Performance Matrix",
                        description: "Granular progress tracking for each pillar, including grade distribution (A+ to E).",
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#home-overall-progress",
                    popover: {
                        title: "Global Progress Ring",
                        description: "A synthesized view of institutional performance across all measurable KPIs.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#home-summary-snapshot",
                    popover: {
                        title: "Periodic Snapshot",
                        description: "Identifies top-performing and underperforming KPIs for the current reporting period.",
                        side: "left", align: "start"
                    }
                },
                {
                    element: "#home-impact-carousel",
                    popover: {
                        title: "Impact Metrics",
                        description: "Real-world outcomes like jobs created and talents trained. Slide to see more strategic impacts.",
                        side: "top", align: "start"
                    }
                },
                {
                    element: "#home-dept-matrix",
                    popover: {
                        title: "Accountability Matrix",
                        description: "Transparent ranking of department performance based on KPI completion and thresholds.",
                        side: "top", align: "start"
                    }
                }
            ] : [];

            const stakeholderSpecificSteps = isStakeholder ? [
                {
                    element: "#nav-kpi-data-sh",
                    popover: {
                        title: "Data Reporting",
                        description: `Submit and manage your ${kpiLabelPlural.toLowerCase()} for the active reporting period.`,
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#sh-stats-cards",
                    popover: {
                        title: "Performance Snapshot",
                        description: `A quick look at your total ${kpiLabelPlural.toLowerCase()} and completion status.`,
                        side: "bottom", align: "start"
                    }
                }
            ] : [];

            return baseSteps
                .concat(themeAndUserSteps)
                .concat(mainDashboardSteps)
                .concat(stakeholderSpecificSteps)
                .concat(helpHintStep);
        }

        // --- OBJECTIVE REVIEW ---
        if (pathname.includes('/objective-review')) {
            return [
                {
                    element: "#obj-review-header",
                    popover: {
                        title: "Review Workflow",
                        description: "This interface allows executives to audit and validate strategic objective submissions before they become official.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#obj-review-filters",
                    popover: {
                        title: "Queue Filtering",
                        description: "Filter the approval queue by Department or Fiscal Year to focus on specific work packages.",
                        side: "bottom", align: "end"
                    }
                },
                {
                    element: "#obj-review-queue",
                    popover: {
                        title: "Approval Queue",
                        description: "Examine the backlog of objectives awaiting your decision. A counter displays the total pending items.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#obj-review-details",
                    popover: {
                        title: "Submission Details",
                        description: "Review the full content, including the name, description, and strategic code associated with the objective.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#obj-review-decision",
                    popover: {
                        title: "Final Decision",
                        description: "Provide a reviewer note and select Approve or Reject. Notes are mandatory for rejections to provide constructive feedback.",
                        side: "top", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- KPI SCORECARD (STAFF) ---
        if (pathname.includes('/kpi-scorecard')) {
            return [
                {
                    element: "#kpi-scorecard-header",
                    popover: {
                        title: "Performance Scorecard",
                        description: `A hierarchical view of performance mapping Pillars to Initiatives, Objectives, and individual ${kpiLabelPlural.toLowerCase()}.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#kpi-scorecard-filters",
                    popover: {
                        title: "Metrict Targeting",
                        description: `Filter the entire scorecard by Year, Quarter, or a specific Strategic Pillar to isolate ${kpiLabel.toLowerCase()} results.`,
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#kpi-scorecard-table-header",
                    popover: {
                        title: "Metric Matrix",
                        description: "Compare Annual Targets against current Actuals. Colors indicate the performance grade (A+ to E).",
                        side: "bottom", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

        // --- ORGANIZATIONAL SCORECARD (DG) ---
        if (pathname.includes('/dg-kpi-scorecard')) {
            if (isStakeholder) return [];
            return [
                {
                    element: "#dg-scorecard-header",
                    popover: {
                        title: "Institutional Perspective",
                        description: "The highest-level view of NITDA performance, designed for executive decision-making and strategic oversight.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#dg-scorecard-insights",
                    popover: {
                        title: "Strategic Intelligence",
                        description: "Synthesized analytics showing trends, completion velocity, and performance trajectory.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#dg-scorecard-pillars",
                    popover: {
                        title: "Pillar Progress",
                        description: "Real-time completion percentages for each of Nigeria's digital transformation pillars.",
                        side: "bottom", align: "start"
                    }
                },
                {
                    element: "#dg-scorecard-details",
                    popover: {
                        title: "Operational Deep Dive",
                        description: `Expand any objective to audit the underlying ${kpiLabelPlural.toLowerCase()} and performance signals.`,
                        side: "top", align: "start"
                    }
                }
            ].concat(helpHintStep);
        }

    };

    const getSidebarSteps = (user) => {
        const isStakeholder = checkIsStakeholder(user);
        const isAdmin = checkIsAdmin(user);
        const kpiLabelPlural = getKpiLabelPlural(user);

        if (isStakeholder) {
            return [
                {
                    element: "#nav-srap-overview-sh",
                    popover: {
                        title: "SRAP 2.0 Overview",
                        description: "Access the public-facing roadmap and high-level strategic alignment.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#nav-dashboard-sh",
                    popover: {
                        title: "Personal Dashboard",
                        description: "Your primary workspace for tracking departmental performance metrics.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#nav-kpi-data-sh",
                    popover: {
                        title: "Data Reporting",
                        description: `Submit and manage your ${kpiLabelPlural.toLowerCase()} for the active reporting period.`,
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#nav-activity-mgmt-sh",
                    popover: {
                        title: "Activity Registry",
                        description: "The full hierarchy of your initiatives and strategic objectives.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#nav-support",
                    popover: {
                        title: "System Support",
                        description: "Get assistance or documentation for the SRAP platform.",
                        side: "right", align: "start"
                    }
                },
                {
                    element: "#nav-logout",
                    popover: {
                        title: "Session Management",
                        description: "Safely sign out of your account.",
                        side: "right", align: "start"
                    }
                }
            ];
        }

        return [
            {
                element: "#nav-srap-overview",
                popover: {
                    title: "Roadmap Home",
                    description: "The main gateway to the SRAP 2.0 strategic framework.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-dashboard",
                popover: {
                    title: "Executive Dashboard",
                    description: "Monitor organization-wide performance and completion trends.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-pillars",
                popover: {
                    title: "Strategic Pillars",
                    description: "Deep dive into the 6 core pillars of digital transformation.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-kpi-data",
                popover: {
                    title: "KPI Repository",
                    description: "Centralized database for all performance data tracking.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-objective-review",
                popover: {
                    title: "Quality Assurance",
                    description: "Approve or reject objective submissions in the review queue.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-kpi-scorecard",
                popover: {
                    title: "Operational Scorecard",
                    description: "A functional breakdown of all KPIs across departments.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-org-scorecard",
                popover: {
                    title: "Organizational Health",
                    description: "The high-level scorecard for DG and executive oversight.",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-srap-mgmt",
                popover: {
                    title: "SRAP 2.0 Management",
                    description: "Administer the core SRAP structure (Initiatives, Objectives).",
                    side: "right", align: "start"
                }
            },
            {
                element: "#nav-settings",
                popover: {
                    title: "System Configuration",
                    description: "Manage users, roles, and platform global settings.",
                    side: "right", align: "start"
                }
            }
        ];
    };

    // --- ADAPTIVE POLLING LOGIC ---
    const getTriggerElement = (pathname) => {
        if (pathname === '/dashboard' || pathname === '/dashboard/') return "#home-eight-pillars";
        if (pathname.includes('/stakeholder-dashboard')) return "#sh-stats-cards";
        if (pathname.includes('/kpi-data')) return "#kpi-data-table";
        if (pathname.includes('/pillar/')) return "#pillar-initiative-grid";
        if (pathname.includes('/srap')) return "#srap-pillar-grid";
        if (pathname.includes('/settings')) return "#settings-tabs";
        if (pathname.includes('/objective-review')) return "#obj-review-queue";
        if (pathname.includes('/kpi-scorecard')) return "#kpi-scorecard-table-header";
        if (pathname.includes('/dg-kpi-scorecard')) return "#dg-scorecard-pillars";
        return null;
    };

    const startTour = (force = false, tourType = 'page') => {
        if (!user) return;

        let steps = [];
        let storageKey = '';

        if (tourType === 'sidebar') {
            steps = getSidebarSteps(user);
            storageKey = 'hasSeenSidebarTour';
        } else {
            steps = getStepsForRoute(location.pathname, user);
            storageKey = `hasSeenTour_${location.pathname}`;
        }

        if (!steps || steps.length === 0) return;

        // Filter valid elements
        const validatedSteps = steps.filter(step => {
            if (!step.element) return true;
            return document.querySelector(step.element);
        });

        // CRITICAL: Don't start if ONLY the "Help Hint" (header icon) is found
        // unless it's a forced restart or it's the sidebar tour.
        const pageSpecificSteps = validatedSteps.filter(s => s.element !== "button[title='Restart Tour']");
        if (!force && tourType === 'page' && pageSpecificSteps.length === 0) return;

        const isTourDisabled = localStorage.getItem('isTourDisabled');
        const hasSeen = localStorage.getItem(storageKey);
        if (!force && (isTourDisabled || hasSeen)) return;

        // Destroy any existing driver instance before creating a new one
        // to prevent orphaned overlays from blocking the UI
        if (driverObj.current) {
            try { driverObj.current.destroy(); } catch (_) {}
            driverObj.current = null;
        }

        // Safety check: if no valid steps remain, bail out
        if (validatedSteps.length === 0) return;

        driverObj.current = driver({
            showProgress: true,
            animate: true,
            popoverClass: 'driverjs-theme',
            steps: validatedSteps,
            onCloseClick: () => {
                localStorage.setItem('isTourDisabled', "true");
                try { driverObj.current?.destroy(); } catch (_) {}
            },
            onDestroyed: () => {
                if (!force) {
                    localStorage.setItem(storageKey, "true");
                }
                // If sidebar tour just finished, try starting the page tour
                if (tourType === 'sidebar' && !force) {
                    setTimeout(() => startTour(false, 'page'), 1000);
                }
            },
        });

        // Wrap drive() in try/catch — if driver.js throws (e.g. element
        // disappeared between filter and drive), destroy immediately so the
        // backdrop overlay doesn't get stuck on screen.
        try {
            driverObj.current.drive();
        } catch (_) {
            try { driverObj.current.destroy(); } catch (__) {}
            driverObj.current = null;
        }
    };

    // Destroy any active tour when the route changes to prevent
    // orphaned overlays from blocking the new page
    useEffect(() => {
        return () => {
            if (driverObj.current) {
                try { driverObj.current.destroy(); } catch (_) {}
                driverObj.current = null;
            }
        };
    }, [location.pathname]);

    // Auto-start tour with adaptive polling
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        let timers = [];

        const checkReadinessAndStart = () => {
            const hasSeenSidebar = localStorage.getItem('hasSeenSidebarTour');

            // Priority 1: Sidebar Tour
            if (!hasSeenSidebar) {
                const sidebarReady = !!document.querySelector(checkIsStakeholder(user) ? "#nav-dashboard-sh" : "#nav-dashboard");
                if (sidebarReady) {
                    const t = setTimeout(() => startTour(false, 'sidebar'), 500);
                    timers.push(t);
                    return;
                }
            }

            // Priority 2: Page Tour
            const trigger = getTriggerElement(location.pathname);
            const isReady = trigger ? !!document.querySelector(trigger) : true;

            if (isReady) {
                const t = setTimeout(() => startTour(false, 'page'), 500);
                timers.push(t);
            } else if (attempts < maxAttempts) {
                attempts++;
                const t = setTimeout(checkReadinessAndStart, 1000);
                timers.push(t);
            }
        };

        const timer = setTimeout(checkReadinessAndStart, 1000);
        timers.push(timer);

        return () => {
            timers.forEach(clearTimeout);
            // Also destroy any in-progress tour when the route changes
            if (driverObj.current) {
                try { driverObj.current.destroy(); } catch (_) {}
                driverObj.current = null;
            }
        };
    }, [location.pathname, user]);

    return (
        <TourContext.Provider value={{ startTour }}>
            {children}
        </TourContext.Provider>
    );
};
