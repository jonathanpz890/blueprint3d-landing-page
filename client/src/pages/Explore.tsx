import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, RefreshCw, X, User, ExternalLink, Box, FileCode, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ModelViewer } from '../components/ModelViewer';
import { parseSTLAsync, type STLModelData } from '../components/STLParser';
import { trackEvent } from '../utils/analytics';
import { API_BASE } from '../utils/api';

interface ExploreProps {
  setCurrentPage: (page: string, params?: any) => void;
}

interface ModelItem {
  id: number;
  name: string;
  thumbnail: string;
  creator: {
    name: string;
    public_url: string;
  };
  public_url: string;
  description: string;
}

interface STLFileItem {
  id: number;
  name: string;
  download_url: string;
  size: number;
}

const CATEGORIES = [
  { id: 'all', labelKey: 'exploreCategoryAll', searchTag: '' },
  { id: 'tools', labelKey: 'exploreCategoryTools', searchTag: 'tools' },
  { id: 'toys', labelKey: 'exploreCategoryToys', searchTag: 'toys' },
  { id: 'gadgets', labelKey: 'exploreCategoryGadgets', searchTag: 'gadget' },
  { id: 'art', labelKey: 'exploreCategoryArt', searchTag: 'decor' },
  { id: 'household', labelKey: 'exploreCategoryHousehold', searchTag: 'household' }
];

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f8fafc'/><g transform='translate(188, 138)' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/><polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/></g></svg>";

