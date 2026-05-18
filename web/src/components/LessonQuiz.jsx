import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export default function LessonQuiz({ lessonId, onQuizChange }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/courses/quiz-questions/?lesson_id=${lessonId}`)
      .then((res) => {
        const qs = res.data.results || res.data
        setQuestions(qs)
        // Pre-fill results from existing attempts
        const initialResults = {}
        qs.forEach((q) => {
          if (q.learner_answer) {
            initialResults[q.id] = {
              selected: q.learner_answer,
              is_correct: q.learner_is_correct,
            }
          }
        })
        setResults(initialResults)
      })
      .finally(() => setLoading(false))
  }, [lessonId])

  const current = questions[currentIndex]

  // Notify parent about quiz state whenever results or questions change
  const totalAttempted = Object.keys(results).length
  const correctCount = Object.values(results).filter((r) => r.is_correct).length
  const attemptedAll = totalAttempted === questions.length
  const allCorrect = attemptedAll && correctCount === questions.length

  useEffect(() => {
    if (onQuizChange) {
      if (questions.length > 0) {
        onQuizChange({
          total: questions.length,
          attempted: totalAttempted,
          correct: correctCount,
          allCorrect,
          attemptedAll,
        })
      } else {
        // No quiz questions exist — ensure hasQuiz stays false
        onQuizChange(null)
      }
    }
  }, [results, questions.length])

  const handleAnswer = useCallback(async () => {
    if (!selected || !current) return
    setSubmitting(true)
    try {
      const res = await api.post('/courses/quiz-attempts/', {
        question: current.id,
        answer: selected,
      })
      setResults((prev) => ({
        ...prev,
        [current.id]: {
          selected: res.data.selected_answer,
          correct: res.data.correct_answer,
          is_correct: res.data.is_correct,
          explanation: res.data.explanation,
        },
      }))
    } finally {
      setSubmitting(false)
    }
  }, [selected, current])

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    } else {
      setShowResults(true)
    }
  }

  const restartQuiz = () => {
    setCurrentIndex(0)
    setSelected(null)
    setShowResults(false)
    setStarted(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>
        Loading quiz...
      </div>
    )
  }

  if (questions.length === 0) {
    return null // No quiz for this lesson
  }

  // Show final results screen
  if (showResults) {
    return (
      <section className="glass-card" style={{
        borderRadius: '1.5rem',
        padding: 'clamp(1.2rem, 5vw, 1.8rem)',
        background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
        border: '1px solid #dbeafe',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '2.5rem', fontWeight: 900, color: allCorrect ? '#16a34a' : '#0f172a',
            marginBottom: '0.3rem',
          }}>
            {allCorrect ? '🎉 Perfect Score!' : '📊 Quiz Results'}
          </div>
          <p style={{ color: '#51657f', fontSize: '0.95rem' }}>
            You answered <strong>{correctCount}/{questions.length}</strong> questions correctly
          </p>
          {allCorrect && (
            <p style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.3rem' }}>
              ✓ Understanding confirmed!
            </p>
          )}
          {!allCorrect && (
            <p style={{ color: '#ea580c', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.3rem' }}>
              Review the incorrect answers and retry when ready
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {questions.map((q, idx) => {
            const r = results[q.id]
            return (
              <div key={q.id} style={{
                padding: '1rem', borderRadius: '1rem',
                background: r?.is_correct ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${r?.is_correct ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: r?.is_correct ? '#16a34a' : '#ef4444',
                    color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                  }}>
                    {r?.is_correct ? '✓' : '✗'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      {idx + 1}. {q.question}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#51657f' }}>
                      Your answer: <strong style={{ color: r?.is_correct ? '#16a34a' : '#ef4444' }}>
                        {r?.selected || 'Not answered'}
                      </strong>
                      {!r?.is_correct && r?.correct && (
                        <> · Correct answer: <strong style={{ color: '#16a34a' }}>{r.correct}</strong></>
                      )}
                    </div>
                    {r?.explanation && (
                      <div style={{
                        marginTop: '0.5rem', padding: '0.6rem 0.8rem',
                        background: '#f8fafc', borderRadius: '0.6rem',
                        fontSize: '0.8rem', color: '#334155', lineHeight: 1.5,
                      }}>
                        💡 {r.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={restartQuiz}
            style={{
              border: '1px solid #dbeafe', background: '#fff', color: '#1d4ed8',
              borderRadius: '999px', padding: '0.7rem 1.4rem', fontWeight: 700,
              cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Retry Quiz
          </button>
        </div>
      </section>
    )
  }

  // Initial start screen
  if (!started) {
    return (
      <section className="glass-card" style={{
        borderRadius: '1.5rem',
        padding: 'clamp(1.5rem, 5vw, 2rem)',
        background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
        border: '1px solid #dbeafe',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
        <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '0.5rem', fontSize: '1.2rem' }}>
          Check Your Understanding
        </h2>
        <p style={{ color: '#51657f', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem', maxWidth: 400, margin: '0 auto 1rem' }}>
          Answer {questions.length} quick question{questions.length > 1 ? 's' : ''} to test what you've learned.
          You must answer all correctly to complete this lesson.
        </p>
        {attemptedAll && allCorrect ? (
          <div>
            <p style={{ color: '#16a34a', fontWeight: 800, marginBottom: '0.75rem' }}>✅ You've already passed this quiz!</p>
          </div>
        ) : (
          <div>
            {attemptedAll && !allCorrect && (
              <p style={{ color: '#ea580c', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {correctCount}/{questions.length} correct — review and retry
              </p>
            )}
            <button
              onClick={() => setStarted(true)}
              style={{
                border: 'none', background: '#2563eb', color: '#fff',
                borderRadius: '999px', padding: '0.75rem 1.5rem', fontWeight: 800,
                cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              {attemptedAll ? 'Review & Retry Quiz' : 'Start Quiz'}
            </button>
          </div>
        )}
      </section>
    )
  }

  // Active quiz question
  const currentResult = results[current?.id]

  return (
    <section className="glass-card" style={{
      borderRadius: '1.5rem',
      padding: 'clamp(1rem, 4vw, 1.5rem)',
      background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
      border: '1px solid #dbeafe',
    }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            height: '100%', background: '#2563eb', borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {current && (
        <div>
          <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.5 }}>
            {current.question}
          </h3>

          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.2rem' }}>
            {[
              { key: 'A', label: current.option_a },
              { key: 'B', label: current.option_b },
              current.option_c ? { key: 'C', label: current.option_c } : null,
              current.option_d ? { key: 'D', label: current.option_d } : null,
            ].filter(Boolean).map((opt) => {
              const isSelected = selected === opt.key
              const isAnswered = !!currentResult
              const isThisCorrect = isAnswered && currentResult.correct === opt.key
              const isThisWrong = isAnswered && isSelected && !currentResult.is_correct

              let bg = '#fff'
              let border = '#dbeafe'
              if (isAnswered) {
                if (isThisCorrect) { bg = '#f0fdf4'; border = '#22c55e' }
                else if (isThisWrong) { bg = '#fef2f2'; border = '#ef4444' }
              } else if (isSelected) { bg = '#eff6ff'; border = '#2563eb' }

              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    if (!isAnswered) {
                      setSelected(opt.key)
                    }
                  }}
                  disabled={isAnswered}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.85rem 1rem', borderRadius: '1rem',
                    background: bg, border: `2px solid ${border}`,
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.2s ease', textAlign: 'left',
                    width: '100', fontSize: '0.9rem', color: '#1e293b',
                    fontWeight: isAnswered && isThisCorrect ? 800 : 500,
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isAnswered && isThisCorrect ? '#16a34a'
                      : isAnswered && isThisWrong ? '#ef4444'
                      : isSelected ? '#2563eb' : '#f1f5f9',
                    color: (isSelected || isAnswered) ? '#fff' : '#64748b',
                    fontWeight: 800, fontSize: '0.8rem',
                  }}>
                    {isAnswered && isThisCorrect ? '✓' : isAnswered && isThisWrong ? '✗' : opt.key}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Feedback after answering */}
          {currentResult && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: '0.8rem', marginBottom: '1rem',
              background: currentResult.is_correct ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${currentResult.is_correct ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <div style={{ fontWeight: 700, color: currentResult.is_correct ? '#16a34a' : '#ef4444', fontSize: '0.85rem' }}>
                {currentResult.is_correct ? '✓ Correct!' : `✗ Incorrect. The correct answer is ${currentResult.correct}`}
              </div>
              {currentResult.explanation && (
                <div style={{ color: '#334155', fontSize: '0.8rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  💡 {currentResult.explanation}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {!currentResult && (
              <button
                onClick={handleAnswer}
                disabled={!selected || submitting}
                style={{
                  border: 'none', borderRadius: '999px', padding: '0.7rem 1.3rem',
                  fontWeight: 800, fontSize: '0.85rem',
                  background: selected && !submitting ? '#2563eb' : '#cbd5e1',
                  color: '#fff', cursor: selected && !submitting ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            )}
            {currentResult && (
              <button
                onClick={handleNext}
                style={{
                  border: 'none', borderRadius: '999px', padding: '0.7rem 1.3rem',
                  fontWeight: 800, fontSize: '0.85rem',
                  background: '#0f172a', color: '#fff', cursor: 'pointer',
                }}
              >
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}