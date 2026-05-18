import {
  type MoveClassification,
  type ClassificationCounts,
} from "../types/chessTypes";
import { classificationToTextColor } from "../lib/classifications";

import bookIcon from "../assets/Classification-Icons/book_64x.png";
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
      key: "book",
      label: "Book",
      icon: bookIcon,
      color: classificationToTextColor["book"],
    },
    {
      key: "best",
      label: "Best",
      icon: bestIcon,
      color: classificationToTextColor["best"],
    },
    {
      key: "excellent",
      label: "Excellent",
      icon: excellentIcon,
      color: classificationToTextColor["excellent"],
    },
    {
      key: "okay",
      label: "Okay",
      icon: okayIcon,
      color: classificationToTextColor["okay"],
    },
    {
      key: "inaccuracy",
      label: "Inaccuracy",
      icon: inaccuracyIcon,
      color: classificationToTextColor["inaccuracy"],
    },
    {
      key: "mistake",
      label: "Mistake",
      icon: mistakeIcon,
      color: classificationToTextColor["mistake"],
    },
    {
      key: "blunder",
      label: "Blunder",
      icon: blunderIcon,
      color: classificationToTextColor["blunder"],
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
