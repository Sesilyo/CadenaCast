import { Routes, Route } from 'react-router-dom'
import LogInPage from './pages/Aa-log-in.jsx';
import AdminControlsPage from './components/AdminControlsPage' // Or wherever this belongs

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
