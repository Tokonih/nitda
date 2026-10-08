/**
 * Role-based label utilities
 * Determines if a user is a stakeholder and returns appropriate labels.
 */

/**
 * Checks if a user is a "Stakeholder".
 * This function is flexible and accepts either:
 * 1. A role string (e.g. "Stakeholder", "Admin")
 * 2. A full user object (checks role, department name, and department type)
 */
/**
 * Checks if a user is an "Admin".
 */
export const isAdmin = (input: any): boolean => {
  if (!input) return false;

  // Case 1: Input is a string (role)
  if (typeof input === "string") {
    const roleLower = input.toLowerCase();
    return roleLower === "admin" || roleLower === "administrator";
  }

  // Case 2: Input is a User object
  if (typeof input === "object") {
    const { role } = input;
    if (role && typeof role === "string") {
      const roleLower = role.toLowerCase();
      return roleLower === "admin" || roleLower === "administrator";
    }
  }

  return false;
};

export const isStakeholder = (input: any): boolean => {
  if (!input) return false;

  // Case 1: Input is just a role string
  if (typeof input === "string") {
    return input.toLowerCase().includes("stakeholder");
  }

  // Case 2: Input is a User object
  if (typeof input === "object") {
    const { role, department } = input;

    // Check 1: Does the user's role include "stakeholder"?
    if (role && typeof role === "string" && role.toLowerCase().includes("stakeholder")) {
      return true;
    }

    // Check 2: Check department details if they exist
    if (department) {
      // Is the department TYPE exactly "stakeholder"?
      if (department.type?.toLowerCase() === "stakeholder") {
        return true;
      }
      // Does the department NAME include "(stakeholder)" or "(stakeholders)"?
      const deptNameLower = department.name?.toLowerCase() || "";
      if (deptNameLower.includes("(stakeholder)") || deptNameLower.includes("(stakeholders)")) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Returns "Activity" for stakeholders, "KPI" for everyone else.
 */
export const getKpiLabel = (input: any): string => {
  return isStakeholder(input) ? "Activity" : "KPI";
};

/**
 * Returns "Activities" for stakeholders, "KPIs" for everyone else.
 */
export const getKpiLabelPlural = (input: any): string => {
  return isStakeholder(input) ? "Activities" : "KPIs";
};
