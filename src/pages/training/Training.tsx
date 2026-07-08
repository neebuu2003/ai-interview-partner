import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, FileText, Flame, Users, Sparkles, Zap, Target, TrendingUp, ChevronRight } from 'lucide-react'

export default function Training() {
  const navigate = useNavigate()

  const modules = [
    {
      id: 'self-intro',
      title: '自我介绍定制',
      description: '输入经历或简介，自动生成简洁、亮眼、稳重三种风格的自我介绍',
      icon: User,
      color: 'bg-pink-50 text-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      features: ['AI智能生成', '三种风格', '一键复制'],
      path: '/training/self-intro',
    },
    {
      id: 'resume-questions',
      title: '简历问答训练',
      description: '上传简历，AI围绕你的经历生成高频追问问题，提前准备应对策略',
      icon: FileText,
      color: 'bg-sage-50 text-sage-600',
      iconBg: 'bg-sage-100',
      iconColor: 'text-sage-600',
      features: ['智能分析', '高频追问', '针对性训练'],
      path: '/training/resume-questions',
    },
    {
      id: 'pressure-interview',
      title: '压力面试特训',
      description: '通过怼人式提问，锻炼你的心理素质和应变能力，压力逐步升级',
      icon: Flame,
      color: 'bg-rose-50 text-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
      features: ['压力递增', '心跳监测', '勇气值系统'],
      path: '/training/pressure-interview',
    },
    {
      id: 'group-interview',
      title: '群面模拟',
      description: '多人角色分配，提供专属话术模板和策略指导，提前熟悉群面流程',
      icon: Users,
      color: 'bg-cyan-50 text-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      features: ['角色分配', '话术模板', '策略指南'],
      path: '/training/group-interview',
    },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-sage-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </button>
          <h1 className="text-lg font-display font-semibold text-text-primary">专项训练</h1>
          <div className="w-24" />
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-sage-50 border border-sage-200 rounded-full text-sage-600 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              进阶训练模块
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-text-primary mb-6">
              专项训练中心
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              针对面试中的关键环节，提供系统化的专项训练，助你全面提升面试能力
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {modules.map((module, index) => {
              const Icon = module.icon
              return (
                <div
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className="card cursor-pointer hover:border-sage-300 transition-all group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${module.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${module.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-3 group-hover:text-sage-600 transition-colors">
                    {module.title}
                  </h3>
                  
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {module.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 ${module.color} rounded-full text-xs font-medium`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button className="flex items-center gap-2 text-sage-600 hover:text-sage-700 transition-colors group-hover:translate-x-1">
                    <span className="font-medium">开始训练</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-sage-50 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-sage-600" />
              </div>
              <div className="text-3xl font-display font-bold text-text-primary mb-2">4</div>
              <div className="text-sm text-text-tertiary">训练模块</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-display font-bold text-text-primary mb-2">100+</div>
              <div className="text-sm text-text-tertiary">训练题目</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-3xl font-display font-bold text-text-primary mb-2">95%</div>
              <div className="text-sm text-text-tertiary">用户好评</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-50 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <div className="text-3xl font-display font-bold text-text-primary mb-2">5</div>
              <div className="text-sm text-text-tertiary">群面角色</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}