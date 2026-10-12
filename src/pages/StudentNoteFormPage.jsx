import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import {
  fetchStudentCases,
  fetchStudentNote,
  saveStudentNote,
} from "../lib/api";
const ROS_SYSTEMS = [
  "Constitutional",
  "Eyes",
  "ENT",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Genitourinary",
  "Musculoskeletal",
  "Skin",
  "Neurological",
  "Psychiatric",
  "Endocrine",
  "Hematologic",
  "Allergic / Immunologic",
];
const EXAM_SYSTEMS = [
  "General",
  "HEENT",
  "Neck",
  "Cardiovascular",
  "Respiratory",
  "Abdominal",
  "Musculoskeletal",
  "Skin",
  "Neurological",
  "Psychiatric",
];
const HPI_FIELDS = [
  ["onset", "Onset"],
  ["location", "Location"],
  ["duration", "Duration"],
  ["character", "Character"],
  ["aggravating", "Aggravating Factors"],
  ["alleviating", "Alleviating Factors"],
  ["radiation", "Radiation"],
  ["timing", "Timing"],
  ["severity", "Severity (0–10)"],
];
const VITAL_FIELDS = [
  ["systolic", "Systolic BP (mmHg)", 1, 350],
  ["diastolic", "Diastolic BP (mmHg)", 1, 250],
  ["heartRate", "Heart Rate (bpm)", 1, 300],
  ["respiratoryRate", "Respiratory Rate (/min)", 1, 100],
  ["temperature", "Temperature (°C)", 25, 45],
  ["oxygenSaturation", "SpO₂ (%)", 0, 100],
  ["height", "Height (cm)", 1, 300],
  ["weight", "Weight (kg)", 0.1, 700],
  ["pain", "Pain Score (0–10)", 0, 10],
];
const TABS = [
  ["subjective", "Subjective"],
  ["objective", "Objective"],
  ["assessment", "Assessment"],
  ["plan", "Plan"],
];
const makeId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const newDiagnosis = () => ({
  id: makeId(),
  name: "",
  icd10: "",
  status: "New",
});
const newMedication = () => ({
  id: makeId(),
  drug: "",
  dose: "",
  route: "",
  frequency: "",
  duration: "",
  refills: "",
});
const newTest = () => ({
  id: makeId(),
  category: "Lab",
  name: "",
  reason: "",
});
const newPlan = (diagnosisId = "") => ({
  id: makeId(),
  diagnosisId,
  tests: [],
  medications: [],
  procedures: "",
  referrals: "",
  education: "",
  followUpWhen: "",
  followUpWhy: "",
});
const newAllergy = () => ({
  id: makeId(),
  substance: "",
  reaction: "",
  severity: "Unknown",
});
const newFamilyHistory = () => ({
  id: makeId(),
  relative: "",
  condition: "",
});
const newCurrentMedication = () => ({
  id: makeId(),
  name: "",
  details: "",
});
function createEmptyNote() {
  return {
    subjective: {
      chiefComplaint: "",
      hpi: Object.fromEntries(
        HPI_FIELDS.map(([key]) => [key, ""])
      ),
      hpiNarrative: "",
      ros: Object.fromEntries(
        ROS_SYSTEMS.map((system) => [
          system,
          { status: "Not asked", findings: "" },
        ])
      ),
      medicalHistory: "",
      surgicalHistory: "",
      currentMedications: [],
      allergies: [],
      familyHistory: [],
      socialHistory: {
        tobacco: "",
        alcohol: "",
        drugs: "",
        occupation: "",
        livingSituation: "",
      },
    },
    objective: {
      vitals: Object.fromEntries(
        VITAL_FIELDS.map(([key]) => [key, ""])
      ),
      physicalExam: Object.fromEntries(
        EXAM_SYSTEMS.map((system) => [
          system,
          { status: "Not examined", findings: "" },
        ])
      ),
      results: {
        labs: "",
        imaging: "",
        ekg: "",
        other: "",
      },
    },
    assessment: {
      diagnoses: [],
      differential: "",
      reasoning: "",
    },
    plan: {
      problems: [],
      generalInstructions: "",
    },
  };
}
const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
const asArray = (value) =>
  Array.isArray(value) ? value : [];
const asText = (value) =>
  typeof value === "string" ? value : "";
