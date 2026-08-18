import styles from "./Heatmap.module.css";

/**
 * GitHub-style contribution heatmap.
 * Receives an array of publication date strings (YYYY-MM-DD).
 * Renders 52 weeks of squares from today backward.
 */
export default function Heatmap({ dates = [] }) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat

  // Count publications per date
  const dateCounts = {};
  for (const d of dates) {
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  }

  // Build 52 weeks of day cells (oldest → newest, left → right)
  const totalDays = 52 * 7 + dayOfWeek + 1; // fill to today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const count = dateCounts[dateStr] || 0;

    // Level: 0=empty, 1-4 based on count
    let level = 0;
    if (count === 1) level = 2;
    else if (count === 2) level = 3;
    else if (count >= 3) level = 4;

    currentWeek.push({
      date: dateStr,
      level,
      count,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month labels
  const months = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstDay = new Date(week[0].date);
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      months.push({ label: firstDay.toLocaleString("default", { month: "short" }), weekIdx });
      lastMonth = month;
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Activity</span>
        <span className={styles.count}>{dates.length} publication{dates.length !== 1 ? "s" : ""}</span>
      </div>

      <div className={styles.graphWrapper}>
        {/* Month labels */}
        <div className={styles.monthRow}>
          {months.map((m, i) => (
            <span
              key={i}
              className={styles.monthLabel}
              style={{ gridColumnStart: m.weekIdx + 2 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className={styles.column}>
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={styles.cell}
                  data-level={day.level}
                  title={day.count > 0 ? `${day.count} publication${day.count !== 1 ? "s" : ""} on ${day.date}` : day.date}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        <div className={styles.cell} data-level="0" />
        <div className={styles.cell} data-level="1" />
        <div className={styles.cell} data-level="2" />
        <div className={styles.cell} data-level="3" />
        <div className={styles.cell} data-level="4" />
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
