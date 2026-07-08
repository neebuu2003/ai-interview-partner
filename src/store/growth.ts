import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface InterviewHistoryRecord {
  id: string
  date: string
  position: string
  industry: string
  mode: 'text' | 'voice' | 'video'
  avgRating: number
  totalQuestions: number
  answeredQuestions: number
  radarData: { dimension: string; score: number }[]
  questions: { question: string; answer: string; rating: number }[]
  duration: number
}

interface FavoritedQuestion {
  id: string
  question: string
  position: string
  category: string
  addedAt: string
  isWrong: boolean
}

interface AbilityScores {
  date: string
  expression: number
  logic: number
  adaptability: number
  communication: number
  structuredThinking: number
  professionalism: number
}

interface CheckInData {
  streak: number
  lastCheckInDate: string
  checkInDates: string[]
  totalDays: number
}

interface GrowthState {
  history: InterviewHistoryRecord[]
  favorites: FavoritedQuestion[]
  abilityHistory: AbilityScores[]
  checkIn: CheckInData
  level: number
  xp: number
  totalInterviews: number
  
  addHistoryRecord: (record: Omit<InterviewHistoryRecord, 'id' | 'date'>) => void
  addFavoritedQuestion: (question: Omit<FavoritedQuestion, 'id' | 'addedAt'>) => void
  removeFavoritedQuestion: (id: string) => void
  toggleWrongQuestion: (id: string) => void
  updateAbilityScores: (scores: Omit<AbilityScores, 'date'>) => void
  checkInToday: () => boolean
  addXP: (amount: number) => void
  calculateLevel: () => void
  getTodayAbilityScores: () => AbilityScores | null
  getWeeklyAbilityTrend: () => AbilityScores[]
}

const STORAGE_KEY = 'ai-interview-growth-data'

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

const initialCheckInData: CheckInData = {
  streak: 0,
  lastCheckInDate: '',
  checkInDates: [],
  totalDays: 0,
}

const calculateLevel = (xp: number) => {
  return Math.floor(xp / 100)
}

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      history: [],
      favorites: [],
      abilityHistory: [],
      checkIn: initialCheckInData,
      level: 0,
      xp: 0,
      totalInterviews: 0,
      
      addHistoryRecord: (record) => {
        const newRecord: InterviewHistoryRecord = {
          ...record,
          id: `hist-${Date.now()}`,
          date: getTodayDate(),
        }
        
        set((state) => ({
          history: [newRecord, ...state.history],
          totalInterviews: state.totalInterviews + 1,
        }))
        
        get().addXP(Math.round(record.avgRating * 10))
        get().checkInToday()
        
        const avgExpression = record.radarData.find(d => d.dimension.includes('表达') || d.dimension.includes('沟通'))?.score || 0
        const avgLogic = record.radarData.find(d => d.dimension.includes('逻辑') || d.dimension.includes('结构'))?.score || 0
        const avgAdaptability = record.radarData.find(d => d.dimension.includes('应变'))?.score || 0
        const avgCommunication = record.radarData.find(d => d.dimension.includes('沟通'))?.score || avgExpression
        const avgStructured = record.radarData.find(d => d.dimension.includes('结构'))?.score || avgLogic
        const avgProfessionalism = record.radarData.find(d => d.dimension.includes('专业'))?.score || 0
        
        get().updateAbilityScores({
          expression: avgExpression,
          logic: avgLogic,
          adaptability: avgAdaptability,
          communication: avgCommunication,
          structuredThinking: avgStructured,
          professionalism: avgProfessionalism,
        })
      },
      
      addFavoritedQuestion: (question) => {
        const newQuestion: FavoritedQuestion = {
          ...question,
          id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          addedAt: getTodayDate(),
        }
        
        set((state) => ({
          favorites: [newQuestion, ...state.favorites],
        }))
      },
      
      removeFavoritedQuestion: (id) => {
        set((state) => ({
          favorites: state.favorites.filter(f => f.id !== id),
        }))
      },
      
      toggleWrongQuestion: (id) => {
        set((state) => ({
          favorites: state.favorites.map(f => 
            f.id === id ? { ...f, isWrong: !f.isWrong } : f
          ),
        }))
      },
      
      updateAbilityScores: (scores) => {
        const today = getTodayDate()
        const existingIndex = get().abilityHistory.findIndex(h => h.date === today)
        
        if (existingIndex >= 0) {
          const existing = get().abilityHistory[existingIndex]
          const count = get().history.filter(h => h.date === today).length + 1
          
          const updated: AbilityScores = {
            date: today,
            expression: Math.round((existing.expression * (count - 1) + scores.expression) / count),
            logic: Math.round((existing.logic * (count - 1) + scores.logic) / count),
            adaptability: Math.round((existing.adaptability * (count - 1) + scores.adaptability) / count),
            communication: Math.round((existing.communication * (count - 1) + scores.communication) / count),
            structuredThinking: Math.round((existing.structuredThinking * (count - 1) + scores.structuredThinking) / count),
            professionalism: Math.round((existing.professionalism * (count - 1) + scores.professionalism) / count),
          }
          
          set((state) => {
            const newHistory = [...state.abilityHistory]
            newHistory[existingIndex] = updated
            return { abilityHistory: newHistory }
          })
        } else {
          set((state) => ({
            abilityHistory: [{ ...scores, date: today }, ...state.abilityHistory],
          }))
        }
      },
      
      checkInToday: () => {
        const today = getTodayDate()
        const { checkIn } = get()
        
        if (checkIn.lastCheckInDate === today) {
          return false
        }
        
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        let newStreak = checkIn.lastCheckInDate === yesterdayStr 
          ? checkIn.streak + 1 
          : 1
        
        set((state) => ({
          checkIn: {
            ...state.checkIn,
            streak: newStreak,
            lastCheckInDate: today,
            checkInDates: [...state.checkIn.checkInDates, today],
            totalDays: state.checkIn.totalDays + 1,
          },
        }))
        
        get().addXP(newStreak * 5)
        
        return true
      },
      
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount
          return {
            xp: newXP,
            level: calculateLevel(newXP),
          }
        })
      },
      
      calculateLevel: () => {
        set((state) => ({
          level: calculateLevel(state.xp),
        }))
      },
      
      getTodayAbilityScores: () => {
        const today = getTodayDate()
        return get().abilityHistory.find(h => h.date === today) || null
      },
      
      getWeeklyAbilityTrend: () => {
        const result: AbilityScores[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const existing = get().abilityHistory.find(h => h.date === dateStr)
          
          if (existing) {
            result.push(existing)
          } else {
            result.push({
              date: dateStr,
              expression: 0,
              logic: 0,
              adaptability: 0,
              communication: 0,
              structuredThinking: 0,
              professionalism: 0,
            })
          }
        }
        return result
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
