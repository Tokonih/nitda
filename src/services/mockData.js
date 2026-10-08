// Mock data service for NITDA Dashboard
// TODO: Replace with actual API calls when backend is ready

// Mock KPI Data
export const mockKPIData = {
  getAll: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: 1,
        title: "Digital Infrastructure Projects",
        value: 8,
        target: 60,
        unit: "projects",
        trend: "up",
        change: 12,
        sector: "Infrastructure"
      },
      {
        id: 2,
        title: "Cybersecurity Implementation",
        value: 10,
        target: 85,
        unit: "percent",
        trend: "up",
        change: 8,
        sector: "Security"
      },
      {
        id: 3,
        title: "Digital Skills Training",
        value: 12500,
        target: 15000,
        unit: "people",
        trend: "up",
        change: 15,
        sector: "Capacity Building"
      }
    ];
  },

  getById: async (id) => {
    const all = await mockKPIData.getAll();
    return all.find(item => item.id === id);
  }
};

// Mock Projects Data
export const mockProjectsData = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 1,
        name: "National Broadband Infrastructure",
        description: "Expanding broadband connectivity across Nigeria",
        status: "active",
        priority: "high",
        progress: 75,
        startDate: "2023-01-15",
        endDate: "2024-12-31",
        budget: 50000000,
        spent: 37500000,
        sector: "Infrastructure",
        location: "National",
        lead: "Eng. Sarah Johnson",
        team: ["John Doe", "Mary Smith", "Ahmed Hassan"],
        workPackage: "B",
        risks: [
          { level: "medium", description: "Weather delays in rural areas" },
          { level: "low", description: "Equipment procurement delays" }
        ],
        milestones: [
          { name: "Phase 1 Complete", date: "2023-06-30", status: "completed" },
          { name: "Phase 2 Complete", date: "2023-12-15", status: "completed" },
          { name: "Phase 3 Complete", date: "2024-06-30", status: "in-progress" },
          { name: "Final Deployment", date: "2024-12-31", status: "pending" }
        ]
      },
      {
        id: 2,
        name: "Digital ID System Implementation",
        description: "Comprehensive digital identity system for citizens",
        status: "active",
        priority: "high",
        progress: 60,
        startDate: "2023-03-01",
        endDate: "2024-09-30",
        budget: 25000000,
        spent: 15000000,
        sector: "Digital Services",
        location: "National",
        lead: "Dr. Amina Kano",
        team: ["Peter Okafor", "Fatima Abdullahi", "Moses Ogundimu"],
        workPackage: "A",
        risks: [
          { level: "high", description: "Privacy concerns from citizens" },
          { level: "medium", description: "Integration with existing systems" }
        ],
        milestones: [
          { name: "Requirements Analysis", date: "2023-05-31", status: "completed" },
          { name: "System Design", date: "2023-08-31", status: "completed" },
          { name: "Pilot Testing", date: "2024-03-31", status: "in-progress" },
          { name: "National Rollout", date: "2024-09-30", status: "pending" }
        ]
      },
      {
        id: 3,
        name: "E-Government Portal Development",
        description: "Unified portal for government services",
        status: "pending",
        priority: "medium",
        progress: 25,
        startDate: "2023-07-01",
        endDate: "2024-12-31",
        budget: 15000000,
        spent: 3750000,
        sector: "E-Government",
        location: "FCT Abuja",
        lead: "Mr. David Okoro",
        team: ["Grace Adebayo", "Ibrahim Musa", "Jennifer Eze"],
        workPackage: "B",
        risks: [
          { level: "medium", description: "Stakeholder alignment challenges" },
          { level: "low", description: "Technology stack changes" }
        ],
        milestones: [
          { name: "Stakeholder Workshops", date: "2023-09-30", status: "completed" },
          { name: "Technical Architecture", date: "2023-12-31", status: "in-progress" },
          { name: "Development Phase", date: "2024-06-30", status: "pending" },
          { name: "Launch", date: "2024-12-31", status: "pending" }
        ]
      },
      {
        id: 4,
        name: "Cybersecurity Framework Implementation",
        description: "National cybersecurity framework rollout",
        status: "active",
        priority: "high",
        progress: 85,
        startDate: "2022-10-01",
        endDate: "2024-03-31",
        budget: 20000000,
        spent: 17000000,
        sector: "Cybersecurity",
        location: "National",
        lead: "Col. Retired James Adamu",
        team: ["Cyber Team Alpha", "Security Analysts", "Policy Team"],
        workPackage: "C",
        risks: [
          { level: "high", description: "Evolving threat landscape" },
          { level: "medium", description: "Skills gap in cybersecurity" }
        ],
        milestones: [
          { name: "Framework Development", date: "2023-03-31", status: "completed" },
          { name: "Pilot Implementation", date: "2023-09-30", status: "completed" },
          { name: "National Rollout", date: "2024-01-31", status: "completed" },
          { name: "Final Evaluation", date: "2024-03-31", status: "in-progress" }
        ]
      },
      {
        id: 5,
        name: "Smart City Initiative - Lagos",
        description: "Digital transformation of Lagos State infrastructure",
        status: "active",
        priority: "medium",
        progress: 40,
        startDate: "2023-04-01",
        endDate: "2025-03-31",
        budget: 75000000,
        spent: 30000000,
        sector: "Smart Cities",
        location: "Lagos State",
        lead: "Arch. Folake Adeyemi",
        team: ["Smart City Team", "Infrastructure Engineers", "Data Analysts"],
        workPackage: "B",
        risks: [
          { level: "high", description: "Funding sustainability" },
          { level: "medium", description: "Technology integration complexity" }
        ],
        milestones: [
          { name: "Master Plan", date: "2023-08-31", status: "completed" },
          { name: "Phase 1 Deployment", date: "2024-02-29", status: "in-progress" },
          { name: "Phase 2 Deployment", date: "2024-08-31", status: "pending" },
          { name: "Full Operation", date: "2025-03-31", status: "pending" }
        ]
      }
    ];
  },

  getById: async (id) => {
    const all = await mockProjectsData.getAll();
    return all.find(project => project.id === parseInt(id));
  },

  getByWorkPackage: async (workPackage) => {
    const all = await mockProjectsData.getAll();
    return all.filter(project => project.workPackage === workPackage);
  },

  create: async (projectData) => {
    // TODO: Implement API call
    return { id: Date.now(), ...projectData };
  },

  update: async (id, updates) => {
    // TODO: Implement API call
    return { id, ...updates };
  }
};

