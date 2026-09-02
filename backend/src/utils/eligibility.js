/**
 * Check if a student meets the eligibility criteria for a drive.
 * This mirrors the database trigger logic at the application level
 * for pre-validation and UI feedback.
 *
 * @param {object} student - { cgpa, backlogs, branch }
 * @param {object} drive - { min_cgpa, max_backlogs, eligible_branches }
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
function checkEligibility(student, drive) {
  const reasons = [];

  if (parseFloat(student.cgpa) < parseFloat(drive.min_cgpa)) {
    reasons.push(`CGPA ${student.cgpa} is below minimum ${drive.min_cgpa}`);
  }

  if (student.backlogs > drive.max_backlogs) {
    reasons.push(`${student.backlogs} backlogs exceeds maximum ${drive.max_backlogs}`);
  }

  const eligibleBranches = drive.eligible_branches
    .split(',')
    .map(b => b.trim().toUpperCase());

  if (!eligibleBranches.includes(student.branch.toUpperCase())) {
    reasons.push(`Branch ${student.branch} is not in eligible list: ${drive.eligible_branches}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

module.exports = { checkEligibility };
