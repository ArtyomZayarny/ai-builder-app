import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import ResumeEditor from './pages/ResumeEditor';
import PublicResume from './pages/PublicResume';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resume/:id" element={<ResumeEditor />} />
          <Route path="/public/:publicId" element={<PublicResume />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
