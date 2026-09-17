import Icon from "../components/Icon";
import { patientProfiles } from "../lib/patientData";

function PatientDashboardPage({ user }) {
  const profile = patientProfiles[user.id];
  if (!profile) return null;

  return (
    <div className="dashboard-page patient-dashboard">
      <section className="page-heading">
        <div>
          <p className="section-label">My health</p>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Stay on top of your care in one secure place.</p>
        </div>
        <button className="primary-button" type="button">
          <Icon name="calendar" size={18} /> Book appointment
        </button>
      </section>
      <section className="care-banner">
        <div>
          <span className="care-banner__label">Your care team</span>
          <h2>{profile.provider.name}</h2>
          <p>{profile.provider.specialty}</p>
        </div>
        <span className="provider-avatar">{profile.provider.initials}</span>
        <button className="care-banner__button" type="button">
          Message provider <Icon name="arrow" size={15} />
        </button>
      </section>
      <section className="patient-dashboard__grid">
        <article className="panel next-visit">
          <div className="panel__header">
            <div>
              <p className="section-label">Upcoming appointment</p>
              <h2>{profile.nextAppointment.type}</h2>
            </div>
            <span className="visit-icon">
              <Icon name="calendar" />
            </span>
          </div>
          <div className="visit-details">
            <div>
              <span>Date</span>
              <strong>{profile.nextAppointment.date}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{profile.nextAppointment.time}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{profile.nextAppointment.location}</strong>
            </div>
          </div>
          <button className="text-button" type="button">
            View appointment details <Icon name="arrow" size={15} />
          </button>
        </article>
        <article className="panel medication-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">My medications</p>
              <h2>Current medications</h2>
            </div>
            <button className="text-button" type="button">
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="medication-list">
            {profile.medications.map((medication) => (
              <div className="medication" key={medication.name}>
                <span
                  className={`medication__pill medication__pill--${medication.color}`}
                >
                  Rx
                </span>
                <div>
                  <h3>{medication.name}</h3>
                  <p>{medication.dosage}</p>
                </div>
                <span>{medication.refill}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="patient-dashboard__grid patient-dashboard__grid--lower">
        <article className="panel health-card">
          <p className="section-label">Health snapshot</p>
          <h2>Your care at a glance</h2>
          <div className="health-stats">
            <div>
              <strong>2</strong>
              <span>Active medications</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Upcoming visit</span>
            </div>
            <div>
              <strong>✓</strong>
              <span>Preventive care on track</span>
            </div>
          </div>
        </article>
        <article className="panel updates-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Recent updates</p>
              <h2>From your care team</h2>
            </div>
            <button
              aria-label="More update options"
              className="more-button"
              type="button"
            >
              •••
            </button>
          </div>
          <div className="updates-list">
            {profile.updates.map((update) => (
              <div className="update" key={update.title}>
                <span className="update__dot" />
                <div>
                  <h3>{update.title}</h3>
                  <p>{update.detail}</p>
                </div>
                <time>{update.date}</time>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default PatientDashboardPage;
