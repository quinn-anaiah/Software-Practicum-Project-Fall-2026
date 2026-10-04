import {useState} from "react"; //This allows React to tract what the user is doing on the page and update the page accordingly.
import Icon from "../components/Icon";

//This is the component that will display the administration page for patients. 
// It will display a list of patients and allow the user to search, review, and manage the people in their practice.
//The information inside the parentheses is called "props" and is used to pass data from a parent component to a child component.
//For patients, its an array of patient objects that will be displayed in the table.
//For onNavigate, its a function that will be called when the user clicks on the "Add patient" button or the arrow button in the table. Its allows us to move between pages in the application.
//For setSelectedPatientId, its a function that will be called when the user clicks on the arrow button in the table. It allows us to set the selected patient id in the parent component so that we can display the correct patient detail page.

function AdminPatientsPage({ patients, onNavigate, setSelectedPatientId }) {
  //We are using the useState hook to create a state variable called "searchText" and a function called "setSearchText". 
  // That will allow us to update the search term when the user types in the search input.
  //SearchText stores whatever the user types in the search input and setSearchText updates the searchText state variable.
  const [searchText, setSearchText] = useState("");

  //Search function that creates a new list containing only the patients whose name or id includes the search term.
  //This function goes through each patient and creates a new list of patients that match the search term. It returns that list to be displayed in the table.
  function getFilteredPatients() {
    const matchingPatients = [];
    //We need to convert the text to lowercase.
    const lowerSearchText = searchText.toLowerCase();

    //Go through each patient one at a time.
    for (const patient of patients) {
      //Get the patient name and id and convert them to lowercase.
      const patientName = patient.name.toLowerCase();
      const patientId = patient.id.toLowerCase();

      //get the provider name and convert it to lowercase.
      const patientProvider = patient.provider.toLowerCase();

      //Check if the search term is included in the patient name, id, or provider name. 
      // If it is, add the patient to the matchingPatients array.

      const nameMatches = patientName.includes(lowerSearchText);
      const idMatches = patientId.includes(lowerSearchText);
      const providerMatches = patientProvider.includes(lowerSearchText);

      if (nameMatches || idMatches || providerMatches) {
        //Add this patient to the matching list.
        matchingPatients.push(patient);
      }
  }
  //Return the list of matching patients.
  return matchingPatients;
}

//filteredPatients is a variable that stores the list of patients that match the search term.
const filteredPatients = getFilteredPatients();

//Search box change handler that updates the searchText state variable when the user types in the search input.
function handleSearchChange(event) {
  //event.target is the search box input element and event.target.value is the value of the input element.
  const newSearchText = event.target.value;
  //We need to save that text into React State.
  //This will cause the component to re-render and display the filtered list of patients.
  setSearchText(newSearchText);
}

//Clear search box handler that clears the search input and resets the searchText state variable.
function clearSearch() {
  setSearchText("");
}

//The main part of the component that renders the page. It displays the page heading, the search box, and the table of patients.
  return (
    <div className="dashboard-page content-page">
      <PageHeading
        eyebrow="Patient directory"
        title="Patients"
        description="Search, review, and manage the people in your practice."
        action="Add patient"
        onNavigate={onNavigate}
      />
      <section className="panel data-panel">
        <div className="data-panel__toolbar">
          {/* Display how many patients are in the list. */}
          {/* This is a dynamic value that will update when the user searches for patients. */}
          <strong>{filteredPatients.length} patients</strong>
          <label className="table-search">
            <Icon name="search" size={16} />
            <input
              placeholder="Search patients"
              type="search"
              value={searchText}
              onChange={handleSearchChange}
            />

          </label>
          {/* If the searchText state variable is not empty, 
          display the "Clear search" button. */}
          {searchText !== "" && (
            <button
              className="outline-button"
              type="button"
              onClick={clearSearch}
            >
              Clear search
            </button>
          )}

        </div>
        {/* The actual patient table that displays the list of patients. */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Provider</th>
                <th>Last visit</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            {/* The table body that displays the list of patients. */}
            <tbody>
              {/* If we found no mathching patients, display a message to the user. */}
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <p>No patients found.</p>
                  </td>
                </tr>
              ) : null}
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  {/* Display the patient avatar, name, and id. */}
                  <td>
                    <span
                      className={`patient-avatar patient-avatar--${patient.color}`}
                    >
                      {patient.initials}
                    </span>
                    {/* Patient name and id are displayed in a span element. 
                    The patient name is displayed in a strong element and the patient id is displayed in a small element. */}
                    <span>
                      <strong>{patient.name}</strong>
                      <small>{patient.id}</small>
                    </span>
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.provider}</td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${patient.status.toLowerCase()}`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <button
                      aria-label={`Open ${patient.name}`}
                      className="row-action"
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        onNavigate("patientDetail");
                      }}
                    >
                      <Icon name="arrow" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action, onNavigate }) {
  return (
    <section className="page-heading">
      <div>
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={() => onNavigate("addPatient")}
      >
        <Icon name="plus" size={18} /> {action}
      </button>
    </section>
  );
}
export default AdminPatientsPage;
