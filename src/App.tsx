import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Gallery from './components/Gallery';
import AboutHouse from './components/AboutHouse';
import Location from './components/Location';
import BookingWidget from './components/BookingWidget';
import Testimonials from './components/Testimonials';
import Rules from './components/Rules';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminContacts from './pages/AdminContacts';
import AdminPricing from './pages/AdminPricing';
import AdminLayout from './components/AdminLayout';

type AdminPage = 'dashboard' | 'bookings' | 'contacts' | 'pricing';

function PublicSite() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Benefits />
      <Gallery />
      <AboutHouse />
      <Location />
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingWidget />
        </div>
      </section>
      <Testimonials />
      <Rules />
      <FAQ />
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function AdminApp() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <AdminDashboard />}
      {currentPage === 'bookings' && <AdminBookings />}
      {currentPage === 'contacts' && <AdminContacts />}
      {currentPage === 'pricing' && <AdminPricing />}
    </AdminLayout>
  );
}

function AppContent() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(window.location.pathname === '/admin' || window.location.hash === '#/admin');
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);

    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  return isAdminRoute ? <AdminApp /> : <PublicSite />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
