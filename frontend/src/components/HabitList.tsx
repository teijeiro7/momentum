import { useState, useEffect } from 'react';
import {
  getHabits,
  createHabit,
  deleteHabit,
  Habit,
  HabitCreate,
} from '../services/api';
import { CATEGORIES, getCategoryById } from '../utils/categories';

interface HabitListProps {
  onSelectHabit: (habit: Habit) => void;
  selectedHabitId: number | null;
}

export default function HabitList({ onSelectHabit, selectedHabitId }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<HabitCreate>({
    name: '',
    goal: '',
    category: 'other',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newHabit = await createHabit(formData);
      setHabits([...habits, newHabit]);
      setFormData({ name: '', goal: '', category: 'other' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  const handleDeleteHabit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
      if (selectedHabitId === id) {
        onSelectHabit(habits.find(h => h.id !== id) || habits[0]);
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Habits</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Habit'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateHabit} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Drink Water"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Drink 2 liters of water daily"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category || 'other'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Create Habit
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No habits yet. Create your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`bg-gray-800 rounded-lg p-5 cursor-pointer transition-all ${
                selectedHabitId === habit.id
                  ? 'ring-2 ring-green-500 shadow-lg'
                  : 'hover:bg-gray-750'
              }`}
              onClick={() => onSelectHabit(habit)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {habit.category && (
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          background: `${getCategoryById(habit.category).color}20`,
                          color: getCategoryById(habit.category).color,
                          border: `1px solid ${getCategoryById(habit.category).color}`,
                        }}
                      >
                        {getCategoryById(habit.category).emoji} {getCategoryById(habit.category).name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {habit.name}
                  </h3>
                  <p className="text-sm text-gray-400">{habit.goal}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(habit.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHabit(habit.id);
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors ml-4"
                  title="Delete habit"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
