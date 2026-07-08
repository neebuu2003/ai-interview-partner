import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGrowthStore } from '@/store/growth'
import { useInterviewStore } from '@/store/interview'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { ArrowLeft, History, Star, TrendingUp, Calendar, Trophy, Clock, Target, BookOpen, X, Check, Flame, Award, Zap, ChevronRight, Filter, Search, MessageCircle, User } from 'lucide-react'

type TabType = 'history' | 'favorites' | 'ability' | 'checkin'

export default function Growth() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('history')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [showDetail, setShowDetail] = useState<string | null>(null)
  
  const { 
    history, 
    favorites, 
    abilityHistory, 
    checkIn, 
    level, 
    xp, 
    totalInterviews,
    checkInToday,
    removeFavoritedQuestion,
    toggleWrongQuestion,
  } = useGrowthStore()
  
  const { position, industry, interviewMode } = useInterviewStore()

  useEffect(() => {
    if (totalInterviews > 0) {
      checkInToday()
    }
  }, [totalInterviews, checkInToday])

  const filteredHistory = history.filter(record => {
    const matchesKeyword = searchKeyword === '' || 
      record.position.includes(searchKeyword) || 
      record.industry.includes(searchKeyword)
    const matchesMode = filterMode === 'all' || record.mode === filterMode
    return matchesKeyword && matchesMode
  })

  const filteredFavorites = favorites.filter(fav => {
    const matchesKeyword = searchKeyword === '' || fav.question.includes(searchKeyword) || fav.position.includes(searchKeyword)
    const matchesWrong = filterMode === 'all' || (filterMode === 'wrong' && fav.isWrong) || (filterMode === 'favorite' && !fav.isWrong)
    return matchesKeyword && matchesWrong
  })

  const today = new Date().toISOString().split('T')[0]
  const hasCheckedInToday = checkIn.lastCheckInDate === today
  const weeklyTrend = useGrowthStore.getState().getWeeklyAbilityTrend()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    return `${month}月${day}日 周${weekDays[date.getDay()]}`
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text': return <MessageCircle className="w-4 h-4 text-sage-500" />
      case 'voice': return <Zap className="w-4 h-4 text-purple-500" />
      case 'video': return <Calendar className="w-4 h-4 text-amber-500" />
      default: return <MessageCircle className="w-4 h-4 text-text-tertiary" />
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'text': return '文字面试'
      case 'voice': return '语音面试'
      case 'video': return '视频面试'
      default: return '面试'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#6B9B6F'
    if (score >= 65) return '#7BAE7F'
    if (score >= 50) return '#C49859'
    return '#B87373'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 65) return '良好'
    if (score >= 50) return '一般'
    return '需提升'
  }

  const getLevelTitle = (level: number) => {
    const titles = ['面试小白', '初级练习生', '面试新星', '进阶选手', '面试达人', '资深面试官', '面试大师', '传奇面试家']
    return titles[Math.min(level, titles.length - 1)]
  }

  const abilityData = abilityHistory.length > 0 
    ? {
        expression: Math.round(abilityHistory.reduce((sum, h) => sum + h.expression, 0) / abilityHistory.length),
        logic: Math.round(abilityHistory.reduce((sum, h) => sum + h.logic, 0) / abilityHistory.length),
        adaptability: Math.round(abilityHistory.reduce((sum, h) => sum + h.adaptability, 0) / abilityHistory.length),
        communication: Math.round(abilityHistory.reduce((sum, h) => sum + h.communication, 0) / abilityHistory.length),
        structuredThinking: Math.round(abilityHistory.reduce((sum, h) => sum + h.structuredThinking, 0) / abilityHistory.length),
        professionalism: Math.round(abilityHistory.reduce((sum, h) => sum + h.professionalism, 0) / abilityHistory.length),
      }
    : { expression: 0, logic: 0, adaptability: 0, communication: 0, structuredThinking: 0, professionalism: 0 }

  const radarData = [
    { dimension: '表达力', value: abilityData.expression },
    { dimension: '逻辑力', value: abilityData.logic },
    { dimension: '应变力', value: abilityData.adaptability },
    { dimension: '沟通力', value: abilityData.communication },
    { dimension: '结构力', value: abilityData.structuredThinking },
    { dimension: '专业度', value: abilityData.professionalism },
  ]

  const generateCalendarDays = () => {
    const days = []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const isCheckedIn = checkIn.checkInDates.includes(dateStr)
      const isToday = dateStr === new Date().toISOString().split('T')[0]
      days.push({ day: i, dateStr, isCheckedIn, isToday })
    }
    
    return days
  }

  const tabs: { id: TabType; label: string; icon: typeof History }[] = [
    { id: 'history', label: '答题历史', icon: History },
    { id: 'favorites', label: '错题收藏', icon: Star },
    { id: 'ability', label: '能力看板', icon: TrendingUp },
    { id: 'checkin', label: '打卡闯关', icon: Calendar },
  ]

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
          <h1 className="text-lg font-display font-semibold text-text-primary">复盘成长</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-sage-50 border border-sage-200 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-text-primary font-medium">Lv.{level}</span>
              <span className="text-text-tertiary text-sm">{getLevelTitle(level)}</span>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">累计面试</p>
                  <p className="text-2xl font-bold text-text-primary">{totalInterviews} 次</p>
                </div>
                <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-sage-600" />
                </div>
              </div>
            </div>
            <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">打卡天数</p>
                  <p className="text-2xl font-bold text-text-primary">{checkIn.totalDays} 天</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">连续打卡</p>
                  <p className="text-2xl font-bold text-text-primary">{checkIn.streak} 天</p>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            </div>
            <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">累计经验</p>
                  <p className="text-2xl font-bold text-text-primary">{xp} XP</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-2 mb-6 flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-sage-50 text-sage-700 border border-sage-200'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-paper'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="card">
            {(activeTab === 'history' || activeTab === 'favorites') && (
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="搜索..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 transition-all appearance-none cursor-pointer"
                  >
                    {activeTab === 'history' ? (
                      <>
                        <option value="all">全部模式</option>
                        <option value="text">文字面试</option>
                        <option value="voice">语音面试</option>
                        <option value="video">视频面试</option>
                      </>
                    ) : (
                      <>
                        <option value="all">全部</option>
                        <option value="wrong">错题</option>
                        <option value="favorite">收藏</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-24 h-24 mx-auto mb-6 bg-sage-50 rounded-full flex items-center justify-center">
                      <History className="w-12 h-12 text-sage-400" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text-secondary mb-2">暂无面试记录</h3>
                    <p className="text-text-tertiary">完成一次面试后，记录将显示在这里</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-6 btn-primary"
                    >
                      开始面试
                    </button>
                  </div>
                ) : (
                  filteredHistory.map(record => (
                    <div key={record.id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-cardHover transition-all animate-slide-up">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center">
                            {getModeIcon(record.mode)}
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">{record.position}</p>
                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                              <span>{record.industry}</span>
                              <span>·</span>
                              <span>{getModeLabel(record.mode)}</span>
                              <span>·</span>
                              <span>{formatDate(record.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold" style={{ color: getScoreColor(record.avgRating * 20) }}>{record.avgRating}</span>
                              <span className="text-amber-500">/5</span>
                            </div>
                            <p className="text-xs text-text-tertiary">{record.answeredQuestions}/{record.totalQuestions} 题</p>
                          </div>
                          <button
                            onClick={() => setShowDetail(record.id === showDetail ? null : record.id)}
                            className="p-2 rounded-lg bg-bg-paper hover:bg-sage-50 transition-all"
                          >
                            <ChevronRight className={`w-5 h-5 text-text-tertiary transition-transform ${showDetail === record.id ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      {showDetail === record.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {record.radarData.slice(0, 3).map((item, index) => (
                              <div key={index} className="bg-bg-paper rounded-lg p-3">
                                <p className="text-xs text-text-tertiary mb-1">{item.dimension}</p>
                                <p className="text-lg font-bold" style={{ color: getScoreColor(item.score) }}>{item.score}</p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-sm text-text-secondary">答题详情：</p>
                            {record.questions.map((q, index) => (
                              <div key={index} className="bg-bg-paper rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-sm text-text-primary font-medium">Q{index + 1}: {q.question}</p>
                                  <div className="flex items-center gap-1">
                                    {Array(5).fill(0).map((_, i) => (
                                      <Star key={i} className={`w-4 h-4 ${i < q.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-text-secondary">A: {q.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-4">
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-24 h-24 mx-auto mb-6 bg-sage-50 rounded-full flex items-center justify-center">
                      <Star className="w-12 h-12 text-sage-400" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text-secondary mb-2">暂无收藏/错题</h3>
                    <p className="text-text-tertiary">在题库或面试中收藏问题，记录将显示在这里</p>
                  </div>
                ) : (
                  filteredFavorites.map(fav => (
                    <div key={fav.id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-cardHover transition-all animate-slide-up">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {fav.isWrong && (
                              <span className="badge-rose">错题</span>
                            )}
                            <span className="text-xs text-text-tertiary">{fav.position}</span>
                            <span className="text-xs text-text-tertiary">{fav.category}</span>
                          </div>
                          <p className="text-text-primary mb-2">{fav.question}</p>
                          <p className="text-xs text-text-tertiary">{formatDate(fav.addedAt)} 添加</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWrongQuestion(fav.id)}
                            className={`p-2 rounded-lg transition-all ${
                              fav.isWrong 
                                ? 'bg-rose-50 text-rose-500' 
                                : 'bg-bg-paper text-text-tertiary hover:bg-rose-50 hover:text-rose-500'
                            }`}
                            title={fav.isWrong ? '取消标记错题' : '标记为错题'}
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeFavoritedQuestion(fav.id)}
                            className="p-2 rounded-lg bg-bg-paper text-text-tertiary hover:bg-rose-50 hover:text-rose-500 transition-all"
                            title="移除收藏"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ability' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: '表达力', value: abilityData.expression, icon: MessageCircle },
                    { label: '逻辑力', value: abilityData.logic, icon: Target },
                    { label: '应变力', value: abilityData.adaptability, icon: Zap },
                    { label: '沟通力', value: abilityData.communication, icon: User },
                    { label: '结构力', value: abilityData.structuredThinking, icon: TrendingUp },
                    { label: '专业度', value: abilityData.professionalism, icon: BookOpen },
                  ].map((item, index) => (
                    <div key={index} className="bg-surface border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex items-center justify-between mb-3">
                        <item.icon className="w-5 h-5" style={{ color: getScoreColor(item.value) }} />
                        <span className="text-xs text-text-tertiary">{getScoreLabel(item.value)}</span>
                      </div>
                      <p className="text-3xl font-bold mb-2" style={{ color: getScoreColor(item.value) }}>{item.value}</p>
                      <p className="text-sm text-text-secondary">{item.label}</p>
                      <div className="mt-3 h-2 bg-bg-paper rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%`, backgroundColor: getScoreColor(item.value) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-border rounded-xl p-4 animate-fade-in">
                    <h3 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-sage-600" />
                      能力雷达图
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#E8E4DF" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6B655C', fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9A948A', fontSize: 10 }} />
                          <Radar name="能力值" dataKey="value" stroke="#7BAE7F" fill="#7BAE7F" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-4 animate-fade-in">
                    <h3 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sage-600" />
                      近7天能力趋势
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                          <XAxis dataKey="date" tick={{ fill: '#6B655C', fontSize: 10 }} tickFormatter={(date) => {
                            const d = new Date(date)
                            return `${d.getMonth() + 1}/${d.getDate()}`
                          }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#9A948A', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: '8px' }}
                            formatter={(value: number) => [`${value}分`, '']}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="expression" name="表达力" stroke="#6B9B6F" strokeWidth={2} />
                          <Line type="monotone" dataKey="logic" name="逻辑力" stroke="#7BAE7F" strokeWidth={2} />
                          <Line type="monotone" dataKey="adaptability" name="应变力" stroke="#C49859" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'checkin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-6 border border-amber-200 animate-slide-up">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold text-text-primary">{checkIn.streak}</p>
                        <p className="text-sm text-text-secondary">连续打卡天数</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-sage-50 to-purple-50 rounded-xl p-6 border border-sage-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center">
                        <Award className="w-8 h-8 text-sage-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold text-text-primary">{level}</p>
                        <p className="text-sm text-text-secondary">当前等级</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-display font-bold text-text-primary">{xp}</p>
                        <p className="text-sm text-text-secondary">累计经验值</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <button
                    onClick={checkInToday}
                    disabled={hasCheckedInToday}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                      hasCheckedInToday
                        ? 'bg-bg-paper text-text-tertiary cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400 hover:shadow-xl hover:shadow-amber-400/20 text-white'
                    }`}
                  >
                    {hasCheckedInToday ? (
                      <>
                        <Check className="w-6 h-6" />
                        今日已打卡
                      </>
                    ) : (
                      <>
                        <Calendar className="w-6 h-6" />
                        立即打卡
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-lg font-display font-semibold text-text-primary mb-4">本月打卡日历</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                      <div key={day} className="text-center py-2 text-xs text-text-tertiary font-medium">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, index) => (
                      <div 
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                          day === null ? '' :
                          day.isToday ? 'bg-sage-500 text-white' :
                          day.isCheckedIn ? 'bg-sage-100 text-sage-700' :
                          'text-text-secondary hover:bg-bg-paper'
                        }`}
                      >
                        {day?.day}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-lg font-display font-semibold text-text-primary mb-4">升级进度</h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Lv.{level} {getLevelTitle(level)}</span>
                      <span className="text-text-secondary">{xp} / {(level + 1) * 100} XP</span>
                    </div>
                    <div className="h-4 bg-bg-paper rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sage-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
                        style={{ width: `${(xp % 100) / 100 * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '首次面试', condition: totalInterviews >= 1, reward: '10 XP' },
                      { label: '连续7天打卡', condition: checkIn.streak >= 7, reward: '50 XP' },
                      { label: '累计10次面试', condition: totalInterviews >= 10, reward: '100 XP' },
                      { label: '获得满分评价', condition: history.some(h => h.avgRating >= 4.5), reward: '80 XP' },
                    ].map((achievement, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border transition-all ${
                          achievement.condition
                            ? 'bg-sage-50 border-sage-200'
                            : 'bg-bg-paper border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          {achievement.condition ? (
                            <Check className="w-5 h-5 text-sage-500" />
                          ) : (
                            <div className="w-5 h-5 border border-border rounded-full" />
                          )}
                          <span className="text-xs font-medium" style={{ color: achievement.condition ? '#6B9B6F' : '#9A948A' }}>
                            {achievement.reward}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: achievement.condition ? '#2D2A26' : '#6B655C' }}>
                          {achievement.label}
                        </p>
                      </div>
                    ))}
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