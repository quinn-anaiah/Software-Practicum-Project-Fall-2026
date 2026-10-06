import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { fetchStudentClass } from "../lib/api";

function StudentClassDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classroomId = searchParams.get("id");

  const [classroom, setClassroom] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!classroomId) {
      setErrorMessage("No class selected.");
      setStatus("error");
      return undefined;
    }

    let ignore = false;

    fetchStudentClass(classroomId)
      .then((data) => {
        if (ignore) return;
        setClassroom(data);
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
  }, [classroomId]);

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Class detail</p>
          <h1>{classroom?.full_name || "Class"}</h1>
          {classroom && (
            <p>
              {classroom.short_name} · {classroom.term}
            </p>
          )}
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/student/classes")}
          type="button"
        >
          <Icon name="arrow" size={16} /> Back to classes
        </button>
      </section>

      {status === "loading" && (
        <section className="panel data-panel">
          <p>Loading class...</p>
        </section>
      )}

      {status === "error" && (
        <section className="panel data-panel">
          <p role="alert">{errorMessage}</p>
        </section>
      )}

      {status === "ready" && classroom && (
        <>
          <section className="panel data-panel">
            <dl className="detail-list">
              <div>
                <dt>Discipline</dt>
                <dd>{classroom.discipline || "Not set"}</dd>
              </div>
              <div>
                <dt>CRN</dt>
                <dd>{classroom.crn}</dd>
              </div>
              <div>
                <dt>Room</dt>
                <dd>{classroom.room || "Not set"}</dd>
              </div>
              <div>
                <dt>Term</dt>
                <dd>{classroom.term}</dd>
              </div>
              <div>
                <dt>Instructor</dt>
                <dd>
                  {classroom.instructors.length
                    ? classroom.instructors.join(", ")
                    : "Not assigned"}
                </dd>
              </div>
              <div>
                <dt>Enrolled since</dt>
                <dd>
                  {classroom.enrolledAt
                    ? new Date(classroom.enrolledAt).toLocaleDateString()
                    : "Not available"}
                </dd>
              </div>
              <div>
                <dt>Your group</dt>
                <dd>{classroom.group ? classroom.group.name : "No group yet"}</dd>
              </div>
              <div>
                <dt>Groupmates</dt>
                <dd>
                  {classroom.group?.teammates.length
                    ? classroom.group.teammates.join(", ")
                    : "None yet"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel data-panel">
            <p className="section-label">Cases</p>
            <h2>Cases for this class</h2>
            <p>
              Cases assigned in this class will appear here once they are linked
              to the class.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default StudentClassDetailPage;