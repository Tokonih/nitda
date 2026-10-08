/**
 * Shared grade color system used across the application.
 * Grades: A+ (≥90) → A (≥80) → B (≥70) → C (≥60) → D (≥50) → E (<50)
 *
 * Color palette (chosen for clear visual distinction):
 *   A+  #155535  dark green   — exceptional
 *   A   #22C55E  bright green — highly efficient
 *   B   #3B82F6  blue         — efficient  (distinct from greens above)
 *   C   #F59E0B  amber        — average
 *   D   #F97316  orange       — fair
 *   E   #EF4444  red          — unsatisfactory
 */

/** Hex color for a grade or percentage */
export const getGradeHex = (gradeOrPct) => {
  const pct = typeof gradeOrPct === "number" ? gradeOrPct : null;
  const grade = typeof gradeOrPct === "string" ? gradeOrPct : null;

  if (grade === "A+" || pct >= 90) return "#155535";
  if (grade === "A"  || pct >= 80) return "#22C55E";
  if (grade === "B"  || pct >= 70) return "#3B82F6";
  if (grade === "C"  || pct >= 60) return "#F59E0B";
  if (grade === "D"  || pct >= 50) return "#F97316";
  return "#EF4444"; // E
};

/** Tailwind bg + text classes for a grade badge */
export const getGradeBadgeClasses = (grade) => {
  switch (grade) {
    case "A+": return { bg: "bg-[#155535]/10", text: "text-[#155535]",  border: "border-[#155535]/30" };
    case "A":  return { bg: "bg-green-100",    text: "text-green-700",  border: "border-green-200" };
    case "B":  return { bg: "bg-blue-100",     text: "text-blue-700",   border: "border-blue-200" };
    case "C":  return { bg: "bg-yellow-100",   text: "text-yellow-700", border: "border-yellow-200" };
    case "D":  return { bg: "bg-orange-100",   text: "text-orange-700", border: "border-orange-200" };
    default:   return { bg: "bg-red-100",      text: "text-red-700",    border: "border-red-200" };
  }
};

/** Human-readable label for a grade */
export const getGradeLabel = (grade) => {
  switch (grade) {
    case "A+": return "Exceptional";
    case "A":  return "Highly Efficient";
    case "B":  return "Efficient";
    case "C":  return "Average";
    case "D":  return "Fair";
    default:   return "Unsatisfactory";
  }
};

/** Derive grade letter from a percentage */
export const gradeFromPct = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "E";
};

/**
 * Grade scale segments for legends and progress bars (E → A+).
 */
export const GRADE_SCALE = [
  { grade: "E",  label: "Unsatisfactory",  min: 0,  max: 49,  hex: "#EF4444" },
  { grade: "D",  label: "Fair",            min: 50, max: 59,  hex: "#F97316" },
  { grade: "C",  label: "Average",         min: 60, max: 69,  hex: "#F59E0B" },
  { grade: "B",  label: "Efficient",       min: 70, max: 79,  hex: "#3B82F6" },
  { grade: "A",  label: "Highly Efficient",min: 80, max: 89,  hex: "#22C55E" },
  { grade: "A+", label: "Exceptional",     min: 90, max: 100, hex: "#155535" },
];