// Mock Compliance Data
export const mockComplianceData = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      {
        id: 1,
        category: "Data Protection",
        status: "compliant",
        score: 95,
        lastAudit: "2024-01-15",
        nextAudit: "2024-04-15",
        requirements: [
          { name: "GDPR Compliance", status: "met", priority: "high" },
          { name: "Data Encryption", status: "met", priority: "high" },
          { name: "Access Controls", status: "met", priority: "medium" },
          { name: "Audit Logs", status: "partial", priority: "medium" }
        ]
      },
      {
        id: 2,
        category: "Cybersecurity",
        status: "compliant",
        score: 88,
        lastAudit: "2024-01-10",
        nextAudit: "2024-04-10",
        requirements: [
          { name: "Firewall Configuration", status: "met", priority: "high" },
          { name: "Intrusion Detection", status: "met", priority: "high" },
          { name: "Security Training", status: "partial", priority: "medium" },
          { name: "Incident Response", status: "met", priority: "high" }
        ]
      },
      {
        id: 3,
        category: "Infrastructure",
        status: "partial",
        score: 72,
        lastAudit: "2023-12-20",
        nextAudit: "2024-03-20",
        requirements: [
          { name: "Backup Systems", status: "met", priority: "high" },
          { name: "Disaster Recovery", status: "partial", priority: "high" },
          { name: "System Monitoring", status: "met", priority: "medium" },
          { name: "Capacity Planning", status: "not-met", priority: "medium" }
        ]
      }
    ];
  },

  getById: async (id) => {
    const all = await mockComplianceData.getAll();
    return all.find(item => item.id === id);
  }
};

