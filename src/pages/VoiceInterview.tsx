import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewSession } from '@/hooks/useInterviewSession'
import { Mic, MicOff, Send, Clock, MessageSquare, Star, CheckCircle2, XCircle, Lightbulb, Target, GitBranch, Hash, AlertTriangle, Loader2, Brain, Volume2, VolumeX, FileText, Play, Pause } from 'lucide-react'

export default function VoiceInterview() {
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
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isTypingMode, setIsTypingMode] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<(typeof SpeechRecognition) | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!interviewId) {
      navigate('/')
    }
  }, [interviewId, navigate])

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  const initAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      microphoneRef.current = stream
      
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const animate = () => {
        if (!analyser) return
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.min(average / 255, 1))
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animate()
    } catch (error) {
      console.error('Failed to access microphone:', error)
    }
  }, [])

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach(track => track.stop())
      microphoneRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsPlayingQuestion(true)
      utterance.onend = () => setIsPlayingQuestion(false)
      utterance.onerror = () => setIsPlayingQuestion(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlayingQuestion(false)
    }
  }

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'interviewer' && !lastMessage.isFollowup) {
      setTimeout(() => {
        speakQuestion(lastMessage.content)
      }, 500)
    }
  }, [messages])

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN'
      
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        setTranscript(finalTranscript + interimTranscript)
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error !== 'no-speech') {
          setIsListening(false)
        }
      }
      
      recognition.onend = () => {
        if (isListening) {
          recognition.start()
        }
      }
      
      recognitionRef.current = recognition
      
      return () => {
        recognition.stop()
      }
    }
  }, [isListening])

  const toggleListening = async () => {
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      stopAudioAnalysis()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else {
      await initAudioAnalysis()
      recognitionRef.current?.start()
      setIsListening(true)
      setRecordingDuration(0)
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    }
  }

  const handleSubmitAnswer = () => {
    if (!transcript.trim()) return
    submitAnswer(transcript, () => navigate('/results'))
    setTranscript('')
    setRecordingDuration(0)
  }

  const handleEndInterview = () => {
    stopAudioAnalysis()
    stopSpeaking()
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="bg-surface/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-semibold text-text-primary">AI 面试陪练官</span>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Mic className="w-3 h-3" />
                语音面试模式
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-mono text-text-secondary">{formatTime(timeElapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="px-5 py-2 text-text-secondary hover:text-sage-600 hover:bg-sage-50 rounded-xl transition-all"
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
            <span className="text-sm font-medium text-purple-500">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="h-3 bg-bg-paper rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {extractedSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-text-tertiary">已识别技能：</span>
              {extractedSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="badge-purple"
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
                  ? 'bg-purple-100' 
                  : 'bg-sage-100'
              }`}>
                {message.role === 'user' ? (
                  <Volume2 className="w-5 h-5 text-purple-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-sage-600" />
                )}
              </div>
              
              <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-purple-50 border border-purple-200 text-text-primary'
                    : 'bg-surface border border-border text-text-primary'
                } ${message.isFollowup ? 'border-l-4 border-l-amber-400' : ''}`}>
                  {message.isFollowup && (
                    <span className="text-xs text-amber-600 mb-2 block">追问</span>
                  )}
                  <p className="text-base leading-relaxed">{message.content}</p>
                  {message.role === 'interviewer' && (
                    <button
                      onClick={() => isPlayingQuestion ? stopSpeaking() : speakQuestion(message.content)}
                      className="mt-3 flex items-center gap-2 text-xs text-purple-500 hover:text-purple-600 transition-colors"
                    >
                      {isPlayingQuestion && messages[messages.length - 1]?.id === message.id ? (
                        <>
                          <Pause className="w-4 h-4" />
                          暂停播放
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          播放问题
                        </>
                      )}
                    </button>
                  )}
                </div>

                {message.role === 'user' && message.feedback && (
                  <div className="mt-4 card animate-fade-in">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">AI 点评</span>
                      <div className="flex ml-2">{getRatingStars(message.feedback.rating)}</div>
                      <span className="text-sm text-purple-500 ml-auto font-semibold">{message.feedback.rating}/5</span>
                    </div>
                    
                    <p className="text-text-secondary mb-5 leading-relaxed">{message.feedback.comment}</p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-bg-paper rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-medium text-text-tertiary">STAR结构</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.starScore}%</div>
                        <div className="mt-2 h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.starScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-5 h-5 text-purple-500" />
                          <span className="text-xs font-medium text-text-tertiary">关键词命中</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.keywordHitRate}%</div>
                        <div className="mt-2 h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.keywordHitRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-5 h-5 text-cyan-500" />
                          <span className="text-xs font-medium text-text-tertiary">逻辑连贯性</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">{message.feedback.analysis.logicalScore}%</div>
                        <div className="mt-2 h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-700"
                            style={{ width: `${message.feedback.analysis.logicalScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-bg-paper rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-medium text-text-tertiary">表达流畅度</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">
                          {transcript.split('').length > 100 ? '优' : transcript.split('').length > 50 ? '良' : '中'}
                        </div>
                        <div className="mt-2 h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-700"
                            style={{ width: `${Math.min(transcript.length * 0.8, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {message.feedback.strengths.length > 0 && (
                        <div className="flex items-start gap-3 bg-sage-50 rounded-xl p-4">
                          <CheckCircle2 className="w-6 h-6 text-sage-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-sage-600">优点：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.strengths.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      {message.feedback.weaknesses.length > 0 && (
                        <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-4">
                          <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-rose-500">待改进：</span>
                            <span className="text-sm text-text-secondary ml-1">
                              {message.feedback.weaknesses.join('、')}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
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
              <div className="w-10 h-10 rounded-full bg-sage-100 flex-shrink-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-sage-400 border-t-sage-600 rounded-full animate-spin" />
              </div>
              <div className="card px-6 py-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  <span className="text-sm text-text-secondary">正在分析你的回答...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs text-text-tertiary">
                {isTypingMode ? '使用文字输入模式' : '点击麦克风开始录音'}
              </span>
              <button
                onClick={() => {
                  setIsTypingMode(!isTypingMode)
                  if (!isTypingMode) setIsListening(false)
                }}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  isTypingMode
                    ? 'bg-purple-100 text-purple-600 border border-purple-200'
                    : 'bg-bg-paper text-text-tertiary border border-border hover:border-purple-200'
                }`}
              >
                {isTypingMode ? (
                  <>
                    <Mic className="w-3 h-3 inline mr-1" />
                    切换语音输入
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 inline mr-1" />
                    切换文字输入
                  </>
                )}
              </button>
            </div>
            <span className={`text-xs font-medium ${transcript.length > 50 ? 'text-purple-500' : 'text-text-tertiary'}`}>
              {transcript.length} 字
            </span>
          </div>
          
          {isTypingMode ? (
            <div className="flex gap-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="请输入你的回答..."
                className="flex-1 h-32 px-5 py-4 bg-bg-paper border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 resize-none transition-all"
                maxLength={2000}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!transcript.trim() || isLoading}
                className={`w-16 h-32 rounded-xl flex items-center justify-center transition-all ${
                  transcript.trim() && !isLoading
                    ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 active:scale-95 text-white'
                    : 'bg-bg-paper cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="card p-4 mb-4 min-h-[100px]">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Volume2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    {transcript ? (
                      <p className="text-text-primary text-base leading-relaxed">{transcript}</p>
                    ) : (
                      <p className="text-text-tertiary text-base">点击下方麦克风按钮开始语音输入...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setTranscript('')}
                  disabled={!transcript.trim()}
                  className={`px-6 py-4 rounded-xl flex items-center gap-2 transition-all ${
                    transcript.trim()
                      ? 'bg-bg-paper text-text-secondary hover:bg-sage-50'
                      : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                  }`}
                >
                  <VolumeX className="w-5 h-5" />
                  清空
                </button>
                
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isListening
                      ? 'bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 shadow-rose-500/30 animate-pulse'
                      : 'bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 shadow-purple-500/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                
                {isListening && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 flex items-end justify-center gap-1 mb-2">
                      {Array(8).fill(0).map((_, i) => (
                        <div 
                          key={i}
                          className="w-2 bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-full transition-all duration-75"
                          style={{ 
                            height: `${Math.max(10, audioLevel * 100 * (i % 3 + 1) / 3)}%`,
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-mono text-purple-500">{formatRecordingTime(recordingDuration)}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!transcript.trim() || isLoading}
                  className={`px-6 py-4 rounded-xl flex items-center gap-2 transition-all ${
                    transcript.trim() && !isLoading
                      ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 active:scale-95 text-white font-medium'
                      : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isLoading ? '发送中...' : '发送回答'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}