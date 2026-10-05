import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { fetchStudentCases } from "../lib/api";

function StudentOverviewPage({
  user,
  onNavigate,
}) {
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState("");

  const firstName = user.name?.split(" ")[0] || "Student";

  useEffect(() => {
    let isCurrent = true;

    async function loadCases() {
      try {
        setCasesLoading(true);
        setCasesError("");

        const data = await fetchStudentCases();

        if (isCurrent) {
          setCases(data);
        }
      } catch (error) {
        if (isCurrent) {
          setCasesError(error.message);
        }
      } finally {
        if (isCurrent) {
          setCasesLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      isCurrent = false;
    };
  }, []);

  function openCase(patientCase) {
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }

  if (casesLoading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading cases...</p>
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{casesError}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My cases</p>

          <h1>Welcome back, {firstName}</h1>

          <p>
            Review available patient scenarios and documentation.
          </p>
        </div>
      </section>

      <section className="panel data-panel">
        {cases.length === 0 ? (
          <p>No cases available yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Case</th>
                  <th scope="col">Chief complaint</th>
                  <th scope="col">Encounter status</th>
                  <th scope="col" aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {cases.map((patientCase) => (
                  <tr key={patientCase.id}>
                    <td>
                      <strong>{patientCase.patient_name}</strong>
                      <p>-</p>
                      <strong>{patientCase.title}</strong>
                    </td>

                    <td>
                      {patientCase.chief_complaint}
                    </td>

                    <td>
                      <span className="status-badge">
                        {patientCase.encounter_status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="row-action"
                        type="button"
                        aria-label={`Open ${patientCase.patient_name}`}
                        onClick={() => openCase(patientCase)}
                      >
                        <Icon name="arrow" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentOverviewPage;