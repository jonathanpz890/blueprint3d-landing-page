import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../utils/analytics';

interface FAQItem {
  q: string;
  a: string;
}

export const Contact: React.FC = () => {
  const { t, language, direction } = useLanguage();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });

  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
  }, []);

  const faqs: FAQItem[] = language === 'he' ? [
    {
      q: 'באילו פורמטים של קבצים אתם תומכים?',
      a: 'אנו מקבלים כרגע קבצי STL (.stl), שהם הסטנדרט המקובל בתעשייה לפריסת הדפסה. אנא ייצאו את העיצובים שלכם בפורמט STL בינארי (binary) להעלאה מהירה יותר ומשקל קובץ קטן יותר. אם יש לכם קובץ בפורמט OBJ, STEP או 3MF, אתם מוזמנים לפנות אלינו ישירות דרך טופס יצירת הקשר.',
    },
    {
      q: 'כיצד מחושב מחיר ההדפסה?',
      a: 'מחשבון העלויות המקוון שלנו מחשב את המחיר בזמן אמת לפי ארבעה פרמטרים מרכזיים: (1) עלות בסיס קבועה להכנת המדפסת והמשטח (₪18.50), (2) נפח הפלסטיק הכולל בשימוש (המחושב לפי גיאומטריית המודל ואחוז צפיפות המילוי שבחרתם), (3) זמן עבודת המכונה (גובה שכבה של 0.12 מ"מ לוקח זמן רב יותר מאשר 0.28 מ"מ), ו-(4) תעריף החומר הנבחר לפי סמ"ק.',
    },
    {
      q: 'מהי צפיפות מילוי (Infill) ומה מומלץ לבחור?',
      a: 'חלקים מודפסים בתלת-ממד מודפסים רק לעיתים נדירות כגוף מלא ומוצק. המילוי הוא מבנה פנימי דמוי כוורת או סריג. מילוי של 10-15% מתאים לפסלונים, מודלים דקורטיביים או חלקים קלים. 20% הוא הסטנדרט המקובל לשימוש כללי. 30-50% מעניק עמידות מכנית מצוינת לחלקים מכניים פונקציונליים, ומילוי של 100% נבחר רק כאשר נדרש חוזק דחיסה מקסימלי או משקל כבד של מוצק.',
    },
    {
      q: 'כיצד מתבצע התשלום וקבלת המוצרים?',
      a: 'לאחר שליחת הבקשה, הצוות שלנו בודק את קבצי ה-G-Code והדגם כדי לוודא שניתן להדפיסם ללא כשלים. לאחר האישור, נשלח אליכם אימייל עם קישור מאובטח לביצוע התשלום (כרטיס אשראי, פייפאל או אפל פיי). מיד לאחר התשלום אנו מפעילים את המדפסות ושולחים את המוצרים עם שליח עד הבית.',
    },
  ] : [
    {
      q: 'What file format do you support?',
      a: 'We currently accept STL (.stl) files, which is the industry standard for 3D slicing. Please export your designs in binary STL for faster upload speeds and smaller file sizes. If you have an OBJ, STEP, or 3MF file, feel free to reach out via the contact form.',
    },
    {
      q: 'How is the print price calculated?',
      a: 'Our instant quote tool calculates pricing in real-time based on four core parameters: (1) Base setup fee ($5.00) to prepare the build plate, (2) Total volume of plastic used, which is calculated from the model geometry and modified by your selected infill density, (3) Print duration, which depends on the layer height (0.12mm takes longer than 0.28mm), and (4) The base material rate per cubic centimeter.',
    },
    {
      q: 'What is infill density, and what should I choose?',
      a: '3D prints are rarely printed solid. Infill is the internal honeycomb structure. 10-15% is perfect for decorative figures or quick models. 20% is the standard for general use. 30-50% provides excellent structural durability for functional mechanical parts, and 100% is only used when maximum compression strength or solid weight is required.',
    },
    {
      q: 'How do I pay and receive my parts?',
      a: 'Once you submit a print request, our operators inspect the model slice patterns to verify that it will print without failures. Once approved, we will email you a secure link to finalize the invoice (Visa, MasterCard, PayPal, or Apple Pay). After payment, we print and ship the parts using standard tracked courier services.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    trackEvent('contact_form_submitted', { subject: form.subject }, 'contact');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const getSubjectLabel = (sub: string) => {
    const labels: Record<string, string> = language === 'he' ? {
      general: 'שאלה כללית',
      bulk: 'הזמנה בכמויות',
      special: 'בקשה לחומרים מיוחדים',
      design: 'תכנון ומידול תלת-ממד'
    } : {
      general: 'General Question',
      bulk: 'Bulk Printing Order',
      special: 'Special Material Request',
      design: '3D Design & CAD Services'
    };
    return labels[sub] || sub;
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-8" style={{ direction: direction }}>
      {/* Background Glows */}
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      <div className="container mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="badge badge-purple font-bold mb-2">{t('contactBadge')}</span>
          <h2 className="text-3xl md:text-4xl font-heading">{t('contactTitle')}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('contactDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Left: FAQs (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4 reveal">
            <h3 
              className="text-xl font-bold font-heading mb-2 flex items-center gap-2" 
              style={{ color: 'var(--text-primary)', textAlign: direction === 'rtl' ? 'right' : 'left' }}
            >
              <HelpCircle className="h-5 w-5" style={{ color: 'var(--primary)' }} /> {t('contactFaqTitle')}
            </h3>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="rounded-xl overflow-hidden transition-all duration-300 border"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                      borderColor: 'rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex justify-between items-center p-4 font-heading font-semibold text-sm transition-colors bg-transparent border-none cursor-pointer"
                      style={{ 
                        color: 'var(--text-primary)', 
                        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' 
                      }}
                    >
                      <span style={{ flexGrow: 1, textAlign: direction === 'rtl' ? 'right' : 'left' }}>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      ) : (
                        <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                    </button>
                    {isOpen && (
                      <div 
                        className="p-4 pt-0 text-xs leading-relaxed border-t"
                        style={{ 
                          color: 'var(--text-secondary)', 
                          borderTopColor: 'rgba(0, 0, 0, 0.05)', 
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          textAlign: direction === 'rtl' ? 'right' : 'left'
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Contact Form (5 Columns) */}
          <div className="lg:col-span-5 reveal reveal-right">
            {!submitted ? (
              <div className="card-glass" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Mail className="h-5 w-5" style={{ color: 'var(--primary)' }} /> {t('contactFormTitle')}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">{t('contactFormName')}</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder={language === 'he' ? 'ישראל ישראלי' : 'Your Name'}
                      className="form-input" 
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">{t('contactFormEmail')}</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="form-input" 
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">{t('contactFormSubject')}</label>
                    <select 
                      name="subject"
                      className="form-select"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="general">{t('contactFormSubGeneral')}</option>
                      <option value="bulk">{t('contactFormSubBulk')}</option>
                      <option value="special">{t('contactFormSubSpecial')}</option>
                      <option value="design">{t('contactFormSubDesign')}</option>
                    </select>
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label">{t('contactFormMessage')}</label>
                    <textarea 
                      name="message"
                      required
                      rows={4}
                      placeholder={t('contactFormMsgPlh')}
                      className="form-textarea resize-none"
                      value={form.message}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center">
                    {t('contactFormSubmit')} <Send className="h-4 w-4 rtl-flip" style={{ marginInlineStart: '0.25rem' }} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-glass text-center py-10 flex flex-col items-center gap-4 animate-glow" style={{ backgroundColor: '#ffffff' }}>
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('contactFormSuccessTitle')}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'he' ? (
                      <>תודה על פנייתך. קיבלנו את הודעתך בנושא **{getSubjectLabel(form.subject)}** ונשיב לך בתוך 24 שעות.</>
                    ) : (
                      <>Thank you for reaching out. We have received your message regarding **{getSubjectLabel(form.subject)}** and will respond within 24 hours.</>
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: 'general', message: '' });
                  }}
                  className="btn-secondary w-full text-xs"
                >
                  {t('contactFormSuccessBtn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
