// Maps stored note statuses to the wording students see
// the stored values stay the same because the instructor routes filter on them.
const NOTE_STATUS_LABELS = {
  Draft: "Draft",
  "Pending Review": "Submitted",
  Returned: "Returned for revision",
  Approved: "Approved",
};

export function noteStatusLabel(status) {
  return NOTE_STATUS_LABELS[status] || status || "Not started";
}