function withIds(items) {
  return items.map((item) => ({
    ...item,
    id: item.id || makeId(),
  }));
}
function createNoteFromCase(patientCase) {
  const note = createEmptyNote();
  return {
    ...note,
    subjective: {
      ...note.subjective,
      chiefComplaint: asText(patientCase.chief_complaint),
      medicalHistory: asText(patientCase.history),
      currentMedications: asArray(
        patientCase.medications
      ).map((medication) => ({
        ...newCurrentMedication(),
        name: asText(medication),
      })),
      allergies: asArray(patientCase.allergies).map(
        (allergy) => ({
          ...newAllergy(),
          substance: asText(allergy),
        })
      ),
    },
  };
}
function normalizeNote(content) {
  const base = createEmptyNote();
  const source = asObject(content);
  const s = asObject(source.subjective);
  const o = asObject(source.objective);
  const a = asObject(source.assessment);
  const p = asObject(source.plan);
  const oldHpi = asObject(s.hpi);
  const oldRos = Object.keys(asObject(s.ros)).length
    ? asObject(s.ros)
    : asObject(s.reviewOfSystems);
  const oldVitals = asObject(o.vitals);
  const oldExam = asObject(o.physicalExam);
  const oldResults = asObject(o.results);
  return {
    subjective: {
      ...base.subjective,
      chiefComplaint: asText(s.chiefComplaint),
      hpi: {
        ...base.subjective.hpi,
        ...oldHpi,
        aggravating: asText(
          oldHpi.aggravating || oldHpi.aggravatingFactors
        ),
        alleviating: asText(
          oldHpi.alleviating || oldHpi.relievingFactors
        ),
      },
      hpiNarrative: asText(
        s.hpiNarrative ||
          oldHpi.additionalHistory ||
          source.subjective
      ),
      ros: Object.fromEntries(
        ROS_SYSTEMS.map((system) => {
          const entry = asObject(oldRos[system]);
          return [
            system,
            {
              status: ["Positive", "Negative"].includes(
                entry.status
              )
                ? entry.status
                : "Not asked",
              findings: asText(entry.findings),
            },
          ];
        })
      ),
      medicalHistory: asText(s.medicalHistory),
      surgicalHistory: asText(s.surgicalHistory),
      currentMedications: withIds(
        asArray(s.currentMedications).map((item) =>
          typeof item === "string"
            ? { name: item, details: "" }
            : item
        )
      ),
      allergies: withIds(
        asArray(s.allergies).map((item) =>
          typeof item === "string"
            ? {
                substance: item,
                reaction: "",
                severity: "Unknown",
              }
            : item
        )
      ),
      familyHistory: withIds(
        asArray(s.familyHistory).map((item) =>
          typeof item === "string"
            ? { relative: "", condition: item }
            : item
        )
      ),
      socialHistory: {
        ...base.subjective.socialHistory,
        ...asObject(s.socialHistory),
      },
    },
    objective: {
      vitals: {
        ...base.objective.vitals,
        ...oldVitals,
        systolic: asText(
          oldVitals.systolic || oldVitals.systolicBP
        ),
        diastolic: asText(
          oldVitals.diastolic || oldVitals.diastolicBP
        ),
        height: asText(
          oldVitals.height || oldVitals.heightCm
        ),
        weight: asText(
          oldVitals.weight || oldVitals.weightKg
        ),
        pain: asText(
          oldVitals.pain || oldVitals.painScore
        ),
      },
      physicalExam: Object.fromEntries(
        EXAM_SYSTEMS.map((system) => {
          const previous = oldExam[system];
          return [
            system,
            typeof previous === "string"
              ? {
                  status: previous
                    ? "Abnormal"
                    : "Not examined",
                  findings: previous,
                }
              : {
                  status: "Not examined",
                  findings: "",
                  ...asObject(previous),
                },
          ];
        })
      ),
      results: {
        ...base.objective.results,
        ...oldResults,
        other: asText(
          oldResults.other || o.results || source.objective
        ),
      },
    },
    assessment: {
      diagnoses: withIds(
        asArray(a.diagnoses).map((item) => ({
          id: item.id,
          name: asText(item.name || item.diagnosis),
          icd10: asText(item.icd10),
          status: item.status || "New",
        }))
      ),
      differential: asText(
        a.differential || a.differentialDiagnoses
      ),
      reasoning: asText(
        a.reasoning ||
          a.clinicalReasoning ||
          source.assessment
      ),
    },
    plan: {
      problems: withIds(
        asArray(p.problems).map((item) => ({
          ...newPlan(),
          ...item,
          diagnosisId: asText(item.diagnosisId),
          tests: withIds(asArray(item.tests)),
          medications: withIds(asArray(item.medications)),
        }))
      ),
      generalInstructions: asText(
        p.generalInstructions ||
          p.patientEducation ||
          source.plan
      ),
    },
  };
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  placeholder = "",
  min,
  max,
  step,
  error,
}) {
  return (
    <label className="soap-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />
      )}
      {error && (
        <small className="soap-field-error">
          {error}
        </small>
      )}
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="soap-field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function RemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
export default function StudentNoteFormPage({
  onNavigate,
}) {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("id");
  const [patientCase, setPatientCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteStatus, setNoteStatus] = useState("Draft");
  const [activeTab, setActiveTab] = useState("subjective");
  const [form, setForm] = useState(createEmptyNote);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [validationErrors, setValidationErrors] =
    useState({});
  useEffect(() => {
    let current = true;
    async function load() {
      setLoading(true);
      setError("");
      setPatientCase(null);
      setForm(createEmptyNote());
      setNoteStatus("Draft");
      setSavedSnapshot("");
      if (!caseId) {
        setLoading(false);
        return;
      }
      try {
        const cases = await fetchStudentCases();
        if (!current) return;
        const selected = cases.find(
          (item) =>
            String(item.id) === String(caseId)
        );
        setPatientCase(selected || null);
        if (!selected) return;
        let initialNote = createNoteFromCase(selected);
        if (selected.assignment_id) {
          const note = await fetchStudentNote(
            selected.assignment_id
          );
          if (!current) return;
          if (note) {
            initialNote = normalizeNote(note.content);
            setNoteStatus(note.status || "Draft");
          }
        }
        setForm(initialNote);
        setSavedSnapshot(JSON.stringify(initialNote));
      } catch (loadError) {
        if (current) {
          setError(
            loadError.message || "Unable to load note."
          );
        }
      } finally {
        if (current) setLoading(false);
      }
    }
    load();
    return () => {
      current = false;
    };
  }, [caseId]);
  const dirty =
    Boolean(savedSnapshot) &&
    JSON.stringify(form) !== savedSnapshot;
  const readonly = !["Draft", "Returned"].includes(
    noteStatus
  );
  useEffect(() => {
    if (!dirty || readonly) return;
    function warn(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () =>
      window.removeEventListener("beforeunload", warn);
  }, [dirty, readonly]);
  function navigateToCase() {
    if (
      dirty &&
      !readonly &&
      !window.confirm(
        "You have unsaved changes. Leave without saving?"
      )
    ) {
      return;
    }
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }
  function setSection(section, key, value) {
    setForm((old) => ({
      ...old,
      [section]: {
        ...old[section],
        [key]: value,
      },
    }));
  }
  function setNested(section, key, field, value) {
    setForm((old) => ({
      ...old,
      [section]: {
        ...old[section],
        [key]: {
          ...old[section][key],
          [field]: value,
        },
      },
    }));
  }
  function addItem(section, key, item) {
    setForm((old) => ({
      ...old,
      [section]: {
        ...old[section],
        [key]: [...old[section][key], item],
      },
    }));
  }
  function changeItem(section, key, id, patch) {
    setForm((old) => ({
      ...old,
      [section]: {
        ...old[section],
        [key]: old[section][key].map((item) =>
          item.id === id
            ? { ...item, ...patch }
            : item
        ),
      },
    }));
  }
  function deleteItem(section, key, id) {
    setForm((old) => ({
      ...old,
      [section]: {
        ...old[section],
        [key]: old[section][key].filter(
          (item) => item.id !== id
        ),
      },
    }));
  }
  function changePlan(id, patch) {
    changeItem("plan", "problems", id, patch);
  }
  function changePlanChild(planId, key, childId, patch) {
    setForm((old) => ({
      ...old,
      plan: {
        ...old.plan,
        problems: old.plan.problems.map((problem) =>
          problem.id === planId
            ? {
                ...problem,
                [key]: problem[key].map((child) =>
                  child.id === childId
                    ? { ...child, ...patch }
                    : child
                ),
              }
            : problem
        ),
      },
    }));
  }
  function addPlanChild(planId, key, item) {
    setForm((old) => ({
      ...old,
      plan: {
        ...old.plan,
        problems: old.plan.problems.map((problem) =>
          problem.id === planId
            ? {
                ...problem,
                [key]: [...problem[key], item],
              }
            : problem
        ),
      },
    }));
  }
  function removePlanChild(planId, key, childId) {
    setForm((old) => ({
      ...old,
      plan: {
        ...old.plan,
        problems: old.plan.problems.map((problem) =>
          problem.id === planId
            ? {
                ...problem,
                [key]: problem[key].filter(
                  (child) => child.id !== childId
                ),
              }
            : problem
        ),
      },
    }));
  }
  function validate() {
    const errors = {};
    for (const [key, label, min, max] of VITAL_FIELDS) {
      const value = form.objective.vitals[key];
      if (value === "") continue;
      const number = Number(value);
      if (
        !Number.isFinite(number) ||
        number < min ||
        number > max
      ) {
        errors[key] = `${label} must be between ${min} and ${max}.`;
      }
    }
    const hpiSeverity = form.subjective.hpi.severity;
    if (hpiSeverity !== "") {
      const severity = Number(hpiSeverity);
      if (
        !Number.isFinite(severity) ||
        severity < 0 ||
        severity > 10
      ) {
        errors.hpiSeverity =
          "Severity must be between 0 and 10.";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }
  async function handleSave() {
    if (
      !patientCase?.assignment_id ||
      saving ||
      readonly
    ) {
      return;
    }
    if (!validate()) {
      setActiveTab(
        Object.keys(validationErrors).length
          ? activeTab
          : "objective"
      );
      setError(
        "Please correct the highlighted values before saving."
      );
      return;
    }
    try {
      setSaving(true);
      setError("");
      await saveStudentNote({
        assignmentId: patientCase.assignment_id,
        content: form,
      });
      setSavedSnapshot(JSON.stringify(form));
    } catch (saveError) {
      setError(
        saveError.message || "Unable to save note."
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading case...</p>
      </div>
    );
  }
  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        {error && <p role="alert">{error}</p>}
        <p>No case selected.</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          Back to my cases
        </button>
      </div>
    );
  }
  const medications = patientCase.medications ?? [];
  const allergies = patientCase.allergies ?? [];
  const vitals = form.objective.vitals;
  const height = Number(vitals.height) / 100;
  const weight = Number(vitals.weight);
  const bmi =
    height > 0 && weight > 0
      ? (weight / (height * height)).toFixed(1)
      : "";
  const tabIndex = TABS.findIndex(
    ([key]) => key === activeTab
  );
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Clinical Note · Case {patientCase.id}
          </p>
          <h1>{patientCase.patient_name}</h1>
          <p>{patientCase.title}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={navigateToCase}
        >
          <Icon name="arrow" size={16} />
          Back to case
        </button>
      </section>
      {error && <p role="alert">{error}</p>}
      <div className="note-layout">
        <aside className="panel data-panel note-sidebar">
          <h2>Patient Information</h2>
          <div className="note-patient-summary">
            <p>
              <strong>Age:</strong>{" "}
              {patientCase.patient_age ?? "Not provided"}
            </p>
            <p>
              <strong>Sex:</strong>{" "}
              {patientCase.patient_sex || "Not provided"}
            </p>
            <p>
              <strong>Chief complaint:</strong>
              <br />
              {patientCase.chief_complaint || "Not provided"}
            </p>
            <p>
              <strong>Medical history:</strong>
              <br />
              {patientCase.history || "Not provided"}
            </p>
            <p>
              <strong>Current medications:</strong>
            </p>
            {medications.length > 0 ? (
              <ul>
                {medications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            ) : (
              <p>None listed.</p>
            )}
            <p>
              <strong>Allergies:</strong>
            </p>
            {allergies.length > 0 ? (
              <ul>
                {allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            ) : (
              <p>None listed.</p>
            )}
            <p>
              <strong>Results:</strong>
              <br />
              {patientCase.results || "No results available"}
            </p>
          </div>
        </aside>
        <section className="panel data-panel note-editor">
          <div className="soap-editor-header">
            <div>
              <h2>SOAP Note</h2>
              <p>Structured clinical documentation</p>
            </div>
            <div>
              <span className="soap-status">
                {noteStatus}
              </span>
              {dirty && !readonly && (
                <p className="soap-unsaved">
                  Unsaved changes
                </p>
              )}
            </div>
          </div>
          <nav
            className="soap-tabs"
            aria-label="SOAP note sections"
          >
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={
                  activeTab === key ? "active" : ""
                }
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <form
            className="soap-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
          >
            <fieldset
              className="soap-editable-fields"
              disabled={readonly || saving}
            >
              {activeTab === "subjective" && (
                <div className="soap-section">
                  <h2>Subjective</h2>
                  <p className="soap-helper">
                    Patient-reported symptoms and history.
                  </p>
                  <Field
                    label="Chief Complaint"
                    value={form.subjective.chiefComplaint}
                    onChange={(value) =>
                      setSection(
                        "subjective",
                        "chiefComplaint",
                        value
                      )
                    }
                  />
                  <h3>History of Present Illness</h3>
                  <p className="soap-helper">
                    OLDCARTS symptom assessment
                  </p>
                  <div className="soap-field-grid">
                    {HPI_FIELDS.map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={form.subjective.hpi[key]}
                        type={
                          key === "severity"
                            ? "number"
                            : "text"
                        }
                        min={key === "severity" ? 0 : undefined}
                        max={key === "severity" ? 10 : undefined}
                        error={
                          key === "severity"
                            ? validationErrors.hpiSeverity
                            : undefined
                        }
                        onChange={(value) =>
                          setNested(
                            "subjective",
                            "hpi",
                            key,
                            value
                          )
                        }
                      />
                    ))}
                  </div>
                  <Field
                    label="Additional HPI"
                    multiline
                    value={form.subjective.hpiNarrative}
                    onChange={(value) =>
                      setSection(
                        "subjective",
                        "hpiNarrative",
                        value
                      )
                    }
                  />
                  <h3>Review of Systems</h3>
                  <div className="soap-ros-list">
                    {ROS_SYSTEMS.map((system) => {
                      const entry = form.subjective.ros[system];
                      return (
                        <div
                          className="soap-ros-row"
                          key={system}
                        >
                          <strong>{system}</strong>
                          <select
                            value={entry.status}
                            onChange={(event) =>
                              setNested(
                                "subjective",
                                "ros",
                                system,
                                {
                                  ...entry,
                                  status: event.target.value,
                                }
                              )
                            }
                          >
                            <option>Not asked</option>
                            <option>Negative</option>
                            <option>Positive</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Relevant findings"
                            value={entry.findings}
                            onChange={(event) =>
                              setNested(
                                "subjective",
                                "ros",
                                system,
                                {
                                  ...entry,
                                  findings: event.target.value,
                                }
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                  <h3>Patient History</h3>
                  <Field
                    label="Past Medical History"
                    multiline
                    value={form.subjective.medicalHistory}
                    onChange={(value) =>
                      setSection(
                        "subjective",
                        "medicalHistory",
                        value
                      )
                    }
                  />
                  <Field
                    label="Past Surgical History"
                    multiline
                    value={form.subjective.surgicalHistory}
                    onChange={(value) =>
                      setSection(
                        "subjective",
                        "surgicalHistory",
                        value
                      )
                    }
                  />
                  <h3>Current Medications</h3>
                  {form.subjective.currentMedications.map(
                    (item) => (
                      <div
                        className="soap-repeat-card"
                        key={item.id}
                      >
                        <div className="soap-field-grid">
                          <Field
                            label="Medication"
                            value={item.name}
                            onChange={(value) =>
                              changeItem(
                                "subjective",
                                "currentMedications",
                                item.id,
                                { name: value }
                              )
                            }
                          />
                          <Field
                            label="Dose / Route / Frequency"
                            value={item.details}
                            onChange={(value) =>
                              changeItem(
                                "subjective",
                                "currentMedications",
                                item.id,
                                { details: value }
                              )
                            }
                          />
                        </div>
                        <RemoveButton
                          label="Remove medication"
                          onClick={() =>
                            deleteItem(
                              "subjective",
                              "currentMedications",
                              item.id
                            )
                          }
                        />
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      addItem(
                        "subjective",
                        "currentMedications",
                        newCurrentMedication()
                      )
                    }
                  >
                    + Add Current Medication
                  </button>
                  <h3>Allergies</h3>
                  {form.subjective.allergies.map((item) => (
                    <div
                      className="soap-repeat-card"
                      key={item.id}
                    >
                      <div className="soap-field-grid">
                        <Field
                          label="Substance"
                          value={item.substance}
                          onChange={(value) =>
                            changeItem(
                              "subjective",
                              "allergies",
                              item.id,
                              { substance: value }
                            )
                          }
                        />
                        <Field
                          label="Reaction"
                          value={item.reaction}
                          onChange={(value) =>
                            changeItem(
                              "subjective",
                              "allergies",
                              item.id,
                              { reaction: value }
                            )
                          }
                        />
                        <SelectField
                          label="Severity"
                          value={item.severity}
                          options={[
                            "Unknown",
                            "Mild",
                            "Moderate",
                            "Severe",
                          ]}
                          onChange={(value) =>
                            changeItem(
                              "subjective",
                              "allergies",
                              item.id,
                              { severity: value }
                            )
                          }
                        />
                      </div>
                      <RemoveButton
                        label="Remove allergy"
                        onClick={() =>
                          deleteItem(
                            "subjective",
                            "allergies",
                            item.id
                          )
                        }
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      addItem(
                        "subjective",
                        "allergies",
                        newAllergy()
                      )
                    }
                  >
                    + Add Allergy
                  </button>
                  <h3>Family History</h3>
                  {form.subjective.familyHistory.map(
                    (item) => (
                      <div
                        className="soap-repeat-card"
                        key={item.id}
                      >
                        <div className="soap-field-grid">
                          <Field
                            label="Relative"
                            value={item.relative}
                            onChange={(value) =>
                              changeItem(
                                "subjective",
                                "familyHistory",
                                item.id,
                                { relative: value }
                              )
                            }
                          />
                          <Field
                            label="Condition"
                            value={item.condition}
                            onChange={(value) =>
                              changeItem(
                                "subjective",
                                "familyHistory",
                                item.id,
                                { condition: value }
                              )
                            }
                          />
                        </div>
                        <RemoveButton
                          label="Remove family history"
                          onClick={() =>
                            deleteItem(
                              "subjective",
                              "familyHistory",
                              item.id
                            )
                          }
                        />
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      addItem(
                        "subjective",
                        "familyHistory",
                        newFamilyHistory()
                      )
                    }
                  >
                    + Add Family History
                  </button>
                  <h3>Social History</h3>
                  <div className="soap-field-grid">
                    {[
                      ["tobacco", "Tobacco"],
                      ["alcohol", "Alcohol"],
                      ["drugs", "Drug Use"],
                      ["occupation", "Occupation"],
                      ["livingSituation", "Living Situation"],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        value={
                          form.subjective.socialHistory[key]
                        }
                        onChange={(value) =>
                          setNested(
                            "subjective",
                            "socialHistory",
                            key,
                            value
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "objective" && (
                <div className="soap-section">
                  <h2>Objective</h2>
                  <p className="soap-helper">
                    Document measurements and examination findings.
                  </p>
                  <h3>Vital Signs</h3>
                  <div className="soap-field-grid">
                    {VITAL_FIELDS.map(
                      ([key, label, min, max]) => (
                        <Field
                          key={key}
                          label={label}
                          type="number"
                          step="any"
                          min={min}
                          max={max}
                          value={vitals[key]}
                          error={validationErrors[key]}
                          onChange={(value) =>
                            setNested(
                              "objective",
                              "vitals",
                              key,
                              value
                            )
                          }
                        />
                      )
                    )}
                    <label className="soap-field">
                      <span>BMI (kg/m²)</span>
                      <input
                        type="text"
                        value={bmi}
                        readOnly
                        placeholder="Calculated automatically"
                      />
                    </label>
                  </div>
                  <h3>Physical Examination</h3>
                  <p className="soap-helper">
                    Document physical examination findings.
                  </p>
                  {EXAM_SYSTEMS.map((system) => {
                    const entry =
                      form.objective.physicalExam[system];
                    return (
                      <div
                        className="soap-repeat-card"
                        key={system}
                      >
                        <strong>{system}</strong>
                        <SelectField
                          label="Examination Status"
                          value={entry.status}
                          options={[
                            "Not examined",
                            "Normal",
                            "Abnormal",
                            "Unable to assess",
                          ]}
                          onChange={(value) =>
                            setNested(
                              "objective",
                              "physicalExam",
                              system,
                              { ...entry, status: value }
                            )
                          }
                        />
                        <Field
                          label="Findings"
                          multiline
                          value={entry.findings}
                          onChange={(value) =>
                            setNested(
                              "objective",
                              "physicalExam",
                              system,
                              { ...entry, findings: value }
                            )
                          }
                        />
                      </div>
                    );
                  })}
                  <h3>Results Reviewed</h3>
                  {[
                    ["labs", "Laboratory Results"],
                    ["imaging", "Imaging"],
                    ["ekg", "EKG"],
                    ["other", "Other Tests"],
                  ].map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      multiline
                      value={form.objective.results[key]}
                      onChange={(value) =>
                        setNested(
                          "objective",
                          "results",
                          key,
                          value
                        )
                      }
                    />
                  ))}
                </div>
              )}
              {activeTab === "assessment" && (
                <div className="soap-section">
                  <h2>Assessment</h2>
                  <p className="soap-helper">
                    Document diagnoses and clinical reasoning.
                  </p>
                  <h3>Diagnoses / Problems</h3>
                  {form.assessment.diagnoses.map((item) => {
                    const linked = form.plan.problems.some(
                      (problem) =>
                        problem.diagnosisId === item.id
                    );
                    return (
                      <div
                        className="soap-repeat-card"
                        key={item.id}
                      >
                        <div className="soap-field-grid">
                          <Field
                            label="Diagnosis / Problem"
                            value={item.name}
                            onChange={(value) =>
                              changeItem(
                                "assessment",
                                "diagnoses",
                                item.id,
                                { name: value }
                              )
                            }
                          />
                          <Field
                            label="ICD-10 Code"
                            value={item.icd10}
                            onChange={(value) =>
                              changeItem(
                                "assessment",
                                "diagnoses",
                                item.id,
                                { icd10: value }
                              )
                            }
                          />
                          <SelectField
                            label="Status"
                            value={item.status}
                            options={[
                              "New",
                              "Stable",
                              "Improving",
                              "Worsening",
                              "Resolved",
                            ]}
                            onChange={(value) =>
                              changeItem(
                                "assessment",
                                "diagnoses",
                                item.id,
                                { status: value }
                              )
                            }
                          />
                        </div>
                        {linked && (
                          <p className="soap-helper">
                            This diagnosis is linked to a plan.
                            Remove or reassign that plan before
                            deleting the diagnosis.
                          </p>
                        )}
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={linked}
                          onClick={() =>
                            deleteItem(
                              "assessment",
                              "diagnoses",
                              item.id
                            )
                          }
                        >
                          Remove Diagnosis
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      addItem(
                        "assessment",
                        "diagnoses",
                        newDiagnosis()
                      )
                    }
                  >
                    + Add Diagnosis
                  </button>
                  <Field
                    label="Differential Diagnoses"
                    multiline
                    value={form.assessment.differential}
                    onChange={(value) =>
                      setSection(
                        "assessment",
                        "differential",
                        value
                      )
                    }
                  />
                  <Field
                    label="Clinical Reasoning"
                    multiline
                    value={form.assessment.reasoning}
                    onChange={(value) =>
                      setSection(
                        "assessment",
                        "reasoning",
                        value
                      )
                    }
                  />
                </div>
              )}
              {activeTab === "plan" && (
                <div className="soap-section">
                  <h2>Plan</h2>
                  <p className="soap-helper">
                    Document proposed care by diagnosis.
                  </p>
                  {form.plan.problems.map((item, index) => (
                    <div
                      className="soap-repeat-card"
                      key={item.id}
                    >
                      <h3>Problem Plan {index + 1}</h3>
                      <label className="soap-field">
                        <span>Assessment Problem</span>
                        <select
                          value={item.diagnosisId}
                          onChange={(event) =>
                            changePlan(item.id, {
                              diagnosisId: event.target.value,
                            })
                          }
                        >
                          <option value="">
                            Select diagnosis
                          </option>
                          {form.assessment.diagnoses.map(
                            (diagnosis) => (
                              <option
                                key={diagnosis.id}
                                value={diagnosis.id}
                              >
                                {diagnosis.name ||
                                  "Unnamed diagnosis"}
                                {diagnosis.icd10
                                  ? ` (${diagnosis.icd10})`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </label>
                      <h4>Proposed Tests</h4>
                      {item.tests.map((test) => (
                        <div
                          className="soap-repeat-card"
                          key={test.id}
                        >
                          <div className="soap-field-grid">
                            <SelectField
                              label="Category"
                              value={test.category}
                              options={[
                                "Lab",
                                "Imaging",
                                "EKG",
                                "Other",
                              ]}
                              onChange={(value) =>
                                changePlanChild(
                                  item.id,
                                  "tests",
                                  test.id,
                                  { category: value }
                                )
                              }
                            />
                            <Field
                              label="Test"
                              value={test.name}
                              onChange={(value) =>
                                changePlanChild(
                                  item.id,
                                  "tests",
                                  test.id,
                                  { name: value }
                                )
                              }
                            />
                            <Field
                              label="Reason"
                              value={test.reason}
                              onChange={(value) =>
                                changePlanChild(
                                  item.id,
                                  "tests",
                                  test.id,
                                  { reason: value }
                                )
                              }
                            />
                          </div>
                          <RemoveButton
                            label="Remove Test"
                            onClick={() =>
                              removePlanChild(
                                item.id,
                                "tests",
                                test.id
                              )
                            }
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          addPlanChild(
                            item.id,
                            "tests",
                            newTest()
                          )
                        }
                      >
                        + Add Test
                      </button>
                      <h4>Proposed Medications</h4>
                      {item.medications.map((medication) => (
                        <div
                          className="soap-repeat-card"
                          key={medication.id}
                        >
                          <div className="soap-field-grid">
                            {[
                              ["drug", "Drug"],
                              ["dose", "Dose"],
                              ["route", "Route"],
                              ["frequency", "Frequency"],
                              ["duration", "Duration"],
                              ["refills", "Refills"],
                            ].map(([key, label]) => (
                              <Field
                                key={key}
                                label={label}
                                value={medication[key]}
                                onChange={(value) =>
                                  changePlanChild(
                                    item.id,
                                    "medications",
                                    medication.id,
                                    { [key]: value }
                                  )
                                }
                              />
                            ))}
                          </div>
                          <RemoveButton
                            label="Remove Medication"
                            onClick={() =>
                              removePlanChild(
                                item.id,
                                "medications",
                                medication.id
                              )
                            }
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          addPlanChild(
                            item.id,
                            "medications",
                            newMedication()
                          )
                        }
                      >
                        + Add Medication
                      </button>
                      <Field
                        label="Procedures"
                        multiline
                        value={item.procedures}
                        onChange={(value) =>
                          changePlan(item.id, {
                            procedures: value,
                          })
                        }
                      />
                      <Field
                        label="Referrals"
                        multiline
                        value={item.referrals}
                        onChange={(value) =>
                          changePlan(item.id, {
                            referrals: value,
                          })
                        }
                      />
                      <Field
                        label="Patient Education"
                        multiline
                        value={item.education}
                        onChange={(value) =>
                          changePlan(item.id, {
                            education: value,
                          })
                        }
                      />
                      <div className="soap-field-grid">
                        <Field
                          label="Follow-Up: When"
                          value={item.followUpWhen}
                          onChange={(value) =>
                            changePlan(item.id, {
                              followUpWhen: value,
                            })
                          }
                        />
                        <Field
                          label="Follow-Up: Why"
                          value={item.followUpWhy}
                          onChange={(value) =>
                            changePlan(item.id, {
                              followUpWhy: value,
                            })
                          }
                        />
                      </div>
                      <RemoveButton
                        label="Remove Problem Plan"
                        onClick={() =>
                          deleteItem(
                            "plan",
                            "problems",
                            item.id
                          )
                        }
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      form.assessment.diagnoses.length === 0
                    }
                    onClick={() =>
                      addItem(
                        "plan",
                        "problems",
                        newPlan(
                          form.assessment.diagnoses[0]?.id ||
                            ""
                        )
                      )
                    }
                  >
                    + Add Problem Plan
                  </button>
                  <Field
                    label="General Patient Instructions"
                    multiline
                    value={form.plan.generalInstructions}
                    onChange={(value) =>
                      setSection(
                        "plan",
                        "generalInstructions",
                        value
                      )
                    }
                  />
                </div>
              )}
            </fieldset>
            <div className="soap-form-actions">
              <div className="soap-section-navigation">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={tabIndex === 0}
                  onClick={() => {
                    setActiveTab(TABS[tabIndex - 1][0]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={tabIndex === TABS.length - 1}
                  onClick={() => {
                    setActiveTab(TABS[tabIndex + 1][0]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Next
                </button>
              </div>
              <div className="form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={navigateToCase}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={
                    saving ||
                    readonly ||
                    !patientCase.assignment_id
                  }
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
