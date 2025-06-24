import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import VideoPlayer from './components/VideoPlayer'
import UserProfile from './components/UserProfile'
import Navbar from './components/Navbar'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({
    name: 'Maria Gabriela',
    email: 'maria@example.com',
    discProfile: {
      dominante: 23,
      influente: 13,
      estavel: 27,
      conforme: 38,
      predominant: 'Conforme'
    },
    progress: {
      coursesCompleted: 12,
      certifications: 8,
      totalHours: 156,
      currentProgress: 78
    }
  })

  const handleLogin = (credentials) => {
    // Simulate login
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

