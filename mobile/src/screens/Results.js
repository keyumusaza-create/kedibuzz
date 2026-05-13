import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Results() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const url = user?.role === 'student'
        ? '/exams/results/my_results/'
        : '/exams/results/'
      const res = await api.get(url)
      setResults(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderResult = ({ item }) => (
    <View style={styles.resultCard}>
      <Text style={styles.examTitle}>{item.exam?.title}</Text>
      <Text style={styles.scoreText}>
        {item.score}/{item.total_marks} ({item.percentage}%)
      </Text>
      <View style={[styles.badge, item.passed ? styles.passed : styles.failed]}>
        <Text style={styles.badgeText}>{item.passed ? 'Passed' : 'Failed'}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text>No results found</Text>}
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
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  badge: {
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  passed: {
    backgroundColor: '#dcfce7',
  },
  failed: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
  },
})