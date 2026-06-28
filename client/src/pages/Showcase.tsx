import React, { useEffect, useState } from 'react';
import { Tag, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../utils/api';

interface ShowcaseProps {
  setCurrentPage: (page: string) => void;
}

interface PrintItem {
  id: number;
  title: string;
  image: string;
  technology: string;
  material: string;
  resolution: string;
  category: 'functional' | 'decorative';
  type: 'fdm' | 'tpu';
  description: string;
  details: string[];
}

export const Showcase: React.FC<ShowcaseProps> = ({ setCurrentPage }) => {
  const [filter, setFilter] = useState<string>('all');
  const [dbItems, setDbItems] = useState<PrintItem[]>([]);
  const { t, language, direction } = useLanguage();

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await fetch(`${API_BASE}/gallery`);
        if (!res.ok) throw new Error('API failed');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const formatted: PrintItem[] = json.data.map((g: any) => ({
            id: g.id,
            title: language === 'he' ? g.titleHe : g.titleEn,
            image: g.imageUrl,
            technology: g.material === 'TPU' ? 'Flexible TPU' : 'FDM Extrusion',
            material: g.material,
            resolution: g.layerHeight,
            category: g.category === 'functional' || g.category === 'mechanical' ? 'functional' : 'decorative',
            type: g.material === 'TPU' ? 'tpu' : 'fdm',
            description: language === 'he' ? g.descHe : g.descEn,
            details: [
              language === 'he' ? `חומר: ${g.material}` : `Material: ${g.material}`,
              language === 'he' ? `מילוי: ${g.infill}` : `Infill: ${g.infill}`,
              language === 'he' ? `איכות: ${g.layerHeight}` : `Resolution: ${g.layerHeight}`,
              language === 'he' ? `משקל: ${g.weight}` : `Weight: ${g.weight}`
            ]
          }));
          setDbItems(formatted);
        }
      } catch (err) {
        console.error('Failed to load dynamic gallery, using static fallback:', err);
      }
    };
    fetchShowcase();
  }, [language]);

  useEffect(() => {
    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filter, dbItems]);

  // Localized showcase items
  const items: PrintItem[] = language === 'he' ? [
    {
      id: 1,
      title: 'מערכת גלגלי שיניים פלנטרית',
      image: '/images/gear.png',
      technology: 'הזרקת פילמנט (FDM)',
      material: 'PLA (ירוק זוהר)',
      resolution: '0.20 מ"מ',
      category: 'functional',
      type: 'fdm',
      description: 'מערכת גלגלי שיניים מכנית המודפסת כיחידה אחת מורכבת (Print-in-Place) עם סיבוב חלק וטולרנסים מבניים קשיחים.',
      details: ['מילוי: 25% ג\'יירויד (Gyroid)', 'דיזה: 0.4 מ"מ', 'טולרנס: ±0.1 מ"מ', 'זמן הדפסה: 8 שעות ו-12 דק׳'],
    },
    {
      id: 2,
      title: 'דרקון אש מפרקי גמיש',
      image: '/images/dragon.png',
      technology: 'הזרקת פילמנט (FDM)',
      material: 'TPU גמיש (כתום מרהיב)',
      resolution: '0.20 מ"מ',
      category: 'decorative',
      type: 'tpu',
      description: 'דרקון מפרקי מפורט וגמיש במיוחד המודפס כיחידה אחת (Print-in-Place). מודפס ב-TPU אלסטי המאפשר לדרקון להתפתל ולהתכופף בחופשיות.',
      details: ['חומר: TPU גמיש 95A', 'מילוי: 15% ג\'יירויד (Gyroid)', 'מהירות הדפסה נמוכה לשכבות חלקות', 'זמן הדפסה: 14 שעות ו-45 דק׳'],
    },
    {
      id: 3,
      title: 'אגרטל גיאומטרי בגוון משי כפול',
      image: '/images/vase.png',
      technology: 'הזרקת פילמנט (FDM)',
      material: 'PLA משי (זהב/סגול)',
      resolution: '0.28 מ"מ',
      category: 'decorative',
      type: 'fdm',
      description: 'אגרטל פרחים בעל עיצוב גלי גיאומטרי. הודפס באמצעות פילמנט משי בעל שני גוונים המשתקף ומחליף צבעים בצורה דינמית בהתאם לזווית האור.',
      details: ['מילוי: 0% (מצב אגרטל - Vase Mode)', 'עובי דופן: 0.8 מ"מ', 'דיזה: 0.6 מ"מ', 'זמן הדפסה: 4 שעות ו-30 דק׳'],
    },
    {
      id: 4,
      title: 'תושבת זרוע לרחפן עומס כבד',
      image: '/images/bracket.png',
      technology: 'הזרקת פילמנט (FDM)',
      material: 'PA-CF (ניילון מחוזק סיבי פחמן)',
      resolution: '0.12 מ"מ (רמה תעשייתית)',
      category: 'functional',
      type: 'fdm',
      description: 'תושבת מבנית בעלת חוזק גבוה עבור שלדת רחפן קוואדקופטר. סיבי הפחמן המוטמעים מעניקים קשיחות קיצונית וספיגת זעזועים גבוהה.',
      details: ['מילוי: 60% רשת (Grid)', 'טמפ\' משטח: 110 מעלות צלזיוס', 'דיזת פלדה מוקשית', 'חוזק מתיחה: 95 MPa'],
    },
  ] : [
    {
      id: 1,
      title: 'Planetary Gear Mechanism',
      image: '/images/gear.png',
      technology: 'FDM Extrusion',
      material: 'PLA (Neon Green)',
      resolution: '0.20 mm',
      category: 'functional',
      type: 'fdm',
      description: 'Fully assembled print-in-place mechanical gear system with smooth rotation and strict structural tolerances.',
      details: ['Infill: 25% Gyroid', 'Nozzle: 0.4mm', 'Tolerance: ±0.1mm', 'Print Time: 8h 12m'],
    },
    {
      id: 2,
      title: 'Flexible Articulated Dragon',
      image: '/images/dragon.png',
      technology: 'FDM Extrusion',
      material: 'Flexible TPU (Vibrant Orange)',
      resolution: '0.20 mm',
      category: 'decorative',
      type: 'tpu',
      description: 'Articulated detailed dragon printed in one single piece (Print-in-Place). Printed with flexible rubber-like TPU allowing it to bend and twist freely.',
      details: ['Material: Flexible TPU 95A', 'Infill: 15% Gyroid', 'Slow print speed for clean layers', 'Print Time: 14h 45m'],
    },
    {
      id: 3,
      title: 'Silk Dual-Color Geometric Vase',
      image: '/images/vase.png',
      technology: 'FDM Extrusion',
      material: 'Silk Gold/Purple PLA',
      resolution: '0.28 mm',
      category: 'decorative',
      type: 'fdm',
      description: 'Organic wavy flower vase printed with dual-color co-extrusion filament that shines and shifts colors dynamically when viewed from different angles.',
      details: ['Infill: 0% (Vase Mode)', 'Wall thickness: 0.8mm', 'Nozzle: 0.6mm', 'Print Time: 4h 30m'],
    },
    {
      id: 4,
      title: 'Heavy-Duty Drone Arm Bracket',
      image: '/images/bracket.png',
      technology: 'FDM Extrusion',
      material: 'PA-CF (Carbon-Fiber Nylon)',
      resolution: '0.12 mm (Industrial)',
      category: 'functional',
      type: 'fdm',
      description: 'High-strength structural bracket for a quadcopter frame. Carbon fiber reinforcements offer extreme rigidity and high impact absorption.',
      details: ['Infill: 60% Grid', 'Bed temp: 110°C', 'Hardened steel nozzle', 'Tensile Strength: 95 MPa'],
    },
  ];

  const displayItems = dbItems.length > 0 ? dbItems : items;

  const filteredItems = displayItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'fdm') return item.type === 'fdm';
    if (filter === 'tpu') return item.type === 'tpu';
    if (filter === 'functional') return item.category === 'functional';
    if (filter === 'decorative') return item.category === 'decorative';
    return true;
  });

  return (
    <div className="relative overflow-hidden pb-20 pt-8" style={{ direction: direction }}>
      {/* Background Glows */}
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      <div className="container mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="badge badge-purple font-bold mb-2">{t('showcaseBadge')}</span>
          <h2 className="text-3xl md:text-4xl font-heading">{t('showcaseTitle')}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('showcaseDesc')}
          </p>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {[
            { id: 'all', label: t('showcaseFilterAll') },
            { id: 'fdm', label: t('showcaseFilterFdm') },
            { id: 'tpu', label: t('showcaseFilterSla') },
            { id: 'functional', label: t('showcaseFilterFunc') },
            { id: 'decorative', label: t('showcaseFilterDeco') },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className="px-4 py-2 rounded-lg font-heading font-semibold text-xs transition-all duration-300 cursor-pointer"
              style={{
                border: '1px solid var(--border-color)',
                background: filter === btn.id ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255, 255, 255, 0.75)',
                color: filter === btn.id ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: filter === btn.id ? '0 2px 8px rgba(249, 115, 22, 0.2)' : 'none'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className="card-glass p-0 overflow-hidden flex flex-col justify-between reveal shadow-xl group border"
              style={{ 
                transitionDelay: `${index * 0.1}s`,
                backgroundColor: '#ffffff',
                borderColor: 'rgba(0, 0, 0, 0.05)',
                textAlign: direction === 'rtl' ? 'right' : 'left'
              }}
            >
              {/* Image Container with Zoom */}
              <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Tech Badge */}
                <div 
                  className="absolute top-4 flex gap-2"
                  style={{
                    left: language === 'he' ? 'auto' : '1rem',
                    right: language === 'he' ? '1rem' : 'auto'
                  }}
                >
                  <span className={`badge ${item.type === 'tpu' ? 'badge-pink' : 'badge-cyan'} text-[10px]`}>
                    {item.technology}
                  </span>
                  <span className={`badge ${item.category === 'functional' ? 'badge-purple' : 'badge-mint'} text-[10px]`}>
                    {language === 'he' 
                      ? (item.category === 'functional' ? 'פונקציונלי' : 'דקורטיבי') 
                      : item.category}
                  </span>
                </div>

                <div 
                  className="absolute bottom-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded border text-[10px] font-bold font-mono"
                  style={{
                    right: language === 'he' ? 'auto' : '1rem',
                    left: language === 'he' ? '1rem' : 'auto',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {t('showcaseLayer')}: {item.resolution}
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 flex-1 flex flex-col justify-between" style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
                <div>
                  <h3 className="text-xl font-bold font-heading mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                </div>

                {/* Specs List */}
                <div className="border-t pt-4 mt-auto" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Settings className="h-3 w-3" /> {t('showcaseParams')}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {item.details.map((detail, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- NO ITEMS --- */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 card-glass max-w-md mx-auto" style={{ backgroundColor: '#ffffff' }}>
            <Tag className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-heading" style={{ color: 'var(--text-secondary)' }}>{t('showcaseEmptyTitle')}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('showcaseEmptySub')}</p>
          </div>
        )}

        {/* --- CTA BOTTOM --- */}
        <div className="text-center mt-16 reveal">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('showcaseCtaText')}</p>
          <button 
            onClick={() => setCurrentPage('quote')} 
            className="btn-primary"
          >
            {t('showcaseCtaBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
