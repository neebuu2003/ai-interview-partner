import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewSession } from '@/hooks/useInterviewSession'
import { Send, Clock, MessageSquare, Star, CheckCircle2, XCircle, Lightbulb, Target, GitBranch, Hash, AlertTriangle, Loader2, Brain, FileText } from 'lucide-react'

export default function TextInterview() {
  const navigate = useNavigate()
  const { 
    interviewId, 
    messages, 
    isLoading, 
    currentQuestionIndex, 
    totalQuestions,
    extractedSkills,
    timeElapsed,
    formatTime,
    submitAnswer,
    endInterview,
    progressPercentage,
  } = useInterviewSession()
  
  const [answer, setAnswer] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!interviewId) {
      navigate('/')
    }
  }, [interviewId, navigate])

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return
    submitAnswer(answer, () => navigate('/results'))
    setAnswer('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const handleEndInterview = () => {
    endInterview()
    navigate('/')
  }

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
      />
    ))
  }

  const isAnswerTooShort = answer.length > 0 && answer.length < 50
  const isAnswerTooLong = answer.length > 1000

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="bg-surface border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-sage-400 via-cyan-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-sage-500/20">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text-primary">AI 面试陪练官</span>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <FileText className="w-3 h-3" />
                文字面试模式
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-bg rounded-lg border border-border">
              <Clock className="w-4 h-4 text-sage-500" />
              <span className="text-sm font-mono text-text-secondary">{formatTime(timeElapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="px-5 py-2 text-text-secondary hover:text-text-primary hover:bg-bg rounded-lg transition-all"
            >
              结束面试
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="px-4 py-4 bg-surface border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-tertiary">面试进度</span>
            <span className="text-sm font-medium text-sage-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="h-3 bg-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sage-500 via-cyan-500 to-blue-500 transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {extractedSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-text-tertiary">已识别技能：</span>
              {extractedSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="text-xs px-3 py-1.5 bg-sage-50 text-sage-600 rounded-full border border-sage-200"
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
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-sage-500 via-cyan-500 to-blue-500 shadow-lg shadow-sage-500/20' 
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/20'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-white font-bold">你</span>
                ) : (
                  <MessageSquare className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-sage-500/20 via-cyan-500/15 to-blue-500/10 border border-sage-500/30 text-text-primary'
                    : 'bg-surface border border-border text-text-primary'
                } ${message.isFollowup ? 'border-l-4 border-l-amber-500' : ''}`}>
                  {message.isFollowup && (
                    <span className="text-xs text-amber-500 mb-2 block">追问</span>
                  )}
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>

                {message.role === 'user' && message.feedback && (
                  <div className="mt-4 card animate-fade-in">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">AI 点评</span>
                      <div className="flex ml-2">{getRatingStars(message.feedback.rating)}</div>
                      <span className="text-sm text-sage-600 ml-auto font-semibold">{message.feedback.rating}/5</span>
                    </div>
                    
                    <p className="text-text-secondary mb-5 leading-relaxed">{message.feedback.comment}</p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-bg rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-medium text-text-tertiary">STAR结构</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.starScore}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.starScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-5 h-5 text-purple-500" />
                          <span className="text-xs font-medium text-text-tertiary">关键词命中</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.keywordHitRate}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.keywordHitRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-5 h-5 text-cyan-500" />
                          <span className="text-xs font-medium text-text-tertiary">逻辑连贯性</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.logicalScore}%</div>
                        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.logicalScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-medium text-text-tertiary">量化数据</span>
                        </div>
                        <div className={`text-2xl font-bold ${message.feedback.analysis.hasQuantitativeData ? 'text-sage-600' : 'text-rose-600'}`}>
                          {message.feedback.analysis.hasQuantitativeData ? '有' : '无'}
                        </div>
                        <div className={`mt-2 h-2 rounded-full overflow-hidden ${message.feedback.analysis.hasQuantitativeData ? 'bg-sage-500/20' : 'bg-rose-500/20'}`}>
                          <div 
                            className={`h-full transition-all duration-700 ${message.feedback.analysis.hasQuantitativeData ? 'bg-sage-500' : 'bg-rose-500'}`}
                            style={{ width: message.feedback.analysis.hasQuantitativeData ? '100%' : '20%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {message.feedback.strengths.length > 0 && (
                        <div className="flex items-start gap-3 bg-sage-50 rounded-xl p-4 border border-sage-200">
                          <CheckCircle2 className="w-6 h-6 text-sage-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-sage-600">优点：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.strengths.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      {message.feedback.weaknesses.length > 0 && (
                        <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-4 border border-rose-200">
                          <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-rose-600">待改进：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.weaknesses.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-amber-600">优化建议：</span>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 rounded-lg px-4 py-2 border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
              回答过长，建议精简到1000字以内
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs text-text-tertiary">提示：按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <span className={`text-xs font-medium ${isAnswerTooLong ? 'text-rose-600' : answer.length > 50 ? 'text-sage-600' : 'text-text-tertiary'}`}>
              {answer.length} 字
            </span>
          </div>
          <div className="flex gap-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入你的回答..."
              className="flex-1 h-32 px-5 py-4 bg-bg border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 resize-none transition-all"
              maxLength={2000}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isLoading}
              className={`w-16 h-32 rounded-xl flex items-center justify-center transition-all ${
                answer.trim() && !isLoading
                  ? 'bg-gradient-to-r from-sage-500 via-cyan-500 to-blue-500 hover:shadow-xl hover:shadow-sage-500/20 hover:scale-105 active:scale-95'
                  : 'bg-border cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}