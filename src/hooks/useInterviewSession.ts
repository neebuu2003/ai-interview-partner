import { useState, useRef, useEffect } from 'react'
import { useInterviewStore } from '@/store/interview'
import type { Feedback } from '@/store/interview'

export function useInterviewSession() {
  const { 
    interviewId, 
    messages, 
    isLoading, 
    currentQuestionIndex, 
    totalQuestions,
    extractedSkills,
    addMessage,
    setLoading,
    updateProgress,
    finishInterview,
    setResults,
    resetInterview
  } = useInterviewStore()
  
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timerRef = useRef<number>()

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const submitAnswer = async (answerText: string, onComplete?: () => void) => {
    if (!answerText.trim() || isLoading) return

    setLoading(true)
    
    const userMessage: { id: string; role: 'user'; content: string; feedback?: Feedback } = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: answerText,
    }
    addMessage(userMessage)

    try {
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          answer: answerText.trim(),
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        userMessage.feedback = data.feedback
        
        if (data.nextQuestion) {
          addMessage({
            id: `msg-${Date.now()}-q`,
            role: 'interviewer',
            content: data.nextQuestion,
            isFollowup: data.isFollowup,
          })
          if (!data.isFollowup) {
            updateProgress(data.currentQuestionIndex, data.totalQuestions)
          }
        } else {
          updateProgress(data.currentQuestionIndex, data.totalQuestions)
          finishInterview()
          
          const resultsResponse = await fetch(`/api/interview/results?id=${interviewId}`)
          const resultsData = await resultsResponse.json()
          
          if (resultsData.success) {
            setResults(resultsData)
          }
          
          setTimeout(() => {
            onComplete?.()
          }, 2000)
        }

        if (data.encouragement) {
          setTimeout(() => {
            addMessage({
              id: `msg-${Date.now()}-enc`,
              role: 'interviewer',
              content: data.encouragement,
            })
          }, 500)
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      addMessage({
        id: `msg-${Date.now()}-error`,
        role: 'interviewer',
        content: '抱歉，网络连接出现问题，请重试。',
      })
    } finally {
      setLoading(false)
    }
  }

  const endInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    finishInterview()
    resetInterview()
  }

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return {
    interviewId,
    messages,
    isLoading,
    currentQuestionIndex,
    totalQuestions,
    extractedSkills,
    timeElapsed,
    formatTime,
    submitAnswer,
    endInterview,
    progressPercentage,
    addMessage,
    timerRef,
  }
}
