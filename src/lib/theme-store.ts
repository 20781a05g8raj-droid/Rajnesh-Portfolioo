import { create } from 'zustand'

type ThemeMode = 'day' | 'night'

interface ThemeState {
  mode: ThemeMode
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'day',
  toggleMode: () => {},
}))
