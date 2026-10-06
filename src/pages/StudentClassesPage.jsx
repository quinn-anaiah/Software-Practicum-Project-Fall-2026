import { useEffect, useState } from "react";
import { fetchStudentClasses } from "../lib/api";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

function StudentClassesPage() {
  const navigate = useNavigate(); 
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchStudentClasses()
      .then((data) => {
        if (ignore) return;
        setClasses(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (ignore) return;
        setErrorMessage(error.message);
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My classes</p>
          <h1>My classes</h1>
          <p>The classes you are enrolled in and the group you belong to.</p>
        </div>
      </section>

      <section className="panel data-panel">
        {status === "loading" && <p>Loading your classes...</p>}
        {status === "error" && <p role="alert">{errorMessage}</p>}
        {status === "ready" && classes.length === 0 && (
          <p>You are not enrolled in any classes yet.</p>
        )}
        {status === "ready" && classes.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>CRN</th>
                  <th>Room</th>
                  <th>Term</th>
                  <th>Group</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {classes.map((classroom) => (
                  <tr key={classroom.id}>
                    <td>
                      <strong>{classroom.full_name}</strong>
                      <small>{classroom.short_name}</small>
                    </td>
                    <td>{classroom.crn}</td>
                    <td>{classroom.room || "Not set"}</td>
                    <td>{classroom.term}</td>
                    <td>{classroom.group || "No group yet"}</td>
                    <td>
                        <button
                            aria-label={`Open ${classroom.full_name}`}
                            className="row-action"
                            onClick={() => navigate(`/student/class?id=${classroom.id}`)}
                            type="button"
                        >
                            <Icon name="arrow" size={16} />
                        </button>
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentClassesPage;