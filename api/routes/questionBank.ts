import express, { type Request, type Response } from 'express'
import { questionBankData, questionCategories, difficultyLevels, industries, positions } from '../data/questionBank'

const router = express.Router()

router.get('/categories', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: questionCategories,
  })
})

router.get('/difficulties', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: difficultyLevels,
  })
})

router.get('/industries', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: industries,
  })
})

router.get('/positions', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: positions,
  })
})

router.get('/questions', (req: Request, res: Response) => {
  const { category, difficulty, industry, position, keyword } = req.query
  
  let filteredQuestions = [...questionBankData]
  
  if (category && category !== 'all') {
    filteredQuestions = filteredQuestions.filter(q => q.category === category)
  }
  
  if (difficulty && difficulty !== 'all') {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty)
  }
  
  if (industry && industry !== 'all') {
    filteredQuestions = filteredQuestions.filter(q => q.industry === industry)
  }
  
  if (position && position !== 'all') {
    filteredQuestions = filteredQuestions.filter(q => q.position === position)
  }
  
  if (keyword) {
    const keywordLower = typeof keyword === 'string' ? keyword.toLowerCase() : ''
    filteredQuestions = filteredQuestions.filter(q => 
      q.question.toLowerCase().includes(keywordLower) ||
      q.position.toLowerCase().includes(keywordLower) ||
      q.industry.toLowerCase().includes(keywordLower)
    )
  }
  
  res.json({
    success: true,
    data: filteredQuestions,
    total: filteredQuestions.length,
  })
})

router.get('/questions/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const question = questionBankData.find(q => q.id === id)
  
  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' })
  }
  
  res.json({
    success: true,
    data: question,
  })
})

export default router
