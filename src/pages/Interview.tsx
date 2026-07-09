import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '@/store/interview'
import type { Feedback } from '@/store/interview'
import { mockInterviewAnswer, mockInterviewResults } from '@/lib/mockApi'
import { Send, Clock, MessageSquare, Star, CheckCircle2, XCircle, Lightbulb, Target, GitBranch, Hash, AlertTriangle, Loader2, Brain, Home } from 'lucide-react'

export default function Interview() {
  const navigate = useNavigate()
  const { 
    interviewId, 
    messages, 
    isLoading, 
    currentQuestionIndex, 
    totalQuestions,
    extractedSkills,
    addMessage,
    setLoading,
    updateProgress,
    finishInterview,
    setResults,
    resetInterview
  } = useInterviewStore()
  
  const [answer, setAnswer] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number>()

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!interviewId) {
      navigate('/')
    }
  }, [interviewId, navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isLoading) return

    setLoading(true)
    
    const userMessage: { id: string; role: 'user'; content: string; feedback?: Feedback } = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: answer,
    }
    addMessage(userMessage)
    setAnswer('')

    try {
      const data = await mockInterviewAnswer(interviewId, answer.trim())
      
      if (data.success) {
        userMessage.feedback = data.feedback
        
        if (data.nextQuestion) {
          addMessage({
            id: `msg-${Date.now()}-q`,
            role: 'interviewer',
            content: data.nextQuestion,
            isFollowup: data.isFollowup,
          })
          if (!data.isFollowup) {
            updateProgress(data.currentQuestionIndex, data.totalQuestions)
          }
        } else {
          updateProgress(data.currentQuestionIndex, data.totalQuestions)
          finishInterview()
          
          const resultsData = await mockInterviewResults(interviewId)
          
          if (resultsData.success) {
            setResults({
              radarData: resultsData.radarData!,
              summary: resultsData.summary!,
              suggestions: resultsData.suggestions!,
              avgRating: resultsData.avgRating!,
              totalQuestions: resultsData.totalQuestions!,
              answeredQuestions: resultsData.answeredQuestions!,
              extractedSkills: resultsData.extractedSkills!,
              analysisSummary: resultsData.analysisSummary!,
            })
          }
          
          setTimeout(() => {
            navigate('/results')
          }, 2000)
        }

        if (data.encouragement) {
          setTimeout(() => {
            addMessage({
              id: `msg-${Date.now()}-enc`,
              role: 'interviewer',
              content: data.encouragement,
            })
          }, 500)
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      addMessage({
        id: `msg-${Date.now()}-error`,
        role: 'interviewer',
        content: '抱歉，网络连接出现问题，请重试。',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleEndInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    finishInterview()
    resetInterview()
    navigate('/')
  }

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-border'}`}
      />
    ))
  }

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const isAnswerTooShort = answer.length > 0 && answer.length < 50
  const isAnswerTooLong = answer.length > 1000

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="bg-surface/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-sage-600" />
            </div>
            <span className="text-xl font-display font-semibold text-text-primary">
              AI 面试陪练官
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-bg-paper rounded-xl border border-border">
              <Clock className="w-4 h-4 text-sage-600" />
              <span className="text-sm font-mono text-text-secondary">{formatTime(timeElapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="px-5 py-2 text-text-secondary hover:text-text-primary hover:bg-sage-50 rounded-xl transition-all"
            >
              结束面试
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="px-4 py-4 bg-surface border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">面试进度</span>
            <span className="text-sm font-medium text-sage-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-bg-paper rounded-full overflow-hidden">
            <div 
              className="h-full bg-sage-500 transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {extractedSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-text-tertiary">已识别技能：</span>
              {extractedSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="text-xs px-3 py-1.5 bg-sage-50 text-sage-700 rounded-full border border-sage-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}
              style={{ animationDelay: '0.1s' }}
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-sage-100' 
                  : 'bg-purple-100'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-sage-700 font-semibold text-sm">你</span>
                ) : (
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                )}
              </div>
              
              <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-sage-50 border border-sage-200 text-text-primary'
                    : 'bg-surface border border-border text-text-primary'
                } ${message.isFollowup ? 'border-l-4 border-l-amber-400' : ''}`}>
                  {message.isFollowup && (
                    <span className="text-xs text-amber-600 mb-2 block">追问</span>
                  )}
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>

                {message.role === 'user' && message.feedback && (
                  <div className="mt-4 card animate-fade-in">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">AI 点评</span>
                      <div className="flex ml-2">{getRatingStars(message.feedback.rating)}</div>
                      <span className="text-sm text-sage-600 ml-auto font-semibold">{message.feedback.rating}/5</span>
                    </div>
                    
                    <p className="text-text-secondary mb-5 leading-relaxed">{message.feedback.comment}</p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-bg-paper rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-medium text-text-tertiary">STAR结构</span>
                        </div>
                        <div className="text-2xl font-display font-semibold text-text-primary">{message.feedback.analysis.starScore}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.starScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-5 h-5 text-purple-500" />
                          <span className="text-xs font-medium text-text-tertiary">关键词命中</span>
                        </div>
                        <div className="text-2xl font-display font-semibold text-text-primary">{message.feedback.analysis.keywordHitRate}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.keywordHitRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-5 h-5 text-cyan-500" />
                          <span className="text-xs font-medium text-text-tertiary">逻辑连贯性</span>
                        </div>
                        <div className="text-2xl font-display font-semibold text-text-primary">{message.feedback.analysis.logicalScore}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.logicalScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-medium text-text-tertiary">量化数据</span>
                        </div>
                        <div className={`text-2xl font-display font-semibold ${message.feedback.analysis.hasQuantitativeData ? 'text-sage-600' : 'text-error'}`}>
                          {message.feedback.analysis.hasQuantitativeData ? '有' : '无'}
                        </div>
                        <div className={`mt-2 h-2 rounded-full overflow-hidden ${message.feedback.analysis.hasQuantitativeData ? 'bg-sage-100' : 'bg-rose-100'}`}>
                          <div 
                            className={`h-full transition-all duration-700 ${message.feedback.analysis.hasQuantitativeData ? 'bg-sage-500' : 'bg-error'}`}
                            style={{ width: message.feedback.analysis.hasQuantitativeData ? '100%' : '20%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {message.feedback.strengths.length > 0 && (
                        <div className="flex items-start gap-3 bg-sage-50 rounded-lg p-4 border border-sage-200">
                          <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-sage-700">优点：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.strengths.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      {message.feedback.weaknesses.length > 0 && (
                        <div className="flex items-start gap-3 bg-rose-50 rounded-lg p-4 border border-rose-200">
                          <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-error">待改进：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.weaknesses.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-amber-700">优化建议：</span>
                          <p className="text-sm text-text-secondary mt-2 leading-relaxed">{message.feedback.optimizedAnswer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              </div>
              <div className="card px-6 py-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-sage-500 animate-spin" />
                  <span className="text-sm text-text-secondary">正在分析你的回答...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface border-t border-border">
          {isAnswerTooShort && answer.length > 0 && (
            <div className="mb-3 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 rounded-lg px-4 py-2 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              回答过于简短，建议详细阐述
            </div>
          )}
          {isAnswerTooLong && (
            <div className="mb-3 flex items-center gap-2 text-error text-xs bg-rose-50 rounded-lg px-4 py-2 border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
              回答过长，建议精简到1000字以内
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs text-text-tertiary">提示：按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <span className={`text-xs font-medium ${isAnswerTooLong ? 'text-error' : answer.length > 50 ? 'text-sage-600' : 'text-text-tertiary'}`}>
              {answer.length} 字
            </span>
          </div>
          <div className="flex gap-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入你的回答..."
              className="flex-1 h-28 px-4 py-3 bg-bg-paper border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 resize-none transition-all"
              maxLength={2000}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isLoading}
              className={`w-14 h-28 rounded-lg flex items-center justify-center transition-all ${
                answer.trim() && !isLoading
                  ? 'btn-primary hover:scale-105 active:scale-95'
                  : 'bg-border cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
