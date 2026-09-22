import { useState } from "react";
import Icon from "../components/Icon";

function AdminAddUsersPage({ addPatient, onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    provider: "",
    status: "Active",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newPatient = {
      id: `P-${Date.now()}`,
      name: formData.name,
      age: formData.age,
      provider: formData.provider,
      status: formData.status,
      lastVisit: new Date().toLocaleDateString(),
      initials: formData.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      color: "blue",
    };

    addPatient(newPatient);
    onNavigate("patients");
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Patient directory</p>
          <h1>Add patient</h1>
          <p>Enter the patient's details below.</p>
        </div>
      </section>

      <section className="panel data-panel">
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              type="text"
            />
          </label>

          <label>
            Age
            <input
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              type="number"
            />
          </label>

          <label>
            Provider
            <input
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              type="text"
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onNavigate("patients")}
            >
              Cancel
            </button>
            <button className="primary-button" type="submit">
              <Icon name="plus" size={18} /> Save patient
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminAddUsersPage;
