import { useState } from "react";
import AppRouter from "./routes/AppRouter";

const sessionKey = "careflow-demo-user";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem(sessionKey);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function handleLogin(authenticatedUser) {
    sessionStorage.setItem(sessionKey, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    setUser(null);
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
