import React from "react";
import "./ItemList.css";

import {
  isPastItem,
  isPastDay
} from "./CodeSnippets";

const Trash = ({
  items,
  onClearAll,
  onRestore,
  getDateLabel
}) => {
  /* Group Into Date Headers */
  const grouped = items.reduce((acc, item) => {
    acc[item.dateKey] = acc[item.dateKey] || [];
    acc[item.dateKey].push(item);
    return acc;
  }, {});

  /* Elements */
  return (
    <div className="items-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Trash <span aria-hidden="true">🗑️</span>
        </h1>
        <button
          className="create-btn trashing"
          onClick={onClearAll}
          aria-label="Permanently clear trash"
        >
        <img
          className="broom-clear"
          src="https://i.imgur.com/06TUgRs.png"
          alt=""
          aria-hidden="true"
        />
          <span>Clear All</span>
        </button>
      </div>

      {/* Items Container */}
      <div className="items-container">
        {Object.keys(grouped)
          .sort()
          .map((dateKey) => (
            <div key={dateKey}>
              <h2 className={`date-header ${isPastDay(dateKey) ? "past" : ""}`}>
                {getDateLabel(dateKey)}
              </h2>

              {/* Items */}
              {grouped[dateKey].map((item) => (
                <div
                  key={item.id}
                  className={`item ${item.moving ? "item-move" : "animate-in"} ${item.clearing ? "deleting" : ""} ${item.restoring ? "restoring" : ""} ${isPastItem(item) ? "past" : ""}`}
                >
                  {/* Left */}
                  <div className="item-left">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-date">{item.time}</p>
                  </div>

                  {/* Right */}
                  <div className="item-right restore">
                    <button
                      type="button"
                      className="restore-btn"
                      aria-label={`Restore ${item.name}`}
                      onClick={() => onRestore(item.id)}
                    >
                      <img
                        src="https://i.imgur.com/rVfRsKl.png"
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Trash;
