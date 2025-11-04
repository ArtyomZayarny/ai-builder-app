import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ResumeEditor from './pages/ResumeEditor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resume/:id" element={<ResumeEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
