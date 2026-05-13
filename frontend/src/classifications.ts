import bestIcon from "./assets/Classification-Icons/best_64x.png";
import excellentIcon from "./assets/Classification-Icons/excellent_64x.png";
import okayIcon from "./assets/Classification-Icons/okay_64x.png";
import inaccuracyIcon from "./assets/Classification-Icons/inaccuracy_64x.png";
import mistakeIcon from "./assets/Classification-Icons/mistake_64x.png";
import blunderIcon from "./assets/Classification-Icons/blunder_64x.png"; 
  
export const classificationToIcon: Record<string, string> = {
  best: bestIcon,
  excellent: excellentIcon,
  okay: okayIcon,
  inaccuracy: inaccuracyIcon,
  mistake: mistakeIcon,
  blunder: blunderIcon,
};

export const classificationToSquareColor: Record<string, string> = {
  best: "rgba(129, 182, 76, 0.50)",
  excellent: "rgba(129, 182, 76, 0.50)",
  okay: "rgba(129, 182, 76, 0.42)",
  inaccuracy: "rgba(245, 196, 66, 0.50)",
  mistake: "rgba(245, 130, 49, 0.50)",
  blunder: "rgba(214, 79, 79, 0.55)",
};

export const classificationToTextColor: Record<string, string> = {
  brilliant: "#26c6da",
  critical: "#6fa8dc",
  best: "#8bc34a",
  excellent: "#8bc34a",
  okay: "#aab89f",
  inaccuracy: "#f5c542",
  mistake: "#f39c12",
  blunder: "#e53935",
  theory: "#b8926a",
};