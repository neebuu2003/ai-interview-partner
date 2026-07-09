import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '@/store/interview'
import { mockInterviewStart } from '@/lib/mockApi'
import { ArrowRight, ArrowLeft, Target, Smile, Flame, Search, AlertCircle, Loader2, CheckCircle2, Code, Server, Layout, BarChart3, Palette, TrendingUp, FileText, Mic, Video } from 'lucide-react'

const industries = ['互联网', '金融', '教育', '医疗', '制造', '零售', '其他']
const positions = [
  { name: '前端开发', icon: Code },
  { name: '后端开发', icon: Server },
  { name: '产品经理', icon: Layout },
  { name: '数据分析师', icon: BarChart3 },
  { name: 'UI/UX设计师', icon: Palette },
  { name: '运营', icon: TrendingUp },
]

export default function InterviewPractice() {
  const navigate = useNavigate()
  const { 
    jd, industry, position, interviewerStyle, interviewMode, 
    setJd, setIndustry, setPosition, setInterviewerStyle, setInterviewMode, 
    startInterview 
  } = useInterviewStore()
  
  const [selectedPosition, setSelectedPosition] = useState('')
  const [errors, setErrors] = useState<{ jd?: string; position?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: { jd?: string; position?: string } = {}
    
    if (jd && jd.trim().length > 5000) {
      newErrors.jd = 'JD内容过长，请控制在5000字符以内'
    }

    const finalPosition = selectedPosition || position
    if (!finalPosition || finalPosition.trim().length === 0) {
      newErrors.position = '请选择或输入目标岗位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartInterview = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    const finalPosition = selectedPosition || position || '通用岗位'
    
    try {
      const data = await mockInterviewStart(
        jd || '',
        industry || '互联网',
        finalPosition,
        interviewerStyle
      )
      if (data.success) {
        setShowSuccess(true)
        startInterview({
          question: data.question,
          interviewId: data.interviewId,
          totalQuestions: data.totalQuestions,
          greeting: data.greeting,
          extractedSkills: data.extractedSkills,
        })
        setTimeout(() => {
          navigate(`/interview/${interviewMode}`)
        }, 100)
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
      setErrors({ jd: '网络错误，请检查网络连接后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-sage-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </button>
          <h1 className="text-lg font-display font-semibold text-text-primary">开始面试练习</h1>
          <div className="w-24" />
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-sage-100 to-sage-200 rounded-full flex items-center justify-center">
              <Target className="w-10 h-10 text-sage-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-4">
              开始你的面试练习
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">
              输入目标岗位JD，AI为你定制模拟面试，实时反馈帮你精准提升面试技巧
            </p>
          </div>

          <div className="card">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">目标岗位 JD</label>
                  <textarea
                    value={jd}
                    onChange={(e) => {
                      setJd(e.target.value)
                      if (errors.jd) setErrors({ ...errors, jd: undefined })
                    }}
                    placeholder="（可选）粘贴或输入目标岗位的JD描述，包括岗位职责、任职要求、技能要求等..."
                    className={`w-full h-40 px-4 py-3 rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none resize-none transition-all ${
                      errors.jd 
                        ? 'input-field-error' 
                        : 'input-field'
                    }`}
                    maxLength={5000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${jd.length > 5000 ? 'text-error' : 'text-text-tertiary'}`}>
                      {jd.length}/5000 字符
                    </span>
                    {errors.jd && (
                      <span className="text-xs text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.jd}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">行业选择</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">请选择行业</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">目标岗位</label>
                    <input
                      type="text"
                      value={position || selectedPosition}
                      onChange={(e) => {
                        setPosition(e.target.value)
                        setSelectedPosition('')
                        if (errors.position) setErrors({ ...errors, position: undefined })
                      }}
                      placeholder="请输入岗位名称"
                      className={`w-full px-4 py-3 rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none transition-all ${
                        errors.position 
                          ? 'input-field-error' 
                          : 'input-field'
                      }`}
                    />
                    {errors.position && (
                      <span className="text-xs text-error flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.position}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-4">热门岗位快速选择</label>
                <div className="grid grid-cols-2 gap-3">
                  {positions.map((pos) => {
                    const Icon = pos.icon
                    return (
                      <button
                        key={pos.name}
                        onClick={() => {
                          setSelectedPosition(pos.name)
                          setPosition(pos.name)
                          if (errors.position) setErrors({ ...errors, position: undefined })
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${
                          selectedPosition === pos.name
                            ? 'bg-sage-50 border-sage-300 text-sage-700'
                            : 'bg-surface border-border text-text-secondary hover:border-sage-300 hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{pos.name}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-text-secondary mb-4">选择面试模式</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setInterviewMode('text')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewMode === 'text'
                          ? 'bg-sage-50 border-sage-300 text-sage-700'
                          : 'bg-surface border-border text-text-secondary hover:border-sage-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">文字面试</span>
                      <span className="text-xs text-text-tertiary">锻炼思路逻辑</span>
                    </button>
                    <button
                      onClick={() => setInterviewMode('voice')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewMode === 'voice'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-surface border-border text-text-secondary hover:border-purple-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">语音面试</span>
                      <span className="text-xs text-text-tertiary">锻炼口述表达</span>
                    </button>
                    <button
                      onClick={() => setInterviewMode('video')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewMode === 'video'
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-surface border-border text-text-secondary hover:border-orange-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">视频面试</span>
                      <span className="text-xs text-text-tertiary">锻炼仪态表情</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-text-secondary mb-4">选择面试官风格</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setInterviewerStyle('friendly')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewerStyle === 'friendly'
                          ? 'bg-sage-50 border-sage-300 text-sage-700'
                          : 'bg-surface border-border text-text-secondary hover:border-sage-300'
                      }`}
                    >
                      <Smile className="w-6 h-6" />
                      <span className="text-xs font-medium">友善鼓励型</span>
                    </button>
                    <button
                      onClick={() => setInterviewerStyle('pressure')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewerStyle === 'pressure'
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-surface border-border text-text-secondary hover:border-rose-300'
                      }`}
                    >
                      <Flame className="w-6 h-6" />
                      <span className="text-xs font-medium">压力挑战型</span>
                    </button>
                    <button
                      onClick={() => setInterviewerStyle('deep')}
                      className={`flex flex-col items-center gap-3 px-4 py-4 rounded-lg border transition-all duration-300 ${
                        interviewerStyle === 'deep'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-surface border-border text-text-secondary hover:border-blue-300'
                      }`}
                    >
                      <Search className="w-6 h-6" />
                      <span className="text-xs font-medium">深度追问型</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={isSubmitting}
                  className={`w-full mt-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-border text-text-tertiary cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在生成面试问题...
                    </>
                  ) : (
                    <>
                      开始模拟面试
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {showSuccess && (
                  <div className="mt-4 bg-sage-50 border border-sage-200 rounded-lg p-4 flex items-center gap-3 animate-scale-in">
                    <CheckCircle2 className="w-5 h-5 text-sage-600" />
                    <span className="text-sage-700 font-medium">面试准备完成，正在进入面试...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}