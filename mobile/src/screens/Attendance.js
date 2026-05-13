import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import api from '../services/api'

export default function Attendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [records, setRecords] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes/')
      const data = res.data.results || res.data
      setClasses(data)
      if (data.length) setSelectedClass(data[0].id)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance/?class_id=${selectedClass}`)
      setRecords(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = async (studentId, status) => {
    try {
      await api.post('/attendance/bulk_record/', {
        class_id: selectedClass,
        date,
        records: [{ student_id: studentId, status }]
      })
      fetchAttendance()
    } catch (err) {
      console.error(err)
    }
  }

  const renderRecord = ({ item }) => (
    <View style={styles.recordCard}>
      <Text style={styles.studentName}>{item.student?.full_name}</Text>
      <View style={styles.statusButtons}>
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'present' && styles.activeButton]}
          onPress={() => handleStatusChange(item.student?.id, 'present')}
        >
          <Text style={styles.buttonText}>P</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'absent' && styles.activeButton]}
          onPress={() => handleStatusChange(item.student?.id, 'absent')}
        >
          <Text style={styles.buttonText}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'late' && styles.activeButton]}
          onPress={() => handleStatusChange(item.student?.id, 'late')}
        >
          <Text style={styles.buttonText}>L</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <View style={styles.classSelector}>
        {classes.map(cls => (
          <TouchableOpacity
            key={cls.id}
            style={[styles.classButton, selectedClass === cls.id && styles.selectedClass]}
            onPress={() => setSelectedClass(cls.id)}
          >
            <Text style={styles.classText}>{cls.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No records</Text>}
      />
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
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  classButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedClass: {
    backgroundColor: '#2563eb',
  },
  classText: {
    color: '#fff',
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 35,
    height: 35,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  activeButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    fontWeight: '600',
  },
})