export const Explore: React.FC<ExploreProps> = ({ setCurrentPage }) => {
  const { t, direction } = useLanguage();
  
  // State variables
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Modal details state
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [modelFiles, setModelFiles] = useState<STLFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Dynamic preview tab switching and multi-media support
  const [activeTab, setActiveTab] = useState<'image' | '3d'>('image');
  const [modelImages, setModelImages] = useState<{ id: number; url: string }[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [loadingImages, setLoadingImages] = useState<boolean>(false);
  const [stlModelData, setStlModelData] = useState<STLModelData | null>(null);
  const [stlLoading, setStlLoading] = useState<boolean>(false);
  const [stlError, setStlError] = useState<string | null>(null);
  const [selectedStlFileId, setSelectedStlFileId] = useState<number | null>(null);

  // Pagination and Infinite Scroll state
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Fetch popular models on mount
  useEffect(() => {
    fetchInitialModels();
  }, [activeCategory]);

  const fetchInitialModels = async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    try {
      const category = CATEGORIES.find(c => c.id === activeCategory);
      let endpoint = `${API_BASE}/models/popular?page=1`;
      
      // If we have a category filter, fetch via search with category tag
      if (category && category.id !== 'all') {
        endpoint = `${API_BASE}/models/search?q=${encodeURIComponent(category.searchTag)}&page=1`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch popular models');
      }
      const data = await response.json();
      setModels(data);
      if (data.length < 12) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError(t('exploreErrLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Trigger
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchInitialModels();
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    try {
      const response = await fetch(`${API_BASE}/models/search?q=${encodeURIComponent(searchQuery)}&page=1`);
      if (!response.ok) {
        throw new Error('Failed to perform search query');
      }
      const data = await response.json();
      setModels(data);
      if (data.length < 12) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError(t('exploreErrLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      let endpoint = '';
      if (searchQuery.trim()) {
        endpoint = `${API_BASE}/models/search?q=${encodeURIComponent(searchQuery)}&page=${nextPage}`;
      } else {
        const category = CATEGORIES.find(c => c.id === activeCategory);
        if (category && category.id !== 'all') {
          endpoint = `${API_BASE}/models/search?q=${encodeURIComponent(category.searchTag)}&page=${nextPage}`;
        } else {
          endpoint = `${API_BASE}/models/popular?page=${nextPage}`;
        }
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to load more models');
      }
      const data = await response.json();
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setModels(prev => {
          // Prevent duplicates by checking ids
          const existingIds = new Set(prev.map(m => m.id));
          const filteredNew = data.filter((m: any) => !existingIds.has(m.id));
          return [...prev, ...filteredNew];
        });
        setPage(nextPage);
        if (data.length < 12) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error loading next page:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll Event Listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      
      const threshold = 350; // trigger loading 350px before reaching the bottom
      const totalHeight = document.documentElement.offsetHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        loadNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, searchQuery, activeCategory, page]);

  // Hook to fetch and parse selected STL preview
  useEffect(() => {
    if (activeTab !== '3d' || !selectedStlFileId || !modelFiles.length) {
      return;
    }

    const selectedFile = modelFiles.find(f => f.id === selectedStlFileId);
    if (!selectedFile) return;

    let active = true;
    setStlLoading(true);
    setStlError(null);
    setStlModelData(null);

    // Call the server download proxy route to stream the file as binary
    fetch(`${API_BASE}/models/download?url=${encodeURIComponent(selectedFile.download_url)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load file: status ${res.status}`);
        }
        return res.arrayBuffer();
      })
      .then(async buffer => {
        if (!active) return;
        try {
          const parsed = await parseSTLAsync(buffer);
          if (!active) return;
          if (parsed.triangleCount === 0) {
            throw new Error("Invalid or empty STL file format");
          }
          setStlModelData(parsed);
          setStlLoading(false);
        } catch (parseErr: any) {
          if (!active) return;
          console.error("Error parsing STL:", parseErr);
          setStlError(t('exploreErrFiles') || 'Failed to load 3D preview');
          setStlLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, selectedStlFileId, modelFiles]);

  const handleOpenModelDetails = async (model: ModelItem) => {
    setSelectedModel(model);
    setLoadingFiles(true);
    setFilesError(null);
    setModelFiles([]);
    // Track explore model open
    trackEvent('explore_model_opened', { thingId: String(model.id), modelName: model.name }, 'explore');

    // Reset secondary states
    setActiveTab('image');
    setModelImages([{ id: 0, url: cleanImageUrl(model.thumbnail) }]);
    setActiveImageIndex(0);
    setStlModelData(null);
    setStlError(null);
    setSelectedStlFileId(null);

    // Parallel fetch images & files
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${API_BASE}/models/files/${model.id}`);
        if (!response.ok) {
          throw new Error('Failed to load model file catalog');
        }
        const data = await response.json();
        const stlFiles = (data as STLFileItem[]).filter(f => f.name.toLowerCase().endsWith('.stl'));
        setModelFiles(stlFiles);
        if (stlFiles.length > 0) {
          setSelectedStlFileId(stlFiles[0].id);
        }
      } catch (err) {
        console.error(err);
        setFilesError(t('exploreErrFiles'));
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchImages = async () => {
      setLoadingImages(true);
      try {
        const response = await fetch(`${API_BASE}/models/images/${model.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        if (data && data.length > 0) {
          const cleaned = data.map((img: any) => ({
            id: img.id,
            url: cleanImageUrl(img.url)
          }));
          setModelImages(cleaned);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingImages(false);
      }
    };

    Promise.all([fetchFiles(), fetchImages()]);
  };

  const handlePrintModelAllFiles = (files: STLFileItem[], model: ModelItem) => {
    if (!files || files.length === 0) return;
    // Navigate to quote page, passing all available file names and URLs + Thingiverse metadata
    setCurrentPage('quote', {
      preloadFiles: files.map(f => ({
        name: f.name,
        url: f.download_url
      })),
      thingiverseUrl: model.public_url,
      thingiverseName: model.name,
      thingiverseImages: modelImages.map(img => img.url),
      thingiverseDescription: model.description
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const cleanImageUrl = (url?: string) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.includes('?url=')) {
      try {
        const urlParam = url.split('?url=')[1].split('&')[0];
        return decodeURIComponent(urlParam);
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-8" style={{ direction }}>
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      <div className="container mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="badge badge-purple animate-float mb-2">{t('explorePopularTag')}</span>
          <h2 className="text-3xl md:text-4xl font-heading">{t('exploreTitle')}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {t('exploreDesc')}
          </p>
        </div>

        {/* --- SEARCH BAR --- */}
        <form onSubmit={handleSearchSubmit} className="explore-search-form">
          <div className="explore-search-container">
            <Search 
              className="explore-search-icon" 
              style={{
                left: direction === 'rtl' ? 'auto' : '1.25rem',
                right: direction === 'rtl' ? '1.25rem' : 'auto'
              }}
            />
            <input
              type="text"
              placeholder={t('exploreSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="explore-search-input"
              style={{
                paddingLeft: direction === 'rtl' ? '1.25rem' : '3rem',
                paddingRight: direction === 'rtl' ? '3rem' : '1.25rem'
              }}
            />
          </div>
          <button type="submit" className="btn-primary explore-search-btn">
            {t('exploreSearchPlaceholder').split('...')[0]}
          </button>
        </form>

        {/* --- CATEGORIES TAB PILLS --- */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-2xl mx-auto">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setSearchQuery(''); // clear query on category shift
              }}
              className={`explore-category-btn ${activeCategory === category.id ? 'active' : ''}`}
            >
              {t(category.labelKey as any)}
            </button>
          ))}
        </div>

        {/* --- LOADER / ERROR / EMPTY STATES --- */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <RefreshCw className="h-10 w-10 animate-spin text-orange-500" />
            <span className="text-sm text-slate-400">{t('exploreLoading')}</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={fetchInitialModels} className="btn-secondary text-xs rounded-full py-1.5 px-4 mt-2">
              Reload
            </button>
          </div>
        )}

        {!loading && !error && models.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Box className="h-12 w-12 text-slate-300 animate-bounce" />
            <p className="text-sm text-slate-400 max-w-sm">{t('exploreNoResults')}</p>
          </div>
        )}

        {/* --- MODELS GRID --- */}
        {!loading && !error && models.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {models.map((model, index) => (
              <div
                key={model.id}
                onClick={() => handleOpenModelDetails(model)}
                className="explore-card animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="explore-card-image-box">
                  <img
                    src={cleanImageUrl(model.thumbnail)}
                    alt={model.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    loading="lazy"
                  />
                </div>

                <div className="px-1 pb-1.5 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold font-heading text-slate-800 line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">
                      {model.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User className="h-2.5 w-2.5 shrink-0" />
                      {model.creator.name}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex justify-between items-center text-[10px] font-extrabold text-orange-500">
                    <span>DETAILS & PRINT</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- LOADING MORE INDICATOR --- */}
        {loadingMore && (
          <div className="flex justify-center items-center gap-2 py-8">
            <RefreshCw className="h-4.5 w-4.5 animate-spin text-orange-500" />
            <span className="text-xs text-slate-400 font-bold">{t('exploreLoading') || 'Loading more models...'}</span>
          </div>
        )}
      </div>

      {/* --- MODEL DETAILS MODAL OVERLAY --- */}
      {selectedModel && createPortal(
        <div 
          className="explore-modal-backdrop animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedModel(null);
            }
          }}
        >
          <div className="explore-modal-content animate-scaleUp">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedModel(null)}
              className="explore-modal-close"
              style={{
                right: direction === 'rtl' ? 'auto' : '1.5rem',
                left: direction === 'rtl' ? '1.5rem' : 'auto'
              }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="explore-modal-grid">
              {/* Media Preview & Files Column (Left) */}
              <div className="explore-modal-media-col">
                {/* Media Tab Toggle */}
                <div className="explore-modal-tabs">
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`explore-modal-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
                  >
                    {t('exploreTabImage') || 'Photo Gallery'}
                  </button>
                  {modelFiles.length > 0 && (
                    <button
                      onClick={() => setActiveTab('3d')}
                      className={`explore-modal-tab-btn ${activeTab === '3d' ? 'active' : ''}`}
                    >
                      {t('exploreTab3D') || '3D Preview'}
                    </button>
                  )}
                </div>

                {/* Main Preview Screen */}
                <div className="explore-modal-preview-box">
                  {activeTab === 'image' ? (
                    <div className="w-full h-full relative">
                      <img
                        src={modelImages[activeImageIndex]?.url || selectedModel.thumbnail || FALLBACK_IMAGE}
                        alt={selectedModel.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                      {loadingImages && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      {stlLoading && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50/50">
                          <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
                          <span className="text-[10px] text-slate-400 font-bold">Loading 3D mesh...</span>
                        </div>
                      )}
                      
                      {stlError && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50/50 p-4 text-center">
                          <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
                          <span className="text-[10px] text-red-500 font-bold">{stlError}</span>
                        </div>
                      )}

                      {!stlLoading && !stlError && stlModelData && (
                        <ModelViewer
                          data={stlModelData}
                          color="#f97316"
                          isMinimal={false}
                          autoRotate={true}
                        />
                      )}

                      {/* File selector for 3D view if multiple exist */}
                      {modelFiles.length > 1 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl border border-slate-100 flex items-center justify-between z-10" style={{ direction: 'ltr' }}>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Part:</span>
                          <select
                            value={selectedStlFileId || ''}
                            onChange={(e) => setSelectedStlFileId(Number(e.target.value))}
                            className="text-[9px] text-slate-700 bg-transparent border-none focus:outline-none font-extrabold max-w-[80%] cursor-pointer"
                          >
                            {modelFiles.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail carousel for Photos tab */}
                {activeTab === 'image' && modelImages.length > 1 && (
                  <div className="explore-modal-thumbnails">
                    {modelImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`explore-modal-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                      >
                        <img src={img.url} />
                      </button>
                    ))}
                  </div>
                )}

                {/* STL Files List inside Media/Files Column */}
                <div style={{ marginTop: '1.5rem' }}>
                  <h5 className="explore-modal-section-title">
                    {t('exploreModalFilesCount')}
                  </h5>

                  {loadingFiles && (
                    <div className="flex items-center justify-center gap-3 py-6">
                      <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                      <span className="text-xs text-slate-400 font-bold">Loading file list...</span>
                    </div>
                  )}

                  {filesError && (
                    <div className="text-xs text-red-500 py-4 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{filesError}</span>
                    </div>
                  )}

                  {!loadingFiles && !filesError && modelFiles.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 font-semibold">No STL files were found in this Thingiverse project.</p>
                  )}

                  {!loadingFiles && !filesError && modelFiles.length > 0 && (
                    <div className="explore-modal-files-list">
                      {modelFiles.map(file => (
                        <div
                          key={file.id}
                          className="explore-modal-file-row"
                        >
                          <div className="explore-modal-file-info">
                            <FileCode className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="explore-modal-file-name" title={file.name}>
                              {file.name}
                            </span>
                            <span className="explore-modal-file-size">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handlePrintModelAllFiles(modelFiles, selectedModel!)}
                            className="btn-primary explore-modal-file-print-btn"
                          >
                            {t('exploreDownloadBtn')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Text metadata & Actions Column (Right) */}
              <div className="explore-modal-info-col">
                <div>
                  <span className="explore-modal-meta-label">Thingiverse Project</span>
                  <h3 className="explore-modal-title">
                    {selectedModel.name}
                  </h3>
                  
                  {/* Metadata Dashboard Grid */}
                  <div className="explore-modal-meta-grid">
                    <div className="explore-modal-meta-item">
                      <span className="label">{t('exploreModalDesigner')}</span>
                      <a
                        href={selectedModel.creator.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="value"
                      >
                        {selectedModel.creator.name}
                        <ExternalLink className="h-3 w-3 shrink-0" style={{ display: 'inline' }} />
                      </a>
                    </div>
                    <div className="explore-modal-meta-item">
                      <span className="label">{t('exploreModalLicense')}</span>
                      <span className="value">CC License</span>
                    </div>
                  </div>

                  {/* Description inside Info Column */}
                  {selectedModel.description && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 className="explore-modal-section-title">Project Description</h5>
                      <p className="explore-modal-desc-text">
                        {selectedModel.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="explore-modal-actions">
                  {/* Start Quote with this model */}
                  {modelFiles.length > 0 && (
                    <button
                      onClick={() => handlePrintModelAllFiles(modelFiles, selectedModel!)}
                      className="explore-modal-btn-primary"
                    >
                      <Box className="h-4.5 w-4.5 shrink-0" />
                      {t('exploreModalQuoteBtn')}
                    </button>
                  )}
                  
                  <a
                    href={selectedModel.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="explore-modal-btn-secondary"
                  >
                    View on Thingiverse <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
