import './App.css'
import Home from './components/Home/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LeagueDetails from './components/LeagueDetails/LeagueDetails'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="*" element={<p>Path not resolved</p>} />
          <Route path='/' element={<Home/>}/>
          <Route path='/league-details/*' element={<LeagueDetails/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
