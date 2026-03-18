import { useState, useEffect } from "react";
import { AlertTriangle } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import BuyCredits from './pages/BuyCredits';
import PaymentStatus from './pages/PaymentStatus';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCollections from './pages/admin/AdminCollections';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import WelcomeModal from './components/WelcomeModal';

// Public Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import Templates from './pages/Templates';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthModal from './components/AuthModal';

function App() {
  // Step 1: Loader State
  const [loading, setLoading] = useState(true);
  const [accountDisabled, setAccountDisabled] = useState(false);

  // Step 2: Simulate loading for 1–2 sec
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Detect account_disabled flag from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('account_disabled') === 'true') {
      setAccountDisabled(true);
      // Clean the URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Step 3: Show loader BEFORE showing website
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          {accountDisabled && (
            <div style={{
              background: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.95rem',
              color: '#991b1b',
              fontWeight: 500,
              position: 'relative',
              zIndex: 10000
            }}>
              <span><AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Your account has been disabled by the admin. Please contact support for assistance.</span>
              <button
                onClick={() => setAccountDisabled(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: '#991b1b',
                  lineHeight: 1,
                  padding: '0 4px'
                }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/payment/success" element={<PaymentStatus />} />
              <Route path="/payment/failure" element={<PaymentStatus />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate"
                element={
                  <ProtectedRoute userOnly>
                    <Generate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute userOnly>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buy-credits"
                element={
                  <ProtectedRoute userOnly>
                    <BuyCredits />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/templates"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/collections"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminCollections />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
          <WelcomeModal />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
