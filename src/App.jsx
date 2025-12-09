import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Voting from './Voting'
import Ranking from './Ranking'
import './index.css'

function Nav() {
  const location = useLocation()
  return (
    <>
      {location.pathname === '/' ? (
        <Link to="/ranking" className="nav-link">rankings</Link>
      ) : (
        <Link to="/" className="nav-link">vote</Link>
      )}
    </>
  )
}

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Voting />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </Router>
  )
}

export default App
