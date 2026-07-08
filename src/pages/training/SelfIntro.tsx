import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Sparkles, Copy, Check, ArrowLeft, FileText, Star, Shield, Mic, MicOff, Video, VideoOff, Play, Pause, Volume2, VolumeX, Send, Clock, Loader2 } from 'lucide-react'

export default function SelfIntro() {
  const navigate = useNavigate()
  const [experience, setExperience] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<{ concise: string; impressive: string; steady: string } | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingType, setPlayingType] = useState<string | null>(null)
  const [practiceMode, setPracticeMode] = useState<'text' | 'voice' | 'video'>('text')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<(typeof SpeechRecognition) | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  const handleGenerate = async () => {
    if (!experience.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/training/self-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: experience.trim() }),
      })
      const data = await response.json()
      if (data.success) {
        setResults({
          concise: data.concise,
          impressive: data.impressive,
          steady: data.steady,
        })
      }
    } catch (error) {
      console.error('Failed to generate self intro:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const speakText = (text: string, type: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => {
        setIsPlaying(true)
        setPlayingType(type)
      }
      utterance.onend = () => {
        setIsPlaying(false)
        setPlayingType(null)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        setPlayingType(null)
      }
      
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
          <h1 className="text-lg font-display font-semibold text-text-primary">自我介绍定制</h1>
          <div className="w-24" />
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-pink-50 border border-pink-200 rounded-full text-pink-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI智能生成
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-4">
              定制专属自我介绍
            </h1>
            <p className="text-text-secondary">
              输入你的经历或简介，AI自动为你生成三种风格的自我介绍
            </p>
          </div>

          <div className="card p-6 mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-3">
              个人经历 / 简介
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="请输入你的教育背景、工作经历、项目经验、技能特长等..."
              className="w-full h-48 input-field resize-none"
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-tertiary">{experience.length}/2000</span>
              <button
                onClick={handleGenerate}
                disabled={!experience.trim() || isGenerating}
                className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  experience.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:shadow-lg hover:shadow-pink-500/20 text-white'
                    : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成自我介绍
                  </>
                )}
              </button>
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 border-l-4 border-cyan-400">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-text-primary">简洁版</h3>
                      <p className="text-xs text-text-tertiary">30秒快速介绍，突出核心亮点</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(results.concise, 'concise')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-cyan-50 transition-all"
                    >
                      {isPlaying && playingType === 'concise' ? (
                        <Pause className="w-5 h-5 text-cyan-500" />
                      ) : (
                        <Play className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(results.concise, 'concise')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-cyan-50 transition-all"
                    >
                      {copiedType === 'concise' ? (
                        <Check className="w-5 h-5 text-sage-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-4">
                  {results.concise}
                </p>
                <div className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  约30秒
                </div>
              </div>

              <div className="card p-6 border-l-4 border-pink-400">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-text-primary">亮眼版</h3>
                      <p className="text-xs text-text-tertiary">1分钟深度介绍，展示个人魅力</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(results.impressive, 'impressive')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-pink-50 transition-all"
                    >
                      {isPlaying && playingType === 'impressive' ? (
                        <Pause className="w-5 h-5 text-pink-500" />
                      ) : (
                        <Play className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(results.impressive, 'impressive')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-pink-50 transition-all"
                    >
                      {copiedType === 'impressive' ? (
                        <Check className="w-5 h-5 text-sage-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-4">
                  {results.impressive}
                </p>
                <div className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  约60秒
                </div>
              </div>

              <div className="card p-6 border-l-4 border-purple-400">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-text-primary">稳重型</h3>
                      <p className="text-xs text-text-tertiary">正式场合使用，彰显专业稳重</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(results.steady, 'steady')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-purple-50 transition-all"
                    >
                      {isPlaying && playingType === 'steady' ? (
                        <Pause className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Play className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(results.steady, 'steady')}
                      className="p-2 rounded-lg bg-bg-paper hover:bg-purple-50 transition-all"
                    >
                      {copiedType === 'steady' ? (
                        <Check className="w-5 h-5 text-sage-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-4">
                  {results.steady}
                </p>
                <div className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  约90秒
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-pink-500" />
                模拟练习
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => {
                    setPracticeMode('text')
                    setIsVideoOn(false)
                    stopVideo()
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    practiceMode === 'text'
                      ? 'bg-pink-50 text-pink-600 border border-pink-200'
                      : 'bg-bg-paper text-text-secondary border border-border hover:border-pink-200'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  文字练习
                </button>
                <button
                  onClick={() => setPracticeMode('voice')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    practiceMode === 'voice'
                      ? 'bg-purple-50 text-purple-600 border border-purple-200'
                      : 'bg-bg-paper text-text-secondary border border-border hover:border-purple-200'
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
                      : 'bg-bg-paper text-text-secondary border border-border hover:border-amber-200'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  视频练习
                </button>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">你的回答</span>
                    <span className="text-xs text-text-tertiary">{transcript.length}/1000</span>
                  </div>
                  
                  {practiceMode === 'text' ? (
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="请输入你的自我介绍练习..."
                      className="w-full h-48 input-field resize-none"
                      maxLength={1000}
                    />
                  ) : (
                    <>
                      <div className="card p-4 mb-4 min-h-[100px]">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Volume2 className="w-5 h-5 text-pink-500" />
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
                        
                        {practiceMode === 'video' && (
                          <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                              isVideoOn
                                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 hover:shadow-xl hover:shadow-amber-500/20'
                                : 'bg-bg-paper hover:bg-sage-50'
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
                              : 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 shadow-pink-500/30 hover:scale-105 active:scale-95'
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
                                  className="w-2 bg-gradient-to-t from-pink-400 to-purple-400 rounded-t-full transition-all duration-75"
                                  style={{ 
                                    height: `${Math.max(10, audioLevel * 100 * (i % 3 + 1) / 3)}%`,
                                    animationDelay: `${i * 50}ms`
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-mono text-pink-500">{formatRecordingTime(recordingDuration)}</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (transcript.trim()) {
                              alert(`练习完成！你的自我介绍练习共 ${transcript.length} 个字\n\n${transcript}`)
                              setTranscript('')
                              setRecordingDuration(0)
                            }
                          }}
                          disabled={!transcript.trim()}
                          className={`px-6 py-4 rounded-xl flex items-center gap-2 transition-all ${
                            transcript.trim()
                              ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:shadow-xl hover:shadow-pink-500/20 hover:scale-105 active:scale-95 text-white font-medium'
                              : 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-5 h-5" />
                          完成练习
                        </button>
                      </div>
                    </>
                  )}
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
                        💡 视频练习小贴士：保持自然微笑，注视摄像头，坐姿端正，背景整洁。
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