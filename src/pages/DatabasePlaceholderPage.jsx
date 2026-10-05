function DatabasePlaceholderPage({ description, eyebrow, title }) {
  return (
    <div className="dashboard-page content-page database-placeholder-page">
      <section className="page-heading">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <section className="panel database-placeholder">
        <span className="database-placeholder__icon">↗</span>
        <div>
          <p className="section-label">Database-ready workspace</p>
          <h2>No records to display yet</h2>
          <p>
            This view will populate from Careflow records as the related
            Supabase tables and API endpoints are connected.
          </p>
        </div>
      </section>
    </div>
  );
}

export default DatabasePlaceholderPage;
