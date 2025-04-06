import { Routes, Route } from 'react-router-dom'
import LogInPage from './pages/Aa-log-in.jsx'
import AdminControlsPage from './components/AdminControlsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogInPage />} /> {/* Default login */}
      <Route path="/admin" element={<AdminControlsPage />} />
      {/* Add more routes here */}
    </Routes>
  )
}

export default App

//I don't know what to do
//Seth again
