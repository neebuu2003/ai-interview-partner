import express, { type Request, type Response } from 'express'

const router = express.Router()

interface Question {
  id: string
  content: string
  type: 'behavioral' | 'technical' | 'situational' | 'cultural' | 'followup'
  targetSkill?: string
  followupTo?: string
}

interface Answer {
  id: string
  questionId: string
  content: string
  feedback: Feedback
}

interface Feedback {
  rating: number
  comment: string
  optimizedAnswer: string
  strengths: string[]
  weaknesses: string[]
  analysis: AnalysisResult
}

interface AnalysisResult {
  starScore: number
  keywordMatches: string[]
  keywordHitRate: number
  logicalScore: number
  hasQuantitativeData: boolean
  depthScore: number
}

interface InterviewSession {
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

const sessions: Map<string, InterviewSession> = new Map()

const skillKeywords: Record<string, string[]> = {
  'frontend': ['React', 'Vue', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Webpack', 'Vite', '性能优化', '组件化', '状态管理', 'Redux', 'Zustand'],
  'backend': ['Java', 'Go', 'Python', 'Spring', '微服务', 'Redis', 'MySQL', 'PostgreSQL', '分布式', '高并发', '缓存', '消息队列'],
  'product': ['需求分析', '用户研究', '产品设计', '项目管理', '数据分析', '竞品分析', '原型设计', '用户增长', 'A/B测试'],
  'data': ['SQL', 'Python', '数据清洗', '数据可视化', '统计分析', '机器学习', 'Excel', 'Tableau', '大数据', 'ETL'],
  'ai': ['机器学习', '深度学习', '神经网络', 'TensorFlow', 'PyTorch', 'NLP', '计算机视觉', '模型训练', '数据挖掘'],
  'design': ['Figma', 'Sketch', 'UI设计', 'UX设计', '交互设计', '视觉设计', '设计系统', '用户体验'],
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

router.post('/start', (req: Request, res: Response) => {
  const { jd, industry, position, interviewerStyle = 'friendly' } = req.body

  const extractedSkills = extractSkillsFromJD(jd || position, position)
  const questions = generateQuestions(extractedSkills, interviewerStyle as 'friendly' | 'pressure' | 'deep')
  
  const styleConfig = interviewerStyleTemplates[interviewerStyle]

  const interviewId = `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const session: InterviewSession = {
    id: interviewId,
    jd: jd || '',
    industry: industry || '',
    position: position || '',
    interviewerStyle: interviewerStyle as 'friendly' | 'pressure' | 'deep',
    extractedSkills,
    questions,
    answers: [],
    currentQuestionIndex: 0,
  }

  sessions.set(interviewId, session)

  res.json({
    success: true,
    question: questions[0].content,
    greeting: styleConfig.greeting,
    interviewId,
    totalQuestions: questions.length,
    extractedSkills,
  })
})

router.post('/answer', (req: Request, res: Response) => {
  const { interviewId, answer } = req.body

  const session = sessions.get(interviewId)
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' })
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

  res.json({
    success: true,
    feedback,
    nextQuestion,
    isFollowup,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.questions.length,
    encouragement: feedback.rating >= 4 ? styleConfig.encouragement : '',
  })
})

router.get('/results', (req: Request, res: Response) => {
  const { id } = req.query

  const session = sessions.get(id as string)
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' })
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

  res.json({
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
  })
})

export default router
