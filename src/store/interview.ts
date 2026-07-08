import { create } from 'zustand'

interface Message {
  id: string
  role: 'interviewer' | 'user'
  content: string
  feedback?: Feedback
  isFollowup?: boolean
}

export interface Feedback {
  rating: number
  comment: string
  optimizedAnswer: string
  strengths: string[]
  weaknesses: string[]
  analysis: AnalysisResult
}

export interface AnalysisResult {
  starScore: number
  keywordMatches: string[]
  keywordHitRate: number
  logicalScore: number
  hasQuantitativeData: boolean
  depthScore: number
}

interface InterviewStateData {
  jd: string
  industry: string
  position: string
  interviewerStyle: 'friendly' | 'pressure' | 'deep'
  interviewMode: 'text' | 'voice' | 'video'
  interviewId: string
  messages: Message[]
  currentQuestion: string
  greeting: string
  isLoading: boolean
  isFinished: boolean
  currentQuestionIndex: number
  totalQuestions: number
  extractedSkills: string[]
  results: Results | null
}

interface InterviewState extends InterviewStateData {
  setJd: (jd: string) => void
  setIndustry: (industry: string) => void
  setPosition: (position: string) => void
  setInterviewerStyle: (style: 'friendly' | 'pressure' | 'deep') => void
  setInterviewMode: (mode: 'text' | 'voice' | 'video') => void
  startInterview: (data: { question: string; interviewId: string; totalQuestions: number; greeting: string; extractedSkills: string[] }) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  updateProgress: (current: number, total: number) => void
  finishInterview: () => void
  setResults: (results: Results) => void
  resetInterview: () => void
}

interface Results {
  radarData: { dimension: string; score: number }[]
  summary: string
  suggestions: string[]
  avgRating: number
  totalQuestions: number
  answeredQuestions: number
  extractedSkills: string[]
  analysisSummary: {
    avgKeywordHitRate: number
    hasQuantitativeData: number
    avgStarScore: number
    avgLogicalScore: number
  }
}

const initialState: InterviewStateData = {
  jd: '',
  industry: '',
  position: '',
  interviewerStyle: 'friendly' as const,
  interviewMode: 'text' as const,
  interviewId: '',
  messages: [],
  currentQuestion: '',
  greeting: '',
  isLoading: false,
  isFinished: false,
  currentQuestionIndex: 0,
  totalQuestions: 5,
  extractedSkills: [],
  results: null,
}

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,
  
  setJd: (jd) => set({ jd }),
  setIndustry: (industry) => set({ industry }),
  setPosition: (position) => set({ position }),
  setInterviewerStyle: (style: 'friendly' | 'pressure' | 'deep') => set({ interviewerStyle: style }),
  setInterviewMode: (mode: 'text' | 'voice' | 'video') => set({ interviewMode: mode }),
  
  startInterview: (data) => set({
    interviewId: data.interviewId,
    currentQuestion: data.question,
    totalQuestions: data.totalQuestions,
    greeting: data.greeting,
    extractedSkills: data.extractedSkills,
    messages: [{ id: 'greeting', role: 'interviewer', content: data.greeting }, { id: '1', role: 'interviewer', content: data.question }],
    isFinished: false,
    currentQuestionIndex: 0,
  }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    currentQuestion: message.role === 'interviewer' ? message.content : state.currentQuestion,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateProgress: (current, total) => set({
    currentQuestionIndex: current,
    totalQuestions: total,
    isFinished: current >= total,
  }),
  
  finishInterview: () => set({ isFinished: true }),
  
  setResults: (results) => set({ results }),
  
  resetInterview: () => set({ ...initialState }),
}))
