import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { PostPropertyPage } from './pages/PostPropertyPage';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { User, PublicProperty } from './types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'buyer' | 'seller'>('buyer');
  const [featuredProperties, setFeaturedProperties] = useState<PublicProperty[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  // Initialize Auth & Demo Users
  useEffect(() => {
    // 1. Fetch demo users for easy role switching
    api.getDemoUsers()
      .then(res => {
        setDemoUsers(res.users);
        // If no token in local storage, default to demo buyer for immediate friendly UX
        const token = getAuthToken();
        if (!token && res.users.length > 0) {
          const defaultUser = res.users[0];
          setAuthToken(defaultUser.id);
          setCurrentUser(defaultUser);
        }
      })
      .catch(err => console.error('Error fetching demo users:', err));

    // 2. Fetch authenticated user if token exists
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(res => setCurrentUser(res.user))
        .catch(() => {
          // Token expired or invalid
          removeAuthToken();
          setCurrentUser(null);
        });
    }

    // 3. Fetch initial featured properties for home page
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    setLoadingProps(true);
    try {
      const res = await api.getProperties();
      setFeaturedProperties(res.properties);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoadingProps(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
  };

  const handleOpenAuth = (defaultRole: 'buyer' | 'seller' = 'buyer') => {
    setAuthDefaultRole(defaultRole);
    setAuthModalOpen(true);
  };

  const handleSwitchUser = (user: User) => {
    setAuthToken(user.id);
    setCurrentUser(user);
  };

  const handleSwitchToAdmin = () => {
    const adminUser = demoUsers.find(u => u.role === 'admin') || {
      id: 'usr_admin_1',
      name: 'Portal Admin',
      email: 'admin@apnaproperty.in',
      mobile: '+91 9876543210',
      role: 'admin' as const
    };
    handleSwitchUser(adminUser);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        
        {/* Main Navigation Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuth={handleOpenAuth}
          onSwitchUser={handleSwitchUser}
          demoUsers={demoUsers}
        />

        {/* Dynamic Route Content */}
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  properties={featuredProperties}
                  loading={loadingProps}
                />
              }
            />

            <Route
              path="/properties"
              element={<PropertiesPage />}
            />

            <Route
              path="/property/:idOrSlug"
              element={
                <PropertyDetailPage
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                />
              }
            />

            <Route
              path="/post-property"
              element={
                <PostPropertyPage
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                  onPropertyCreated={loadFeaturedProperties}
                />
              }
            />

            <Route
              path="/my-purchases"
              element={
                <BuyerDashboard
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                />
              }
            />

            <Route
              path="/my-properties"
              element={
                <SellerDashboard
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                />
              }
            />

            <Route
              path="/admin"
              element={
                <AdminDashboard
                  currentUser={currentUser}
                  onOpenAuth={handleOpenAuth}
                  onSwitchToAdmin={handleSwitchToAdmin}
                />
              }
            />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Authentication Modal */}
        {authModalOpen && (
          <AuthModal
            initialRole={authDefaultRole}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={(user) => setCurrentUser(user)}
            demoUsers={demoUsers}
          />
        )}

      </div>
    </Router>
  );
}
export default App;
