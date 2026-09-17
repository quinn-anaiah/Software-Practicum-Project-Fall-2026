import Icon from "./Icon";

function Header({ onMenuClick, onLogout, sidebarPinned, user }) {
  return (
    <header className="topbar">
      <button
        aria-label={
          sidebarPinned ? "Collapse navigation" : "Pin navigation open"
        }
        aria-pressed={sidebarPinned}
        className="menu-button"
        onClick={onMenuClick}
        type="button"
      >
        <Icon name="menu" />
      </button>
      <label className="search-box">
        <Icon name="search" size={18} />
        <input
          aria-label="Search"
          placeholder="Search patients, appointments..."
          type="search"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="topbar__actions">
        <button
          aria-label="Notifications"
          className="icon-button"
          type="button"
        >
          <Icon name="bell" />
          <span className="notification-dot" />
        </button>
        <button
          aria-label="Sign out"
          className="account-button"
          onClick={onLogout}
          type="button"
        >
          <span className="avatar">{user.initials}</span>
          <span className="account-button__name">{user.name}</span>
          <span className="account-button__role">{user.role} · Sign out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
