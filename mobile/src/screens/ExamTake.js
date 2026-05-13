import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native'
import api from '../services/api'

export default function ExamTake({ navigation, route }) {
  const { examId } = route.params
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [startedAt, setStartedAt] = useState(null)

  useEffect(() => {
    fetchExam()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && loading === false) {
      handleSubmit()
    }
  }, [timeLeft, loading])

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/exams/${examId}/start/`)
      setExam(res.data.exam)
      setQuestions(res.data.questions)
      setStartedAt(new Date().toISOString())
      setTimeLeft(res.data.exam.duration_minutes * 60)
    } catch (err) {
      Alert.alert('Error', 'Could not start exam')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmit = async () => {
    try {
      const res = await api.post('/exams/results/submit/', {
        exam_id: examId,
        answers,
        started_at: startedAt,
        submitted_at: new Date().toISOString()
      })
      const result = res.data
      Alert.alert(
        'Exam Completed',
        `Score: ${result.score}/${result.total_marks} (${result.percentage}%)\n${result.passed ? 'Passed' : 'Failed'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (err) {
      Alert.alert('Error', 'Error submitting exam')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timer}>
        <Text style={[styles.timerText, timeLeft < 60 && styles.timerDanger]}>
          {formatTime(timeLeft)}
        </Text>
      </View>

      {questions.map((question, index) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.questionText}>Q{index + 1}: {question.question_text}</Text>
          <Text style={styles.marksText}>Marks: {question.marks}</Text>
          
          {question.question_type === 'multiple_choice' && question.options && (
            <View>
              {Object.entries(question.options).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.option, answers[question.id] === key && styles.optionSelected]}
                  onPress={() => handleAnswerChange(question.id, key)}
                >
                  <Text>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {question.question_type === 'short_answer' && (
            <TextInput
              style={styles.input}
              placeholder="Enter answer"
              value={answers[question.id] || ''}
              onChangeText={(text) => handleAnswerChange(question.id, text)}
            />
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Exam</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  timer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  timerDanger: {
    color: '#ef4444',
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  marksText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
  },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})