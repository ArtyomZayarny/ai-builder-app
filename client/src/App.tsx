import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import ResumeEditor from './pages/ResumeEditor';
import PublicResume from './pages/PublicResume';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resume/:id" element={<ResumeEditor />} />
            <Route path="/public/:publicId" element={<PublicResume />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
