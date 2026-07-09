import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockQuestionBank } from '@/lib/mockApi'
import { 
  Search, Filter, X, BookOpen, User, MessageCircle, Users, Flame, Code, Brain, 
  ChevronRight, ArrowLeft, Star, AlertTriangle, Lightbulb, Target, CheckCircle2,
  Clock, FolderOpen, Sparkles
} from 'lucide-react'

interface QuestionBankItem {
  id: string
  question: string
  category: 'self-intro' | 'common' | 'situational' | 'pressure' | 'professional' | 'logic'
  categoryName: string
  industry: string
  position: string
  difficulty: 'fresh' | 'junior' | 'mid' | 'senior'
  difficultyName: string
  answerGuide: string
  fullScoreAnswer: string
  avoidPhrases: string[]
  deductionPoints: string[]
}

const categoryIcons: Record<string, typeof User> = {
  'self-intro': User,
  'common': MessageCircle,
  'situational': Users,
  'pressure': Flame,
  'professional': Code,
  'logic': Brain,
}

const difficultyColors: Record<string, string> = {
  'fresh': 'bg-sage-50 text-sage-600 border border-sage-200',
  'junior': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
  'mid': 'bg-purple-50 text-purple-600 border border-purple-200',
  'senior': 'bg-amber-50 text-amber-600 border border-amber-200',
}

export default function QuestionBank() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<QuestionBankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    industry: 'all',
    position: 'all',
  })
  const [keyword, setKeyword] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [filters, keyword])

  const fetchQuestions = async () => {
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...mockQuestionBank]
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(q => q.category === filters.category)
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty)
    }
    if (filters.industry !== 'all') {
      filtered = filtered.filter(q => q.industry === filters.industry)
    }
    if (filters.position !== 'all') {
      filtered = filtered.filter(q => q.position === filters.position)
    }
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(lowerKeyword) ||
        q.position.toLowerCase().includes(lowerKeyword) ||
        q.industry.toLowerCase().includes(lowerKeyword)
      )
    }
    
    setQuestions(filtered)
    setLoading(false)
  }

  const categories = [
    { id: 'self-intro', name: '自我介绍' },
    { id: 'common', name: '高频问答' },
    { id: 'situational', name: '情景题' },
    { id: 'pressure', name: '压力面' },
    { id: 'professional', name: '专业题' },
    { id: 'logic', name: '行测思维题' },
  ]

  const difficulties = [
    { id: 'fresh', name: '应届生' },
    { id: 'junior', name: '初级' },
    { id: 'mid', name: '中级' },
    { id: 'senior', name: '高管' },
  ]

  const industries = ['互联网', '金融', '教育', '医疗', '制造', '零售', '其他']
  const positions = ['前端开发', '后端开发', '产品经理', '数据分析师', 'UI/UX设计师', '运营', '算法工程师', '测试工程师', '项目经理']

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-sage-600" />
              </div>
              <span className="text-xl font-display font-semibold text-text-primary">AI 面试陪练官</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-xl text-text-secondary hover:text-sage-600 hover:bg-sage-50 transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-sage-50 border border-sage-200 rounded-full text-sage-600 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              精选面试题库
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-6">
              题库中心
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              分岗位、分行业、分难度，海量面试题助你备战面试
            </p>
          </div>

          <div className="card p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索题目、岗位或行业..."
                  className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:flex items-center gap-2 px-6 py-4 rounded-xl border transition-all ${
                  showFilters 
                    ? 'bg-sage-50 border-sage-300 text-sage-600' 
                    : 'bg-bg-paper border-border text-text-secondary hover:border-sage-300'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden lg:inline">筛选条件</span>
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">题型分类</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 appearance-none cursor-pointer"
                  >
                    <option value="all">全部题型</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">难度级别</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 appearance-none cursor-pointer"
                  >
                    <option value="all">全部难度</option>
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">行业</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 appearance-none cursor-pointer"
                  >
                    <option value="all">全部行业</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">目标岗位</label>
                  <select
                    value={filters.position}
                    onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-500/10 appearance-none cursor-pointer"
                  >
                    <option value="all">全部岗位</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-sage-600" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-text-primary">{questions.length}</div>
                <div className="text-text-tertiary text-sm">题目总数</div>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-text-primary">{positions.length}</div>
                <div className="text-text-tertiary text-sm">覆盖岗位</div>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-text-primary">{categories.length}</div>
                <div className="text-text-tertiary text-sm">题型分类</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(cat => {
              const Icon = categoryIcons[cat.id]
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, category: filters.category === cat.id ? 'all' : cat.id })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    filters.category === cat.id
                      ? 'bg-sage-50 border-sage-300 text-sage-600'
                      : 'bg-bg-paper border-border text-text-secondary hover:border-sage-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-sage-300 border-t-sage-500 rounded-full animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-sage-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-text-secondary mb-2">没有找到匹配的题目</h3>
              <p className="text-text-tertiary">请尝试调整筛选条件或搜索关键词</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions.map((question, index) => {
                const Icon = categoryIcons[question.category]
                return (
                  <div
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className="card p-6 cursor-pointer hover:border-sage-300 transition-all group animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-sage-600" />
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[question.difficulty]}`}>
                            {question.difficultyName}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-sage-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-text-primary mb-3 line-clamp-2 group-hover:text-sage-600 transition-colors">
                      {question.question}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-bg-paper rounded-full text-xs text-text-tertiary">
                        {question.industry}
                      </span>
                      <span className="px-3 py-1 bg-bg-paper rounded-full text-xs text-text-tertiary">
                        {question.position}
                      </span>
                      <span className="px-3 py-1 bg-bg-paper rounded-full text-xs text-text-tertiary">
                        {question.categoryName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>答题思路</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span>满分范文</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedQuestion(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-8 animate-scale-in">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-bg-paper rounded-full flex items-center justify-center hover:bg-sage-50 transition-all"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${difficultyColors[selectedQuestion.difficulty]}`}>
                {selectedQuestion.difficultyName}
              </div>
              <span className="px-4 py-2 bg-bg-paper rounded-full text-sm text-text-tertiary">
                {selectedQuestion.industry} - {selectedQuestion.position}
              </span>
            </div>

            <h2 className="text-2xl font-display font-semibold text-text-primary mb-6">
              {selectedQuestion.question}
            </h2>

            <div className="space-y-8">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">答题思路</h3>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {selectedQuestion.answerGuide}
                </p>
              </div>

              <div className="bg-sage-50 border border-sage-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-sage-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">满分范文</h3>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {selectedQuestion.fullScoreAnswer}
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">避雷话术</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.avoidPhrases.map((phrase, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-sm"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">扣分点解析</h3>
                </div>
                <ul className="space-y-2">
                  {selectedQuestion.deductionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedQuestion(null)
              }}
              className="w-full mt-8 py-4 btn-primary"
            >
              关闭详情
            </button>
          </div>
        </div>
      )}
    </div>
  )
}