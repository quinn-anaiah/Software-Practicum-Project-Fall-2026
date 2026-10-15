import { useEffect, useState } from "react";
import { fetchPatientCareTeam } from "../lib/api";

function PatientCareTeamPage({ user }) {
  const [careTeam, setCareTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadCareTeam() {
      try {
        setIsLoading(true);
        const result = await fetchPatientCareTeam();
        if (isCurrent) setCareTeam(result);
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load care team.",
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    loadCareTeam();
    return () => {
      isCurrent = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-page content-page">
        <p className="directory-loading">Loading your care team…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page content-page">
        <section className="panel directory-error">{error}</section>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My health</p>
          <h1>Care Team</h1>
          <p>Physicians, nurses, and clinical staff assigned to your care.</p>
        </div>
      </section>

      {careTeam.length === 0 ? (
        <section className="panel" style={{ padding: "30px", textAlign: "center" }}>
          <p className="empty-list-message">No care team members assigned yet.</p>
        </section>
      ) : (
        <section className="team-grid" style={{ marginTop: "24px" }}>
          {careTeam.map((member, index) => {
            const provider = member.provider || {};
            const firstName = provider.first_name || "Assigned";
            const lastName = provider.last_name || "Provider";
            const fullName = `Dr. ${firstName} ${lastName}`.trim();
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            const subroleName = member.subrole?.name || "Care Provider";
            const avatarColorClass = index % 2 === 0 ? "team-avatar--teal" : "team-avatar--purple";

            return (
              <article className="panel team-card" key={member.id}>
                <div className={`team-avatar ${avatarColorClass}`}>
                  {initials || "DR"}
                </div>
                
                {member.is_primary ? (
                  <span className="preview-label" style={{ marginBottom: "10px", display: "inline-block" }}>
                    Primary Provider
                  </span>
                ) : (
                  <p className="section-label">{subroleName}</p>
                )}

                <h2>{fullName}</h2>
                <p>Role: {subroleName}</p>
                <p>Careflow ID: {provider.careflow_id || "Not listed"}</p>
                
                
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default PatientCareTeamPage;