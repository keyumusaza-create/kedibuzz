import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import api from '../services/api'

export default function Marks() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    score: '',
    total_marks: '100',
    assessment_type: 'quiz',
  })

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/marks/')
      setAssessments(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      await api.post('/marks/', formData)
      fetchAssessments()
      setShowForm(false)
      setFormData({
        student_id: '',
        score: '',
        total_marks: '100',
        assessment_type: 'quiz',
      })
    } catch (err) {
      console.error(err)
    }
  }

  const renderMark = ({ item }) => (
    <View style={styles.markCard}>
      <Text style={styles.studentName}>{item.student?.full_name}</Text>
      <Text style={styles.markInfo}>{item.subject?.name} - {item.assessment_type}</Text>
      <Text style={styles.scoreText}>{item.score}/{item.total_marks}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marks</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addButtonText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Student ID"
            value={formData.student_id}
            onChangeText={text => setFormData({ ...formData, student_id: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Score"
            value={formData.score}
            onChangeText={text => setFormData({ ...formData, score: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Total Marks"
            value={formData.total_marks}
            onChangeText={text => setFormData({ ...formData, total_marks: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={assessments}
          renderItem={renderMark}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text>No marks recorded</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#2563eb',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
  },
  markCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  markInfo: {
    fontSize: 14,
    color: '#64748b',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
})