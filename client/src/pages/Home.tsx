import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Palette, Shield, ChevronRight, Layers, Box, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { HomeModelViewer } from '../components/HomeModelViewer';
import { API_BASE } from '../utils/api';

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

interface FilamentColor {
  nameEn: string;
  nameHe: string;
  hex: string;
  stock: boolean;
}

interface MaterialDetail {
  name: string;
  type: string;
  strength: string;
  flexibility: string;
  finish: string;
  cost: string;
  uses: string;
  colors: FilamentColor[];
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const { t, language } = useLanguage();
  const [materialColors, setMaterialColors] = useState<Record<string, FilamentColor[]>>({
    PLA: [
      { nameEn: 'Solid Black', nameHe: 'שחור אטום', hex: '#111827', stock: true },
      { nameEn: 'Snow White', nameHe: 'לבן שלג', hex: '#ffffff', stock: true },
      { nameEn: 'Slate Gray', nameHe: 'אפור צפחה', hex: '#64748b', stock: true },
      { nameEn: 'Metallic Silver', nameHe: 'כסף מטאלי', hex: '#cbd5e1', stock: true },
      { nameEn: 'Silk Gold', nameHe: 'זהב משי', hex: '#eab308', stock: true },
      { nameEn: 'Silk Copper', nameHe: 'נחושת משי', hex: '#b45309', stock: true },
      { nameEn: 'Wood / Bamboo', nameHe: 'עץ / במבוק', hex: '#c89d7c', stock: true },
      { nameEn: 'Crimson Red', nameHe: 'אדום קרימזון', hex: '#ef4444', stock: true },
      { nameEn: 'Vibrant Orange', nameHe: 'כתום מרהיב', hex: '#f97316', stock: true },
      { nameEn: 'Sun Yellow', nameHe: 'צהוב שמש', hex: '#facc15', stock: true },
      { nameEn: 'Lime Green', nameHe: 'ירוק ליים', hex: '#84cc16', stock: true },
      { nameEn: 'Grass Green', nameHe: 'ירוק דשא', hex: '#22c55e', stock: true },
      { nameEn: 'Army Green', nameHe: 'ירוק צבא', hex: '#3f6212', stock: true },
      { nameEn: 'Teal / Cyan', nameHe: 'טורקיז', hex: '#06b6d4', stock: true },
      { nameEn: 'Royal Blue', nameHe: 'כחול רויאל', hex: '#2563eb', stock: true },
      { nameEn: 'Lilac Purple', nameHe: 'סגול לילך', hex: '#a78bfa', stock: true },
      { nameEn: 'Bubblegum Pink', nameHe: 'ורוד מסטיק', hex: '#f472b6', stock: true },
      { nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true }
    ],
    PETG: [
      { nameEn: 'Solid Black', nameHe: 'שחור אטום', hex: '#111827', stock: true },
      { nameEn: 'Snow White', nameHe: 'לבן שלג', hex: '#ffffff', stock: true },
      { nameEn: 'Slate Gray', nameHe: 'אפור צפחה', hex: '#64748b', stock: true },
      { nameEn: 'Metallic Silver', nameHe: 'כסף מטאלי', hex: '#cbd5e1', stock: true },
      { nameEn: 'Silk Gold', nameHe: 'זהב משי', hex: '#eab308', stock: true },
      { nameEn: 'Silk Copper', nameHe: 'נחושת משי', hex: '#b45309', stock: true },
      { nameEn: 'Wood / Bamboo', nameHe: 'עץ / במבוק', hex: '#c89d7c', stock: true },
      { nameEn: 'Crimson Red', nameHe: 'אדום קרימזון', hex: '#ef4444', stock: true },
      { nameEn: 'Vibrant Orange', nameHe: 'כתום מרהיב', hex: '#f97316', stock: true },
      { nameEn: 'Sun Yellow', nameHe: 'צהוב שמש', hex: '#facc15', stock: true },
      { nameEn: 'Lime Green', nameHe: 'ירוק ליים', hex: '#84cc16', stock: true },
      { nameEn: 'Grass Green', nameHe: 'ירוק דשא', hex: '#22c55e', stock: true },
      { nameEn: 'Army Green', nameHe: 'ירוק צבא', hex: '#3f6212', stock: true },
      { nameEn: 'Teal / Cyan', nameHe: 'טורקיז', hex: '#06b6d4', stock: true },
      { nameEn: 'Royal Blue', nameHe: 'כחול רויאל', hex: '#2563eb', stock: true },
      { nameEn: 'Lilac Purple', nameHe: 'סגול לילך', hex: '#a78bfa', stock: true },
      { nameEn: 'Bubblegum Pink', nameHe: 'ורוד מסטיק', hex: '#f472b6', stock: true },
      { nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true }
    ],
    TPU: [
      { nameEn: 'Flexible Black', nameHe: 'שחור גמיש', hex: '#111827', stock: true },
      { nameEn: 'Flexible White', nameHe: 'לבן גמיש', hex: '#ffffff', stock: true },
      { nameEn: 'Translucent Clear', nameHe: 'שקוף גמיש', hex: '#f1f5f9', stock: true },
      { nameEn: 'Flexible Red', nameHe: 'אדום גמיש', hex: '#ef4444', stock: true },
      { nameEn: 'Flexible Blue', nameHe: 'כחול גמיש', hex: '#2563eb', stock: true }
    ]
  });

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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await fetch(`${API_BASE}/filaments`);
        if (!res.ok) throw new Error('Failed to fetch filaments catalog');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Filter by active === true (visible in storefront)
          const activeFilaments = json.data.filter((f: any) => f.active);
          
