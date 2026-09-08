import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [patients, setPatients] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await fetch('/api/patients')
        const data = await response.json()

        if (!response.ok) throw new Error(data.message)
        setPatients(data)
      } catch (requestError) {
        setError(requestError.message || 'Could not load the patient.')
      }
    }

    loadPatients()
  }, [])

  return (
    <main className="app-shell">
      <p className="eyebrow">EMR database connection</p>
      <h1>Patients</h1>
      <p className="intro">Records loaded from your local PostgreSQL database.</p>

      {patients && (
        <section className="patient-list" aria-label="Patient records">
          <span className="status">Connected · {patients.length} record{patients.length === 1 ? '' : 's'}</span>
          {patients.map((patient) => (
            <article className="patient-card" key={patient.id}>
              <h2>{patient.first_name} {patient.last_name}</h2>
              <dl>
                <div><dt>Patient ID</dt><dd>{patient.id}</dd></div>
                <div><dt>Record created</dt><dd>{new Date(patient.created_at).toLocaleString()}</dd></div>
              </dl>
            </article>
          ))}
          {patients.length === 0 && <p className="loading">No patients have been added yet.</p>}
        </section>
      )}

      {error && (
        <section className="error" role="alert">
          <h2>Could not load patients</h2>
          <p>{error}</p>
          <p>Confirm PostgreSQL is running and that <code>emr_db.test_patients</code> exists.</p>
        </section>
      )}

      {!patients && !error && <p className="loading">Contacting local database…</p>}
    </main>
  )
}

export default App
