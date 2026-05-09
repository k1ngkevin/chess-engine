import React from "react";
import styles from "./PgnImportForm.module.css";
import { IconSearch } from "@tabler/icons-react";

type PgnImportProps = {
  pgn: string;
  setPgn: React.Dispatch<React.SetStateAction<string>>;
  isImporting: boolean;
  onImportPgn: (pgn: string) => Promise<void>;
};

const PgnImportForm = ({
  pgn,
  setPgn,
  isImporting,
  onImportPgn,
}: PgnImportProps) => {
  return (
    <>
      <textarea
        value={pgn}
        className={styles.pgnForm}
        rows={10}
        cols={50}
        onChange={(e) => setPgn(e.target.value)}
        placeholder="Paste PGN contents..."
      ></textarea>
      <button
        type="button"
        className={styles.analyzePgnButton}
        onClick={() => onImportPgn(pgn)}
      >
        <IconSearch stroke={1.75} />
        {isImporting ? "Analyzing..." : "Analyze PGN"}
      </button>
    </>
  );
};

export default PgnImportForm;
