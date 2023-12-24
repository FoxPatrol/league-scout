import './App.css';
import Home from './components/Home/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LeagueDetails from './components/LeagueDetails/LeagueDetails';
import Timeline from './components/Timeline/Timeline';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="*" element={<p>Path not resolved</p>} />
          <Route path="/" element={<Home />} />
          <Route path="/league-details" element={<LeagueDetails />} />
          <Route path="/league-details/timeline" element={<Timeline />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
