import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '@/store/interview'
import { useGrowthStore } from '@/store/growth'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { Trophy, Target, TrendingUp, Star, CheckCircle2, ArrowRight, Home, RotateCcw, BarChart3, Download, Copy, CheckCircle, Loader2, Brain, BarChart2 } from 'lucide-react'

export default function Results() {
  const navigate = useNavigate()
  const { results, resetInterview, messages, position, industry, interviewMode } = useInterviewStore()
  const { addHistoryRecord } = useGrowthStore()
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!results) {
      navigate('/')
      return
    }
    
    if (!saved && results) {
      const questionAnswerPairs = []
      let currentQuestion = ''
      let currentAnswer = ''
      let currentRating = 0
      
      messages.forEach(msg => {
        if (msg.role === 'interviewer' && msg.content && !msg.isFollowup) {
          if (currentQuestion && currentAnswer) {
            questionAnswerPairs.push({
              question: currentQuestion,
              answer: currentAnswer,
              rating: currentRating,
            })
          }
          currentQuestion = msg.content
          currentAnswer = ''
          currentRating = 0
        } else if (msg.role === 'user' && msg.content) {
          currentAnswer = msg.content
          if (msg.feedback) {
            currentRating = msg.feedback.rating
          }
        }
      })
      
      if (currentQuestion && currentAnswer) {
        questionAnswerPairs.push({
          question: currentQuestion,
          answer: currentAnswer,
          rating: currentRating,
        })
      }
      
      addHistoryRecord({
        position: position || '通用岗位',
        industry: industry || '互联网',
        mode: interviewMode,
        avgRating: results.avgRating,
        totalQuestions: results.totalQuestions,
        answeredQuestions: results.answeredQuestions,
        radarData: results.radarData,
        questions: questionAnswerPairs,
        duration: 0,
      })
      
      setSaved(true)
    }
  }, [results, navigate, saved, messages, position, industry, interviewMode, addHistoryRecord])

  const handleHome = () => {
    resetInterview()
    navigate('/')
  }

  const handleRetry = () => {
    resetInterview()
    navigate('/')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#5A8A5E'
    if (score >= 65) return '#3B82F6'
    if (score >= 50) return '#B88F40'
    return '#9A5E5E'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 65) return '良好'
    if (score >= 50) return '待提升'
    return '需加强'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-sage-50 text-sage-700 border border-sage-200'
    if (score >= 65) return 'bg-blue-50 text-blue-700 border border-blue-200'
    if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200'
    return 'bg-rose-50 text-error border border-rose-200'
  }

  const handleCopyReport = () => {
    if (!results) return
    
    const report = `
AI 面试陪练官 - 面试评估报告

【综合评分】${results.avgRating}/5
【能力总分】${Math.round(results.radarData.reduce((sum, item) => sum + item.score, 0) / results.radarData.length)}/100
【回答题数】${results.answeredQuestions}/${results.totalQuestions}

【能力分析】
${results.radarData.map(item => `- ${item.dimension}: ${item.score}分 (${getScoreLabel(item.score)})`).join('\n')}

【综合评价】
${results.summary}

【改进建议】
${results.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

【识别技能】
${results.extractedSkills.join('、')}
    `.trim()
    
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      window.print()
      setIsExporting(false)
    }, 500)
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-6 h-6 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
          </div>
          <p className="text-text-tertiary">加载中...</p>
        </div>
      </div>
    )
  }

  const radarData = results.radarData.map(item => ({
    dimension: item.dimension,
    score: item.score,
    fullMark: 100,
  }))

  const averageScore = Math.round(
    results.radarData.reduce((sum, item) => sum + item.score, 0) / results.radarData.length
  )

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-surface/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-sage-600" />
            </div>
            <span className="text-xl font-display font-semibold text-text-primary">
              AI 面试陪练官
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyReport}
              className="px-5 py-2.5 bg-bg-paper text-text-secondary rounded-xl border border-border hover:border-sage-300 hover:text-text-primary transition-all flex items-center gap-2"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-sage-600" /> : <Copy className="w-5 h-5" />}
              {copied ? '已复制' : '复制报告'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-bg-paper text-text-secondary rounded-xl border border-border hover:border-sage-300 hover:text-text-primary transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isExporting ? '导出中...' : '导出PDF'}
            </button>
            <button
              onClick={handleHome}
              className="px-5 py-2.5 bg-bg-paper text-text-secondary rounded-xl border border-border hover:border-sage-300 hover:text-text-primary transition-all flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              返回首页
            </button>
            <button
              onClick={() => { resetInterview(); navigate('/growth') }}
              className="px-5 py-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-all flex items-center gap-2"
            >
              <BarChart2 className="w-5 h-5" />
              查看成长
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto" id="report-content">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-sage-50 border border-sage-200 rounded-full text-sage-700 text-sm font-medium mb-6">
              <Trophy className="w-4 h-4" />
              面试完成
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-text-primary mb-4">面试评估报告</h1>
            <p className="text-lg text-text-secondary">以下是你的面试表现分析和改进建议</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-sage-600" />
                </div>
                <span className="text-sm text-text-tertiary">平均评分</span>
              </div>
              <div className="text-5xl font-display font-semibold text-text-primary">{results.avgRating}<span className="text-xl text-text-tertiary">/5</span></div>
              <div className="flex mt-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < results.avgRating ? 'text-amber-500 fill-amber-500' : 'text-border'}`}
                  />
                ))}
              </div>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-text-tertiary">能力总分</span>
              </div>
              <div className="text-5xl font-display font-semibold text-text-primary">{averageScore}<span className="text-xl text-text-tertiary">/100</span></div>
              <div className={`inline-block text-sm mt-3 px-4 py-1.5 rounded-full ${getScoreBgColor(averageScore)}`}>
                {getScoreLabel(averageScore)}
              </div>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-text-tertiary">回答题数</span>
              </div>
              <div className="text-5xl font-display font-semibold text-text-primary">{results.answeredQuestions}<span className="text-xl text-text-tertiary">/{results.totalQuestions}</span></div>
              <div className="text-sm text-text-secondary mt-3">已完成全部问题</div>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm text-text-tertiary">建议改进</span>
              </div>
              <div className="text-5xl font-display font-semibold text-text-primary">{results.suggestions.length}</div>
              <div className="text-sm text-text-secondary mt-3">项待提升</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-sage-600" />
                能力雷达图
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E8E4DF" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fill: '#6B655C', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9A948A', fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}分`, '得分']}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E8E4DF',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Radar
                      name="能力得分"
                      dataKey="score"
                      stroke="#7BAE7F"
                      fill="#7BAE7F"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card animate-fade-in">
              <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                能力详细分析
              </h2>
              <div className="space-y-5">
                {results.radarData.map((item) => (
                  <div key={item.dimension} className="bg-bg-paper rounded-xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-text-secondary">{item.dimension}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          item.score >= 80 ? 'text-sage-600' :
                          item.score >= 65 ? 'text-blue-600' :
                          item.score >= 50 ? 'text-amber-600' : 'text-error'
                        }`}>
                          {item.score}分
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${getScoreBgColor(item.score)}`}>
                          {getScoreLabel(item.score)}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-700"
                        style={{ 
                          width: `${item.score}%`,
                          backgroundColor: getScoreColor(item.score)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-12 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              综合评价
            </h2>
            <div className="bg-bg-paper rounded-xl p-6 border border-border">
              <p className="text-text-secondary leading-relaxed text-base">{results.summary}</p>
            </div>
          </div>

          <div className="card mb-12 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sage-600" />
              改进建议
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {results.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-bg-paper rounded-xl p-5 border border-border flex items-start gap-4 hover:border-sage-200 transition-all">
                  <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-700 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-12 animate-fade-in">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              岗位技能匹配
            </h2>
            <div className="flex flex-wrap gap-3">
              {results.extractedSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-5 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 hover:border-purple-300 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-text-tertiary">
              以上是从你的目标岗位JD中识别出的核心技能要求。建议在面试准备中重点准备这些技能相关的问题。
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              再练一次
            </button>
            <button
              onClick={handleHome}
              className="btn-secondary flex items-center gap-2"
            >
              返回首页
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
