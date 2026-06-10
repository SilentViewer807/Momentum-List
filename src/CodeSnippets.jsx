const CodeSnippets = () => {
  return null;
};

/* Date Helpers */
export const getItemDateTime = (item) => {
  const [year, month, day] = item.dateKey.split("-").map(Number);

  const [time, modifier] = item.time.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM") {
    if (hours !== 12) hours += 12;
  } else {
    if (hours === 12) hours = 0;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export const isPastItem = (item) => {
  const itemTime = getItemDateTime(item);

  const now = new Date();
  now.setSeconds(0, 0);

  return itemTime < now;
};

export const getLocalDateKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

export const isPastDay = (dateKey) => {
  return dateKey < getLocalDateKey();
};

export default CodeSnippets;