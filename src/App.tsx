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
import AdminCalendar from './pages/AdminCalendar'; // <--- NOVO IMPORT
import AdminContacts from './pages/AdminContacts';
import AdminPricing from './pages/AdminPricing';
import AdminBlog from './pages/AdminBlog';
import AdminLayout from './components/AdminLayout';
import PublicBlog from './pages/PublicBlog';

// Adicionamos 'calendar' na lista de tipos
type AdminPage = 'dashboard' | 'bookings' | 'contacts' | 'pricing' | 'blog' | 'calendar';

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
      {currentPage === 'calendar' && <AdminCalendar />} {/* <--- NOVA TELA */}
      {currentPage === 'contacts' && <AdminContacts />}
      {currentPage === 'pricing' && <AdminPricing />}
      {currentPage === 'blog' && <AdminBlog />}
    </AdminLayout>
  );
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);
    
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  if (currentPath.startsWith('/admin')) {
    return <AdminApp />;
  }
  
  if (currentPath.startsWith('/blog')) {
    return <PublicBlog />;
  }

  return <PublicSite />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
