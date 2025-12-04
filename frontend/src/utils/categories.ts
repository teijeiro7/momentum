// Predefined categories with colors
export const CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', color: '#00ff88', emoji: '💪' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#39ff14', emoji: '🧘' },
  { id: 'productivity', name: 'Productivity', color: '#ffd93d', emoji: '⚡' },
  { id: 'learning', name: 'Learning', color: '#00d4ff', emoji: '📚' },
  { id: 'social', name: 'Social', color: '#ff6b9d', emoji: '👥' },
  { id: 'creativity', name: 'Creativity', color: '#c77dff', emoji: '🎨' },
  { id: 'finance', name: 'Finance', color: '#06ffa5', emoji: '💰' },
  { id: 'other', name: 'Other', color: '#a5d6a7', emoji: '📌' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export function getCategoryById(id: string) {
  return CATEGORIES.find(cat => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColor(id: string) {
  return getCategoryById(id).color;
}

export function getCategoryEmoji(id: string) {
  return getCategoryById(id).emoji;
}
