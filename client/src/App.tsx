import { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Modeling } from './pages/Modeling';
import { Explore } from './pages/Explore';
import { Quote } from './pages/Quote';
import { Showcase } from './pages/Showcase';
import { Contact } from './pages/Contact';
import { Management } from './pages/management';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { BackgroundShapes } from './components/BackgroundShapes';
import { trackEvent } from './utils/analytics';

const PAGE_ORDER: Record<string, number> = {
  home: 0,
  modeling: 1,
  explore: 2,
  quote: 3,
  showcase: 4,
  contact: 5,
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (window.location.pathname === '/management') {
      return 'management';
    }
    return 'home';
  });
  const [exitingPage, setExitingPage] = useState<string | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'slide-forward' | 'slide-backward'>('slide-forward');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [pageParams, setPageParams] = useState<any>(null);
  const { direction } = useLanguage();

  useEffect(() => {
    const handlePopState = () => {
      const page = window.location.pathname === '/management' ? 'management' : 'home';
      if (page !== currentPage) {
        handlePageChange(page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  // Track initial page view on mount
  useEffect(() => {
    const initialPage = window.location.pathname === '/management' ? null : (currentPage || 'home');
    if (initialPage) {
      trackEvent('page_view', {}, initialPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setExitingPage(null);
        setIsTransitioning(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handlePageChange = (page: string, params: any = null) => {
    if (page === currentPage) return;

    // Always scroll to top when navigating pages
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Calculate transition direction
    const currentIndex = PAGE_ORDER[currentPage] ?? 0;
    const newIndex = PAGE_ORDER[page] ?? 0;
    const isForward = newIndex > currentIndex;

    let dirClass: 'slide-forward' | 'slide-backward' = isForward ? 'slide-forward' : 'slide-backward';
    if (direction === 'rtl') {
      dirClass = isForward ? 'slide-backward' : 'slide-forward';
    }

    setPageParams(params);
    setTransitionDirection(dirClass);
    setExitingPage(currentPage);
    setCurrentPage(page);
    setIsTransitioning(true);

    // Track page view
    if (page !== 'management') {
      trackEvent('page_view', {}, page);
    }

    if (page === 'management') {
      window.history.pushState({}, '', '/management');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentPage === 'management') {
    return (
      <div className={`min-h-screen app-container ${direction === 'rtl' ? 'rtl-layout' : 'ltr-layout'}`} dir={direction}>
        <Management setCurrentPage={handlePageChange} />
      </div>
    );
  }

  const renderPage = (pageName: string) => {
    switch (pageName) {
      case 'home':
        return <Home setCurrentPage={handlePageChange} />;
      case 'modeling':
        return <Modeling setCurrentPage={handlePageChange} />;
      case 'explore':
        return <Explore setCurrentPage={handlePageChange} />;
      case 'quote':
        return <Quote pageParams={pageParams} clearPageParams={() => setPageParams(null)} setCurrentPage={handlePageChange} />;
      case 'showcase':
        return <Showcase setCurrentPage={handlePageChange} />;
      case 'contact':
        return <Contact />;
      default:
        return <Home setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className={`min-h-screen app-container ${direction === 'rtl' ? 'rtl-layout' : 'ltr-layout'}`}>
      <BackgroundShapes />
      <div className="flex-grow-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        <NavBar currentPage={currentPage} setCurrentPage={handlePageChange} />
        <main className="main-content-layout">
          <div className={`page-transition-container ${transitionDirection}`}>
            {exitingPage && (
              <div className="page-transition-item page-exit" style={{ pointerEvents: 'none' }}>
                <ErrorBoundary key={exitingPage}>
                  {renderPage(exitingPage)}
                </ErrorBoundary>
              </div>
            )}
            <div className={`page-transition-item page-enter ${isTransitioning ? 'transition-active' : ''}`}>
              <ErrorBoundary key={currentPage}>
                {renderPage(currentPage)}
              </ErrorBoundary>
            </div>
          </div>
        </main>
        <Footer setCurrentPage={handlePageChange} />
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;

