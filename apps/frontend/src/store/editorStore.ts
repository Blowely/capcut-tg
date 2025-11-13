import { create } from 'zustand'

export interface TimelineClip {
  id: string
  videoId: string
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  layer: number
}

export interface TextLayer {
  id: string
  content: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  startTime: number
  duration: number
}

export interface Filter {
  brightness: number
  contrast: number
  saturation: number
}

interface EditorState {
  clips: TimelineClip[]
  textLayers: TextLayer[]
  filters: Filter
  currentTime: number
  isPlaying: boolean
  zoom: number
  selectedClipId: string | null
  selectedTextId: string | null

  // Actions
  addClip: (clip: TimelineClip) => void
  removeClip: (id: string) => void
  updateClip: (id: string, updates: Partial<TimelineClip>) => void
  addTextLayer: (text: TextLayer) => void
  removeTextLayer: (id: string) => void
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void
  updateFilters: (filters: Partial<Filter>) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  setSelectedClip: (id: string | null) => void
  setSelectedText: (id: string | null) => void
  reset: () => void
}

const initialFilters: Filter = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
}

export const useEditorStore = create<EditorState>((set) => ({
  clips: [],
  textLayers: [],
  filters: initialFilters,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  selectedClipId: null,
  selectedTextId: null,

  addClip: (clip) =>
    set((state) => ({ clips: [...state.clips, clip] })),

  removeClip: (id) =>
    set((state) => ({ clips: state.clips.filter((c) => c.id !== id) })),

  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  addTextLayer: (text) =>
    set((state) => ({ textLayers: [...state.textLayers, text] })),

  removeTextLayer: (id) =>
    set((state) => ({ textLayers: state.textLayers.filter((t) => t.id !== id) })),

  updateTextLayer: (id, updates) =>
    set((state) => ({
      textLayers: state.textLayers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  updateFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setZoom: (zoom) => set({ zoom }),

  setSelectedClip: (id) => set({ selectedClipId: id }),

  setSelectedText: (id) => set({ selectedTextId: id }),

  reset: () =>
    set({
      clips: [],
      textLayers: [],
      filters: initialFilters,
      currentTime: 0,
      isPlaying: false,
      selectedClipId: null,
      selectedTextId: null,
    }),
}))



