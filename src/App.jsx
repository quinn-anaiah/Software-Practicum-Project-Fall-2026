import { useEffect, useState } from "react";
import { fetchCurrentUser } from "./lib/api";
import AppRouter from "./routes/AppRouter";

const sessionKey = "careflow-user";
const tokenKey = "careflow-access-token";

function App() {
  const [user, setUser] = useState(() => {
    if (!sessionStorage.getItem(tokenKey)) return null;
    const savedUser = sessionStorage.getItem(sessionKey);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isRestoringSession, setIsRestoringSession] = useState(() =>
    Boolean(sessionStorage.getItem(tokenKey)),
  );

  useEffect(() => {
    const accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) return undefined;

    let isCurrent = true;

    async function restoreSession() {
      try {
        const currentUser = await fetchCurrentUser(accessToken);
        if (isCurrent) {
          sessionStorage.setItem(sessionKey, JSON.stringify(currentUser));
          setUser(currentUser);
        }
      } catch {
        if (isCurrent) {
          sessionStorage.removeItem(sessionKey);
          sessionStorage.removeItem(tokenKey);
          setUser(null);
        }
      } finally {
        if (isCurrent) setIsRestoringSession(false);
      }
    }

    restoreSession();
    return () => {
      isCurrent = false;
    };
  }, []);

  function handleLogin(authenticatedSession) {
    const { accessToken, ...authenticatedUser } = authenticatedSession;
    sessionStorage.setItem(sessionKey, JSON.stringify(authenticatedUser));
    sessionStorage.setItem(tokenKey, accessToken);
    setUser(authenticatedUser);
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem(tokenKey);
    setUser(null);
  }

  if (isRestoringSession) {
    return <main className="app-session-loading">Restoring your session…</main>;
  }

  return (
    <AppRouter
      onLogin={handleLogin}
      onLogout={handleLogout}
      user={user}
    />
  );
}

export default App;