          const grouped: Record<string, FilamentColor[]> = {
            PLA: [],
            PETG: [],
            TPU: []
          };
          
          activeFilaments.forEach((f: any) => {
            const mats = Array.isArray(f.material) ? f.material : [f.material];
            mats.forEach((m: string) => {
              if (grouped[m]) {
                grouped[m].push({
                  nameEn: f.nameEn,
                  nameHe: f.nameHe,
                  hex: f.hex,
                  stock: f.stock
                });
              }
            });
          });
          
          // Only update state if we received at least some colors to avoid clearing catalog on transient db empty states
          if (grouped.PLA.length > 0 || grouped.PETG.length > 0 || grouped.TPU.length > 0) {
            setMaterialColors(grouped);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic filament catalog:', err);
      }
    };
    fetchColors();
  }, []);

  const materials: Record<string, MaterialDetail> = language === 'he' ? {
    PLA: {
      name: 'Polylactic Acid (PLA)',
      type: 'פילמנט FDM',
      strength: 'בינונית (קשיחות גבוהה)',
      flexibility: 'נמוכה',
      finish: 'מט עד מבריק, פירוט קצוות חד',
      cost: 'ידידותי לתקציב ($)',
      uses: 'אבי טיפוס ראשוניים, מודלים דקורטיביים, פרויקטים חינוכיים, חלקים בעלי עומס נמוך.',
      colors: materialColors.PLA,
    },
    PETG: {
      name: 'Polyethylene Terephthalate Glycol (PETG)',
      type: 'פילמנט FDM',
      strength: 'גבוהה (עמיד מאוד בפני מכות)',
      flexibility: 'בינונית-נמוכה',
      finish: 'חצי-מבריק, אפשרויות שקיפות',
      cost: 'משתלם ($$)',
      uses: 'חלקים מכניים פונקציונליים, מתקנים לתנאי חוץ, תושבות, מוצרים עמידים במים.',
      colors: materialColors.PETG,
    },
    TPU: {
      name: 'Thermoplastic Polyurethane (TPU)',
      type: 'פילמנט FDM',
      strength: 'גבוהה (עמיד מאוד לקריעה)',
      flexibility: 'גבוהה מאוד (אלסטי דמוי גומי)',
      finish: 'גומי, מט/משי',
      cost: 'פרימיום ($$$)',
      uses: 'מגיני טלפון, אטמים, משככי זעזועים, ידיות אחיזה רכות, חלקים עם צירים גמישים.',
      colors: materialColors.TPU,
    },
  } : {
    PLA: {
      name: 'Polylactic Acid (PLA)',
      type: 'FDM (Filament)',
      strength: 'Moderate (High Rigidity)',
      flexibility: 'Low',
      finish: 'Matte to Glossy, sharp detail',
      cost: 'Budget-friendly ($)',
      uses: 'Prototyping, decorative models, educational projects, low-stress parts.',
      colors: materialColors.PLA,
    },
    PETG: {
      name: 'Polyethylene Terephthalate Glycol (PETG)',
      type: 'FDM (Filament)',
      strength: 'High (Impact Resistant)',
      flexibility: 'Medium-Low',
      finish: 'Semi-glossy, translucent options',
      cost: 'Affordable ($$)',
      uses: 'Functional mechanical parts, outdoor containers, brackets, waterproof objects.',
      colors: materialColors.PETG,
    },
    TPU: {
      name: 'Thermoplastic Polyurethane (TPU)',
      type: 'FDM (Filament)',
      strength: 'High (Tear Resistant)',
      flexibility: 'Very High (Rubber-like)',
      finish: 'Rubbery, matte/satin',
      cost: 'Premium ($$$)',
      uses: 'Phone cases, gaskets, vibration dampeners, soft grips, flexible hinge parts.',
      colors: materialColors.TPU,
    },
  };

  return (
    <div className="relative overflow-hidden pb-16">
      {/* Decorative Glows */}
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      {/* --- HERO SECTION --- */}
      <section className="container mx-auto px-6 pt-6 md:pt-10 pb-16">
        <div className="hero-grid-content">
          <div className="badge badge-purple animate-float hero-badge">{t('homeHeroBadge')}</div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading leading-none hero-title">
            {t('homeHeroTitle1')} <span className="text-gradient">{t('homeHeroTitle2')}</span> <br />
            {t('homeHeroTitle3')}
          </h2>
          <p className="text-lg md:text-xl max-w-xl mx-auto lg:mx-0 hero-desc" style={{ color: 'var(--text-secondary)' }}>
            {t('homeHeroDesc')}
          </p>
          
          <div className="hero-visual">
            <div className="home-model-container">
              <HomeModelViewer />
            </div>
          </div>

          <div className="hero-buttons-container hero-buttons">
            <button 
              onClick={() => setCurrentPage('quote')} 
              className="btn-primary"
              style={{ width: '100%', whiteSpace: 'nowrap', justifyContent: 'center' }}
            >
              {t('homeHeroBtnUpload')} <ChevronRight className="h-5 w-5 rtl-flip" />
            </button>
            <button 
              onClick={() => setCurrentPage('showcase')} 
              className="btn-secondary"
              style={{ width: '100%', whiteSpace: 'nowrap', justifyContent: 'center' }}
            >
              {t('homeHeroBtnShowcase')}
            </button>
          </div>
        </div>
      </section>

      {/* --- ROADMAP SECTION --- */}
      <section className="container mx-auto px-6 py-16 border-t" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="roadmap-header mb-16 reveal">
          <span className="text-xs uppercase font-extrabold tracking-widest" style={{ color: 'var(--primary)' }}>{t('homeProcessBadge')}</span>
          <h2 className="text-3xl md:text-4xl mt-2 font-heading">{t('homeProcessTitle')}</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{t('homeProcessDesc')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className="card-glass process-card reveal reveal-delay-1 flex flex-col gap-3 text-center items-center">
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 border" style={{ borderColor: 'rgba(14, 165, 233, 0.2)' }}>
              <Layers className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <h3 className="text-sm md:text-lg font-bold font-heading">{t('homeStep1Title')}</h3>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{t('homeStep1Desc')}</p>
          </div>

          <div className="card-glass process-card reveal reveal-delay-2 flex flex-col gap-3 text-center items-center">
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl text-orange-500 border" style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
              <Cpu className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <h3 className="text-sm md:text-lg font-bold font-heading">{t('homeStep2Title')}</h3>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{t('homeStep2Desc')}</p>
          </div>

          <div className="card-glass process-card reveal reveal-delay-3 flex flex-col gap-3 text-center items-center">
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl text-amber-500 border" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
              <Zap className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <h3 className="text-sm md:text-lg font-bold font-heading">{t('homeStep3Title')}</h3>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{t('homeStep3Desc')}</p>
          </div>

          <div className="card-glass process-card reveal flex flex-col gap-3 text-center items-center">
            <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <h3 className="text-sm md:text-lg font-bold font-heading">{t('homeStep4Title')}</h3>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{t('homeStep4Desc')}</p>
          </div>
        </div>
      </section>

      {/* --- SERVICES/FEATURES SECTION --- */}
      <section className="container mx-auto px-6 py-16 border-t" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 flex flex-col justify-between gap-6 reveal">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest" style={{ color: 'var(--primary)' }}>{t('homeFeaturesBadge')}</span>
              <h2 className="text-3xl md:text-4xl font-heading mt-2">{t('homeFeaturesTitle')}</h2>
              <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>{t('homeFeaturesDesc')}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded flex items-center justify-center shrink-0 border" style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)', color: 'var(--primary)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>✔</div>
                <div>
                  <h4 className="text-sm font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeFeature1Title')}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('homeFeature1Desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded flex items-center justify-center shrink-0 border" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--secondary)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>✔</div>
                <div>
                  <h4 className="text-sm font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeFeature2Title')}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('homeFeature2Desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded flex items-center justify-center shrink-0 border" style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', color: '#0284c7', borderColor: 'rgba(14, 165, 233, 0.2)' }}>✔</div>
                <div>
                  <h4 className="text-sm font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeFeature3Title')}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('homeFeature3Desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded flex items-center justify-center shrink-0 border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.2)' }}>✔</div>
                <div>
                  <h4 className="text-sm font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeFeature4Title')}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('homeFeature4Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="tech-list-container reveal reveal-right">
            <div 
              className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/40" 
              style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Cpu className="h-5 w-5 text-cyan-500 shrink-0" />
                  <h3 className="text-base font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeTechFdmTitle')}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('homeTechFdmDesc')}</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/40" 
              style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Palette className="h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-base font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeTechSlaTitle')}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('homeTechSlaDesc')}</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/40" 
              style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Shield className="h-5 w-5 shrink-0" style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-base font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeTechMultiTitle')}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('homeTechMultiDesc')}</p>
              </div>
            </div>

            <div 
              className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/40"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Box className="h-5 w-5 text-emerald-500 shrink-0" />
                  <h3 className="text-base font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('homeTechPostTitle')}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('homeTechPostDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3D MODELING & CAD BANNER --- */}
      <section className="container mx-auto px-6 py-12 reveal">
        <div 
          className="rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.15)',
            textAlign: language === 'he' ? 'right' : 'left',
            direction: language === 'he' ? 'rtl' : 'ltr'
          }}
        >
          <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full filter blur-xl pointer-events-none" style={{ backgroundColor: 'rgba(14, 165, 233, 0.05)' }} />
          <div className="flex-1">
            <span className="badge badge-cyan text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ display: 'inline-block' }}>
              {t('modelingBadge')}
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-black mb-3 mt-1" style={{ color: 'var(--text-primary)' }}>
              {language === 'he' ? 'שירותי מידול ותכנון תלת-מימד מותאמים אישית' : 'Need a Custom 3D Model?'}
            </h2>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              {language === 'he' 
                ? 'אין לכם קובץ STL מוכן? המעצבים שלנו יקחו את הרעיונות, השרטוטים או החלקים שלכם ויהפכו אותם לקבצי תלת-מימד מדויקים המוכנים להדפסה ישירה.'
                : 'Do not have an STL file? Our CAD specialists design precise custom models from sketches, product descriptions, or physical parts.'}
            </p>
          </div>
          <div className="shrink-0">
            <button 
              onClick={() => setCurrentPage('modeling')} 
              className="btn-secondary font-bold text-sm px-6 py-3 rounded-xl shadow-md border hover:border-cyan-500 transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-primary)'
              }}
            >
              {language === 'he' ? 'בקשת שירותי מידול' : 'Request Modeling Service'}
            </button>
          </div>
        </div>
      </section>

      {/* --- MATERIALS INTERACTIVE TABLE --- */}
      <section className="container mx-auto px-6 py-16 border-t" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <span className="text-xs uppercase font-extrabold tracking-widest" style={{ color: 'var(--primary)' }}>{t('homeMaterialBadge')}</span>
          <h2 className="text-3xl md:text-4xl mt-2 font-heading">{t('homeMaterialTitle')}</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{t('homeMaterialDesc')}</p>
        </div>

        {/* Three Side-by-Side Material Spec Cards */}
        <div 
          className="reveal" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', 
            gap: '24px', 
            width: '100%',
            padding: '16px 0'
          }}
        >
          {Object.keys(materials).map((matKey) => {
            const mat = materials[matKey];
            return (
              <div 
                key={matKey} 
                className="card-glass p-6 flex flex-col justify-between animate-glow" 
                style={{ 
                  backgroundColor: '#ffffff', 
                  minHeight: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '24px'
                }}
              >
                <div>
                  <div className="flex justify-between items-start border-b pb-4 mb-4 gap-2" style={{ borderBottomColor: 'rgba(0, 0, 0, 0.05)' }}>
                    <div>
                      <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{mat.name}</h3>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>{mat.type}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded border shrink-0 text-center" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', fontSize: '11px' }}>
                      <span className="font-bold text-emerald-600">{mat.cost}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 mb-6 text-sm">
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('homeMatStrength')}</span>
                      <span className="font-medium text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mat.strength}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('homeMatFlexibility')}</span>
                      <span className="font-medium text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mat.flexibility}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('homeMatFinish')}</span>
                      <span className="font-medium text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mat.finish}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('homeMatUses')}</span>
                      <span className="font-medium text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{mat.uses}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{t('homeMatColors')}</span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {mat.colors.map((color, index) => (
                      <span 
                        key={index} 
                        className="badge" 
                        style={{ 
                          fontSize: '10px', 
                          padding: '0.2rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '9999px',
                          opacity: color.stock ? 1 : 0.5,
                          textTransform: 'none',
                          letterSpacing: 'normal',
                          cursor: 'default'
                        }}
                        title={!color.stock ? (language === 'he' ? 'חסר במלאי' : 'Out of Stock') : undefined}
                      >
                        <span 
                          style={{ 
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: color.hex,
                            border: color.hex.toLowerCase() === '#ffffff' ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                            flexShrink: 0
                          }} 
                        />
                        <span>{language === 'he' ? color.nameHe : color.nameEn}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="container mx-auto px-6 py-12 reveal">
        <div 
          className="rounded-3xl p-12 text-center max-w-4xl mx-auto backdrop-blur-md relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.15)'
          }}
        >
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full filter blur-xl pointer-events-none" style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }} />
          <h2 className="text-3xl md:text-4xl font-heading mb-4" style={{ color: 'var(--text-primary)' }}>{t('homeCtaTitle')}</h2>
          <p className="max-w-lg mx-auto mb-8 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            {t('homeCtaDesc')}
          </p>
          <button onClick={() => setCurrentPage('quote')} className="btn-primary">
            {t('homeCtaBtn')}
          </button>
        </div>
      </section>
    </div>
  );
};
