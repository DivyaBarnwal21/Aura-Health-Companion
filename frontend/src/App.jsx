import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import Wellness from './pages/Wellness';
import Login from './pages/Login';
import Register from './pages/Register';

// Wrapper: redirect to /login if not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session restore
  return user ? children : <Navigate to="/login" replace />;
}

// Wrapper: redirect to / if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected routes */}
          <Route path="/"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/journal"   element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/chatbot"   element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wellness"  element={<ProtectedRoute><Wellness /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
