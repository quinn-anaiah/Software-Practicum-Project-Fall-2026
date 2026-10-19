import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchStudentCases,
  fetchStudentNote,
  fetchStudentOrders,
} from "../lib/api";
// Calls the submission endpoint directly so this page does not require
// a new named export in src/lib/api.js.
async function submitStudentDocumentation(assignmentId) {
  const accessToken = sessionStorage.getItem("careflow-access-token");
  if (!accessToken) {
    throw new Error("No active session. Please sign in again.");
  }

  const response = await fetch("/api/student/submissions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignmentId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Unable to submit documentation.");
  }
  return payload;
}

// Display Helpers
function display(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not documented";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "Not documented";
}
function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}
function asObject(value) { return isObject(value) ? value : {}; }
function asArray(value) { return Array.isArray(value) ? value : []; }
function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}
function PreviewField({ label, value }) {
  return (
    <div className="soap-preview-field">
      <strong>{label}</strong>
      <p>{display(value)}</p>
    </div>
  );
}
function PreviewSection({ title, children }) {
  return (
    <section className="soap-preview-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function PreviewSubheading({ children }) {
  return (
    <h4 className="soap-preview-subheading">
      {children}
    </h4>
  );
}
// Subjective
const HPI_FIELDS = [
  ["onset", "Onset"],
  ["location", "Location"],
  ["duration", "Duration"],
  ["character", "Character"],
  ["aggravating", "Aggravating Factors"],
  ["alleviating", "Alleviating Factors"],
  ["radiation", "Radiation"],
  ["timing", "Timing"],
  ["severity", "Severity"],
];
function SubjectivePreview({ data }) {
  if (typeof data === "string") {
    return (
      <PreviewSection title="S — Subjective">
        <p>{display(data)}</p>
      </PreviewSection>
    );
  }
  const subjective = asObject(data);
  const hpi = asObject(subjective.hpi);
  const ros = asObject(
    subjective.ros || subjective.reviewOfSystems
  );
  const social = asObject(subjective.socialHistory);
  const medications = asArray(
    subjective.currentMedications
  );
  const allergies = asArray(subjective.allergies);
  const familyHistory = asArray(subjective.familyHistory);
  return (
    <PreviewSection title="S — Subjective">
      <PreviewField
        label="Chief Complaint"
        value={subjective.chiefComplaint}
      />
      <PreviewSubheading>
        History of Present Illness
      </PreviewSubheading>
      <div className="soap-preview-grid">
        {HPI_FIELDS.map(([key, label]) => {
          let value = hpi[key];
          if (key === "aggravating") {
            value =
              value || hpi.aggravatingFactors;
          }
          if (key === "alleviating") {
            value =
              value || hpi.relievingFactors;
          }
          return (
            <PreviewField
              key={key}
              label={label}
              value={value}
            />
          );
        })}
      </div>
      {hasValue(
        subjective.hpiNarrative ||
          hpi.additionalHistory
      ) && (
        <PreviewField
          label="Additional HPI"
          value={
            subjective.hpiNarrative ||
            hpi.additionalHistory
          }
        />
      )}
      <PreviewSubheading>
        Review of Systems
      </PreviewSubheading>
      {Object.keys(ros).length === 0 ? (
        <p className="soap-preview-muted">
          Not documented
        </p>
      ) : (
        <div className="soap-preview-ros">
          {Object.entries(ros).map(
            ([system, entry]) => {
              const item = asObject(entry);
              const status =
                item.status || "Not asked";
              return (
                <div
                  className="soap-preview-ros-row"
                  key={system}
                >
                  <strong>{system}</strong>
                  <span
                    className={
                      "soap-preview-indicator " +
                      (status === "Positive"
                        ? "positive"
                        : status === "Negative"
                        ? "negative"
                        : "")
                    }
                  >
                    {status}
                  </span>
                  <span>
                    {hasValue(item.findings)
                      ? item.findings
                      : "—"}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}
      <PreviewSubheading>
        Medical and Surgical History
      </PreviewSubheading>
      <div className="soap-preview-grid">
        <PreviewField
          label="Past Medical History"
          value={subjective.medicalHistory}
        />
        <PreviewField
          label="Past Surgical History"
          value={subjective.surgicalHistory}
        />
      </div>
      <PreviewSubheading>
        Current Medications
      </PreviewSubheading>
      {medications.length === 0 ? (
        <p className="soap-preview-muted">
          No medications documented
        </p>
      ) : (
        <ul className="soap-preview-list">
          {medications.map((medication, index) => {
            const item = asObject(medication);
            return (
              <li key={item.id || index}>
                {typeof medication === "string"
                  ? medication
                  : (
                      <>
                        <strong>
                          {display(item.name)}
                        </strong>
                        {hasValue(item.details) &&
                          ` — ${item.details}`}
                      </>
                    )}
              </li>
            );
          })}
        </ul>
      )}
      <PreviewSubheading>
        Allergies
      </PreviewSubheading>
      {allergies.length === 0 ? (
        <p className="soap-preview-muted">
          No allergies documented
        </p>
      ) : (
        <div className="soap-preview-grid">
          {allergies.map((allergy, index) => {
            const item = asObject(allergy);
            return (
              <div
                className="soap-preview-item"
                key={item.id || index}
              >
                {typeof allergy === "string" ? (
                  <strong>{allergy}</strong>
                ) : (
                  <>
                    <strong>
                      {display(item.substance)}
                    </strong>
                    <p>
                      Reaction: {display(item.reaction)}
                    </p>
                    <p>
                      Severity: {display(item.severity)}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      <PreviewSubheading>
        Family History
      </PreviewSubheading>
      {familyHistory.length === 0 ? (
        <p className="soap-preview-muted">
          Not documented
        </p>
      ) : (
        <ul className="soap-preview-list">
          {familyHistory.map((history, index) => {
            const item = asObject(history);
            return (
              <li key={item.id || index}>
                {typeof history === "string"
                  ? history
                  : `${display(item.relative)} — ${display(
                      item.condition
                    )}`}
              </li>
            );
          })}
        </ul>
      )}
      <PreviewSubheading>
        Social History
      </PreviewSubheading>
      <div className="soap-preview-grid">
        <PreviewField
          label="Tobacco"
          value={social.tobacco}
        />
        <PreviewField
          label="Alcohol"
          value={social.alcohol}
        />
        <PreviewField
          label="Drug Use"
          value={social.drugs}
        />
        <PreviewField
          label="Occupation"
          value={social.occupation}
        />
        <PreviewField
          label="Living Situation"
          value={social.livingSituation}
        />
      </div>
    </PreviewSection>
  );
}
// Objective
const VITAL_FIELDS = [
  ["systolic", "Systolic BP", "mmHg"],
  ["diastolic", "Diastolic BP", "mmHg"],
  ["heartRate", "Heart Rate", "bpm"],
  ["respiratoryRate", "Respiratory Rate", "/min"],
  ["temperature", "Temperature", "°C"],
  ["oxygenSaturation", "Oxygen Saturation", "%"],
  ["height", "Height", "cm"],
  ["weight", "Weight", "kg"],
  ["pain", "Pain Score", "/10"],
];
function ObjectivePreview({ data }) {
  if (typeof data === "string") {
    return (
      <PreviewSection title="O — Objective">
        <p>{display(data)}</p>
      </PreviewSection>
    );
  }
  const objective = asObject(data);
  const vitals = asObject(objective.vitals);
  const exam = asObject(objective.physicalExam);
  const results = objective.results;
  const heightValue =
    vitals.height || vitals.heightCm;
  const weightValue =
    vitals.weight || vitals.weightKg;
  const height = Number(heightValue) / 100;
  const weight = Number(weightValue);
  const bmi =
    height > 0 && weight > 0
      ? (weight / (height * height)).toFixed(1)
      : null;
  return (
    <PreviewSection title="O — Objective">
      <PreviewSubheading>
        Vital Signs
      </PreviewSubheading>
      <div className="soap-preview-vitals">
        {VITAL_FIELDS.map(([key, label, unit]) => {
          let value = vitals[key];
          if (key === "systolic") {
            value = value || vitals.systolicBP;
          }
          if (key === "diastolic") {
            value = value || vitals.diastolicBP;
          }
          if (key === "height") {
            value = value || vitals.heightCm;
          }
          if (key === "weight") {
            value = value || vitals.weightKg;
          }
          if (key === "pain") {
            value = value || vitals.painScore;
          }
          return (
            <div
              className="soap-preview-vital"
              key={key}
            >
              <span>{label}</span>
              <strong>
                {hasValue(value)
                  ? `${value} ${unit}`
                  : "—"}
              </strong>
            </div>
          );
        })}
        <div className="soap-preview-vital">
          <span>BMI</span>
          <strong>
            {bmi ? `${bmi} kg/m²` : "—"}
          </strong>
        </div>
      </div>
      <PreviewSubheading>
        Physical Examination
      </PreviewSubheading>
      {Object.keys(exam).length === 0 ? (
        <p className="soap-preview-muted">
          Not documented
        </p>
      ) : (
        <div className="soap-preview-exam">
          {Object.entries(exam).map(
            ([system, entry]) => {
              const item = asObject(entry);
              const status =
                typeof entry === "string"
                  ? "Documented"
                  : item.status || "Not examined";
              const findings =
                typeof entry === "string"
                  ? entry
                  : item.findings;
              return (
                <div
                  className="soap-preview-exam-row"
                  key={system}
                >
                  <strong>{system}</strong>
                  <div>
                    <span className="soap-preview-indicator">
                      {status}
                    </span>
                    {hasValue(findings) && (
                      <p>{findings}</p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
      <PreviewSubheading>
        Results Reviewed
      </PreviewSubheading>
      {typeof results === "string" ? (
        <p>{display(results)}</p>
      ) : (
        <div className="soap-preview-grid">
          {[
            ["labs", "Laboratory Results"],
            ["imaging", "Imaging"],
            ["ekg", "EKG"],
            ["other", "Other Tests"],
          ].map(([key, label]) => (
            <PreviewField
              key={key}
              label={label}
              value={asObject(results)[key]}
            />
          ))}
        </div>
      )}
    </PreviewSection>
  );
}
// Assessment
function AssessmentPreview({ data }) {
  if (typeof data === "string") {
    return (
      <PreviewSection title="A — Assessment">
        <p>{display(data)}</p>
      </PreviewSection>
    );
  }
  const assessment = asObject(data);
  const diagnoses = asArray(assessment.diagnoses);
  return (
    <PreviewSection title="A — Assessment">
      <PreviewSubheading>
        Diagnoses / Problems
      </PreviewSubheading>
      {diagnoses.length === 0 ? (
        <p className="soap-preview-muted">
          No diagnoses documented
        </p>
      ) : (
        <div className="soap-preview-diagnoses">
          {diagnoses.map((diagnosis, index) => (
            <div
              className="soap-preview-diagnosis"
              key={diagnosis.id || index}
            >
              <div>
                <strong>
                  {index + 1}.{" "}
                  {display(
                    diagnosis.name ||
                      diagnosis.diagnosis
                  )}
                </strong>
                {hasValue(diagnosis.icd10) && (
                  <p>ICD-10: {diagnosis.icd10}</p>
                )}
              </div>
              <span className="soap-preview-indicator">
                {diagnosis.status || "Not specified"}
              </span>
            </div>
          ))}
        </div>
      )}
      <PreviewSubheading>
        Differential Diagnoses
      </PreviewSubheading>
      <p>
        {display(
          assessment.differential ||
            assessment.differentialDiagnoses
        )}
      </p>
      <PreviewSubheading>
        Clinical Reasoning
      </PreviewSubheading>
      <p>
        {display(
          assessment.reasoning ||
            assessment.clinicalReasoning
        )}
      </p>
    </PreviewSection>
  );
}
// Plan
function PlanPreview({ data, diagnoses }) {
  if (typeof data === "string") {
    return (
      <PreviewSection title="P — Plan">
        <p>{display(data)}</p>
      </PreviewSection>
    );
  }
  const plan = asObject(data);
  const problems = asArray(plan.problems);
  function diagnosisName(diagnosisId) {
    const diagnosis = diagnoses.find(
      (item) => item.id === diagnosisId
    );
    return diagnosis
      ? diagnosis.name ||
          diagnosis.diagnosis ||
          "Unnamed diagnosis"
      : "Unassigned problem";
  }
  return (
    <PreviewSection title="P — Plan">
      {problems.length === 0 ? (
        <p className="soap-preview-muted">
          No problem-based plans documented
        </p>
      ) : (
        problems.map((problem, index) => (
          <div
            className="soap-preview-plan"
            key={problem.id || index}
          >
            <h4>
              {index + 1}.{" "}
              {diagnosisName(problem.diagnosisId)}
            </h4>
            <PreviewSubheading>
              Proposed Tests
            </PreviewSubheading>
            {asArray(problem.tests).length === 0 ? (
              <p className="soap-preview-muted">
                None documented
              </p>
            ) : (
              <ul className="soap-preview-list">
                {problem.tests.map((test, testIndex) => (
                  <li key={test.id || testIndex}>
                    <strong>
                      {display(test.name)}
                    </strong>
                    {hasValue(test.category) &&
                      ` (${test.category})`}
                    {hasValue(test.reason) &&
                      ` — ${test.reason}`}
                  </li>
                ))}
              </ul>
            )}
            <PreviewSubheading>
              Proposed Medications
            </PreviewSubheading>
            {asArray(problem.medications).length === 0 ? (
              <p className="soap-preview-muted">
                None documented
              </p>
            ) : (
              <div className="soap-preview-medications">
                {problem.medications.map(
                  (medication, medicationIndex) => (
                    <div
                      className="soap-preview-item"
                      key={
                        medication.id || medicationIndex
                      }
                    >
                      <strong>
                        {display(medication.drug)}
                      </strong>
                      <div className="soap-preview-grid">
                        <PreviewField
                          label="Dose"
                          value={medication.dose}
                        />
                        <PreviewField
                          label="Route"
                          value={medication.route}
                        />
                        <PreviewField
                          label="Frequency"
                          value={medication.frequency}
                        />
                        <PreviewField
                          label="Duration"
                          value={medication.duration}
                        />
                        <PreviewField
                          label="Refills"
                          value={medication.refills}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            <div className="soap-preview-grid">
              <PreviewField
                label="Procedures"
                value={problem.procedures}
              />
              <PreviewField
                label="Referrals"
                value={problem.referrals}
              />
              <PreviewField
                label="Patient Education"
                value={problem.education}
              />
              <PreviewField
                label="Follow-Up: When"
                value={
                  problem.followUpWhen ||
                  problem.followUp
                }
              />
              <PreviewField
                label="Follow-Up: Why"
                value={problem.followUpWhy}
              />
            </div>
          </div>
        ))
      )}
      <PreviewSubheading>
        General Patient Instructions
      </PreviewSubheading>
      <p>
        {display(
          plan.generalInstructions ||
            plan.patientEducation
        )}
      </p>
    </PreviewSection>
  );
}
// Complete Note Preview
function SOAPNotePreview({ note, patientCase }) {
  const content = asObject(note.content);
  const assessment = asObject(content.assessment);
  return (
    <article className="soap-preview-document">
      <header className="soap-preview-document-header">
        <div>
          <p className="section-label">
            Clinical Documentation
          </p>
          <h2>SOAP Note</h2>
          <p>{patientCase.title}</p>
        </div>
        <span className="soap-status">
          {note.status || "Draft"}
        </span>
      </header>
      <div className="soap-preview-patient-header">
        <PreviewField
          label="Patient"
          value={patientCase.patient_name}
        />
        <PreviewField
          label="Age"
          value={patientCase.patient_age}
        />
        <PreviewField
          label="Sex"
          value={patientCase.patient_sex}
        />
        <PreviewField
          label="Case ID"
          value={patientCase.id}
        />
      </div>
      <SubjectivePreview data={content.subjective} />
      <ObjectivePreview data={content.objective} />
      <AssessmentPreview data={content.assessment} />
      <PlanPreview
        data={content.plan}
        diagnoses={asArray(assessment.diagnoses)}
      />
    </article>
  );
}
// Submission Page
export default function StudentSubmissionPage({
  onNavigate,
}) {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("id");
  const [patientCase, setPatientCase] =
    useState(null);
  const [note, setNote] = useState(null);
  const [orders, setOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isCurrent = true;
    async function loadSubmission() {
      setLoading(true);
      setError("");
      setPatientCase(null);
      setNote(null);
      setOrders([]);
      if (!caseId) {
        setLoading(false);
        return;
      }
      try {
        const cases = await fetchStudentCases();
        if (!isCurrent) return;
        const selectedCase = cases.find(
          (item) =>
            String(item.id) === String(caseId)
        );
        if (!selectedCase) return;
        setPatientCase(selectedCase);
        if (selectedCase.assignment_id) {
          const [savedNote, savedOrders] = await Promise.all([
            fetchStudentNote(selectedCase.assignment_id),
            fetchStudentOrders(selectedCase.assignment_id),
          ]);
          if (!isCurrent) return;
          setNote(savedNote || null);
          setOrders(savedOrders || []);
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError.message ||
              "Unable to load submission."
          );
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }
    loadSubmission();
    return () => {
      isCurrent = false;
    };
  }, [caseId]);
  async function handleSubmit() {
    if (!patientCase?.assignment_id || !note || submitting) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      // const submittedNote = await submitStudentDocumentation(
      //   patientCase.assignment_id
      // );
      // setNote(submittedNote);
      await submitStudentDocumentation(patientCase.assignment_id);
      // The submit route returns a message, not the note, so reload the note
      // to show its new "Pending Review" status.
      setNote(await fetchStudentNote(patientCase.assignment_id));
      const savedOrders = await fetchStudentOrders(patientCase.assignment_id);
      setOrders(savedOrders || []);
      setSuccess("Documentation submitted for instructor review.");
    } catch (submitError) {
      setError(submitError.message || "Unable to submit documentation.");
    } finally {
      setSubmitting(false);
    }
  }

  function goBackToCase() {
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }
  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">
          Loading documentation preview...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{error}</p>
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
  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
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
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Submission · Case {patientCase.id}
          </p>
          <h1>Review & Submit</h1>
          <p>
            {patientCase.patient_name} ·{" "}
            {patientCase.title}
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={goBackToCase}
        >
          Back to case
        </button>
      </section>
      <section className="panel data-panel">
        <div className="soap-preview-topbar">
          <div>
            <h2>SOAP Note Preview</h2>
            <p>
              Review your saved clinical documentation
              before submitting it to your instructor.
            </p>
          </div>
        </div>
        {!note ? (
          <div className="soap-preview-empty">
            <h3>No SOAP note saved</h3>
            <p>
              Create and save a SOAP note before
              reviewing your submission.
            </p>
          </div>
        ) : (
          <SOAPNotePreview
            note={note}
            patientCase={patientCase}
          />
        )}
      </section>

      <section className="panel data-panel">
        <div className="soap-preview-topbar">
          <div>
            <h2>Saved Orders</h2>
            <p>Review the orders saved for this patient encounter.</p>
          </div>
        </div>
        {orders.length === 0 ? (
          <p>No orders saved for this encounter.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Order</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_type}</td>
                    <td>{order.order_name}</td>
                    <td><span className="status-badge">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel data-panel">
        <h2>Submit for Instructor Review</h2>
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
        {note?.status === "Pending Review" ? (
          <p role="status">This documentation has been submitted and is awaiting instructor review.</p>
        ) : note?.status === "Approved" ? (
          <p>This documentation has been approved.</p>
        ) : (
          <>
            <p>Submitting locks the SOAP note and saved orders until an instructor returns the work for corrections.</p>
            <button
              className="primary-button"
              type="button"
              disabled={!note || submitting || !["Draft", "Returned"].includes(note?.status)}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit for Instructor Review"}
            </button>
            {!note && <p>Save a SOAP note before submitting.</p>}
          </>
        )}
      </section>
    </div>
  );
}
