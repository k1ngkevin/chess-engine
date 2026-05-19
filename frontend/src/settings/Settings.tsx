import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import styles from "./Settings.module.css";
import { type Settings as SettingsValues } from "../types/chessTypes";

type SettingsProps = {
  settings: SettingsValues;
  updateSettings: (newSettings: Partial<SettingsValues>) => void;
  onClose: () => void;
};

function Settings({ settings, updateSettings, onClose }: SettingsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="settings-title">Settings</h2>
            <p>Adjust analysis display defaults.</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close settings"
            onClick={onClose}
          >
            <IconX stroke={1.75} />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.section} aria-label="Analysis settings">
            <div className={styles.settingRow}>
              <div className={styles.settingCopy}>
                <label htmlFor="show-engine-arrows">Show engine arrows</label>
                <p>Display candidate move arrows on the board.</p>
              </div>
              <input
                id="show-engine-arrows"
                className={styles.checkboxInput}
                type="checkbox"
                defaultChecked={settings.showEngineArrows}
                onChange={(event) => {
                  updateSettings({ showEngineArrows: event.target.checked });
                }}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingCopy}>
                <label htmlFor="engine-depth">Engine depth</label>
                <p>
                  Depth used for engine analysis requests. (Higher depth takes
                  longer to analyze)
                </p>
              </div>
              <input
                id="engine-depth"
                className={styles.numberInput}
                type="number"
                min={1}
                max={25}
                step={1}
                defaultValue={settings.engineDepth}
                onChange={(event) => {
                  updateSettings({
                    engineDepth: Math.min(25, Number(event.target.value)),
                  });
                }}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingCopy}>
                <label htmlFor="number-of-lines">Number of lines</label>
                <p>How many candidate engine lines to show.</p>
              </div>
              <input
                id="number-of-lines"
                className={styles.numberInput}
                type="number"
                min={1}
                max={5}
                step={1}
                defaultValue={settings.numberOfLines}
                onChange={(event) => {
                  updateSettings({
                    numberOfLines: Math.min(5, Number(event.target.value)),
                  });
                }}
              />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default Settings;
