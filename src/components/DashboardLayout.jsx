import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

function DashboardLayout({
  activePage,
  children,
  navItems,
  onLogout,
  onNavigate,
  user,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  function handleMenuClick() {
    if (window.innerWidth <= 640) {
      setIsSidebarOpen(true);
      return;
    }
    setIsSidebarPinned((isPinned) => !isPinned);
  }

  function handleNavigate(pageId) {
    onNavigate(pageId);
    setIsSidebarOpen(false);
  }
  return (
    <div
      className={`dashboard-layout ${isSidebarPinned ? "dashboard-layout--sidebar-pinned" : ""}`}
    >
      <Sidebar
        activePage={activePage}
        isOpen={isSidebarOpen}
        isPinned={isSidebarPinned}
        navItems={navItems}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
      />
      <div className="dashboard-layout__content">
        <Header
          onLogout={onLogout}
          onMenuClick={handleMenuClick}
          sidebarPinned={isSidebarPinned}
          user={user}
        />
        <main>{children}</main>
      </div>
      {isSidebarOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}
    </div>
  );
}

export default DashboardLayout;
