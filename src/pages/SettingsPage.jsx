function SettingsPage({ user }) {
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Account settings</p>
          <h1>Settings</h1>
          <p>Manage your profile, communication preferences, and security.</p>
        </div>
      </section>
      <section className="settings-grid">
        <article className="panel settings-profile">
          <span className="settings-avatar">{user.initials}</span>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="status-badge status-badge--active">
              {user.role}
            </span>
          </div>
          <button className="outline-button" type="button">
            Edit profile
          </button>
        </article>
        <SettingsRow
          title="Notifications"
          description="Choose how you receive appointment reminders and account updates."
          action="Manage"
        />
        <SettingsRow
          title="Privacy & security"
          description="Update your password and review active sessions."
          action="Review"
        />
        <SettingsRow
          title="Accessibility"
          description="Customize display, contrast, and motion preferences."
          action="Customize"
        />
      </section>
    </div>
  );
}
function SettingsRow({ title, description, action }) {
  return (
    <article className="panel settings-row">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="outline-button" type="button">
        {action}
      </button>
    </article>
  );
}
export default SettingsPage;
