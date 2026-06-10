import React, { useState } from "react";
import "./ItemList.css";

import {
  isPastItem,
  isPastDay
} from "./CodeSnippets";

const Important = ({
  items,
  onDelete,
  onToggleStar,
  onMoveUp,
  onMoveDown,
  getDateLabel,
  createOpened
}) => {
  const [unstarring, setUnstarring] = useState({});

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
          Important <span aria-hidden="true">⭐</span>
        </h1>
        <button
          className={`create-btn ${createOpened ? "creating" : ""}`}
          onClick={() =>
            window.dispatchEvent(new Event("openCreateImportant"))
          }
        >
          <span className="plus">+</span>
          <span>Create Item</span>
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
                  className={`item ${item.moving ? "item-move" : "animate-in"} ${unstarring[item.id] ? "deleting" : ""} ${item.deleting ? "deleting" : ""} ${isPastItem(item) ? "past" : ""}`}
                >
                  {/* Left */}
                  <div className="item-left">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-date">{item.time}</p>
                  </div>

                  {/* Right */}
                  <div className="item-right">
                    <div className="arrows">
                      <button
                        type="button"
                        className="arrow up"
                        aria-label={`Move ${item.name} up`}
                        onClick={() => onMoveUp(item.id)}
                      >
                        <span aria-hidden="true">►</span>
                      </button>
                      <button
                        type="button"
                        className="arrow down"
                        aria-label={`Move ${item.name} down`}
                        onClick={() => onMoveDown(item.id)}
                      >
                        <span aria-hidden="true">►</span>
                      </button>
                    </div>

                    <div className="images">
                    <button
                      type="button"
                      className="star-btn"
                      aria-label={`Remove star from ${item.name}`}
                      onClick={() => {
                        setUnstarring((prev) => ({ ...prev, [item.id]: true }));
                        setTimeout(() => onToggleStar(item.id), 180);
                      }}
                    >
                      <img
                        className={`star ${item.unstarring ? "unstarring" : ""}`}
                        src="https://i.imgur.com/00cGYG9.png"
                        alt=""
                        aria-hidden="true"
                      />
                    </button>

                      <button
                        type="button"
                        className="trash-btn"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => onDelete(item.id)}
                      >
                        <img
                          className="trash"
                          src="https://www.reshot.com/preview-assets/icons/ELYZKXP234/trash-ELYZKXP234.svg"
                          alt=""
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Important;
