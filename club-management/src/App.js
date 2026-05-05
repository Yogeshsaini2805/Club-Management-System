import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Clubs from './pages/Clubs';
import Initiations from './pages/Initiations';
import Events from './pages/Events';
import ClubDetails from './pages/ClubDetails';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

import './App.css';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin' && user.role !== 'club_admin') return <Navigate to="/home" />;
  
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <div className="app-container">
      <div className="animated-bg">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      {!isAuthPage && <Navbar />}
      <main className="main-content" style={{ paddingTop: isAuthPage ? '0' : '100px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
          <Route path="/initiations" element={<ProtectedRoute><Initiations /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/clubs/:id" element={<ProtectedRoute><ClubDetails /></ProtectedRoute>} />
          <Route path="/initiations/:id" element={<ProtectedRoute><ClubDetails /></ProtectedRoute>} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
