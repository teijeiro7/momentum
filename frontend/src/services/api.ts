import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Habit {
  id: number;
  name: string;
  goal: string;
  created_at: string;
  category?: string;
}

export interface HabitCreate {
  name: string;
  goal: string;
  category?: string;
}

export interface HabitUpdate {
  name?: string;
  goal?: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  value: boolean;
}

export interface HabitLogCreate {
  date: string;
  value: boolean;
}

export interface HeatmapDataPoint {
  date: string;
  value: number;
}

export interface HeatmapResponse {
  habit_name: string;
  data: HeatmapDataPoint[];
}

// Habit CRUD
export const getHabits = async (): Promise<Habit[]> => {
  const response = await api.get('/habits');
  return response.data;
};

export const getHabit = async (id: number): Promise<Habit> => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
};

export const createHabit = async (habit: HabitCreate): Promise<Habit> => {
  const response = await api.post('/habits', habit);
  return response.data;
};

export const updateHabit = async (id: number, habit: HabitUpdate): Promise<Habit> => {
  const response = await api.put(`/habits/${id}`, habit);
  return response.data;
};

export const deleteHabit = async (id: number): Promise<void> => {
  await api.delete(`/habits/${id}`);
};

// Habit Log CRUD
export const getHabitLogs = async (habitId: number): Promise<HabitLog[]> => {
  const response = await api.get(`/habits/${habitId}/logs`);
  return response.data;
};

export const createHabitLog = async (
  habitId: number,
  log: HabitLogCreate
): Promise<HabitLog> => {
  const response = await api.post(`/habits/${habitId}/logs`, log);
  return response.data;
};

export const deleteHabitLog = async (habitId: number, logId: number): Promise<void> => {
  await api.delete(`/habits/${habitId}/logs/${logId}`);
};

// Analytics
export const getHabitHeatmap = async (habitId: number): Promise<HeatmapResponse> => {
  const response = await api.get(`/analytics/${habitId}/heatmap`);
  return response.data;
};

export default api;
