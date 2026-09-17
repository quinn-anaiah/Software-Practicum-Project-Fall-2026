import Icon from "../components/Icon";
import { patientProfiles } from "../lib/patientData";

function PatientAppointmentsPage({ user }) {
  const { appointments } = patientProfiles[user.id];
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My schedule</p>
          <h1>Appointments</h1>
          <p>Review upcoming visits and your recent care history.</p>
        </div>
        <button className="primary-button" type="button">
          <Icon name="plus" size={18} /> Book appointment
        </button>
      </section>
      <section className="patient-appointment-list">
        {appointments.map((appointment) => (
          <article
            className="panel patient-appointment"
            key={`${appointment.date}-${appointment.time}`}
          >
            <span className="date-block">
              <strong>{appointment.date.split(" ")[1]}</strong>
              <small>{appointment.date.split(" ")[0]}</small>
            </span>
            <div>
              <p className="section-label">{appointment.status}</p>
              <h2>{appointment.type}</h2>
              <p>
                {appointment.time} · {appointment.provider}
              </p>
            </div>
            <button className="outline-button" type="button">
              {appointment.status === "Upcoming"
                ? "Manage visit"
                : "View summary"}{" "}
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
export default PatientAppointmentsPage;
