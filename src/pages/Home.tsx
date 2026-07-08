import { useNavigate } from 'react-router-dom'
import { useGrowthStore } from '@/store/growth'
import { Users, Zap, CheckCircle2, Sparkles, Brain, TrendingUp, GraduationCap, ChevronRight, Wand2, BookMarked, BarChart2, Calendar, Target } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { checkIn, level, totalInterviews } = useGrowthStore()

  const getLevelTitle = (level: number) => {
    const titles = ['面试小白', '初级练习生', '面试新星', '进阶选手', '面试达人', '资深面试官', '面试大师', '传奇面试家']
    return titles[Math.min(level, titles.length - 1)]
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-sage-600" />
            </div>
            <span className="text-xl font-display font-semibold text-text-primary">
              AI 面试陪练官
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{getLevelTitle(level)}</span>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-sage-50 border border-sage-200 rounded-full text-sage-700 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              让面试准备更轻松
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-text-primary mb-6 leading-tight">
              面试练习，
              <span className="text-sage-600">一步一步</span>
              <br />
              变得更好
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
              输入目标岗位JD，AI为你定制模拟面试，实时反馈帮你精准提升面试技巧
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-text-secondary animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CheckCircle2 className="w-5 h-5 text-sage-500" />
                <span>智能问题生成</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CheckCircle2 className="w-5 h-5 text-sage-500" />
                <span>实时专业反馈</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CheckCircle2 className="w-5 h-5 text-sage-500" />
                <span>能力成长追踪</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            <div 
              onClick={() => navigate('/interview-practice')}
              className="card cursor-pointer hover:border-sage-300 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-16 h-16 bg-sage-50 rounded-xl flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-sage-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                面试练习
              </h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                输入目标岗位JD，AI为你量身定制模拟面试，实时反馈帮你精准提升
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge">文字面试</span>
                <span className="badge-purple">语音面试</span>
                <span className="badge-orange">视频面试</span>
              </div>
              <button className="flex items-center gap-2 text-sage-600 hover:text-sage-700 transition-colors">
                <span className="font-medium text-sm">开始练习</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div 
              onClick={() => navigate('/question-bank')}
              className="card cursor-pointer hover:border-purple-300 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <BookMarked className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                题库中心
              </h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                分岗位、分行业、分难度，海量面试题助你备战面试
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-purple">自我介绍</span>
                <span className="badge-blue">高频问答</span>
                <span className="badge-orange">情景题</span>
              </div>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
                <span className="font-medium text-sm">浏览题库</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div 
              onClick={() => navigate('/training')}
              className="card cursor-pointer hover:border-pink-300 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                专项训练
              </h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                针对面试关键环节的系统化专项训练，全面提升面试能力
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-pink">自我介绍</span>
                <span className="badge-rose">压力面试</span>
                <span className="badge-blue">群面模拟</span>
              </div>
              <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors">
                <span className="font-medium text-sm">开始训练</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div 
              onClick={() => navigate('/growth')}
              className="card cursor-pointer hover:border-indigo-300 animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <BarChart2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                复盘成长
              </h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                记录答题历史，追踪能力提升，每日打卡闯关
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-indigo">能力看板</span>
                <span className="badge-amber">打卡闯关</span>
                <span className="badge-pink">错题收藏</span>
              </div>
              <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                <span className="font-medium text-sm">查看成长</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-sage-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-sage-600" />
              </div>
              <div className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-2">{totalInterviews}</div>
              <div className="text-text-secondary">已完成面试练习</div>
            </div>
            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-2">{checkIn.streak}</div>
              <div className="text-text-secondary">连续打卡天数</div>
            </div>
            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-2">{level}</div>
              <div className="text-text-secondary">当前等级</div>
            </div>
          </div>

          <div className="mt-16 card animate-fade-in">
            <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary mb-8 text-center">用户心得</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-bg-paper rounded-lg p-5 border border-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">"面试前用这个工具练习了3次，真实面试时明显感觉更自信了。"</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-700 font-semibold">张</div>
                  <div>
                    <div className="text-text-primary font-medium text-sm">张明</div>
                    <div className="text-text-tertiary text-xs">产品经理</div>
                  </div>
                </div>
              </div>
              <div className="bg-bg-paper rounded-lg p-5 border border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">"压力面试模式真的很有用，让我在真实面试中不再紧张。"</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold">李</div>
                  <div>
                    <div className="text-text-primary font-medium text-sm">李华</div>
                    <div className="text-text-tertiary text-xs">前端工程师</div>
                  </div>
                </div>
              </div>
              <div className="bg-bg-paper rounded-lg p-5 border border-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">"优化建议特别实用，帮我弥补了经验不足的短板。"</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold">王</div>
                  <div>
                    <div className="text-text-primary font-medium text-sm">王伟</div>
                    <div className="text-text-tertiary text-xs">产品经理</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-text-tertiary">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-sage-500" />
            <span>AI 面试陪练官 - 让面试更自信</span>
          </div>
          <p className="text-sm">© 2026 AI Interview Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
