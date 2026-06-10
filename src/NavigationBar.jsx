import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = ({
  allLength,
  importantLength,
  missedLength,
  trashLength,
  customLists,
  onAddCategory,
  createCategoryOpened,
  deleteMode,
  onToggleDelete,
  onDeleteCustomList,
  showSettings,
  setShowSettings,
  missedToTrashDays,
  setMissedToTrashDays,
  trashToDeleteDays,
  setTrashToDeleteDays,
  darkMode,
  setDarkMode
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="nav-container"
      aria-label="Main navigation"
    >
      {/* Top Bar */}
      <div className="nav-top">
        <h1 className="nav-title">Momentum List</h1>
        <button
          type="button"
          className="nav-settings-button"
          aria-label="Open settings"
          aria-expanded={showSettings}
          aria-controls="settings-panel"
          onClick={() => window.dispatchEvent(new Event("openSettings"))}
        >
          <img
            src="https://www.reshot.com/preview-assets/icons/WNMFS4GD3E/settings-WNMFS4GD3E.svg"
            alt=""
            aria-hidden="true"
            className="nav-settings"
          />
        </button>
      </div>

      {/* Settings Box */}
      <div
        className={`create-box ${showSettings ? "open" : ""}`}
        inert={!showSettings}
        aria-hidden={!showSettings}
        id="settings-panel"
        aria-labelledby="settings-title"
      >
        <div className="create-header">
          <h2 id="settings-title">Settings</h2>
          <button
            type="button"
            className="close-x"
            aria-label="Close settings"
            onClick={() => setShowSettings(false)}
          >
            ✕
          </button>
        </div>

        <div className="create-body">
          <div className="option">
            <label
              htmlFor="missed-trash-slider"
              className="settings-label"
            >
              Days Until Missed Items Are Trashed
              <span className="settings-value">
                {missedToTrashDays === 11 ? "Disabled" : missedToTrashDays}
              </span>
            </label>
            <input
              id="missed-trash-slider"
              type="range"
              min="0"
              max="11"
              value={missedToTrashDays}
              aria-valuetext={
                missedToTrashDays === 11
                  ? "Disabled"
                  : `${missedToTrashDays} days`
              }
              onChange={(e) => setMissedToTrashDays(Number(e.target.value))}
            />
          </div>

          <div className="option">
            <label
              htmlFor="trash-deleted-slider"
              className="settings-label"
            >
              Days Until Trash Items Are Deleted
              <span className="settings-value">
                {trashToDeleteDays === 11 ? "Disabled" : trashToDeleteDays}
              </span>
            </label>
            <input
              id="trash-deleted-slider"
              type="range"
              min="0"
              max="11"
              value={trashToDeleteDays}
              aria-valuetext={
                trashToDeleteDays === 11
                  ? "Disabled"
                  : `${trashToDeleteDays} days`
              }
              onChange={(e) => setTrashToDeleteDays(Number(e.target.value))}
            />
          </div>

          <div className="option">
          <label className="settings-toggle">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
            Dark Mode
          </label>
          </div>
        </div>
      </div>

      {/* Main Options */}
      <div className="nav-scroll">
        <div className={`nav-section ${customLists.length === 0 && "centered"}`}>
          <Link 
            className={`nav-item ${isActive("/") ? "active" : ""} ${customLists.length === 0 && "centered"}`} 
            to="/"
            onClick={() => window.dispatchEvent(new Event("closeAll"))}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">📄</span>
            <span className="nav-label">All</span>
            <span
              className="nav-count no-delete"
              aria-label={`${allLength} items`}
            >
              {allLength}
            </span>
          </Link>

          <Link 
            className={`nav-item ${isActive("/important") ? "active" : ""} ${customLists.length === 0 && "centered"}`} 
            to="/important"
            onClick={() => window.dispatchEvent(new Event("closeAll"))}
            aria-current={isActive("/important") ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">⭐</span>
            <span className="nav-label">Important</span>
            <span
              className="nav-count no-delete"
              aria-label={`${importantLength} Items`}
            >
              {importantLength}
            </span>
          </Link>

          <Link 
            className={`nav-item ${isActive("/missed") ? "active" : ""} ${customLists.length === 0 && "centered"}`} 
            to="/missed"
            onClick={() => window.dispatchEvent(new Event("closeAll"))}
            aria-current={isActive("/missed") ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">⏰</span>
            <span className="nav-label">Missed</span>
            <span
              className="nav-count no-delete"
              aria-label={`${missedLength} Items`}
            >
              {missedLength}
            </span>
          </Link>

          <Link 
            className={`nav-item ${isActive("/trash") ? "active" : ""} ${customLists.length === 0 && "centered"}`} 
            to="/trash"
            onClick={() => window.dispatchEvent(new Event("closeAll"))}
            aria-current={isActive("/trash") ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">🗑️</span>
            <span className="nav-label">Trash</span>
            <span
              className="nav-count no-delete"
              aria-label={`${trashLength} Items`}
            >
              {trashLength}
            </span>
          </Link>

          {/* Add Button */}
          <button
            type="button"
            className={`nav-item ${createCategoryOpened ? "active" : ""} ${customLists.length === 0 && "centered"}`}
            aria-expanded={createCategoryOpened}
            aria-controls="create-category-panel"
            onClick={onAddCategory}
          >
            <span className="nav-icon plus-icon" aria-hidden="true">➕</span>
            <span className="nav-label">Add</span>
          </button>

          {/* Delete Button */}
          {customLists.length > 0 && (
            <button
              type="button"
              className={`nav-item delete-btn ${deleteMode ? "active" : ""}`}
              aria-pressed={deleteMode}
              onClick={(e) => {
                onToggleDelete(e);
                window.dispatchEvent(new Event("closeAll"));
              }}
            >
              <span className="nav-icon x-icon" aria-hidden="true">➕</span>
              <span className="nav-label">Delete</span>
            </button>
          )}
        </div>

        {/* Divider */}
        {customLists.length > 0 && <div className="nav-divider"></div>}

        {/* Custom Options */}
        <div className="nav-section custom-section">
          {customLists.map((list) => {
            const path = `/custom/${encodeURIComponent(list.name)}`;

            const handleClick = (e) => {
              if (!deleteMode) return;
            
              e.preventDefault();
            
              const encoded = encodeURIComponent(list.name);
              const isCurrent = location.pathname === `/custom/${encoded}`;
            
              onDeleteCustomList(list.name);
            
              if (isCurrent) {
                navigate("/");
              }
            };            

            return (
              <Link
                key={list.name}
                to={path}
                onClick={(e) => {
                  handleClick(e);
                  window.dispatchEvent(new Event("closeAll"));
                }}
                className={`
                  nav-item
                  custom-item
                  ${isActive(path) ? "active" : ""}
                  ${list.deleting ? "deleting" : ""}
                `}
                aria-current={isActive(path) ? "page" : undefined}
              >
                <span
                  className="nav-icon"
                  aria-hidden="true"
                >
                  {list.icon}
                </span>
                <span className="nav-label">{list.name}</span>
                <span
                  className={`nav-count ${deleteMode ? "delete-x" : "no-delete"}`}
                  aria-label={deleteMode ? "Delete Sign" : `${list.items.length} Items`}
                >
                  {deleteMode ? (
                    <span aria-hidden="true">✕</span>
                  ) : (
                    list.items.length
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
