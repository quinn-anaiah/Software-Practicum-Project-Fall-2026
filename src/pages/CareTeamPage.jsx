import Icon from "../components/Icon";
import { patientProfiles } from "../lib/patientData";

function CareTeamPage({ user }) {
  const { careTeam } = patientProfiles[user.id];
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My care team</p>
          <h1>People supporting your care</h1>
          <p>Reach the right person whenever you have a question.</p>
        </div>
        <button className="outline-button" type="button">
          Care preferences
        </button>
      </section>
      <section className="team-grid">
        {careTeam.map((member) => (
          <article className="panel team-card" key={member.name}>
            <span className={`team-avatar team-avatar--${member.color}`}>
              {member.initials}
            </span>
            <p className="section-label">{member.note}</p>
            <h2>{member.name}</h2>
            <p>{member.role}</p>
            <button className="text-button" type="button">
              Send a message <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
      </section>
      <section className="panel contact-panel">
        <div>
          <p className="section-label">After-hours care</p>
          <h2>Need help outside regular hours?</h2>
          <p>
            Use the nurse line for non-emergency medical questions. For
            emergencies, call 911.
          </p>
        </div>
        <button className="primary-button" type="button">
          Contact nurse line
        </button>
      </section>
    </div>
  );
}
export default CareTeamPage;
