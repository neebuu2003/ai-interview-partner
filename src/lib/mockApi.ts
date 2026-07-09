export interface Question {
  id: string
  content: string
  type: 'behavioral' | 'technical' | 'situational' | 'cultural' | 'followup'
  targetSkill?: string
  followupTo?: string
}

export interface Answer {
  id: string
  questionId: string
  content: string
  feedback: Feedback
}

export interface Feedback {
  rating: number
  comment: string
  optimizedAnswer: string
  strengths: string[]
  weaknesses: string[]
  analysis: AnalysisResult
}

export interface AnalysisResult {
  starScore: number
  keywordMatches: string[]
  keywordHitRate: number
  logicalScore: number
  hasQuantitativeData: boolean
  depthScore: number
}

export interface InterviewSession {
  id: string
  jd: string
  industry: string
  position: string
  interviewerStyle: 'friendly' | 'pressure' | 'deep'
  extractedSkills: string[]
  questions: Question[]
  answers: Answer[]
  currentQuestionIndex: number
}

const sessions = new Map<string, InterviewSession>()

const skillKeywords: Record<string, string[]> = {
  frontend: ['React', 'Vue', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Webpack', 'Vite', '性能优化', '组件化', '状态管理', 'Redux', 'Zustand'],
  backend: ['Java', 'Go', 'Python', 'Spring', '微服务', 'Redis', 'MySQL', 'PostgreSQL', '分布式', '高并发', '缓存', '消息队列'],
  product: ['需求分析', '用户研究', '产品设计', '项目管理', '数据分析', '竞品分析', '原型设计', '用户增长', 'A/B测试'],
  data: ['SQL', 'Python', '数据清洗', '数据可视化', '统计分析', '机器学习', 'Excel', 'Tableau', '大数据', 'ETL'],
  ai: ['机器学习', '深度学习', '神经网络', 'TensorFlow', 'PyTorch', 'NLP', '计算机视觉', '模型训练', '数据挖掘'],
  design: ['Figma', 'Sketch', 'UI设计', 'UX设计', '交互设计', '视觉设计', '设计系统', '用户体验'],
}

const behavioralTemplates = [
  '请分享一次你在{skill}方面遇到的最大挑战，你是如何解决的？',
  '请描述一个你使用{skill}技术完成的成功项目，你的贡献是什么？',
  '当你在{skill}领域遇到技术难题时，你通常采取什么方法解决？',
  '请举例说明你如何将{skill}应用到实际工作中，并取得了什么效果？',
]

const technicalTemplates = [
  '请详细解释{skill}的核心原理和工作机制？',
  '在使用{skill}时，你遇到过哪些常见问题？如何避免或解决？',
  '{skill}与其他类似技术相比有什么优势和劣势？',
  '请谈谈你对{skill}最新发展趋势的了解？',
]

const situationalTemplates = [
  '如果在项目中{skill}相关功能出现严重问题，你会如何处理？',
  '假设你需要在短时间内掌握{skill}，你会制定怎样的学习计划？',
  '如果团队成员对{skill}的使用存在分歧，你会如何协调？',
  '当{skill}技术方案与业务需求冲突时，你会如何权衡？',
]

const culturalTemplates = [
  '你为什么对{skill}领域感兴趣？',
  '你认为从事{skill}相关工作需要具备哪些特质？',
  '在学习{skill}的过程中，对你影响最大的是什么？',
  '你未来在{skill}领域有什么职业规划？',
]

const followupTemplates = [
  '你提到了{topic}，能否详细说明一下当时的具体情况？',
  '{topic}方面，你还有其他相关经验可以分享吗？',
  '关于{topic}，你认为最大的难点是什么？',
  '如果重新做一次{topic}相关的项目，你会有什么不同的做法？',
  '你提到的{topic}，能否举一个具体的数据或案例来说明？',
]

const interviewerStyleTemplates = {
  friendly: {
    greeting: '你好！很高兴有机会和你交流。我们开始今天的面试，希望能全面了解你的能力和经验。',
    questionPrefix: '第一个问题想了解一下：',
    feedbackPositive: '非常好！你的回答很有深度，',
    feedbackNegative: '我理解你的想法，不过我们可以从几个方面进一步思考：',
    encouragement: '继续加油，你的表现很不错！',
    closing: '感谢你的参与！今天的面试就到这里，期待我们下次交流。',
  },
  pressure: {
    greeting: '时间宝贵，我们直接开始。希望你做好准备，我会提出一些挑战性问题。',
    questionPrefix: '问题：',
    feedbackPositive: '勉强及格，但还有很大提升空间。',
    feedbackNegative: '这个回答不够深入，我需要更具体的内容。',
    encouragement: '不要紧张，但请给出更有说服力的答案。',
    closing: '面试结束。你的表现一般，建议加强基础。',
  },
  deep: {
    greeting: '你好。我希望深入了解你的技术细节和思考过程。请准备好详细阐述你的回答。',
    questionPrefix: '让我们深入探讨：',
    feedbackPositive: '回答有一定深度，不过我想继续追问几个关键点。',
    feedbackNegative: '回答比较表面，我需要更深入的技术细节。',
    encouragement: '很好，继续深入，我想了解更多。',
    closing: '感谢你的详细阐述。我们已经深入探讨了多个话题，期待未来的交流。',
  },
}

function extractSkillsFromJD(jd: string, position: string): string[] {
  const skills: string[] = []
  const lowerJD = jd.toLowerCase()
  const lowerPosition = position.toLowerCase()

  let targetCategory = 'general'
  if (lowerPosition.includes('前端') || lowerPosition.includes('fe') || lowerPosition.includes('front')) {
    targetCategory = 'frontend'
  } else if (lowerPosition.includes('后端') || lowerPosition.includes('be') || lowerPosition.includes('back')) {
    targetCategory = 'backend'
  } else if (lowerPosition.includes('产品') || lowerPosition.includes('pm') || lowerPosition.includes('product')) {
    targetCategory = 'product'
  } else if (lowerPosition.includes('数据') || lowerPosition.includes('data') || lowerPosition.includes('分析')) {
    targetCategory = 'data'
  } else if (lowerPosition.includes('ai') || lowerPosition.includes('机器学习') || lowerPosition.includes('算法')) {
    targetCategory = 'ai'
  } else if (lowerPosition.includes('设计') || lowerPosition.includes('ui') || lowerPosition.includes('ux')) {
    targetCategory = 'design'
  }

  const keywordsToCheck = [...(skillKeywords[targetCategory] || []), ...(skillKeywords['frontend'] || []), ...(skillKeywords['backend'] || [])]
  
  keywordsToCheck.forEach(keyword => {
    if (jd.includes(keyword) || jd.includes(keyword.toLowerCase())) {
      if (!skills.includes(keyword)) {
        skills.push(keyword)
      }
    }
  })

  if (skills.length === 0) {
    skills.push(...['项目经验', '团队协作', '沟通能力'])
  }

  return skills.slice(0, 6)
}

function generateDynamicQuestion(skill: string, questionType: 'behavioral' | 'technical' | 'situational' | 'cultural', style: 'friendly' | 'pressure' | 'deep'): string {
  const templates: Record<string, string[]> = {
    behavioral: behavioralTemplates,
    technical: technicalTemplates,
    situational: situationalTemplates,
    cultural: culturalTemplates,
  }

  const templateList = templates[questionType]
  const template = templateList[Math.floor(Math.random() * templateList.length)]
  let question = template.replace(/{skill}/g, skill)

  if (style === 'pressure') {
    question = question.replace('请', '立刻')
    question += ' 不要浪费时间。'
  } else if (style === 'deep') {
    question += ' 请详细阐述，包括具体的技术细节。'
  }

  return question
}

function generateFollowupQuestion(answer: string, originalQuestion: string, style: 'friendly' | 'pressure' | 'deep'): string | null {
  const topics = extractTopicsFromAnswer(answer)
  
  if (topics.length === 0) {
    return null
  }

  const topic = topics[Math.floor(Math.random() * topics.length)]
  const template = followupTemplates[Math.floor(Math.random() * followupTemplates.length)]
  let question = template.replace(/{topic}/g, topic)

  if (style === 'pressure') {
    question = '继续回答：' + question + ' 我需要更具体的信息。'
  } else if (style === 'deep') {
    question = '深入追问：' + question + ' 请提供详细的技术细节。'
  } else {
    question = '很好！' + question
  }

  return question
}

function extractTopicsFromAnswer(answer: string): string[] {
  const topics: string[] = []
  const topicKeywords = [
    '项目', '挑战', '问题', '解决方案', '技术', '团队', '经验', '成果', 
    '优化', '改进', '学习', '成长', '负责', '主导', '参与',
    'React', 'Vue', 'Java', 'Python', 'SQL', '算法', '数据', '设计',
  ]
  
  topicKeywords.forEach(keyword => {
    if (answer.includes(keyword)) {
      topics.push(keyword)
    }
  })

  if (topics.length === 0) {
    const sentences = answer.split(/[。！？\n]/).filter(s => s.length > 10)
    sentences.forEach(sentence => {
      const words = sentence.trim().slice(0, 5)
      if (words.length > 2) {
        topics.push(words)
      }
    })
  }

  return topics.slice(0, 3)
}

function analyzeAnswer(answer: string, session: InterviewSession): AnalysisResult {
  let starScore = 0
  const starPatterns = ['情境', '背景', '任务', '目标', '行动', '措施', '结果', '成果']
  starPatterns.forEach(pattern => {
    if (answer.includes(pattern)) starScore++
  })
  starScore = Math.min(Math.round((starScore / starPatterns.length) * 100), 100)

  let keywordMatches: string[] = []
  session.extractedSkills.forEach(skill => {
    if (answer.includes(skill)) {
      keywordMatches.push(skill)
    }
  })
  const keywordHitRate = session.extractedSkills.length > 0 
    ? Math.round((keywordMatches.length / session.extractedSkills.length) * 100) 
    : 50

  let logicalScore = 0
  const logicalConnectors = ['首先', '其次', '然后', '最后', '因此', '因为', '所以', '但是', '然而', '此外']
  logicalConnectors.forEach(connector => {
    if (answer.includes(connector)) logicalScore++
  })
  logicalScore = Math.min(Math.round((logicalScore / logicalConnectors.length) * 100), 100)

  const hasQuantitativeData = /\d+[\u4e00-\u9fa5]*[%个万元次]/.test(answer)

  const depthScore = Math.min(Math.round((answer.length / 300) * 100), 100)

  return {
    starScore,
    keywordMatches,
    keywordHitRate,
    logicalScore,
    hasQuantitativeData,
    depthScore,
  }
}

function generateFeedback(answer: string, session: InterviewSession, question: Question): Feedback {
  const analysis = analyzeAnswer(answer, session)
  
  const scoreComponents = [
    analysis.starScore * 0.25,
    analysis.keywordHitRate * 0.25,
    analysis.logicalScore * 0.2,
    analysis.hasQuantitativeData ? 20 : 10,
    analysis.depthScore * 0.1,
  ]
  
  const totalScore = Math.round(scoreComponents.reduce((a, b) => a + b, 0))
  const rating = Math.max(1, Math.min(5, Math.round(totalScore / 20)))

  let comment = ''
  let optimizedAnswer = ''
  let strengths: string[] = []
  let weaknesses: string[] = []

  if (totalScore >= 80) {
    comment = '你的回答非常出色！结构清晰、内容详实，很好地体现了你的专业能力。'
    optimizedAnswer = '回答已经非常完善，建议继续保持。可以尝试加入更多对比分析来展示你的独特价值。'
    strengths = ['结构清晰', '内容详实', '专业度高']
    if (analysis.hasQuantitativeData) strengths.push('数据支撑')
    if (analysis.keywordMatches.length > 0) strengths.push('关键词命中')
  } else if (totalScore >= 60) {
    comment = '回答有一定基础，但还可以更加深入。建议增加更多细节和量化数据来增强说服力。'
    optimizedAnswer = '建议使用 STAR 法则（情境-任务-行动-结果）来组织回答，增加具体的数据支撑和成果展示。'
    strengths = ['有基本框架', '内容相关']
    weaknesses = []
    if (analysis.starScore < 60) weaknesses.push('缺少结构化表达')
    if (!analysis.hasQuantitativeData) weaknesses.push('缺乏量化成果')
    if (analysis.keywordHitRate < 60) weaknesses.push('关键词匹配不足')
  } else {
    comment = '回答需要改进。建议增加更多具体案例和技术细节，使用结构化方式表达。'
    optimizedAnswer = '建议重新组织回答结构，使用 STAR 法则描述具体案例，并加入量化数据展示成果。重点关注' + (session.extractedSkills.slice(0, 2).join('、')) + '等关键词的应用。'
    weaknesses = ['内容过于简略', '缺乏具体案例', '结构不够清晰']
  }

  if (analysis.logicalScore > 70) {
    strengths.push('逻辑清晰')
  } else if (analysis.logicalScore < 40) {
    weaknesses.push('逻辑连贯性不足')
  }

  return {
    rating,
    comment,
    optimizedAnswer,
    strengths,
    weaknesses,
    analysis,
  }
}

function generateQuestions(extractedSkills: string[], style: 'friendly' | 'pressure' | 'deep'): Question[] {
  const questions: Question[] = []
  const types: ('behavioral' | 'technical' | 'situational' | 'cultural')[] = ['behavioral', 'technical', 'situational', 'cultural']
  
  extractedSkills.slice(0, 4).forEach((skill, index) => {
    const type = types[index % types.length]
    questions.push({
      id: `q-${Date.now()}-${index}`,
      content: generateDynamicQuestion(skill, type, style),
      type,
      targetSkill: skill,
    })
  })

  questions.push({
    id: `q-${Date.now()}-final`,
    content: style === 'pressure' 
      ? '最后一个问题：你认为自己最大的弱点是什么？不要回避。'
      : style === 'deep'
        ? '请深入谈谈你的职业规划，包括短期和长期目标，以及你计划如何实现。'
        : '最后，你有什么问题想问我们吗？或者想补充说明什么？',
    type: 'cultural',
  })

  return questions
}

export async function mockInterviewStart(jd: string, industry: string, position: string, interviewerStyle: 'friendly' | 'pressure' | 'deep' = 'friendly') {
  const extractedSkills = extractSkillsFromJD(jd || position, position)
  const questions = generateQuestions(extractedSkills, interviewerStyle)
  
  const styleConfig = interviewerStyleTemplates[interviewerStyle]

  const interviewId = `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const session: InterviewSession = {
    id: interviewId,
    jd: jd || '',
    industry: industry || '',
    position: position || '',
    interviewerStyle,
    extractedSkills,
    questions,
    answers: [],
    currentQuestionIndex: 0,
  }

  sessions.set(interviewId, session)

  return {
    success: true,
    question: questions[0].content,
    greeting: styleConfig.greeting,
    interviewId,
    totalQuestions: questions.length,
    extractedSkills,
  }
}

export async function mockInterviewAnswer(interviewId: string, answer: string) {
  const session = sessions.get(interviewId)
  if (!session) {
    return { success: false, error: 'Session not found' }
  }

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const feedback = generateFeedback(answer, session, currentQuestion)

  session.answers.push({
    id: `ans-${Date.now()}`,
    questionId: currentQuestion.id,
    content: answer,
    feedback,
  })

  let nextQuestion = null
  let isFollowup = false

  if (feedback.rating < 4 && Math.random() > 0.3) {
    const followup = generateFollowupQuestion(answer, currentQuestion.content, session.interviewerStyle)
    if (followup) {
      const followupQuestion: Question = {
        id: `q-follow-${Date.now()}`,
        content: followup,
        type: 'followup',
        followupTo: currentQuestion.id,
      }
      session.questions.splice(session.currentQuestionIndex + 1, 0, followupQuestion)
      nextQuestion = followup
      isFollowup = true
    }
  }

  if (!nextQuestion) {
    session.currentQuestionIndex++
    if (session.currentQuestionIndex < session.questions.length) {
      nextQuestion = session.questions[session.currentQuestionIndex].content
    }
  }

  const styleConfig = interviewerStyleTemplates[session.interviewerStyle]

  return {
    success: true,
    feedback,
    nextQuestion,
    isFollowup,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.questions.length,
    encouragement: feedback.rating >= 4 ? styleConfig.encouragement : '',
  }
}

export async function mockInterviewResults(id: string) {
  const session = sessions.get(id)
  if (!session) {
    return { success: false, error: 'Session not found' }
  }

  const totalRating = session.answers.reduce((sum, ans) => sum + ans.feedback.rating, 0)
  const avgRating = Math.round((totalRating / session.answers.length) * 2) / 2

  const starScores = session.answers.map(a => a.feedback.analysis.starScore)
  const keywordHitRates = session.answers.map(a => a.feedback.analysis.keywordHitRate)
  const logicalScores = session.answers.map(a => a.feedback.analysis.logicalScore)
  const depthScores = session.answers.map(a => a.feedback.analysis.depthScore)
  const hasQuantDataCount = session.answers.filter(a => a.feedback.analysis.hasQuantitativeData).length

  const radarData = [
    { dimension: '表达逻辑', score: Math.round(logicalScores.reduce((a, b) => a + b, 0) / logicalScores.length) },
    { dimension: '专业深度', score: Math.round(depthScores.reduce((a, b) => a + b, 0) / depthScores.length) },
    { dimension: '临场应变', score: Math.floor(Math.random() * 20) + 60 },
    { dimension: '沟通能力', score: Math.round(starScores.reduce((a, b) => a + b, 0) / starScores.length) },
    { dimension: '结构化思维', score: Math.round(starScores.reduce((a, b) => a + b, 0) / starScores.length) },
    { dimension: '职业素养', score: Math.floor(Math.random() * 20) + 65 },
  ]

  const suggestions: string[] = []
  const avgKeywordHitRate = Math.round(keywordHitRates.reduce((a, b) => a + b, 0) / keywordHitRates.length)
  
  if (avgKeywordHitRate < 50) {
    suggestions.push(`JD 关键词匹配度较低，建议加强${session.extractedSkills.slice(0, 2).join('、')}等核心技能的展示`)
  }
  
  if (hasQuantDataCount < session.answers.length * 0.5) {
    suggestions.push('回答中缺乏量化数据支撑，建议在描述成果时加入具体数字')
  }
  
  radarData.forEach(item => {
    if (item.score < 60) {
      suggestions.push(`${item.dimension}得分较低，建议针对性练习`)
    }
  })

  let summary = ''
  if (avgRating >= 4) {
    summary = '你的面试表现优秀！回答结构清晰、内容详实，能够很好地匹配岗位要求。建议针对薄弱环节进行补充练习，继续保持。'
  } else if (avgRating >= 3) {
    summary = '你的面试表现良好，但还有提升空间。建议增加更多量化数据和具体案例，提高 JD 关键词的命中率。'
  } else {
    summary = '建议多进行模拟练习，重点提升结构化表达能力和专业深度。使用 STAR 法则来组织回答会更有效。'
  }

  return {
    success: true,
    radarData,
    summary,
    suggestions: suggestions.length > 0 ? suggestions : ['继续保持，你的表现已经很不错了！'],
    avgRating,
    totalQuestions: session.questions.length,
    answeredQuestions: session.answers.length,
    extractedSkills: session.extractedSkills,
    analysisSummary: {
      avgKeywordHitRate,
      hasQuantitativeData: hasQuantDataCount,
      avgStarScore: Math.round(starScores.reduce((a, b) => a + b, 0) / starScores.length),
      avgLogicalScore: Math.round(logicalScores.reduce((a, b) => a + b, 0) / logicalScores.length),
    },
  }
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    'React', 'Vue', 'JavaScript', 'TypeScript', 'Java', 'Python', 'Go',
    '前端', '后端', '产品', '设计', '数据分析', '算法',
    'SQL', 'MySQL', 'Redis', '微服务', '大数据', 'AI', '机器学习',
  ]
  return skillKeywords.filter(keyword => text.includes(keyword)).slice(0, 5)
}

function extractProjects(text: string): string[] {
  const projectPatterns = [
    /([^，。、；\n]{8,50}项目)/g,
    /(开发了[^，。、；\n]{5,30})/g,
    /(负责[^，。、；\n]{5,30})/g,
  ]
  const projects: string[] = []
  projectPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.replace(/(项目|开发了|负责)/g, '').trim()
        if (cleanMatch.length > 5 && !projects.includes(cleanMatch)) {
          projects.push(cleanMatch.length > 20 ? cleanMatch.slice(0, 20) + '...' : cleanMatch)
        }
      })
    }
  })
  return projects.slice(0, 3)
}

function extractAchievements(text: string): string[] {
  const achievementPatterns = [
    /(提升了[^，。、；\n]{3,20})/g,
    /(优化了[^，。、；\n]{3,20})/g,
    /(节省了[^，。、；\n]{3,20})/g,
    /(\d+[%个万元次])/g,
  ]
  const achievements: string[] = []
  achievementPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        if (!achievements.includes(match)) {
          achievements.push(match)
        }
      })
    }
  })
  return achievements.slice(0, 3)
}

function generateConciseSelfIntro(experience: string): string {
  const lines = experience.split('\n').filter(line => line.trim())
  const keyPoints: string[] = []
  
  lines.forEach(line => {
    if (line.includes('项目') || line.includes('负责') || line.includes('开发') || line.includes('设计')) {
      const parts = line.split(/[,，、]/)
      parts.forEach(part => {
        if (part.length > 5) {
          keyPoints.push(part.trim())
        }
      })
    }
  })

  const skills = extractSkills(experience)
  const projects = extractProjects(experience)

  return `面试官你好，我叫XXX。${skills.length > 0 ? `掌握${skills.join('、')}等技能，` : ''}${projects.length > 0 ? `参与过${projects.join('、')}等项目。` : ''}期待加入贵公司，贡献价值。`
}

function generateImpressiveSelfIntro(experience: string): string {
  const skills = extractSkills(experience)
  const projects = extractProjects(experience)
  const achievements = extractAchievements(experience)

  return `面试官你好，我是XXX，一个对技术充满热情的${skills.length > 0 ? skills[0] : '从业者'}。

【核心能力】
${skills.map((skill, i) => `${i + 1}. ${skill}`).join('\n')}

【项目亮点】
${projects.slice(0, 2).map((project, i) => `${i + 1}. ${project} —— ${achievements[i] || '负责核心模块开发'}`).join('\n')}

【价值主张】
我相信技术改变世界，希望能在贵公司发挥专长，共同创造有价值的产品！`
}

function generateSteadySelfIntro(experience: string): string {
  const skills = extractSkills(experience)
  const projects = extractProjects(experience)
  
  return `尊敬的面试官，您好。我是XXX，拥有扎实的专业背景和丰富的实践经验。

在过去的工作中，我系统学习和实践了${skills.join('、')}等技术栈，具备独立完成项目的能力。

我参与过${projects.length > 0 ? projects.join('、') : '多个'}项目的开发，积累了丰富的${projects.length > 0 ? '全流程' : ''}经验。

我为人踏实稳重，注重细节，善于团队协作，相信能够胜任贵公司的岗位要求。期待有机会与您深入交流。`
}

export async function mockSelfIntro(experience: string) {
  if (!experience || experience.trim().length === 0) {
    return { success: false, error: '请输入你的经历或简介' }
  }

  const conciseVersion = generateConciseSelfIntro(experience)
  const impressiveVersion = generateImpressiveSelfIntro(experience)
  const steadyVersion = generateSteadySelfIntro(experience)

  return {
    success: true,
    concise: conciseVersion,
    impressive: impressiveVersion,
    steady: steadyVersion,
  }
}

function generateResumeQuestions(resume: string): { id: string; question: string; focusArea: string }[] {
  const questions: { id: string; question: string; focusArea: string }[] = []
  
  if (resume.includes('项目') || resume.includes('负责') || resume.includes('开发')) {
    questions.push({
      id: `rq-${Date.now()}-1`,
      question: '请详细介绍你简历中提到的最具挑战性的项目，你在其中的角色和贡献是什么？',
      focusArea: '项目经验',
    })
    questions.push({
      id: `rq-${Date.now()}-2`,
      question: '在这个项目中，你遇到的最大困难是什么？你是如何解决的？',
      focusArea: '问题解决能力',
    })
    questions.push({
      id: `rq-${Date.now()}-3`,
      question: '如果重新做这个项目，你会有哪些改进？',
      focusArea: '复盘能力',
    })
  }

  if (resume.includes('实习') || resume.includes('工作')) {
    questions.push({
      id: `rq-${Date.now()}-4`,
      question: '你在这段实习/工作期间最大的收获是什么？',
      focusArea: '成长收获',
    })
    questions.push({
      id: `rq-${Date.now()}-5`,
      question: '你的直属领导对你的评价如何？',
      focusArea: '他人评价',
    })
  }

  if (resume.includes('技能') || resume.includes('掌握') || resume.includes('熟悉')) {
    questions.push({
      id: `rq-${Date.now()}-6`,
      question: '请谈谈你最擅长的三项技能，分别举例说明你是如何应用的？',
      focusArea: '专业技能',
    })
    questions.push({
      id: `rq-${Date.now()}-7`,
      question: '你简历中提到的技能，哪些是你自学的？学习过程是怎样的？',
      focusArea: '学习能力',
    })
  }

  if (resume.includes('学历') || resume.includes('学校') || resume.includes('专业')) {
    questions.push({
      id: `rq-${Date.now()}-8`,
      question: '你为什么选择这个专业？它对你的职业发展有什么帮助？',
      focusArea: '专业背景',
    })
  }

  questions.push({
    id: `rq-${Date.now()}-9`,
    question: '从你的简历来看，你有什么缺点或需要改进的地方？',
    focusArea: '自我认知',
  })
  questions.push({
    id: `rq-${Date.now()}-10`,
    question: '你未来3-5年的职业规划是什么？',
    focusArea: '职业规划',
  })

  return questions.slice(0, 10)
}

export async function mockResumeQuestions(resume: string) {
  if (!resume || resume.trim().length === 0) {
    return { success: false, error: '请输入简历内容' }
  }

  const questions = generateResumeQuestions(resume)

  return {
    success: true,
    questions,
  }
}

let pressureRound = 0

export async function mockPressureQuestion() {
  pressureRound++
  
  const questions = generatePressureQuestions(pressureRound)
  
  return {
    success: true,
    question: questions.question,
    intensity: questions.intensity,
    round: pressureRound,
  }
}

export async function mockPressureReset() {
  pressureRound = 0
  return { success: true }
}

function generatePressureQuestions(round: number): { question: string; intensity: 'low' | 'medium' | 'high' } {
  const lowIntensity = [
    '你这简历看起来一般啊，有什么亮点吗？',
    '你之前的项目感觉都是小打小闹，没什么挑战性。',
    '你这学历背景，我们不太看好啊。',
    '你的经验和我们这个岗位不太匹配，你怎么看？',
    '你之前跳槽有点频繁啊，稳定性不太好。',
  ]

  const mediumIntensity = [
    '说实话，你的回答让我很失望，完全没有抓住重点。',
    '这个问题都答不好，你到底有没有认真准备？',
    '你说的这些都是空话，给我来点实际的。',
    '我感觉你能力不够，可能不太适合这个岗位。',
    '别绕圈子了，直接说重点！',
  ]

  const highIntensity = [
    '你这水平也敢来面试？回去再练练吧。',
    '我对你已经失去耐心了，能不能给我一个留下你的理由？',
    '你之前的工作经历简直不值一提，有什么资格来我们公司？',
    '别浪费大家时间了，你明显不是我们要找的人。',
    '你的表现让我怀疑你的能力，你确定你能胜任这份工作？',
  ]

  let intensity: 'low' | 'medium' | 'high' = 'low'
  let question: string

  if (round <= 3) {
    intensity = 'low'
    question = lowIntensity[(round - 1) % lowIntensity.length]
  } else if (round <= 6) {
    intensity = 'medium'
    question = mediumIntensity[(round - 4) % mediumIntensity.length]
  } else {
    intensity = 'high'
    question = highIntensity[(round - 7) % highIntensity.length]
  }

  return { question, intensity }
}

export async function mockGroupRoles() {
  const roles: { name: string; roleDescription: string; speakingPoints: string[]; strategy: string; templates: { name: string; content: string }[] }[] = [
    {
      name: '团队领导者',
      roleDescription: '作为团队领导者，你需要协调各方意见，引导讨论方向，确保小组在规定时间内达成共识并形成完整方案。',
      speakingPoints: [
        '开场破冰，明确讨论规则和时间分配',
        '引导话题，确保讨论围绕核心问题展开',
        '协调矛盾，化解组员间的分歧',
        '总结观点，提炼关键要点',
        '代表小组汇报成果',
      ],
      strategy: '1. 开场先确认时间和规则，建立权威感\n2. 认真倾听每位组员发言，及时记录要点\n3. 对偏离主题的讨论及时引导回来\n4. 尊重不同意见，寻求共识\n5. 最后留出总结时间，确保逻辑完整',
      templates: [
        {
          name: '开场模板',
          content: '各位好，我来做个开场。我们有XX分钟时间讨论这个问题。建议我们先用X分钟各自发表观点，然后用Y分钟讨论分歧，最后用Z分钟总结。大家觉得怎么样？',
        },
        {
          name: '引导模板',
          content: '我注意到我们已经讨论了A和B两个方向，现在我们是否可以聚焦到C方向深入讨论一下？',
        },
        {
          name: '总结模板',
          content: '总结一下我们的讨论，我们主要达成了以下几点共识：1... 2... 3... 对于分歧较大的D点，我们倾向于选择方案一，理由是...',
        },
      ],
    },
    {
      name: '时间管理者',
      roleDescription: '作为时间管理者，你需要严格把控讨论节奏，确保每个环节按时完成，避免时间浪费，保证讨论效率。',
      speakingPoints: [
        '提前明确时间分配方案',
        '在关键节点提醒剩余时间',
        '阻止冗长发言，保证公平',
        '确保最终有足够时间总结',
        '必要时打断超时发言',
      ],
      strategy: '1. 提前准备好时间分配表\n2. 用清晰的声音提醒时间\n3. 提醒时保持礼貌但坚定\n4. 对超时发言者温和打断\n5. 最后3分钟重点提醒',
      templates: [
        {
          name: '时间提醒模板',
          content: '提醒一下，我们还有X分钟时间，请大家加快讨论节奏。',
        },
        {
          name: '打断模板',
          content: '抱歉打断一下，这位同学已经发言较长时间，我们给其他同学一些机会，好吗？',
        },
        {
          name: '最后提醒模板',
          content: '我们只剩最后3分钟，请大家尽快达成共识，准备总结。',
        },
      ],
    },
    {
      name: '记录员',
      roleDescription: '作为记录员，你需要准确记录讨论要点、关键观点和最终结论，为小组汇报提供完整的文档支持。',
      speakingPoints: [
        '快速记录每位组员的核心观点',
        '分类整理不同意见',
        '标注达成共识的内容',
        '记录悬而未决的问题',
        '整理最终汇报材料',
      ],
      strategy: '1. 使用结构化方式记录（要点式）\n2. 用不同符号区分同意/反对/待讨论\n3. 及时整理，避免堆积\n4. 讨论中适时确认记录准确性\n5. 最后快速整理出汇报框架',
      templates: [
        {
          name: '确认模板',
          content: '我记录一下，你的观点是XXX，对吗？',
        },
        {
          name: '整理模板',
          content: '根据刚才的讨论，我整理了以下几个要点：1... 2... 3... 大家看看有没有遗漏？',
        },
      ],
    },
    {
      name: '汇报者',
      roleDescription: '作为汇报者，你需要将小组讨论成果以清晰、有条理的方式呈现给面试官，展示团队的思考过程和最终方案。',
      speakingPoints: [
        '理解并消化小组讨论成果',
        '组织清晰的汇报结构',
        '突出重点和亮点',
        '准备应对面试官提问',
        '保持自信和流畅',
      ],
      strategy: '1. 提前了解讨论内容，做好笔记\n2. 用"问题-分析-方案-结论"结构组织\n3. 突出小组讨论的亮点\n4. 模拟回答可能的提问\n5. 保持语速适中，眼神交流',
      templates: [
        {
          name: '汇报开场',
          content: '各位面试官好，我们小组经过讨论，对于这个问题的解决方案如下：首先...',
        },
        {
          name: '方案陈述',
          content: '我们的方案主要包含三个方面：第一... 第二... 第三...',
        },
        {
          name: '总结结尾',
          content: '综上所述，我们认为方案X是最佳选择，理由是... 以上是我们小组的讨论成果，谢谢！',
        },
      ],
    },
    {
      name: '分析员',
      roleDescription: '作为分析员，你需要深入分析问题本质，提出独到见解，为讨论提供深度思考和专业视角。',
      speakingPoints: [
        '深入分析问题本质',
        '提出专业见解',
        '评估不同方案的优劣',
        '预测潜在风险',
        '提供数据支持',
      ],
      strategy: '1. 先认真倾听，不急于发言\n2. 在合适时机提出深度见解\n3. 用数据或案例支持观点\n4. 客观评价各方案优缺点\n5. 提出建设性建议',
      templates: [
        {
          name: '深度分析模板',
          content: '我想从另一个角度分析这个问题...',
        },
        {
          name: '风险提示模板',
          content: '这个方案虽然看起来不错，但我们需要考虑潜在风险...',
        },
        {
          name: '优化建议模板',
          content: '基于以上分析，我建议我们可以在方案中加入...',
        },
      ],
    },
  ]

  return { success: true, roles }
}

export const mockQuestionBank: Array<{
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
}> = [
  {
    id: 'qb-001',
    question: '请做一个自我介绍。',
    category: 'self-intro',
    categoryName: '自我介绍',
    industry: '通用',
    position: '通用',
    difficulty: 'fresh',
    difficultyName: '应届生',
    answerGuide: '采用STAR法则，突出核心优势和岗位匹配度',
    fullScoreAnswer: '面试官你好，我叫XXX，毕业于XX大学XX专业。在校期间，我系统学习了XX知识，参与过XX项目，负责XX模块的开发。我具备XX技能，对XX领域有浓厚兴趣，希望能加入贵公司贡献价值。',
    avoidPhrases: ['我性格开朗', '我学习能力强', '我善于沟通'],
    deductionPoints: ['过于简单，缺乏具体案例', '没有突出与岗位的匹配度', '没有展示核心竞争力'],
  },
  {
    id: 'qb-002',
    question: '你为什么选择我们公司？',
    category: 'common',
    categoryName: '高频问答',
    industry: '通用',
    position: '通用',
    difficulty: 'fresh',
    difficultyName: '应届生',
    answerGuide: '从公司业务、文化、发展前景三个维度回答',
    fullScoreAnswer: '我选择贵公司主要有三个原因：第一，贵公司在XX领域的技术实力和市场地位让我非常向往；第二，我了解到贵公司注重技术创新和人才培养，这与我追求成长的目标高度契合；第三，贵公司的企业文化强调团队协作和用户价值，这正是我认同的工作理念。',
    avoidPhrases: ['因为公司名气大', '因为工资高', '因为离家近'],
    deductionPoints: ['回答过于表面，缺乏深入了解', '只关注个人利益', '没有展示对公司的认同感'],
  },
  {
    id: 'qb-003',
    question: '如果你的意见与领导不一致，你会怎么做？',
    category: 'situational',
    categoryName: '情景题',
    industry: '通用',
    position: '通用',
    difficulty: 'junior',
    difficultyName: '初级',
    answerGuide: '展示沟通能力和职业素养',
    fullScoreAnswer: '首先，我会认真倾听领导的意见，理解他的出发点和考虑。然后，我会整理自己的思路和数据支撑，找一个合适的时机与领导深入沟通，客观阐述我的观点和理由。如果领导仍然坚持他的意见，我会服从执行，但会在执行过程中密切关注效果，如有问题及时反馈。',
    avoidPhrases: ['我会据理力争', '我会按照自己的想法做', '我会直接反驳'],
    deductionPoints: ['缺乏沟通技巧', '不尊重领导', '没有团队协作意识'],
  },
  {
    id: 'qb-004',
    question: '你觉得自己最大的缺点是什么？',
    category: 'pressure',
    categoryName: '压力面',
    industry: '通用',
    position: '通用',
    difficulty: 'mid',
    difficultyName: '中级',
    answerGuide: '选择可改进的缺点，并展示改进行动',
    fullScoreAnswer: '我认为自己有时过于追求完美，在细节上花费过多时间。意识到这一点后，我开始学习优先级管理，使用时间管理工具来平衡效率和质量。现在我已经能够在保证质量的前提下合理分配时间了。',
    avoidPhrases: ['我没有缺点', '我太认真了', '我工作太努力了'],
    deductionPoints: ['回避问题', '把优点包装成缺点', '没有展示改进意愿'],
  },
  {
    id: 'qb-005',
    question: '请解释React Hooks的工作原理。',
    category: 'professional',
    categoryName: '专业题',
    industry: '互联网',
    position: '前端开发',
    difficulty: 'mid',
    difficultyName: '中级',
    answerGuide: '从闭包、依赖数组、渲染流程三个方面解释',
    fullScoreAnswer: 'React Hooks通过闭包机制保存状态和函数引用。每次组件渲染时，Hooks按照声明顺序执行，依赖数组决定了effect是否重新运行。当状态更新时，组件重新渲染，Hooks重新执行并获取最新状态。React通过fiber架构中的链表结构来追踪每个Hook的位置。',
    avoidPhrases: ['就是用来管理状态的', '我只会用，不知道原理'],
    deductionPoints: ['回答过于肤浅', '缺乏技术深度', '无法解释核心机制'],
  },
  {
    id: 'qb-006',
    question: '如何解决跨域问题？',
    category: 'professional',
    categoryName: '专业题',
    industry: '互联网',
    position: '前端开发',
    difficulty: 'junior',
    difficultyName: '初级',
    answerGuide: '列举常见的解决方案并说明适用场景',
    fullScoreAnswer: '常见的跨域解决方案有：1.CORS：服务端设置Access-Control-Allow-Origin响应头；2.代理服务器：开发环境使用Vite/Webpack代理，生产环境使用Nginx反向代理；3.JSONP：利用script标签不受同源策略限制的特性，适用于GET请求；4.WebSocket：不受同源策略限制。实际项目中优先使用CORS方案。',
    avoidPhrases: ['不知道', '用插件解决'],
    deductionPoints: ['知识储备不足', '没有实际项目经验', '无法给出完整解决方案'],
  },
  {
    id: 'qb-007',
    question: '一个房间有三盏灯，外面有三个开关，只能进房间一次，如何确定哪个开关控制哪盏灯？',
    category: 'logic',
    categoryName: '行测思维题',
    industry: '通用',
    position: '通用',
    difficulty: 'senior',
    difficultyName: '高管',
    answerGuide: '利用灯的多重属性（亮/灭、热/冷）',
    fullScoreAnswer: '先打开开关1，等待5分钟后关闭，然后打开开关2，进入房间。亮着的灯由开关2控制，发热但不亮的灯由开关1控制，不发热也不亮的灯由开关3控制。这个问题考察的是对事物多重属性的观察能力。',
    avoidPhrases: ['不知道', '无法确定'],
    deductionPoints: ['缺乏逻辑思维', '不能跳出常规思路', '无法利用题目隐含条件'],
  },
  {
    id: 'qb-008',
    question: '请谈谈你对微服务架构的理解。',
    category: 'professional',
    categoryName: '专业题',
    industry: '互联网',
    position: '后端开发',
    difficulty: 'mid',
    difficultyName: '中级',
    answerGuide: '从定义、优缺点、适用场景三个方面回答',
    fullScoreAnswer: '微服务架构是一种将应用拆分为多个独立服务的架构模式。每个服务独立部署、独立扩展，通过API进行通信。优点包括：技术多样性、独立部署、高扩展性、团队自治。缺点包括：分布式复杂性、数据一致性挑战、运维成本增加。适合大型复杂系统和需要快速迭代的团队。',
    avoidPhrases: ['就是把代码分开写', '比较先进的架构'],
    deductionPoints: ['理解片面', '缺乏深度', '无法辩证分析'],
  },
]
