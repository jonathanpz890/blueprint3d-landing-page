import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';


interface NavBarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage }) => {
    const { language, t, toggleLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });

    const navItems = [
        { id: 'home', label: t('navHome') },
        { id: 'modeling', label: t('navModeling') },
        { id: 'explore', label: t('navExplore') },
        { id: 'quote', label: t('navQuote') },
        { id: 'showcase', label: t('navShowcase') },
        { id: 'contact', label: t('navContact') },
    ];

    useEffect(() => {
        // Find active button inside desktop horizontal nav menu
        const activeBtn = navRef.current?.querySelector('.nav-link.active') as HTMLButtonElement;
        if (activeBtn) {
            setIndicatorStyle({
                left: `${activeBtn.offsetLeft}px`,
                width: `${activeBtn.offsetWidth}px`,
                opacity: 1
            });
        } else {
            setIndicatorStyle({ opacity: 0 });
        }
    }, [currentPage]);

    return (
        <header className="site-header">
            <div className="navbar-capsule">
                {/* Brand Logo */}
                <div
                    className="brand-logo-container"
                    onClick={() => setCurrentPage('home')}
                >
                    <div className="flex items-center gap-1.5 font-heading" style={{ direction: 'ltr', fontFamily: '"Fredoka", sans-serif' }}>
                        <div className="flex flex-col select-none">
                            <div className="flex items-baseline font-black tracking-tight" style={{ fontSize: '25px', lineHeight: '0.95', fontFamily: '"Fredoka", sans-serif' }}>
                                <span style={{ color: '#2563eb' }}>Blue</span>
                                <span style={{ color: '#ea580c' }}>Print</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                color: '#000000',
                                fontSize: '5.5px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                lineHeight: '1',
                                marginTop: '2px',
                                direction: 'ltr',
                                fontFamily: '"Fredoka", sans-serif',
                                padding: '0 2px'
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
                                fontSize: '40px',
                                lineHeight: '0.8',
                                marginLeft: '4px',
                                fontFamily: '"Fredoka", sans-serif',
                                color: '#1e293b',
                                display: 'inline-block',
                                paddingRight: '2px'
                             }}>3D</span>
                        </span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="nav-menu-capsule" ref={navRef}>
                    <div className="nav-active-indicator" style={indicatorStyle} />
                    {navItems.map((item) => {
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentPage(item.id)}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Call to Action & Language Switcher */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="btn-lang"
                        title={language === 'en' ? 'עברית' : 'English'}
                    >
                        <Globe className="h-3.5 w-3.5" />
                        <span className="nav-lang-text">{language === 'en' ? 'עברית' : 'English'}</span>
                    </button>

                    <button
                        onClick={() => setCurrentPage('quote')}
                        className="btn-primary rounded-full py-2 px-5 text-sm nav-cta-button"
                    >
                        {t('btnGetQuote')}
                    </button>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn-secondary mobile-nav-toggle"
                        style={{
                            padding: '8px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            backgroundColor: '#fffc',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 'auto'
                        }}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown Capsule */}
            {isOpen && (
                <div className="card-glass reveal visible mobile-menu-dropdown">
                    {navItems.map((item) => {
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    setIsOpen(false);
                                }}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                style={{
                                    width: '100%',
                                    textAlign: 'center',
                                    padding: '12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </header>
    );
};

