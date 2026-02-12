// Par'Issy restaurant table layout
// Positions are percentages (x%, y%) within the floor plan container
// Matches the physical floor plan with corrections:
// - Table 5 does not exist
// - Row 30 has 6 tables (30-35), not 7

export const STAGES = {
  AVAILABLE: 'available',
  SEATED: 'seated',
  ENTRY: 'entry',
  MAIN_COURSE: 'mainCourse',
  SNACK: 'snack',
  COFFEE: 'coffee',
  DESSERT: 'dessert',
  DONE: 'done',
};

export const STAGE_LABELS = {
  [STAGES.AVAILABLE]: 'Available',
  [STAGES.SEATED]: 'Waiting',
  [STAGES.ENTRY]: 'Entry',
  [STAGES.MAIN_COURSE]: 'Main Course',
  [STAGES.SNACK]: 'Snack',
  [STAGES.COFFEE]: 'Coffee',
  [STAGES.DESSERT]: 'Dessert',
  [STAGES.DONE]: 'Done',
};

export const STAGE_COLORS = {
  [STAGES.AVAILABLE]: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
  [STAGES.SEATED]: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  [STAGES.ENTRY]: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  [STAGES.MAIN_COURSE]: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
  [STAGES.SNACK]: { bg: '#ede9fe', text: '#7c3aed', border: '#c4b5fd' },
  [STAGES.COFFEE]: { bg: '#f5f0e6', text: '#78350f', border: '#c8b88a' },
  [STAGES.DESSERT]: { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' },
  [STAGES.DONE]: { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
};

export const STAGE_ORDER = [
  STAGES.SEATED,
  STAGES.ENTRY,
  STAGES.MAIN_COURSE,
  STAGES.SNACK,
  STAGES.COFFEE,
  STAGES.DESSERT,
  STAGES.DONE,
];

// Table definitions with position (% x, % y) on the floor plan
export const tables = [
  // Top row (near kitchen)
  { id: 40, x: 6,  y: 6,  type: 'standard', defaultSeats: 4 },
  { id: 41, x: 26, y: 6,  type: 'standard', defaultSeats: 4 },
  { id: 42, x: 44, y: 6,  type: 'standard', defaultSeats: 4 },
  { id: 45, x: 62, y: 6,  type: 'standard', defaultSeats: 4 },
  { id: 43, x: 82, y: 6,  type: 'standard', defaultSeats: 4 },

  // Row 30 (6 tables)
  { id: 14, x: 6,  y: 28, type: 'standard', defaultSeats: 4 },
  { id: 30, x: 26, y: 28, type: 'standard', defaultSeats: 4 },
  { id: 31, x: 37, y: 28, type: 'standard', defaultSeats: 4 },
  { id: 32, x: 48, y: 28, type: 'standard', defaultSeats: 4 },
  { id: 33, x: 59, y: 28, type: 'standard', defaultSeats: 4 },
  { id: 34, x: 70, y: 28, type: 'standard', defaultSeats: 4 },
  { id: 35, x: 82, y: 28, type: 'standard', defaultSeats: 4 },

  // Middle left
  { id: 12, x: 6, y: 48, type: 'standard', defaultSeats: 4 },

  // Row 20
  { id: 11, x: 6,  y: 62, type: 'standard', defaultSeats: 4 },
  { id: 20, x: 26, y: 62, type: 'standard', defaultSeats: 4 },
  { id: 21, x: 37, y: 62, type: 'standard', defaultSeats: 4 },
  { id: 22, x: 48, y: 62, type: 'standard', defaultSeats: 4 },
  { id: 23, x: 59, y: 62, type: 'standard', defaultSeats: 4 },
  { id: 24, x: 72, y: 62, type: 'standard', defaultSeats: 4 },
  { id: 25, x: 84, y: 62, type: 'standard', defaultSeats: 4 },

  // Bottom row (entrance)
  { id: 7, x: 4,  y: 84, type: 'round', defaultSeats: 8 },
  { id: 6, x: 20, y: 84, type: 'rectangular', defaultSeats: 6 },
  // Table 5 does not exist
  { id: 4, x: 42, y: 84, type: 'standard', defaultSeats: 2 },
  { id: 3, x: 55, y: 84, type: 'standard', defaultSeats: 2 },
  { id: 2, x: 68, y: 84, type: 'standard', defaultSeats: 4 },
  { id: 1, x: 84, y: 84, type: 'round', defaultSeats: 8 },
];

export function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
