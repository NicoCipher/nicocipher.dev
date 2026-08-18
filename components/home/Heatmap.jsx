import styles from "./Heatmap.module.css";

/**
 * GitHub-style contribution heatmap.
 * - Exactly 52 weeks going back from today
 * - Columns = weeks (oldest left → newest right)
 * - Rows = days (Sun top → Sat bottom)
 * - Month labels on top, day labels on left
 */
export default function Heatmap({ dates = [] }) {
  // Count publications per date string "YYYY-MM-DD"
  const counts = {};
  for (const d of dates) {
    counts[d] = (counts[d] || 0) + 1;
  }

  const today = new Date();

  // Start on the Sunday of the week 52 weeks ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - today.getDay() - 52 * 7);
  // startDate is always a Sunday

  // Build cells day by day
  const cells = [];
  const cursor = new Date(startDate);
  while (cursor <= today) {
    const iso = cursor.toISOString().split("T")[0];
    const count = counts[iso] || 0;
    let level = 0;
    if (count === 1) level = 2;
    else if (count === 2) level = 3;
    else if (count >= 3) level = 4;
    cells.push({ iso, count, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group into columns of 7 (each column = one week, Sun–Sat)
  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  // Build month label positions
  // A month label sits above the first column whose Sunday falls in that month
  const monthLabels = [];
  let seenMonth = -1;
  columns.forEach((col, colIdx) => {
    const weekStart = new Date(col[0].iso);
    const m = weekStart.getMonth();
    if (m !== seenMonth) {
      monthLabels.push({
        colIdx,
        label: weekStart.toLocaleString("default", { month: "short" }),
      });
      seenMonth = m;
    }
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalPubs = dates.length;

  return (
    <figure className={styles.figure}>
      <div className={styles.header}>
        <figcaption className={styles.label}>Publication Activity</figcaption>
        <span className={styles.count}>
          {totalPubs} publication{totalPubs !== 1 ? "s" : ""} in the last year
        </span>
      </div>

      <div className={styles.graphArea}>
        {/* Day-of-week labels */}
        <div className={styles.dayLabels} aria-hidden="true">
          {dayNames.map((d, i) => (
            <span
              key={d}
              className={styles.dayLabel}
              style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
            >
              {d}
            </span>
          ))}
        </div>

        <div className={styles.graphColumn}>
          {/* Month labels row */}
          <div className={styles.monthRow} aria-hidden="true">
            {columns.map((_, colIdx) => {
              const ml = monthLabels.find((m) => m.colIdx === colIdx);
              return (
                <div key={colIdx} className={styles.monthCell}>
                  {ml ? <span className={styles.monthLabel}>{ml.label}</span> : null}
                </div>
              );
            })}
          </div>

          {/* The grid */}
          <div className={styles.grid} role="grid" aria-label="Publication activity grid">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className={styles.gridCol} role="row">
                {col.map((cell) => (
                  <div
                    key={cell.iso}
                    role="gridcell"
                    className={styles.cell}
                    data-level={cell.level}
                    title={
                      cell.count > 0
                        ? `${cell.count} publication${cell.count !== 1 ? "s" : ""} on ${cell.iso}`
                        : `No activity on ${cell.iso}`
                    }
                    aria-label={
                      cell.count > 0
                        ? `${cell.count} publication${cell.count !== 1 ? "s" : ""} on ${cell.iso}`
                        : cell.iso
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendText}>Less</span>
        <div className={styles.cell} data-level="0" />
        <div className={styles.cell} data-level="1" />
        <div className={styles.cell} data-level="2" />
        <div className={styles.cell} data-level="3" />
        <div className={styles.cell} data-level="4" />
        <span className={styles.legendText}>More</span>
      </div>
    </figure>
  );
}
