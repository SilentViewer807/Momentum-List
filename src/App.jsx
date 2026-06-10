import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import All from "./1-All";
import Important from "./2-Important";
import Missed from "./3-Missed";
import Trash from "./4-Trash";
import Custom from "./Custom";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

import {
  getItemDateTime,
  isPastItem
} from "./CodeSnippets";

/* TOP */

/* Logic Storage */
const LS_ITEMS = "todo_items";
const LS_TRASH = "todo_trash";
const LS_CUSTOM = "todo_custom_lists";
const LS_SETTINGS = "todo_settings";

const DAY_MS = 1000 * 60 * 60 * 24;





/* HELPERS */
const isDisabled = (days) => days === 11;

const getMissedAt = (item) => {
  const d = getItemDateTime(item);
  d.setHours(0, 0, 0, 0); // normalize to start of day
  return d.getTime();
};

const getEffectiveTrashAt = (item, days) => {
  if (isDisabled(days)) return Infinity;
  return getMissedAt(item) + toMs(days);
};

const getEffectiveDeleteAt = (trashAt, days) => {
  if (isDisabled(days)) return undefined;
  return trashAt + toMs(days);
};

/* Date Handling */
const formatDateKey = (date) => date.toISOString().split("T")[0];

const formatHourTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const format12HourFromTimeInput = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDateLabel = (dateKey) => {
  const yesterday = new Date();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  yesterday.setDate(today.getDate() - 1);

  if (dateKey === formatDateKey(yesterday)) return "Yesterday";
  if (dateKey === formatDateKey(today)) return "Today";
  if (dateKey === formatDateKey(tomorrow)) return "Tomorrow";
  return new Date(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const insertByDateTime = (list, item) => {
  const itemTime = getItemDateTime(item);

  const index = list.findIndex(
    (i) => getItemDateTime(i) > itemTime
  );

  if (index === -1) return [...list, item];
  return [...list.slice(0, index), item, ...list.slice(index)];
};

/* Layout Correction */
const LayoutWatcher = () => {
  const location = useLocation();

  useEffect(() => {
    const updateLayout = () => {
      const nav = document.querySelector(".nav-container");
      const navTop = document.querySelector(".nav-top");
      const navScroll = document.querySelector(".nav-scroll");
      const itemsPage = document.querySelector(".items-page");

      if (!itemsPage || !nav) return;

      const isMobile = window.innerWidth <= 700;

      if (isMobile && navTop && navScroll) {
        const height =
          window.innerHeight -
          navTop.getBoundingClientRect().height -
          navScroll.getBoundingClientRect().height;

        itemsPage.style.height = `${height}px`;
        itemsPage.style.width = "100dvw";
      } else {
        const width = window.innerWidth - nav.getBoundingClientRect().width;

        itemsPage.style.width = `${width}px`;
        itemsPage.style.height = "100dvh";
      }
    };

    requestAnimationFrame(updateLayout);

    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [location.pathname]);

  return null;
};

/* Auto Close Create Box */
const RouteCreateCloser = ({ onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose(false);
  }, [location.pathname]);

  return null;
};

const TrashExitCleaner = ({ onClean }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/trash") {
      onClean();
    }
  }, [location.pathname]);

  return null;
};

/* Timestamps */
const now = () => Date.now();

const toMs = (days) => days * DAY_MS;





/* APP */

