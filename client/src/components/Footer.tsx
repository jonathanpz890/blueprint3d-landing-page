import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logoImg from '../assets/brand-logo.png';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const { t, direction } = useLanguage();

  return (
    <footer 
      className="pt-16 pb-8" 
      style={{ 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid rgba(0, 0, 0, 0.06)', 
        color: 'var(--text-secondary)',
        direction: direction
      }}
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center">
              <img src={logoImg} alt="BluePrint 3D Logo" className="h-9 w-9 object-contain" />
            </div>
            <div className="flex items-center gap-1 font-heading" style={{ direction: 'ltr', fontFamily: '"Fredoka", sans-serif' }}>
              <div className="flex flex-col select-none">
                <div className="flex items-baseline font-black tracking-tight" style={{ fontSize: '20px', lineHeight: '0.95', fontFamily: '"Fredoka", sans-serif' }}>
                  <span style={{ color: '#2563eb' }}>Blue</span>
                  <span style={{ color: '#ea580c' }}>Print</span>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  color: '#000000', 
                  fontSize: '4.5px', 
                  fontWeight: '900', 
                  textTransform: 'uppercase', 
                  lineHeight: '1', 
                  marginTop: '2px',
                  direction: 'ltr',
                  fontFamily: '"Fredoka", sans-serif'
                }}>
                  <span>S</span><span>T</span><span>U</span><span>D</span><span>I</span><span>O</span><span>S</span>
                </div>
              </div>
              <span style={{ 
                filter: 'drop-shadow(1.5px 2.5px 3px rgba(15, 23, 42, 0.2))',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <span className="font-black select-none" style={{ 
                  fontSize: '32px', 
                  lineHeight: '0.8', 
                  marginLeft: '3px',
                  fontFamily: '"Fredoka", sans-serif',
                  color: '#1e293b', 
                  display: 'inline-block',
                  paddingRight: '2px'
                }}>3D</span>
              </span>
            </div>
          </div>
          <p className="text-sm">
            {t('footerDesc')}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>
            {t('footerNavTitle')}
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm p-0 list-none">
            <li>
              <button 
                onClick={() => setCurrentPage('home')} 
                className="hover:text-white transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  font: 'inherit', 
                  color: 'var(--text-secondary)', 
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('navHome')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage('modeling')} 
                className="hover:text-white transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  font: 'inherit', 
                  color: 'var(--text-secondary)', 
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('navModeling')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage('quote')} 
                className="hover:text-white transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  font: 'inherit', 
                  color: 'var(--text-secondary)', 
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('navQuote')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage('showcase')} 
                className="hover:text-white transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  font: 'inherit', 
                  color: 'var(--text-secondary)', 
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('navShowcase')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage('contact')} 
                className="hover:text-white transition-colors cursor-pointer"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  font: 'inherit', 
                  color: 'var(--text-secondary)', 
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('navContact')}
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Materials */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>
            {t('footerMatTitle')}
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm p-0 list-none" style={{ color: 'var(--text-secondary)' }}>
            <li>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span>
                {t('footerMatPla')}
              </span>
            </li>
            <li>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}></span>
                {t('footerMatPetg')}
              </span>
            </li>
            <li>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                {t('footerMatTpu')}
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3 text-sm">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-2 font-heading" style={{ color: 'var(--text-primary)' }}>
            {t('footerContactTitle')}
          </h4>
          <span className="flex items-center gap-2.5">
            <Mail className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <span>hello@print3dhub.com</span>
          </span>
          <span className="flex items-center gap-2.5">
            <Phone className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
            <span>+972 (0) 3-3D-PRINT</span>
          </span>
          <span className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <span>Tel Aviv, Israel</span>
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 border-t pt-6 flex flex-col md:flex-row items-center justify-between text-xs gap-4" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} BluePrint 3D. {t('footerRights')}</span>
        </div>
        <span className="flex items-center gap-1.5">
          {t('footerMadeWith')} <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" style={{ color: '#f97316', fill: '#f97316' }} /> {t('footerForMakers')}
        </span>
      </div>
    </footer>
  );
};
