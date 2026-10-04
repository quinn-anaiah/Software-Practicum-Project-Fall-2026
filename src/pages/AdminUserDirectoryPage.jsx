import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { fetchAdminUsers } from "../lib/api";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function AdminUserDirectoryPage() {
  const [directory, setDirectory] = useState({ users: [], stats: null });
  const [queryInput, setQueryInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadDirectory() {
      setStatus("loading");
      setError("");
      try {
        const result = await fetchAdminUsers(activeQuery);
        if (isCurrent) {
          setDirectory(result);
          setStatus("ready");
        }
      } catch (directoryError) {
        if (isCurrent) {
          setError(
            directoryError instanceof Error
              ? directoryError.message
              : "Unable to load the user directory.",
          );
          setStatus("error");
        }
      }
    }

    loadDirectory();
    return () => {
      isCurrent = false;
    };
  }, [activeQuery]);

  const selectedUser =
    directory.users.find((user) => user.id === selectedUserId) ||
    directory.users[0];
  const largestRoleCount = Math.max(
    ...(directory.stats?.roleBreakdown || []).map((role) => role.count),
    1,
  );

  function handleSearch(event) {
    event.preventDefault();
    setActiveQuery(queryInput.trim());
  }

  return (
    <div className="dashboard-page content-page admin-directory-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Administration · protected directory</p>
          <h1>Global user search</h1>
          <p>
            Search account profiles, role assignments, and identifiers across
            Careflow. Passwords and secret credentials are never displayed.
          </p>
        </div>
      </section>

      <form className="directory-search" onSubmit={handleSearch}>
        <Icon name="search" size={18} />
        <input
          aria-label="Search all users"
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Search name, Careflow ID, UTEP ID, email, role, or subrole"
          value={queryInput}
        />
        <button className="primary-button" type="submit">
          Search <Icon name="arrow" size={15} />
        </button>
      </form>

      {status === "error" && (
        <section className="panel directory-error" role="alert">
          {error}
        </section>
      )}

      {directory.stats && (
        <section className="directory-metrics">
          <article className="panel">
            <span>Total accounts</span>
            <strong>{directory.stats.totalUsers}</strong>
            <small>Supabase Auth users</small>
          </article>
          <article className="panel">
            <span>New this week</span>
            <strong>{directory.stats.newThisWeek}</strong>
            <small>Created in the last seven days</small>
          </article>
          <article className="panel">
            <span>Discipline assigned</span>
            <strong>{directory.stats.usersWithSubrole}</strong>
            <small>Profiles with a subrole</small>
          </article>
        </section>
      )}

      <section className="directory-layout">
        <article className="panel directory-table-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Live account directory</p>
              <h2>
                {activeQuery
                  ? `Search results · ${directory.users.length}`
                  : "All accounts"}
              </h2>
            </div>
            <span className="directory-live-indicator">● Live database</span>
          </div>
          {status === "loading" ? (
            <p className="directory-loading">Loading account records…</p>
          ) : directory.users.length === 0 ? (
            <p className="directory-loading">No user records match this search.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Subrole</th>
                    <th>UTEP ID</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {directory.users.map((user) => (
                    <tr
                      className={
                        selectedUser?.id === user.id
                          ? "directory-row--selected"
                          : ""
                      }
                      key={user.id}
                    >
                      <td>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </td>
                      <td>
                        <span className="status-badge status-badge--active">
                          {user.role || "Unassigned"}
                        </span>
                      </td>
                      <td>{user.subrole || "—"}</td>
                      <td>{user.utepId || "—"}</td>
                      <td>
                        <button
                          aria-label={`View ${user.name}`}
                          className="row-action"
                          onClick={() => setSelectedUserId(user.id)}
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
        </article>

        <aside className="directory-sidebar">
          <article className="panel role-chart">
            <p className="section-label">Role distribution</p>
            <h2>Account mix</h2>
            {(directory.stats?.roleBreakdown || []).map((role) => (
              <div className="role-chart__row" key={role.name}>
                <span>{role.name}</span>
                <i>
                  <b style={{ width: `${(role.count / largestRoleCount) * 100}%` }} />
                </i>
                <strong>{role.count}</strong>
              </div>
            ))}
          </article>

          <article className="panel account-detail">
            <p className="section-label">Selected account</p>
            {selectedUser ? (
              <>
                <h2>{selectedUser.name}</h2>
                <p className="account-detail__email">{selectedUser.email}</p>
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>{selectedUser.role || "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Subrole</dt>
                    <dd>{selectedUser.subrole || "Not assigned"}</dd>
                  </div>
                  <div>
                    <dt>UTEP ID</dt>
                    <dd>{selectedUser.utepId || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Careflow ID</dt>
                    <dd>{selectedUser.careflowId || "Not created"}</dd>
                  </div>
                  <div>
                    <dt>Auth user ID</dt>
                    <dd>{selectedUser.id}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(selectedUser.createdAt)}</dd>
                  </div>
                </dl>
                <p className="account-detail__note">
                  Passwords, password hashes, and authentication tokens are
                  never available in this directory.
                </p>
              </>
            ) : (
              <p className="directory-loading">Select an account to view its profile.</p>
            )}
          </article>
        </aside>
      </section>
    </div>
  );
}

export default AdminUserDirectoryPage;