const App = () => {
  /* Categories */
  const CATEGORY_ICONS = [
    "🏠","💼","🛒","📖","📞","🎮","🎉","🎄","🎃","💝","🦃","🐇",
    "🏀","⚽","🏐","🏈","🎾","🚗","💪","👟","☀️","🍂","❄️","🌷",
  ];

  const [customLists, setCustomLists] = useState([]);

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🏠");

  const [deleteMode, setDeleteMode] = useState(false);

  /* Items */
  const [items, setItems] = useState([]);
  const importantItems = items.filter((item) => item.starred);
  const missedItems = items
    .filter(isPastItem)
    .sort((a, b) => {
      const da = new Date(`${a.dateKey} ${a.time}`);
      const db = new Date(`${b.dateKey} ${b.time}`);
      return da - db;
    });
  const [trashItems, setTrashItems] = useState([]);

  /* Item Variables */
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState(formatDateKey(new Date()));
  const [newTime, setNewTime] = useState(formatHourTime(new Date()));
  const [createStarred, setCreateStarred] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  /* Settings Variables */
  const [showSettings, setShowSettings] = useState(false);
  const [missedToTrashDays, setMissedToTrashDays] = useState(3);
  const [trashToDeleteDays, setTrashToDeleteDays] = useState(3);
  const [darkMode, setDarkMode] = useState(false);

  /* Time Refs */
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);





  /* SAVING */

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem(LS_ITEMS) || "[]");
    const savedTrash = JSON.parse(localStorage.getItem(LS_TRASH) || "[]");
    const savedCustomLists = JSON.parse(
      localStorage.getItem(LS_CUSTOM) || "[]"
    );
    const savedSettings = JSON.parse(
      localStorage.getItem(LS_SETTINGS) || "{}"
    );

    if (savedSettings.missedToTrashDays !== undefined)
      setMissedToTrashDays(savedSettings.missedToTrashDays);

    if (savedSettings.trashToDeleteDays !== undefined)
      setTrashToDeleteDays(savedSettings.trashToDeleteDays);

    if (savedSettings.darkMode !== undefined)
      setDarkMode(savedSettings.darkMode);  

    setItems(savedItems);
    setTrashItems(savedTrash);
    setCustomLists(savedCustomLists);
  }, []);

  const stripFlags = (item) => {
    const { deleting, clearing, restoring, ...clean } = item;
    return clean;
  };

  /* Items */
  useEffect(() => {
    localStorage.setItem(
      LS_ITEMS,
      JSON.stringify(items.map(stripFlags))
    );
  }, [items]);

  /* Trash Items */
  useEffect(() => {
    localStorage.setItem(
      LS_TRASH,
      JSON.stringify(trashItems.map(stripFlags))
    );
  }, [trashItems]);

  /* Categories */
  useEffect(() => {
    localStorage.setItem(
      LS_CUSTOM,
      JSON.stringify(
        customLists.map((list) => ({
          ...list,
          items: list.items.map(stripFlags),
        }))
      )
    );
  }, [customLists]);

  /* Settings */
  useEffect(() => {
    localStorage.setItem(
      LS_SETTINGS,
      JSON.stringify({
        missedToTrashDays,
        trashToDeleteDays,
        darkMode,
      })
    );
  }, [
    missedToTrashDays,
    trashToDeleteDays,
    darkMode,
  ]);  

  /* Move Expired Items */
  useEffect(() => {
    const currentTime = now();

    /* missed > trash */
    if (!isDisabled(missedToTrashDays)) {
      setItems((prevItems) => {
        const keep = [];
        const move = [];

        prevItems.forEach((item) => {
          const trashAt = getEffectiveTrashAt(item, missedToTrashDays);

          if (currentTime >= trashAt) {
            move.push({
              ...item,
              trashedAt: trashAt,
              deleteAt: getEffectiveDeleteAt(trashAt, trashToDeleteDays),
            });
          } else {
            keep.push(item);
          }
        });

        if (move.length) {
          setTrashItems((t) => [...t, ...move]);
        }
  
        return keep;
      });
    }

    /* trash > deleted */
    setTrashItems((prev) =>
    isDisabled(trashToDeleteDays)
      ? prev.map((i) => ({ ...i, deleteAt: undefined }))
      : prev.filter(
          (item) => !item.deleteAt || currentTime < item.deleteAt
        )
    );
  }, [
    missedToTrashDays,
    trashToDeleteDays,
    items.length,
    trashItems.length
  ]);  

  /* Light / Dark Mode Set */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode);
  }, [darkMode]);





  /* FUNCTIONS */

  /* Create Category Open */
  const openCategory = () => {
    setShowCreate(false);
    setShowCreateCategory(prev => !prev);
    setShowSettings(false);
  };

  /* Create Category */
  const createCategory = () => {
    if (!newCategoryName.trim()) return;

    setCustomLists((prev) => [
      ...prev,
      {
        name: newCategoryName,
        icon: newCategoryIcon ? newCategoryIcon : "�",
        items: [],
      },
    ]);

    setNewCategoryName("");
  };

  /* Delete Category Toggle */
  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  useEffect(() => {
    if (customLists.length === 0 && deleteMode) {
      setDeleteMode(false);
    }
  }, [customLists.length]);  

  /* Delete Category */
  const deleteCustomList = (name) => {
    setCustomLists((lists) =>
      lists.map((l) =>
        l.name === name ? { ...l, deleting: true } : l
      )
    );

    setTimeout(() => {
      setCustomLists((lists) =>
        lists.filter((l) => l.name !== name)
      );
    }, 300);
  };

  /* Create Item Open */
  useEffect(() => {
    const openNormal = () => {
      setActiveCategory(null);
      setCreateStarred(false);
      setShowCreate(prev => !prev);
      setShowCreateCategory(false);
      setShowSettings(false);
    };

    const openImportant = () => {
      setActiveCategory(null);
      setCreateStarred(true);
      setShowCreate(prev => !prev);
      setShowCreateCategory(false);
      setShowSettings(false);
    };

    const openCustomCreate = (e) => {
      setActiveCategory(e.detail);
      setCreateStarred(false);
      setShowCreate(prev => !prev);
      setShowCreateCategory(false);
      setShowSettings(false);
    };

    const openSettings = (e) => {
      setActiveCategory(null);
      setShowCreate(false);
      setShowCreateCategory(false);
      setShowSettings(prev => !prev);
    };

    const closeAll = (e) => {
      setActiveCategory(null);
      setShowCreate(false);
      setShowCreateCategory(false);
      setShowSettings(false);
    };

    window.addEventListener("openCreate", openNormal);
    window.addEventListener("openCreateImportant", openImportant);
    window.addEventListener("openCreateCustom", openCustomCreate);
    window.addEventListener("openSettings", openSettings);
    window.addEventListener("closeAll", closeAll);

    return () => {
      window.removeEventListener("openCreate", openNormal);
      window.removeEventListener("openCreateImportant", openImportant);
      window.removeEventListener("openCreateCustom", openCustomCreate);
      window.removeEventListener("openSettings", openSettings);
      window.removeEventListener("closeAll", closeAll);
    };
  }, []);

  /* Create Item */
  const createItem = (categoryName = null) => {
    if (!newName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newName,
      dateKey: newDate,
      time: format12HourFromTimeInput(newTime),
      starred: createStarred,
      category: categoryName,
    };

    setItems((prev) => insertByDateTime(prev, newItem));

    if (categoryName) {
      setCustomLists((prev) =>
        prev.map((list) =>
          list.name === categoryName
            ? { ...list, items: insertByDateTime(list.items, newItem)} : list
        )
      );
    }

    setNewName("");
  };

  /* Star Item */
  const toggleStar = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );

    setCustomLists((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === id ? { ...item, starred: !item.starred } : item
        ),
      }))
    );
  };

  /* Delete Item */
  const deleteItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, deleting: true } : item
      )
    );

    setCustomLists((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === id ? { ...item, deleting: true } : item
        ),
      }))
    );

    setTimeout(() => {
      setItems((prev) => {
        const itemToTrash = prev.find((i) => i.id === id);
        if (itemToTrash) {
          setTrashItems((t) => [
            ...t,
            {
              ...itemToTrash,
              trashedAt: now(),
              deleteAt: getEffectiveDeleteAt(now(), trashToDeleteDays),
            },
          ]);
        }
        return prev.filter((i) => i.id !== id);
      });

      setCustomLists((prev) =>
        prev.map((list) => ({
          ...list,
          items: list.items.filter((i) => i.id !== id),
        }))
      );
    }, 220);
  };

  /* Delete All Missed Items */
  const deleteAllMissed = () => {
    setItems((prev) =>
      prev.map((item) =>
        isPastItem(item) ? { ...item, deleting: true } : item
      )
    );

    setCustomLists((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          isPastItem(item) ? { ...item, deleting: true } : item
        ),
      }))
    );

    setTimeout(() => {
      setItems((prev) => {
        const itemsToTrash = prev.filter(isPastItem);
        if (itemsToTrash.length) {
          setTrashItems((t) => [
            ...t,
            ...itemsToTrash.map((item) => {
              const trashAt = getEffectiveTrashAt(item, missedToTrashDays);
            
              return {
                ...item,
                trashedAt: trashAt,
                deleteAt: getEffectiveDeleteAt(trashAt, trashToDeleteDays),
              };
            }),            
          ]);          
        }
        return prev.filter((item) => !isPastItem(item));
      });

      setCustomLists((prev) =>
        prev.map((list) => ({
          ...list,
          items: list.items.filter((item) => !isPastItem(item)),
        }))
      );
    }, 220);
  };

  /* Clear Deleted */
  const clearTrash = () => {
    setTrashItems((prev) =>
      prev.map((item) => ({ ...item, clearing: true }))
    );

    setTimeout(() => {
      setTrashItems([]);
    }, 220);
  };

  /* Retore Deleted */
  const restoreItem = (id) => {
    setTrashItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, restoring: true } : item
      )
    );

    setTimeout(() => {
      setTrashItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;

        const cleanItem = { ...item };
        delete cleanItem.restoring;

        setItems((itemsPrev) => insertByDateTime(itemsPrev, cleanItem));

        if (cleanItem.category) {
          setCustomLists((listsPrev) =>
            listsPrev.map((list) =>
              list.name === cleanItem.category
                ? { ...list, items: insertByDateTime(list.items, cleanItem)}
                : list
            )
          );
        }

        return prev.filter((i) => i.id !== id);
      });
    }, 220);
  };

  /* Item Animations */
  const clearItemAnimations = () => {
    setItems((prev) =>
      prev.map(({ deleting, clearing, restoring, ...item }) => item)
    );

    setTrashItems((prev) =>
      prev.map(({ deleting, clearing, restoring, ...item }) => item)
    );

    setCustomLists((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.map(
          ({ deleting, clearing, restoring, ...item }) => item
        ),
      }))
    );
  };

  /* Move Item Up/Down */
  const moveItemWithinGroup = (
    id,
    direction,
    {
      starred = null,
      missed = false,
      category = null,
    } = {}
  ) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index === -1) return prev;
  
      const item = prev[index];
  
      const matchesGroup = (i) => {
        if (i.dateKey !== item.dateKey) return false;
        if (starred !== null && i.starred !== starred) return false;
        if (missed && !isPastItem(i)) return false;
        if (category !== null && i.category !== category) return false;
        return true;
      };
  
      const groupIndexes = prev
        .map((i, idx) => ({ i, idx }))
        .filter(({ i }) => matchesGroup(i))
        .map(({ idx }) => idx);
  
      const posInGroup = groupIndexes.indexOf(index);
      const targetPos =
        direction === "up" ? posInGroup - 1 : posInGroup + 1;
  
      if (targetPos < 0 || targetPos >= groupIndexes.length) return prev;
  
      const targetIndex = groupIndexes[targetPos];
      const next = [...prev];
  
      next[index] = { ...next[index], moving: !next[index].moving };
      next[targetIndex] = { ...next[targetIndex], moving: !next[targetIndex].moving };
  
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  
      return next;
    });
  };

  /* Handle Enter Key */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  }





  /* ELEMENTS */

  return (
    <div className="container">
      <BrowserRouter>
        {/* Layout */}
        <LayoutWatcher />
        <RouteCreateCloser onClose={setShowCreate} />
        <TrashExitCleaner onClean={clearItemAnimations} />
        <NavigationBar
          allLength={items.length}
          importantLength={importantItems.length}
          missedLength={missedItems.length}
          trashLength={trashItems.length}
          customLists={customLists}
          onAddCategory={() => openCategory()}
          createCategoryOpened={showCreateCategory}
          deleteMode={deleteMode}
          onToggleDelete={toggleDeleteMode}
          onDeleteCustomList={deleteCustomList}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          missedToTrashDays={missedToTrashDays}
          setMissedToTrashDays={setMissedToTrashDays}
          trashToDeleteDays={trashToDeleteDays}
          setTrashToDeleteDays={setTrashToDeleteDays}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Create Box */}
        <div
          id="create-item-panel"
          className={`create-box ${showCreate ? "open" : ""}`}
          inert={!showCreate}
          aria-hidden={!showCreate}
          aria-labelledby="create-item-title"
        >
          <div className="create-header">
            <h2 id="create-item-title">New Item</h2>
            <button
              type="button"
              className="close-x"
              aria-label="Close"
              onClick={() => setShowCreate(false)}
            >
              ✕
            </button>
          </div>

          <div className="create-body">
            <div className="name-wrapper">
              <label htmlFor="item-name" className="sr-only">
                Item Name
              </label>

              <input
                placeholder="Name"
                id="item-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                inputMode="text"
                autoComplete="off"
                enterKeyHint="done"
              />
            </div>
            <div
              className="picker-wrapper"
              onClick={() => datePickerRef.current?.showPicker()}
            >
              <label htmlFor="datePicker" className="sr-only">
                Due Date
              </label>
              <input
                id="datePicker"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                ref={datePickerRef}
              />
            </div>

            <div
              className="picker-wrapper"
              onClick={() => timePickerRef.current?.showPicker()}
            >
              <label htmlFor="timePicker" className="sr-only">
                Due Time
              </label>
              <input
                id="timePicker"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                ref={timePickerRef}
              />
            </div>
            <button
              className="create-confirm"
              onClick={() => createItem(activeCategory)}
            >
              Add
            </button>
          </div>
        </div>

        {/* Category Create Box */}
        <div
          id="create-category-panel"
          className={`create-box ${showCreateCategory ? "open" : ""}`}
          inert={!showCreateCategory}
          aria-hidden={!showCreateCategory}
          aria-labelledby="create-category-title"
        >
          <div className="create-header">
            <h2 id="create-category-title">New Category</h2>
            <button
              type="button"
              className="close-x"
              aria-label="Close category creator"
              onClick={() => setShowCreateCategory(false)}
            >
              ✕
            </button>
          </div>

          <div className="create-body">
            <div className="name-wrapper">
              <label htmlFor="category-name" className="sr-only">
                Category Name
              </label>
              <input
                className="name-input"
                id="category-name"
                placeholder="Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value.slice(0, 9))}
                onKeyDown={handleKeyDown}
                inputMode="text"
                autoComplete="off"
                maxLength={9}
              />

              <label htmlFor="category-icon" className="sr-only">
                Category Icon
              </label>
              <input
                className="icon-input"
                id="category-icon"
                placeholder="Icon"
                value={newCategoryIcon}
                onChange={(e) => {
                  const value = e.target.value;

                  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
                  const segments = segmenter.segment(value);

                  const firstChar = Array.from(segments)[0]?.segment || "";
                  
                  setNewCategoryIcon(firstChar);
                }}
              />
            </div>

            <div className="icon-selector">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  className={`icon-option ${newCategoryIcon === icon ? "selected" : ""}`}
                  aria-pressed={newCategoryIcon === icon}
                  onClick={() => setNewCategoryIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>

            <button className="create-confirm" onClick={createCategory}>
              Add
            </button>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <All
                items={items}
                onDelete={deleteItem}
                onToggleStar={toggleStar}
                onMoveUp={(id) =>
                  moveItemWithinGroup(id, "up")
                }
                onMoveDown={(id) =>
                  moveItemWithinGroup(id, "down")
                }
                getDateLabel={getDateLabel}
                createOpened={showCreate}
              />
            }
          />
          <Route
            path="/important"
            element={
              <Important
                items={importantItems}
                onDelete={deleteItem}
                onToggleStar={toggleStar}
                onMoveUp={(id) =>
                  moveItemWithinGroup(id, "up", { starred: true })
                }
                onMoveDown={(id) =>
                  moveItemWithinGroup(id, "down", { starred: true })
                }
                getDateLabel={getDateLabel}
                createOpened={showCreate}
              />
            }
          />
          <Route
            path="/missed"
            element={
              <Missed
                items={missedItems}
                onDelete={deleteItem}
                onToggleStar={toggleStar}
                onMoveUp={(id) =>
                  moveItemWithinGroup(id, "up", { missed: true })
                }
                onMoveDown={(id) =>
                  moveItemWithinGroup(id, "down", { missed: true })
                }
                getDateLabel={getDateLabel}
                onTrashAll={deleteAllMissed}
              />
            }
          />
          <Route
            path="/trash"
            element={
              <Trash
                items={trashItems}
                onClearAll={clearTrash}
                onRestore={restoreItem}
                getDateLabel={getDateLabel}
              />
            }
          />
          {customLists.map((list) => (
            <Route
              key={list.name}
              path={`/custom/${encodeURIComponent(list.name)}`}
              element={
                <Custom
                  list={list}
                  onDelete={deleteItem}
                  onToggleStar={toggleStar}
                  onMoveUp={(id) =>
                    moveItemWithinGroup(id, "up", { category: list.name })
                  }
                  onMoveDown={(id) =>
                    moveItemWithinGroup(id, "down", { category: list.name })
                  }
                  getDateLabel={getDateLabel}
                  createOpened={showCreate}
                />
              }
            />
          ))}
        </Routes>

        <Footer/>
      </BrowserRouter>
    </div>
  );
};

export default App;
