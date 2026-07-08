import express, { type Request, type Response } from 'express'

const router = express.Router()

interface SelfIntroRequest {
  experience: string
}

interface SelfIntroResponse {
  success: boolean
  concise: string
  impressive: string
  steady: string
}

router.post('/self-intro', (req: Request, res: Response) => {
  const { experience } = req.body as SelfIntroRequest
  
  if (!experience || experience.trim().length === 0) {
    return res.json({ success: false, error: '请输入你的经历或简介' })
  }

  const conciseVersion = generateConciseSelfIntro(experience)
  const impressiveVersion = generateImpressiveSelfIntro(experience)
  const steadyVersion = generateSteadySelfIntro(experience)

  res.json({
    success: true,
    concise: conciseVersion,
    impressive: impressiveVersion,
    steady: steadyVersion,
  })
})

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

interface ResumeQuestionRequest {
  resume: string
}

interface ResumeQuestionResponse {
  success: boolean
  questions: { id: string; question: string; focusArea: string }[]
}

router.post('/resume-questions', (req: Request, res: Response) => {
  const { resume } = req.body as ResumeQuestionRequest
  
  if (!resume || resume.trim().length === 0) {
    return res.json({ success: false, error: '请输入简历内容' })
  }

  const questions = generateResumeQuestions(resume)

  res.json({
    success: true,
    questions,
  })
})

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

interface PressureQuestionResponse {
  success: boolean
  question: string
  intensity: 'low' | 'medium' | 'high'
  round: number
}

let pressureRound = 0

router.post('/pressure-question', (req: Request, res: Response) => {
  pressureRound++
  
  const questions = generatePressureQuestions(pressureRound)
  
  res.json({
    success: true,
    question: questions.question,
    intensity: questions.intensity,
    round: pressureRound,
  })
})

router.post('/pressure-reset', (req: Request, res: Response) => {
  pressureRound = 0
  res.json({ success: true })
})

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

interface GroupInterviewRequest {
  role: string
}

interface GroupInterviewResponse {
  success: boolean
  roleDescription: string
  speakingPoints: string[]
  strategy: string
  templates: { name: string; content: string }[]
}

router.post('/group-roles', (req: Request, res: Response) => {
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

  res.json({ success: true, roles })
})

router.post('/group-interview', (req: Request, res: Response) => {
  const { role } = req.body as GroupInterviewRequest
  
  if (!role) {
    return res.json({ success: false, error: '请选择角色' })
  }

  const result = generateGroupInterviewData(role)

  res.json({
    success: true,
    ...result,
  })
})

function generateGroupInterviewData(role: string): {
  roleDescription: string
  speakingPoints: string[]
  strategy: string
  templates: { name: string; content: string }[]
} {
  const roles: Record<string, {
    roleDescription: string
    speakingPoints: string[]
    strategy: string
    templates: { name: string; content: string }[]
  }> = {
    leader: {
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
    timer: {
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
    recorder: {
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
    speaker: {
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
    analyst: {
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
  }

  return roles[role] || roles.analyst
}

export default router
