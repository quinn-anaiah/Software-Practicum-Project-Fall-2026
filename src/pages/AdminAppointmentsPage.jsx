import Icon from "../components/Icon";
import { adminAppointments } from "../lib/adminData";

function AdminAppointmentsPage() {
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Schedule management</p>
          <h1>Appointments</h1>
          <p>Keep today’s care schedule moving smoothly.</p>
        </div>
        <button className="primary-button" type="button">
          <Icon name="plus" size={18} /> New appointment
        </button>
      </section>
      <section className="panel appointment-page-panel">
        <div className="calendar-strip">
          <button type="button">‹</button>
          <strong>September 2026</strong>
          <div>
            {["15 Tue", "16 Wed", "17 Thu", "18 Fri", "19 Sat"].map(
              (day, index) => (
                <button
                  className={
                    index === 2
                      ? "calendar-day calendar-day--active"
                      : "calendar-day"
                  }
                  key={day}
                  type="button"
                >
                  {day}
                </button>
              ),
            )}
          </div>
          <button type="button">›</button>
        </div>
        <div className="appointment-page-list">
          {adminAppointments.map((appointment) => (
            <article
              className="appointment-row"
              key={`${appointment.date}-${appointment.time}-${appointment.patient}`}
            >
              <time>{appointment.time}</time>
              <span className="appointment-row__line" />
              <div>
                <h3>{appointment.patient}</h3>
                <p>
                  {appointment.type} · {appointment.provider}
                </p>
              </div>
              <span
                className={`status-badge status-badge--${appointment.status.toLowerCase()}`}
              >
                {appointment.status}
              </span>
              <button className="row-action" type="button">
                <Icon name="arrow" size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export default AdminAppointmentsPage;
