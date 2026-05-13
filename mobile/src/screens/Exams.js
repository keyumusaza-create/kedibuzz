import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Exams({ navigation }) {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/exams/')
      setExams(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderExam = ({ item }) => (
    <View style={styles.examCard}>
      <Text style={styles.examTitle}>{item.title}</Text>
      <Text style={styles.examInfo}>{item.subject?.name} - {item.class_obj?.name}</Text>
      <Text style={styles.examInfo}>Duration: {item.duration_minutes} min</Text>
      <Text style={styles.examInfo}>Questions: {item.question_count}</Text>
      {user?.role === 'student' && item.is_published ? (
        <TouchableOpacity
          style={styles.takeButton}
          onPress={() => navigation.navigate('ExamTake', { examId: item.id })}
        >
          <Text style={styles.takeButtonText}>Take Exam</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.badge, item.is_published ? styles.published : styles.draft]}>
          <Text style={styles.badgeText}>{item.is_published ? 'Published' : 'Draft'}</Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exams</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={exams}
          renderItem={renderExam}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text>No exams available</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  examCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  examInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 3,
  },
  takeButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  published: {
    backgroundColor: '#dcfce7',
  },
  draft: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 12,
  },
})