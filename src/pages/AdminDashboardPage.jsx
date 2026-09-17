import Icon from "../components/Icon";
import { adminPatients } from "../lib/adminData";

const schedule = [
  {
    time: "09:00",
    name: "Maya Anderson",
    detail: "Annual wellness visit",
    initials: "MA",
    color: "purple",
  },
  {
    time: "10:30",
    name: "James Peterson",
    detail: "Follow-up consultation",
    initials: "JP",
    color: "gold",
  },
  {
    time: "11:15",
    name: "Diana Wells",
    detail: "Lab results review",
    initials: "DW",
    color: "blue",
  },
];

function AdminDashboardPage({ user }) {
  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Administrator workspace</p>
          <h1>Good morning, {user.name}</h1>
          <p>Here’s the latest across your practice.</p>
        </div>
        <button className="primary-button" type="button">
          <Icon name="plus" size={18} /> Add patient
        </button>
      </section>
      <section aria-label="Practice summary" className="metric-grid">
        <Metric
          label="Total patients"
          value={adminPatients.length}
          change="Demo patient directory"
          icon="patients"
          tone="teal"
        />
        <Metric
          label="Today’s appointments"
          value="12"
          change="3 remaining"
          icon="calendar"
          tone="blue"
        />
        <Metric
          label="Pending tasks"
          value="08"
          change="2 due today"
          icon="chart"
          tone="lavender"
        />
        <Metric
          label="Patient satisfaction"
          value="94%"
          change="↑ 4.2% this month"
          icon="grid"
          tone="gold"
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel schedule-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Schedule</p>
              <h2>Today’s appointments</h2>
            </div>
            <button className="text-button" type="button">
              View calendar <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="schedule-list">
            {schedule.map((appointment) => (
              <Appointment key={appointment.time} {...appointment} />
            ))}
          </div>
        </article>
        <article className="panel activity-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Practice activity</p>
              <h2>Weekly patient visits</h2>
            </div>
            <button
              aria-label="More activity options"
              className="more-button"
              type="button"
            >
              •••
            </button>
          </div>
          <div className="chart" aria-label="Weekly patient visits chart">
            <div className="chart__bars">
              {[42, 62, 48, 75, 58, 86, 70].map((height, index) => (
                <span
                  className={index === 5 ? "bar bar--active" : "bar"}
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="chart__days">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value, change, icon, tone }) {
  return (
    <article className="metric-card">
      <span className={`metric-card__icon metric-card__icon--${tone}`}>
        <Icon name={icon} />
      </span>
      <p>{label}</p>
      <h2>{value}</h2>
      <span className="metric-card__change">{change}</span>
    </article>
  );
}
function Appointment({ time, name, detail, initials, color }) {
  return (
    <div className="appointment">
      <time>
        {time}
        <span>AM</span>
      </time>
      <span className={`patient-avatar patient-avatar--${color}`}>
        {initials}
      </span>
      <div>
        <h3>{name}</h3>
        <p>{detail}</p>
      </div>
      <button
        aria-label={`Open ${name}`}
        className="appointment__arrow"
        type="button"
      >
        <Icon name="arrow" size={17} />
      </button>
    </div>
  );
}
export default AdminDashboardPage;