// Mock User Data
export const mockUserData = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@nitda.gov.ng",
        role: "Project Manager",
        department: "Digital Infrastructure",
        status: "active",
        lastLogin: "2024-01-20T10:30:00Z",
        permissions: ["read", "write", "admin"],
        avatar: "/api/placeholder/40/40"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.j@nitda.gov.ng",
        role: "Technical Lead",
        department: "Software Development",
        status: "active",
        lastLogin: "2024-01-20T09:15:00Z",
        permissions: ["read", "write"],
        avatar: "/api/placeholder/40/40"
      },
      {
        id: 3,
        name: "Dr. Amina Kano",
        email: "amina.kano@nitda.gov.ng",
        role: "Policy Director",
        department: "Policy & Strategy",
        status: "active",
        lastLogin: "2024-01-19T16:45:00Z",
        permissions: ["read", "write", "approve"],
        avatar: "/api/placeholder/40/40"
      },
      {
        id: 4,
        name: "Ahmed Hassan",
        email: "ahmed.h@nitda.gov.ng",
        role: "Data Analyst",
        department: "Analytics",
        status: "inactive",
        lastLogin: "2024-01-15T14:20:00Z",
        permissions: ["read"],
        avatar: "/api/placeholder/40/40"
      }
    ];
  },

  getById: async (id) => {
    const all = await mockUserData.getAll();
    return all.find(user => user.id === id);
  },

  create: async (userData) => {
    return { id: Date.now(), ...userData, status: 'active' };
  },

  update: async (id, updates) => {
    return { id, ...updates };
  },

  delete: async (id) => {
    return { success: true };
  }
};

// Mock Data Sources
export const mockDataSources = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));

    return [
      {
        id: 1,
        name: "National Population Commission Database",
        type: "Database",
        status: "active",
        quality: 95,
        lastUpdate: "2024-01-18T12:00:00Z",
        format: "SQL Database",
        size: "2.5 TB",
        contact: "npc@npc.gov.ng",
        description: "Comprehensive population and demographic data",
        validationStatus: "verified",
        issues: []
      },
      {
        id: 2,
        name: "CBN Economic Indicators API",
        type: "API",
        status: "active",
        quality: 88,
        lastUpdate: "2024-01-20T08:30:00Z",
        format: "REST API",
        size: "Real-time",
        contact: "api@cbn.gov.ng",
        description: "Real-time economic and financial indicators",
        validationStatus: "verified",
        issues: [
          { type: "warning", message: "Occasional timeout during peak hours" }
        ]
      },
      {
        id: 3,
        name: "Ministry of Education Records",
        type: "File System",
        status: "pending",
        quality: 65,
        lastUpdate: "2024-01-10T15:45:00Z",
        format: "Excel/CSV",
        size: "150 GB",
        contact: "data@education.gov.ng",
        description: "Educational institutions and enrollment data",
        validationStatus: "pending",
        issues: [
          { type: "error", message: "Inconsistent data formats across regions" },
          { type: "warning", message: "Missing data for some states" }
        ]
      },
      {
        id: 4,
        name: "NIMC Identity Database",
        type: "Secure Database",
        status: "active",
        quality: 92,
        lastUpdate: "2024-01-19T20:00:00Z",
        format: "Encrypted Database",
        size: "5.2 TB",
        contact: "secure@nimc.gov.ng",
        description: "National identity management system data",
        validationStatus: "verified",
        issues: []
      }
    ];
  }
};

// Export all mock services
export default {
  kpiData: mockKPIData,
  projectsData: mockProjectsData,
  complianceData: mockComplianceData,
  userData: mockUserData,
  dataSources: mockDataSources
};