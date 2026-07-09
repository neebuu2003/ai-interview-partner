import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockGroupRoles } from '@/lib/mockApi'
import { Users, ArrowLeft, Brain, Target, MessageSquare, Lightbulb, Play, Pause, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, User, RefreshCw } from 'lucide-react'

interface Role {
  name: string
  roleDescription: string
  speakingPoints: string[]
  strategy: string
  templates: { name: string; content: string }[]
}

export default function GroupInterview() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<string | null>(null)
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

  const speakText = (text: string, type: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => { setIsPlaying(true); setPlayingType(type); }
      utterance.onend = () => { setIsPlaying(false); setPlayingType(null); }
      utterance.onerror = () => { setIsPlaying(false); setPlayingType(null); }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setPlayingType(null)
    }
  }

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

  const generateRoles = async () => {
    setIsLoading(true)
    try {
      const data = await mockGroupRoles()
      if (data.success) {
        setRoles(data.roles)
        setSelectedRole(null)
      }
    } catch (error) {
      console.error('Failed to generate roles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateRoles()
  }, [])

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
          <h1 className="text-lg font-display font-semibold text-text-primary">群面模拟</h1>
          <div className="w-24" />
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sage-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-sage-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-4">
              群面模拟
            </h1>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              模拟无领导小组讨论场景，通过角色分配和话术模板，帮助你掌握群面技巧，提升团队协作和表达能力。
            </p>
            
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
                    ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                    : 'bg-surface text-text-secondary border border-border hover:border-cyan-200'
                }`}
              >
                <Video className="w-5 h-5" />
                视频练习
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2">
                  <Users className="w-6 h-6 text-sage-500" />
                  角色分配
                </h2>
                <button
                  onClick={generateRoles}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-surface text-text-secondary hover:bg-sage-50 border border-border transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-text-tertiary/30 border-t-text-tertiary rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  重新分配
                </button>
              </div>

              {roles.map((role, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedRole(role)}
                  className={`card p-6 cursor-pointer transition-all ${
                    selectedRole?.name === role.name
                      ? 'border-sage-300 shadow-cardHover'
                      : 'hover:border-sage-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-sage-100 to-cyan-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-sage-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{role.name}</h3>
                        <p className="text-xs text-text-tertiary">角色 {index + 1}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{role.roleDescription}</p>
                </div>
              ))}
            </div>

            <div className="flex-1">
              {selectedRole ? (
                <div className="space-y-6">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2">
                        <Target className="w-6 h-6 text-cyan-500" />
                        角色定位
                      </h2>
                      <button
                        onClick={() => isPlaying && playingType === 'description' ? stopSpeaking() : speakText(selectedRole.roleDescription, 'description')}
                        className="p-2 rounded-xl bg-surface hover:bg-sage-50 border border-border transition-all"
                      >
                        {isPlaying && playingType === 'description' ? (
                          <Pause className="w-5 h-5 text-cyan-500" />
                        ) : (
                          <Play className="w-5 h-5 text-cyan-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-text-primary leading-relaxed">{selectedRole.roleDescription}</p>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2 mb-4">
                      <Brain className="w-6 h-6 text-sage-500" />
                      发言要点
                    </h2>
                    <ul className="space-y-3">
                      {selectedRole.speakingPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-sage-600 font-medium">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary">{point}</p>
                            <button
                              onClick={() => isPlaying && playingType === `point-${index}` ? stopSpeaking() : speakText(point, `point-${index}`)}
                              className="mt-1 text-xs text-sage-500 hover:text-sage-600 transition-colors flex items-center gap-1"
                            >
                              {isPlaying && playingType === `point-${index}` ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              朗读
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2 mb-4">
                      <Lightbulb className="w-6 h-6 text-amber-500" />
                      策略建议
                    </h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-text-primary leading-relaxed">{selectedRole.strategy}</p>
                      <button
                        onClick={() => isPlaying && playingType === 'strategy' ? stopSpeaking() : speakText(selectedRole.strategy, 'strategy')}
                        className="mt-3 text-xs text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                      >
                        {isPlaying && playingType === 'strategy' ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        朗读策略
                      </button>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-xl font-display font-semibold text-text-primary flex items-center gap-2 mb-4">
                      <MessageSquare className="w-6 h-6 text-success" />
                      话术模板
                    </h2>
                    <div className="space-y-4">
                      {selectedRole.templates.map((template, index) => (
                        <div key={index} className="bg-sage-50 border border-sage-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-sage-600">{template.name}</h3>
                            <button
                              onClick={() => isPlaying && playingType === `template-${index}` ? stopSpeaking() : speakText(template.content, `template-${index}`)}
                              className="p-1.5 rounded-xl bg-surface hover:bg-sage-100 transition-all"
                            >
                              {isPlaying && playingType === `template-${index}` ? (
                                <Pause className="w-4 h-4 text-sage-500" />
                              ) : (
                                <Play className="w-4 h-4 text-sage-500" />
                              )}
                            </button>
                          </div>
                          <p className="text-text-primary text-sm leading-relaxed">{template.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-text-secondary">练习回答</span>
                      <span className="text-xs text-text-tertiary">{transcript.length}/1000</span>
                    </div>
                    
                    {practiceMode === 'text' ? (
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="使用上面的话术模板，模拟群面场景进行练习..."
                        className="w-full h-32 input-field resize-none"
                        maxLength={1000}
                      />
                    ) : (
                      <>
                        <div className="card p-4 mb-4 min-h-[100px]">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Volume2 className="w-5 h-5 text-sage-500" />
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
                                  ? 'bg-gradient-to-r from-cyan-400 via-sage-400 to-blue-400 hover:shadow-xl hover:shadow-cyan-500/20'
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
                                ? 'bg-gradient-to-r from-cyan-400 via-sage-400 to-blue-400 shadow-cyan-500/30 animate-pulse'
                                : 'bg-gradient-to-r from-cyan-400 via-sage-400 to-blue-400 shadow-cyan-500/30 hover:scale-105 active:scale-95'
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
                                    className="w-2 bg-gradient-to-t from-sage-400 to-cyan-400 rounded-t-full transition-all duration-75"
                                    style={{ 
                                      height: `${Math.max(10, audioLevel * 100 * (i % 3 + 1) / 3)}%`,
                                      animationDelay: `${i * 50}ms`
                                    }}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-mono text-sage-500">{formatRecordingTime(recordingDuration)}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-bg-paper rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-text-tertiary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-text-secondary mb-2">选择一个角色</h3>
                  <p className="text-text-tertiary">点击左侧角色卡片，查看详细的角色定位和话术模板</p>
                </div>
              )}
            </div>
            
            {practiceMode === 'video' && (
              <div className="w-80 flex-shrink-0">
                <div className="card p-6">
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
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-cyan-500/90 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs text-white font-medium">录音中</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-sage-50 rounded-xl border border-sage-200">
                    <p className="text-xs text-sage-600 leading-relaxed">
                      💡 群面小贴士：保持眼神交流，注意语速语调，适时打断和被打断，积极参与讨论但不抢话。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}