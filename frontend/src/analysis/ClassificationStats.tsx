import {
  type MoveClassification,
  type ClassificationCounts,
} from "../types/types";
import bestIcon from "../assets/Classification-Icons/best_64x.png";
import excellentIcon from "../assets/Classification-Icons/excellent_64x.png";
import okayIcon from "../assets/Classification-Icons/okay_64x.png";
import inaccuracyIcon from "../assets/Classification-Icons/inaccuracy_64x.png";
import mistakeIcon from "../assets/Classification-Icons/mistake_64x.png";
import blunderIcon from "../assets/Classification-Icons/blunder_64x.png";
import styles from "./ClassificationStats.module.css";

type ClassificationStatsProps = {
  whiteCounts: ClassificationCounts;
  blackCounts: ClassificationCounts;
};

const ClassificationStats = ({
  whiteCounts,
  blackCounts,
}: ClassificationStatsProps) => {
  const classificationRows: {
    key: MoveClassification;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      key: "best",
      label: "Best",
      icon: bestIcon,
      color: "#8bc34a",
    },
    {
      key: "excellent",
      label: "Excellent",
      icon: excellentIcon,
      color: "#8bc34a",
    },
    {
      key: "okay",
      label: "Okay",
      icon: okayIcon,
      color: "#aab89f",
    },
    {
      key: "inaccuracy",
      label: "Inaccuracy",
      icon: inaccuracyIcon,
      color: "#f5c542",
    },
    {
      key: "mistake",
      label: "Mistake",
      icon: mistakeIcon,
      color: "#f39c12",
    },
    {
      key: "blunder",
      label: "Blunder",
      icon: blunderIcon,
      color: "#e53935",
    },
  ];
  return (
    <div className={styles.classificationBreakdown}>
      <div className={styles.classificationHeader}>
        <span />
        <span>White</span>
        <span />
        <span>Black</span>
      </div>

      {classificationRows.map((row) => (
        <div key={row.key} className={styles.classificationRow}>
          <span
            className={styles.classificationLabel}
            style={{ color: row.color }}
          >
            {row.label}
          </span>

          <span
            className={styles.classificationCount}
            style={{ color: row.color }}
          >
            {whiteCounts[row.key]}
          </span>

          <img
            className={styles.classificationIcon}
            src={row.icon}
            alt={row.label}
          />

          <span
            className={styles.classificationCount}
            style={{ color: row.color }}
          >
            {blackCounts[row.key]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ClassificationStats;
