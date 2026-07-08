import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ArrowLeft, Zap, Shield, Heart, RotateCcw, Send, AlertTriangle, Mic, MicOff, Video, VideoOff, Play, Pause, Volume2, VolumeX, Clock, User } from 'lucide-react'

interface PressureQuestion {
  question: string
  intensity: 'low' | 'medium' | 'high'
  round: number
}

export default function PressureInterview() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState<PressureQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [heartRate, setHeartRate] = useState(72)
  const [couragePoints, setCouragePoints] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [practiceMode, setPracticeMode] = useState<'text' | 'voice' | 'video'>('text')
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<(typeof SpeechRecognition) | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  useEffect(() => {
    const timer = setInterval(() => {
      setHeartRate(prev => {
        const variation = currentQuestion?.intensity === 'high' ? 15 : currentQuestion?.intensity === 'medium' ? 10 : 5
        const newRate = prev + Math.floor(Math.random() * variation * 2) - variation
        return Math.min(140, Math.max(60, newRate))
      })
    }, 2000)
    return () => clearInterval(timer)
  }, [currentQuestion])

  useEffect(() => {
    if (currentQuestion) {
      setCouragePoints(prev => {
        const deduction = currentQuestion.intensity === 'high' ? 10 : currentQuestion.intensity === 'medium' ? 5 : 2
        return Math.max(0, prev - deduction)
      })
    }
  }, [currentQuestion])

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-rose-500 text-white'
      case 'medium': return 'bg-amber-500 text-white'
      default: return 'bg-amber-200 text-amber-900'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'high': return '高压'
      case 'medium': return '中压'
      default: return '低压'
    }
  }

  const getHeartRateColor = () => {
    if (heartRate >= 120) return 'text-rose-500'
    if (heartRate >= 100) return 'text-amber-500'
    if (heartRate >= 85) return 'text-amber-400'
    return 'text-success'
  }

  const getCourageColor = () => {
    if (couragePoints >= 70) return 'bg-success'
    if (couragePoints >= 40) return 'bg-amber-400'
    return 'bg-rose-500'
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    if (currentQuestion && !isPlaying) {
      setTimeout(() => {
        speakText(currentQuestion.question)
      }, 500)
    }
  }, [currentQuestion])

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

  const initVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsVideoOn(true)
      }
    } catch (error) {
      console.error('Failed to access camera:', error)
      alert('无法访问摄像头，请检查权限设置')
    }
  }, [])

  const stopVideo = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop())
      videoStreamRef.current = null
    }
    setIsVideoOn(false)
  }, [])

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
      if (practiceMode === 'video' && !isVideoOn) {
        await initVideo()
      }
      recognitionRef.current?.start()
      setIsListening(true)
      setRecordingDuration(0)
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    }
  }

  const toggleVideo = async () => {
    if (isVideoOn) {
      stopVideo()
    } else {
      await initVideo()
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/training/pressure-reset', {
        method: 'POST',
      })
      await response.json()
      await fetchNextQuestion()
    } catch (error) {
      console.error('Failed to start:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNextQuestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/training/pressure-question', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        setCurrentQuestion({
          question: data.question,
          intensity: data.intensity,
          round: data.round,
        })
        setMessage('')
        setTranscript('')
        setRecordingDuration(0)
      }
    } catch (error) {
      console.error('Failed to fetch question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    const inputText = practiceMode === 'text' ? message : transcript
    if (!inputText.trim()) return
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      fetchNextQuestion()
    }, 1500)
  }

  const handleEnd = () => {
    stopAudioAnalysis()
    stopVideo()
    stopSpeaking()
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    fetch('/api/training/pressure-reset', { method: 'POST' })
    setCurrentQuestion(null)
    setCouragePoints(100)
    setHeartRate(72)
    setMessage('')
    setTranscript('')
    setIsVideoOn(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/training')}
            className="flex items-center gap-2 text-text-secondary hover:text-sage-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回专项训练</span>
          </button>
          <h1 className="text-lg font-display font-semibold text-text-primary">压力面试特训</h1>
          <div className="w-24" />
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {!currentQuestion ? (
            <div className="text-center py-12">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center">
                <Flame className="w-16 h-16 text-amber-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-4">
                压力面试特训
              </h1>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                通过挑战性提问，锻炼你的心理素质和应变能力。随着回合增加，压力逐渐升级，看看你能坚持到第几轮！
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                <div className="card p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="text-lg font-semibold text-text-primary">心跳监测</div>
                  <div className="text-xs text-text-tertiary">实时压力指数</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-lg font-semibold text-text-primary">抗压能力</div>
                  <div className="text-xs text-text-tertiary">勇气值系统</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-sage-500" />
                  </div>
                  <div className="text-lg font-semibold text-text-primary">压力升级</div>
                  <div className="text-xs text-text-tertiary">难度递增</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-lg font-semibold text-text-primary">真实模拟</div>
                  <div className="text-xs text-text-tertiary">还原高压场景</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 justify-center">
                <button
                  onClick={() => setPracticeMode('text')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    practiceMode === 'text'
                      ? 'bg-sage-50 text-sage-600 border border-sage-200'
                      : 'bg-surface text-text-secondary border border-border hover:border-sage-200'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  文字练习
                </button>
                <button
                  onClick={() => setPracticeMode('voice')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    practiceMode === 'voice'
                      ? 'bg-purple-50 text-purple-600 border border-purple-200'
                      : 'bg-surface text-text-secondary border border-border hover:border-purple-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  语音练习
                </button>
                <button
                  onClick={() => setPracticeMode('video')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    practiceMode === 'video'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-surface text-text-secondary border border-border hover:border-amber-200'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  视频练习
                </button>
              </div>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all ${
                  !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:shadow-xl hover:shadow-amber-500/20 text-white'
                    : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                }`}
              >
                {isLoading ? '准备中...' : '开始挑战'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary">第 {currentQuestion.round} 轮</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIntensityColor(currentQuestion.intensity)}`}>
                      {getIntensityLabel(currentQuestion.intensity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className={`w-5 h-5 ${getHeartRateColor()}`} />
                      <span className={`text-xl font-semibold ${getHeartRateColor()}`}>{heartRate}</span>
                      <span className="text-xs text-text-tertiary">bpm</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">勇气值</span>
                    <span className={`text-xl font-semibold ${couragePoints >= 70 ? 'text-success' : couragePoints >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {couragePoints}%
                    </span>
                  </div>
                  <div className="h-3 bg-bg-paper rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getCourageColor()}`}
                      style={{ width: `${couragePoints}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Flame className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl text-text-primary font-medium leading-relaxed">
                        {currentQuestion.question}
                      </p>
                      <button
                        onClick={() => isPlaying ? stopSpeaking() : speakText(currentQuestion.question)}
                        className="mt-4 flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4" />
                            暂停播放
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            重新播放问题
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">你的回答</span>
                    <span className="text-xs text-text-tertiary">{(practiceMode === 'text' ? message : transcript).length}/1000</span>
                  </div>
                  
                  {practiceMode === 'text' ? (
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="面对压力问题，保持冷静，给出你的回答..."
                      className="w-full h-32 input-field resize-none"
                      maxLength={1000}
                    />
                  ) : (
                    <>
                      <div className="card p-4 mb-4 min-h-[100px]">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Volume2 className="w-5 h-5 text-amber-500" />
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
                              ? 'bg-surface text-text-secondary hover:bg-sage-50 border border-border'
                              : 'bg-bg-paper text-text-tertiary cursor-not-allowed border border-border'
                          }`}
                        >
                          <VolumeX className="w-5 h-5" />
                          清空
                        </button>
                        
                        {practiceMode === 'video' && (
                          <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                              isVideoOn
                                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:shadow-xl hover:shadow-amber-500/20'
                                : 'bg-surface hover:bg-sage-50 border border-border'
                            }`}
                          >
                            {isVideoOn ? (
                              <Video className="w-6 h-6 text-white" />
                            ) : (
                              <VideoOff className="w-6 h-6 text-text-tertiary" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={toggleListening}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                            isListening
                              ? 'bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 shadow-rose-500/30 animate-pulse'
                              : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 shadow-amber-500/30 hover:scale-105 active:scale-95'
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
                                  className="w-2 bg-gradient-to-t from-amber-400 to-rose-400 rounded-t-full transition-all duration-75"
                                  style={{ 
                                    height: `${Math.max(10, audioLevel * 100 * (i % 3 + 1) / 3)}%`,
                                    animationDelay: `${i * 50}ms`
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-mono text-amber-500">{formatRecordingTime(recordingDuration)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={handleEnd}
                      className="px-6 py-3 rounded-xl bg-surface text-text-secondary hover:bg-sage-50 border border-border transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      结束挑战
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!((practiceMode === 'text' ? message : transcript).trim()) || isTyping}
                      className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                        ((practiceMode === 'text' ? message : transcript).trim()) && !isTyping
                          ? 'bg-gradient-to-r from-amber-400 to-rose-400 hover:shadow-lg hover:shadow-amber-500/20 text-white'
                          : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                      }`}
                    >
                      {isTyping ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          面试官思考中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          提交回答
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {practiceMode === 'video' && (
                  <div className="w-80 flex-shrink-0">
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-bg-paper border border-border">
                      {isVideoOn && videoRef.current ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-sage-50 flex items-center justify-center mb-3">
                            <User className="w-10 h-10 text-sage-400" />
                          </div>
                          <p className="text-sm text-text-tertiary">点击摄像头按钮开启</p>
                        </div>
                      )}
                      {isListening && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-rose-500/90 rounded-full flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <span className="text-xs text-white font-medium">录音中</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-600 leading-relaxed">
                        💡 压力面试小贴士：保持冷静，眼神坚定，语速放缓，逻辑清晰地表达观点。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}