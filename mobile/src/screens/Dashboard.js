import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function Dashboard({ navigation }) {
  const { user, logout } = useAuth()

  const teacherMenu = [
    { name: 'Classes', screen: 'Exams' },
    { name: 'Attendance', screen: 'Attendance' },
    { name: 'Marks', screen: 'Marks' },
    { name: 'Exams', screen: 'Exams' },
  ]

  const studentMenu = [
    { name: 'Available Exams', screen: 'Exams' },
    { name: 'My Results', screen: 'Results' },
  ]

  const menu = user?.role === 'student' ? studentMenu : teacherMenu

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.first_name || user?.username}!</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>
      
      <View style={styles.grid}>
        {menu.map(item => (
          <TouchableOpacity
            key={item.name}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => { logout(); navigation.replace('Login') }}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
  },
})