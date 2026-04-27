/**
 * HKCC 2026 booth symbols (image-based).
 * Index order is meaningful — see slot.js tier logic:
 *   0 Diamond → 1st
 *   1 Star    → 2nd
 *   2 Drop    → 3rd
 *   3 X       -> Miss
 */
window.SLOT_SYMBOLS = [
  {
    id: "sym-diamond",
    name: "Diamond",
    src: "assets/symbols/diamond.png",
    tierNote: "1st prize path — four diamonds",
  },
  {
    id: "sym-star",
    name: "Star",
    src: "assets/symbols/star.png",
    tierNote: "2nd prize path — four stars",
  },
  {
    id: "sym-drop",
    name: "Drop",
    src: "assets/symbols/drop.png",
    tierNote: "3rd prize path — four drops",
  },
  {
    id: "sym-miss",
    name: "Miss",
    src: "assets/symbols/miss.png",
    tierNote: "Miss — no prize",
    isMiss: true,
  },
];
