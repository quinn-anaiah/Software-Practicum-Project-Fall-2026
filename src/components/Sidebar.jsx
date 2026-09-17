import Icon from "./Icon";

function Sidebar({
  activePage,
  isOpen,
  isPinned,
  navItems,
  onClose,
  onNavigate,
}) {
  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : ""} ${isPinned ? "sidebar--pinned" : ""}`}
    >
      <div className="sidebar__brand">
        <span className="brand-mark">+</span>
        <span>Careflow</span>
        <button
          aria-label="Close navigation"
          className="sidebar__close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
      </div>
      <nav aria-label="Primary navigation" className="sidebar__nav">
        {navItems.map((item) => (
          <button
            className={`nav-item ${item.id === activePage ? "nav-item--active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__bottom">
        <button
          className={`nav-item ${activePage === "settings" ? "nav-item--active" : ""}`}
          onClick={() => onNavigate("settings")}
          type="button"
        >
          <Icon name="settings" />
          <span>Settings</span>
        </button>
        <div className="help-card">
          <span>Need help?</span>
          <p>Visit the help center or contact support.</p>
          <button type="button">
            Get support <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
