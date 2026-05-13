import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider } from './src/context/AuthContext'
import Login from './src/screens/Login'
import Dashboard from './src/screens/Dashboard'
import Exams from './src/screens/Exams'
import ExamTake from './src/screens/ExamTake'
import Results from './src/screens/Results'
import Attendance from './src/screens/Attendance'
import Marks from './src/screens/Marks'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Exams" component={Exams} />
          <Stack.Screen name="ExamTake" component={ExamTake} />
          <Stack.Screen name="Results" component={Results} />
          <Stack.Screen name="Attendance" component={Attendance} />
          <Stack.Screen name="Marks" component={Marks} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  )
}