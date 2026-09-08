import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [patient, setPatient] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPatient() {
      try {
        const response = await fetch('/api/patients/john-doe')
        const data = await response.json()

        if (!response.ok) throw new Error(data.message)
        setPatient(data)
      } catch (requestError) {
        setError(requestError.message || 'Could not load the patient.')
      }
    }

    loadPatient()
  }, [])

  return (
    <main className="app-shell">
      <p className="eyebrow">EMR database connection</p>
      <h1>Patient lookup</h1>
      <p className="intro">Loading the local PostgreSQL record for John Doe.</p>

      {patient && (
        <article className="patient-card" aria-label="John Doe patient record">
          <span className="status">Connected</span>
          <h2>{patient.first_name} {patient.last_name}</h2>
          <dl>
            <div><dt>Patient ID</dt><dd>{patient.id}</dd></div>
            <div><dt>Record created</dt><dd>{new Date(patient.created_at).toLocaleString()}</dd></div>
          </dl>
        </article>
      )}

      {error && (
        <section className="error" role="alert">
          <h2>Could not load John Doe</h2>
          <p>{error}</p>
          <p>Confirm PostgreSQL is running and that <code>emr_db.test_patients</code> contains a John Doe record.</p>
        </section>
      )}

      {!patient && !error && <p className="loading">Contacting local database…</p>}
    </main>
  )
}

export default App
