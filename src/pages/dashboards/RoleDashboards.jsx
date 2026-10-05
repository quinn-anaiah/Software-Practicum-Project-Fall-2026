const dashboardContent = {
  Admin: {
    eyebrow: "Administration",
    title: "Careflow operations",
    description:
      "Manage accounts, access, and system activity as database modules are connected.",
    areas: ["User access", "Operational activity", "System configuration"],
  },
  Instructor: {
    eyebrow: "Instructor workspace",
    title: "Teaching workspace",
    description:
      "Cohort activity, scenario progress, and submitted work will load here from your assigned classrooms.",
    areas: ["Assigned classrooms", "Scenario progress", "Review queue"],
  },
  Patient: {
    eyebrow: "My health",
    title: "Your care portal",
    description:
      "Appointments, care-team information, and clinical updates will appear here once they are connected to your profile.",
    areas: ["Upcoming appointments", "Care team", "Health updates"],
  },
  Student: {
    eyebrow: "My cases",
    title: "Your learning workspace",
    description:
      "Assigned scenarios, encounter progress, and documentation requirements will appear here when an instructor assigns a case.",
    areas: ["Assigned cases", "Documentation", "Instructor feedback"],
  },
};

function RoleDashboard({ user }) {
  const content = dashboardContent[user.role] || dashboardContent.Patient;

  return (
    <div className="dashboard-page content-page role-dashboard">
      <section className="page-heading">
        <div>
          <p className="section-label">{content.eyebrow}</p>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>{content.description}</p>
        </div>
      </section>
      <section className="role-dashboard__areas">
        {content.areas.map((area) => (
          <article className="panel role-dashboard__area" key={area}>
            <p className="section-label">Database connection pending</p>
            <h2>{area}</h2>
            <p>No records to display yet.</p>
          </article>
        ))}
      </section>
      <section className="panel role-dashboard__notice">
        <span>↗</span>
        <div>
          <p className="section-label">Next integration step</p>
          <h2>{content.title} is database-ready</h2>
          <p>
            This dashboard will request only the records authorized for your
            role after its API endpoint is added.
          </p>
        </div>
      </section>
    </div>
  );
}

export default RoleDashboard;
