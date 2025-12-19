import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
// Lazy load pages for better performance
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';

// Lazy Components
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminCalendar = lazy(() => import('./pages/AdminCalendar'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));
const AdminPricing = lazy(() => import('./pages/AdminPricing'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const PublicBlog = lazy(() => import('./pages/PublicBlog'));

// Loading Component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A7B9B]"></div>
  </div>
);

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
    if (!user) {
      return (
        <Suspense fallback={<Loading />}>
          <AdminLogin />
        </Suspense>
      );
    }
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      <Suspense fallback={<Loading />}>
        {currentPage === 'dashboard' && <AdminDashboard />}
        {currentPage === 'bookings' && <AdminBookings />}
        {currentPage === 'calendar' && <AdminCalendar />}
        {currentPage === 'contacts' && <AdminContacts />}
        {currentPage === 'pricing' && <AdminPricing />}
        {currentPage === 'blog' && <AdminBlog />}
      </Suspense>
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
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  if (currentPath.startsWith('/admin')) {
    return (
      <Suspense fallback={<Loading />}>
        <AdminApp />
      </Suspense>
    );
  }

  if (currentPath.startsWith('/blog')) {
    return (
      <Suspense fallback={<Loading />}>
        <PublicBlog />
      </Suspense>
    );
  }

  return <PublicSite />;
}

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>Casa Itaquanduba | Aluguel de Temporada em Ilhabela</title>
        <meta name="description" content="Sua casa de temporada perfeita em Ilhabela. Vista para o mar, piscina, e todo conforto para sua família. Reserve direto conosco e economize." />
        <meta property="og:title" content="Casa Itaquanduba | Paraíso em Ilhabela" />
        <meta property="og:description" content="Vista para o mar, piscina e conforto total. A melhor experiência em Ilhabela." />
        <meta property="og:image" content="https://casaitaquanduba.com.br/og-image.jpg" />
        <meta property="og:url" content="https://casaitaquanduba.com.br" />
        <link rel="canonical" href="https://casaitaquanduba.com.br" />
      </Helmet>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
