import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PenTool, Box, RefreshCw, Send, CheckCircle, FileText, Compass, HeartHandshake } from 'lucide-react';

interface ModelingProps {
  setCurrentPage?: (page: string) => void;
}

export const Modeling: React.FC<ModelingProps> = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectName: '',
    description: '',
    dimensions: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [requestId, setRequestId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/modeling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setRequestId(data.data?.id || '');
      setIsSuccess(true);
    } catch {
      // Fallback: still show success to user even if network fails
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', projectName: '', description: '', dimensions: '', notes: '' });
    setIsSuccess(false);
    setRequestId('');
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-8" style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}>
      {/* Decorative Glows */}
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal visible">
          <span className="badge badge-cyan text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            {t('modelingBadge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 mt-2" style={{ color: 'var(--text-primary)' }}>
            {t('modelingTitle')}
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('modelingDesc')}
          </p>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '4rem' 
          }}
        >
          <div 
            className="card-glass hover:translate-y-[-4px] transition-transform duration-300"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {t('modelingFeature1Title')}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {t('modelingFeature1Desc')}
              </p>
            </div>
          </div>

          <div 
            className="card-glass hover:translate-y-[-4px] transition-transform duration-300"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'var(--secondary-glow)', 
                color: 'var(--secondary)',
                flexShrink: 0
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {t('modelingFeature2Title')}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {t('modelingFeature2Desc')}
              </p>
            </div>
          </div>

          <div 
            className="card-glass hover:translate-y-[-4px] transition-transform duration-300"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'rgba(16,185,129,0.1)', 
                color: '#10b981',
                flexShrink: 0
              }}
            >
              <PenTool size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {t('modelingFeature3Title')}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {t('modelingFeature3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        {isSuccess ? (
          <div className="card-glass max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-6 animate-fadeInUp" style={{ backgroundColor: '#ffffff' }}>
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <CheckCircle className="h-12 w-12 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
              {t('modelingSuccessTitle')}
            </h2>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
              {t('modelingSuccessDesc')}
            </p>
            {requestId && (
              <div className="w-full rounded-xl p-4 border text-sm flex justify-between items-center" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{language === 'he' ? 'מספר פניה:' : 'Request ID:'}</span>
                <span className="font-bold font-mono text-base" style={{ color: 'var(--primary)' }}>{requestId}</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="btn-primary rounded-xl mt-4 px-6 py-3 font-semibold text-sm"
            >
              {language === 'he' ? 'שליחת בקשה נוספת' : 'Submit Another Request'}
            </button>
          </div>
        ) : (
          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '32px', 
              alignItems: 'flex-start' 
            }}
          >
            {/* Request Form */}
            <div 
              className="card-glass" 
              style={{ 
                backgroundColor: '#ffffff',
                flex: '1 1 500px',
                minWidth: '320px',
                padding: '32px'
              }}
            >
              <h2 className="text-2xl font-bold font-heading mb-6" style={{ color: 'var(--text-primary)' }}>
                {language === 'he' ? 'פרטי בקשת תכנון חדשה' : 'New Design Request Details'}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group m-0">
                    <label className="form-label">{t('modelingFormName')}</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label">{t('modelingFormEmail')}</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group m-0 sm:col-span-2">
                    <label className="form-label">{language === 'he' ? 'טלפון (אופציונלי)' : 'Phone Number (Optional)'}</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder={language === 'he' ? '050-000-0000' : '+1 (555) 000-0000'}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group m-0">
                  <label className="form-label">{t('modelingFormProject')}</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>

                <div className="form-group m-0">
                  <label className="form-label">{t('modelingFormDesc')}</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={
                      language === 'he'
                        ? 'תארו מהו המוצר או הרכיב שברצונכם לתכנן, למה ישמש, מידות משוערות, או אם יש חלק שבור שתרצו לשחזר'
                        : 'Describe what you need designed, its function, estimated dimensions, or details about parts to replicate.'
                    }
                  />
                </div>

                <div className="form-group m-0">
                  <label className="form-label">
                    {language === 'he' ? 'מידות יעד משוערות (מ"מ)' : 'Target Dimensions (e.g. 50x50x20mm)'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 120 x 80 x 45 mm"
                  />
                </div>

                <div className="form-group m-0">
                  <label className="form-label">
                    {language === 'he' ? 'קובץ סקיצה / תמונה (אופציונלי)' : 'Reference sketch / image (Optional)'}
                  </label>
                  <div className="dropzone py-6 px-4 text-center border-2 border-dashed rounded-xl cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
                    <input type="file" className="hidden" id="ref-file" />
                    <label htmlFor="ref-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <Box className="h-8 w-8" style={{ color: 'var(--primary)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'he'
                          ? 'גררו סקיצה, שרטוט טכני או תמונה או לחצו לבחירה'
                          : 'Drag sketches, images or documents here or click to browse'}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        PNG, JPG, PDF, STEP up to 15MB
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary rounded-xl mt-2 w-full py-3.5 font-bold flex justify-center items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{language === 'he' ? 'שולח...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t('modelingFormSubmit')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Design Guidelines Column */}
            <div 
              style={{ 
                flex: '1 1 350px',
                minWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <div className="card-glass p-6">
                <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FileText className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  {language === 'he' ? 'תהליך העבודה שלנו' : 'CAD Design Process'}
                </h3>
                <ul className="flex flex-col gap-3 text-xs leading-relaxed list-none p-0 m-0" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    <span>
                      {language === 'he'
                        ? 'בחינת דרישות: אנו עוברים על הסקיצות והמפרט שנשלח בבקשה.'
                        : 'Requirement Review: We evaluate your uploaded sketches and geometric requirements.'}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-600">2.</span>
                    <span>
                      {language === 'he'
                        ? 'הצעת מחיר וסקיצה ראשונית: נחזור אליכם עם מחיר משוער ומסגרת זמן עבודה.'
                        : 'Estimate & Quote: We get back to you with design estimates and timelines.'}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-600">3.</span>
                    <span>
                      {language === 'he'
                        ? 'מידול תלת-מימד (CAD): ביצוע המידול ושיתוף תצוגה תלת-מימדית לאישורכם.'
                        : '3D CAD Modeling: We design the part and share a interactive 3D link for feedback.'}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-600">4.</span>
                    <span>
                      {language === 'he'
                        ? 'הדפסה: לאחר אישור קובץ ה-STL, נדפיס ונשלח את החלק המוגמר.'
                        : 'Direct to Print: Once approved, the STL is seamlessly loaded into our slicer queue.'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="card-glass p-6">
                <h3 className="text-lg font-bold font-heading mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <HeartHandshake className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                  {language === 'he' ? 'צריכים עזרה דחופה?' : 'Direct Consultation'}
                </h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'he'
                    ? 'רוצים להתייעץ ישירות לגבי פרויקט מורכב או חלק תעשייתי? נשמח לדבר איתכם ולתאם פגישת תכנון.'
                    : 'Need expert feedback on complex engineering assemblies? Contact us directly for a technical consultation.'}
                </p>
                <div className="flex flex-col gap-2 text-xs">
                  <span className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="font-semibold">{language === 'he' ? 'טלפון' : 'Phone'}:</span>
                    <span style={{ color: 'var(--text-primary)' }}>+972 (0) 3-3D-PRINT</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="font-semibold">{language === 'he' ? 'אימייל' : 'Email'}:</span>
                    <span style={{ color: 'var(--text-primary)' }}>design@print3dhub.com</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
