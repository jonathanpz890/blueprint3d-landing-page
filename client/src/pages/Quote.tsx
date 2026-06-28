import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Box, Settings, CheckCircle2, RefreshCw, Sparkles, Send, Plus } from 'lucide-react';
import { parseSTLAsync, type STLModelData } from '../components/STLParser';
import { ModelViewer } from '../components/ModelViewer';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../utils/analytics';

type MaterialType = 'PLA' | 'PETG' | 'TPU';
type LayerHeightType = 0.12 | 0.20 | 0.28;

interface FormState {
  name: string;
  email: string;
  phone: string;
  comments: string;
}

interface QuoteProps {
  pageParams?: {
    preloadUrl?: string;
    preloadName?: string;
    preloadFiles?: { name: string; url: string }[];
    thingiverseUrl?: string;
    thingiverseName?: string;
    thingiverseImages?: string[];
    thingiverseDescription?: string;
  } | null;
  clearPageParams?: () => void;
  setCurrentPage?: (page: string) => void;
}

export const Quote: React.FC<QuoteProps> = ({ pageParams, clearPageParams, setCurrentPage }) => {
  const { t, language, direction, formatPrice } = useLanguage();
  const didPreloadRef = useRef(false);

  interface ConfiguredModel {
    id: string;
    file: File;
    name: string;
    size: number;
    modelData: STLModelData;
    slicedData: { weightg: number; timeSeconds: number; fileKey?: string } | null;
    slicing: boolean;
    material: MaterialType;
    color: string;
    infill: number;
    layerHeight: LayerHeightType;
    quantity: number;
    error: string | null;
  }

  const [models, setModels] = useState<ConfiguredModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Thingiverse source metadata (when navigated from Explore)
  const [thingiverseUrl, setThingiverseUrl] = useState<string>('');
  const [thingiverseName, setThingiverseName] = useState<string>('');

  // Submission Flow
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', comments: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [submitProgress, setSubmitProgress] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  const [successRef, setSuccessRef] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultFilamentRef = useRef<{ material: MaterialType; hex: string }>({
    material: 'PETG',
    hex: '#111827'
  });
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);
  // Track if quote was started (first file uploaded)
  const quoteStartedRef = useRef(false);
  // Track if a quote was priced (slicing completed) but not yet ordered
  const quotePricedRef = useRef(false);
  const quotePriceRef = useRef(0);

  // Material Presets with hex colors
  // Material Presets with hex colors loaded from backend db (with static fallbacks)
  const [materialColors, setMaterialColors] = useState<Record<MaterialType, { nameEn: string; nameHe: string; hex: string; stock: boolean }[]>>({
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
      { nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true },
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
      { nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true },
    ],
    TPU: [
      { nameEn: 'Flexible Black', nameHe: 'שחור גמיש', hex: '#111827', stock: true },
      { nameEn: 'Flexible White', nameHe: 'לבן גמיש', hex: '#ffffff', stock: true },
      { nameEn: 'Translucent Clear', nameHe: 'שקוף גמיש', hex: '#f1f5f9', stock: true },
      { nameEn: 'Flexible Red', nameHe: 'אדום גמיש', hex: '#ef4444', stock: true },
      { nameEn: 'Flexible Blue', nameHe: 'כחול גמיש', hex: '#2563eb', stock: true },
    ],
  });

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/filaments');
        if (!res.ok) throw new Error('Failed to fetch filaments catalog');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Filter by active === true (visible in storefront)
          const activeFilaments = json.data.filter((f: any) => f.active);
          
          // Identify if a database item is marked as default
          const defaultItem = activeFilaments.find((f: any) => f.isDefault);
          if (defaultItem) {
            const mats = Array.isArray(defaultItem.material) ? defaultItem.material : [defaultItem.material];
            const mat = (mats[0] || 'PETG') as MaterialType;
            defaultFilamentRef.current = {
              material: mat,
              hex: defaultItem.hex
            };
          } else {
            // fallback: first active filament if none is marked default
            const firstActive = activeFilaments[0];
            if (firstActive) {
              const mats = Array.isArray(firstActive.material) ? firstActive.material : [firstActive.material];
              defaultFilamentRef.current = {
                material: (mats[0] || 'PETG') as MaterialType,
                hex: firstActive.hex
              };
            }
          }

          const grouped: Record<MaterialType, { nameEn: string; nameHe: string; hex: string; stock: boolean }[]> = {
            PLA: [],
            PETG: [],
            TPU: []
          };
          
          activeFilaments.forEach((f: any) => {
            const mats = Array.isArray(f.material) ? f.material : [f.material];
            mats.forEach((m: string) => {
              const materialKey = m as MaterialType;
              if (grouped[materialKey]) {
                grouped[materialKey].push({
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
      } finally {
        setIsCatalogLoaded(true);
      }
    };
    fetchColors();
  }, []);

  // Load preloaded models from Explore page redirection
  useEffect(() => {
    if (!isCatalogLoaded) return;
    
    // Check if we have anything to preload
    const hasSingle = !!(pageParams?.preloadUrl && pageParams?.preloadName);
    const hasMultiple = !!(pageParams?.preloadFiles && pageParams.preloadFiles.length > 0);
    
    if (!hasSingle && !hasMultiple) return;
    if (didPreloadRef.current) return;
    didPreloadRef.current = true;

    // Capture Thingiverse metadata from params before clearing
    if (pageParams?.thingiverseUrl) setThingiverseUrl(pageParams.thingiverseUrl);
    if (pageParams?.thingiverseName) setThingiverseName(pageParams.thingiverseName);

    // Clear params immediately so reload doesn't trigger it again
    if (clearPageParams) {
      clearPageParams();
    }

    setLoading(true);
    setError(null);

    // Build the list of files to download
    const filesToLoad: { name: string; url: string }[] = [];
    if (hasMultiple && pageParams?.preloadFiles) {
      filesToLoad.push(...pageParams.preloadFiles);
    } else if (hasSingle && pageParams?.preloadUrl && pageParams?.preloadName) {
      filesToLoad.push({
        name: pageParams.preloadName,
        url: pageParams.preloadUrl
      });
    }

    console.log(`Preloading ${filesToLoad.length} STL file(s) onto the Quote page.`);

    const downloadPromises = filesToLoad.map(fileInfo => {
      return fetch(`http://localhost:5001/api/models/download?url=${encodeURIComponent(fileInfo.url)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to download ${fileInfo.name}: status ${res.status}`);
          }
          return res.arrayBuffer();
        })
        .then(async buffer => {
          const parsed = await parseSTLAsync(buffer);
          if (parsed.triangleCount === 0) {
            throw new Error(t('quoteErrEmpty') || `STL file ${fileInfo.name} is empty or invalid.`);
          }

          const mockFile = new File([buffer], fileInfo.name, { type: 'application/octet-stream' });
          const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
          const defaultMat: MaterialType = defaultFilamentRef.current.material;
          const defaultColor = defaultFilamentRef.current.hex;

          return {
            id: newId,
            file: mockFile,
            name: fileInfo.name,
            size: buffer.byteLength,
            modelData: parsed,
            slicedData: null,
            slicing: false,
            material: defaultMat,
            color: defaultColor,
            infill: 20,
            layerHeight: 0.20 as LayerHeightType,
            quantity: 1,
            error: null,
          };
        });
    });

    Promise.all(downloadPromises)
      .then(newModels => {
        setModels(prev => {
          const existingNames = new Set(prev.map(m => m.name));
          const filteredNew = newModels.filter(m => !existingNames.has(m.name));
          return [...prev, ...filteredNew];
        });
        if (newModels.length > 0) {
          setActiveModelId(newModels[0].id);
        }
      })
      .catch(err => {
        console.error("Failed to preload files:", err);
        setError(err.message || 'Failed to download and parse the STL files.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isCatalogLoaded, pageParams, clearPageParams]);

  const materialRates: Record<MaterialType, number> = {
    PLA: 0.15,
    PETG: 0.18,
    TPU: 0.26,
  };

  const densities: Record<MaterialType, number> = {
    PLA: 1.24,
    PETG: 1.27,
    TPU: 1.21,
  };

  const infillLabels = [
    { value: 10, pct: '10%', left: '0%', descEn: 'Draft', descHe: 'טיוטה' },
    { value: 20, pct: '20%', left: '11.1%', descEn: 'Std', descHe: 'סטנדרט' },
    { value: 50, pct: '50%', left: '44.4%', descEn: 'Strong', descHe: 'חזק' },
    { value: 100, pct: '100%', left: '100%', descEn: 'Solid', descHe: 'מלא' },
  ];

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.stl')) {
      setError(t('quoteErrFormat'));
      return;
    }

    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const parsed = await parseSTLAsync(buffer);
        
        if (parsed.triangleCount === 0) {
          throw new Error(t('quoteErrEmpty'));
        }

        const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
        const defaultMat: MaterialType = defaultFilamentRef.current.material;
        const defaultColor = defaultFilamentRef.current.hex;

        const newModel: ConfiguredModel = {
          id: newId,
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
          modelData: parsed,
          slicedData: null,
          slicing: false,
          material: defaultMat,
          color: defaultColor,
          infill: 20,
          layerHeight: 0.20,
          quantity: 1,
          error: null,
        };

        setModels(prev => [...prev, newModel]);
        setActiveModelId(newId);

        // Track quote_started on first file upload
        if (!quoteStartedRef.current) {
          quoteStartedRef.current = true;
          const source = pageParams?.thingiverseUrl ? 'explore' : 'direct';
          trackEvent('quote_started', { source }, 'quote');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to parse the STL file. Make sure it is valid.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError(t('quoteErrRead'));
      setLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(f => processFile(f));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(f => processFile(f));
    }
  };

  const removeFile = (id: string) => {
    setModels(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (activeModelId === id) {
        setActiveModelId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleMaterialChange = (modelId: string, newMat: MaterialType) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        return {
          ...m,
          material: newMat,
          color: materialColors[newMat]?.[0]?.hex || '#111827',
          slicedData: null,
          error: null
        };
      }
      return m;
    }));
  };

  const handleColorChange = (modelId: string, newColor: string) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, color: newColor } : m));
  };

  const handleInfillChange = (modelId: string, newInfill: number) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        return {
          ...m,
          infill: newInfill,
          slicedData: null,
          error: null
        };
      }
      return m;
    }));
  };

  const handleLayerHeightChange = (modelId: string, newHeight: LayerHeightType) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        return {
          ...m,
          layerHeight: newHeight,
          slicedData: null,
          error: null
        };
      }
      return m;
    }));
  };

  const handleQuantityChange = (modelId: string, newQty: number) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, quantity: newQty } : m));
  };

  const sliceModel = async (modelId: string, mat: MaterialType, inf: number, lh: LayerHeightType) => {
    const targetModel = models.find(m => m.id === modelId);
    if (!targetModel) return;

    setModels(prev => prev.map(m => m.id === modelId ? { ...m, slicing: true, error: null } : m));

    const formData = new FormData();
    formData.append('file', targetModel.file);
    formData.append('material', mat);
    formData.append('infill', inf.toString());
    formData.append('layerHeight', lh.toString());
    if (targetModel.modelData?.boundingBox) {
      formData.append('width', targetModel.modelData.boundingBox.width.toString());
      formData.append('height', targetModel.modelData.boundingBox.height.toString());
      formData.append('depth', targetModel.modelData.boundingBox.depth.toString());
    }

    try {
      const response = await fetch('http://localhost:5001/api/slice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Slicing server error');
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setModels(prev => prev.map(m => m.id === modelId ? {
          ...m,
          slicing: false,
          slicedData: {
            weightg: resJson.data.weightg,
            timeSeconds: resJson.data.timeSeconds,
            fileKey: resJson.data.fileKey
          }
        } : m));

        // Track quote_priced after slicing succeeds
        quotePricedRef.current = true;
      }
    } catch (err: any) {
      console.error('Slicing error:', err);
      const errMsg = language === 'he'
        ? 'שגיאה בחיבור לשרת הפריסה. מציג הערכות זמניות.'
        : 'Failed to connect to the slicing server. Displaying fallback estimates.';
      setModels(prev => prev.map(m => m.id === modelId ? {
        ...m,
        slicing: false,
        error: errMsg,
        slicedData: null
      } : m));
    }
  };

  useEffect(() => {
    const modelToSlice = models.find(m => !m.slicedData && !m.slicing && !m.error);
    if (modelToSlice) {
      sliceModel(modelToSlice.id, modelToSlice.material, modelToSlice.infill, modelToSlice.layerHeight);
    }
    // Update the current total price ref for abandonment tracking
    const pricedModels = models.filter(m => m.slicedData);
    if (pricedModels.length > 0) {
      let total = 0;
      pricedModels.forEach(m => {
        const p = getModelPricing(m);
        total += p.total;
      });
      quotePriceRef.current = total;
    }
  }, [models, language]);

  // Track quote_abandoned on page unload if priced but not ordered
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (quotePricedRef.current) {
        trackEvent('quote_abandoned', { totalEstimatedPrice: quotePriceRef.current }, 'quote');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also fire on SPA navigation away (component unmount)
      if (quotePricedRef.current) {
        trackEvent('quote_abandoned', { totalEstimatedPrice: quotePriceRef.current }, 'quote');
      }
    };
  }, []);

  // Pricing Logic
  const getModelPricing = (m: ConfiguredModel) => {
    const setupCost = 7.00;
    let materialCost = 0;
    let printTimeCost = 0;

    const rate = materialRates[m.material];
    const density = densities[m.material];

    if (m.slicedData) {
      materialCost = m.slicedData.weightg * (rate / density);
      const printHours = m.slicedData.timeSeconds / 3600;
      const hourlyMachineRate = 0.90;
      printTimeCost = printHours * hourlyMachineRate;
    } else {
      const fSolid = Math.min(1.0, (m.modelData.surfaceArea * 0.05) / m.modelData.volume);
      const plasticFraction = fSolid + (1 - fSolid) * (m.infill / 100);
      const computedVolume = m.modelData.volume * plasticFraction;

      materialCost = computedVolume * rate;

      let speedFactor = 1.8;
      if (m.layerHeight === 0.12) speedFactor = 3.0;
      if (m.layerHeight === 0.28) speedFactor = 1.2;

      const printMinutes = computedVolume * speedFactor;
      const printHours = printMinutes / 60;
      const hourlyMachineRate = 0.90;
      printTimeCost = printHours * hourlyMachineRate;
    }

    const subtotal = setupCost + materialCost + printTimeCost;
    const total = subtotal * m.quantity;

    return {
      setupCost: Number(setupCost.toFixed(2)),
      materialCost: Number(materialCost.toFixed(2)),
      printTimeCost: Number(printTimeCost.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const getPricing = () => {
    let totalSetup = 0;
    let totalMaterial = 0;
    let totalPrintTime = 0;
    let total = 0;

    models.forEach(m => {
      const p = getModelPricing(m);
      totalSetup += p.setupCost;
      totalMaterial += p.materialCost;
      totalPrintTime += p.printTimeCost;
      total += p.total;
    });

    return {
      setupCost: Number(totalSetup.toFixed(2)),
      materialCost: Number(totalMaterial.toFixed(2)),
      printTimeCost: Number(totalPrintTime.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const getWeight = (m: ConfiguredModel) => {
    if (m.slicedData) {
      return Number(m.slicedData.weightg.toFixed(1));
    }
    const density = densities[m.material];
    const fSolid = Math.min(1.0, (m.modelData.surfaceArea * 0.05) / m.modelData.volume);
    const plasticFraction = fSolid + (1 - fSolid) * (m.infill / 100);
    return Number((m.modelData.volume * plasticFraction * density).toFixed(1));
  };

  const getPrintTime = (m: ConfiguredModel) => {
    if (m.slicedData) {
      const prepMinutes = 6.5; 
      const totalMinutes = Math.round(prepMinutes + (m.slicedData.timeSeconds / 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (language === 'he') {
        if (hours === 0) return `${mins} דק׳`;
        return `${hours} שעות ו-${mins} דק׳`;
      }
      if (hours === 0) return `${mins}m`;
      return `${hours}h ${mins}m`;
    }

    const prepMinutes = 6.5; 
    let speedFactor = 1.8;
    if (m.layerHeight === 0.12) speedFactor = 3.0;
    if (m.layerHeight === 0.28) speedFactor = 1.2;
    const fSolid = Math.min(1.0, (m.modelData.surfaceArea * 0.05) / m.modelData.volume);
    const plasticFraction = fSolid + (1 - fSolid) * (m.infill / 100);
    const computedVolume = m.modelData.volume * plasticFraction;
    const printMinutes = computedVolume * speedFactor;
    const totalMinutes = Math.round(prepMinutes + printMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (language === 'he') {
      if (hours === 0) return `${mins} דק׳`;
      return `${hours} שעות ו-${mins} דק׳`;
    }
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert(t('quoteFormAlert'));
      return;
    }

    setSubmitting(true);
    setSubmitProgress(0);
    setSubmitStep(t('quoteSubmitStep1'));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const orderData = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        comments: form.comments
      },
      models: models.map(m => ({
        name: m.name,
        size: m.size,
        material: m.material,
        color: m.color,
        infill: m.infill,
        layerHeight: m.layerHeight,
        quantity: m.quantity,
        weightg: getWeight(m),
        timeSeconds: m.slicedData ? m.slicedData.timeSeconds : Math.round((m.modelData.volume * (m.layerHeight === 0.12 ? 3.0 : m.layerHeight === 0.28 ? 1.2 : 1.8) * 60) + 390),
        price: getModelPricing(m).total,
        fileKey: m.slicedData?.fileKey || ''
      })),
      subtotal: subtotal,
      vatAmount: vatAmount,
      totalWithVat: totalWithVat,
      ...(thingiverseUrl ? { thingiverseUrl, thingiverseName } : {})
    };

    try {
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order request to server');
      }

      const resJson = await response.json();
      const orderId = resJson.data?.id || `P3D-${Math.floor(100000 + Math.random() * 900000)}`;

      setSuccessRef(orderId);

      const steps = [
        { progress: 20, step: t('quoteSubmitStep2') },
        { progress: 40, step: t('quoteSubmitStep3') },
        { progress: 65, step: t('quoteSubmitStep4') },
        { progress: 85, step: t('quoteSubmitStep5') },
        { progress: 100, step: t('quoteSubmitStep6') },
      ];

      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
          setSubmitProgress(steps[currentStepIndex].progress);
          setSubmitStep(steps[currentStepIndex].step);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          setSubmitting(false);
          setSuccess(true);
          // Track successful order — mark as not priced anymore so no abandonment fires
          trackEvent('quote_ordered', { orderId, totalWithVat: orderData.totalWithVat }, 'quote');
          quotePricedRef.current = false;
        }
      }, 800);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(language === 'he' ? 'שגיאה בשמירת ההזמנה בשרת. אנא נסה שוב.' : 'Failed to submit the order. Please try again.');
      setSubmitting(false);
    }
  };

  const startNewEstimate = () => {
    setModels([]);
    setActiveModelId(null);
    setSuccess(false);
    setForm({ name: '', email: '', comments: '' });
    setThingiverseUrl('');
    setThingiverseName('');
    didPreloadRef.current = false;
  };

  const pricing = getPricing();
  const subtotal = pricing.total;
  const vatAmount = Number((subtotal * 0.17).toFixed(2));
  const totalWithVat = Number((subtotal + vatAmount).toFixed(2));

  const activeModel = models.find((m) => m.id === activeModelId) || null;

  const getMaterialVisualPreset = (mat: MaterialType) => {
    if (mat === 'TPU') return 'matte';
    if (mat === 'PETG') return 'glossy';
    return 'glossy';
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-8" style={{ direction: direction }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".stl" 
        className="hidden" 
        multiple
      />
      <div className="bg-glow-purple" />
      <div className="bg-glow-pink" />

      <div className="container mx-auto px-6">
        {/* --- HEADER --- */}
        {models.length === 0 && (
          <div className="mb-10" style={{ textAlign: language === 'he' ? 'right' : 'left' }}>
            <span className="badge badge-cyan font-bold mb-2">{t('quoteBadge')}</span>
            <h2 className="text-3xl md:text-4xl font-heading">{t('quoteTitle')}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t('quoteDesc')}
            </p>
          </div>
        )}

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div 
            className="max-w-2xl mx-auto mb-6 p-4 rounded-xl border text-sm flex items-center justify-between"
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold bg-transparent border-none cursor-pointer" style={{ color: '#ef4444' }}>×</button>
          </div>
        )}

        {/* --- LOADING --- */}
        {loading && (
          <div className="card-glass max-w-lg mx-auto py-16 text-center flex flex-col items-center gap-4" style={{ backgroundColor: '#ffffff' }}>
            <RefreshCw className="h-10 w-10 animate-spin" style={{ color: 'var(--primary)' }} />
            <h3 className="text-lg font-heading">{t('quoteLoading')}</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('quoteLoadingSub')}</p>
          </div>
        )}

        {/* --- STEP 1: UPLOAD ZONE --- */}
        {models.length === 0 && !loading && (
          <div 
            className="max-w-2xl mx-auto dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl border" 
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: 'rgba(249, 115, 22, 0.2)', color: 'var(--primary)' }}
              >
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold" style={{ color: 'var(--text-primary)' }}>{t('quoteUploadTitle')}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('quoteUploadSub')}</p>
              </div>
              <button className="btn-secondary mt-2 py-2 px-5 text-sm">
                {t('quoteUploadBtn')}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: DETAILS, ESTIMATION & CONFIG --- */}
        {models.length > 0 && activeModel && !loading && !success && !submitting && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: 3D Preview (7 Columns) */}
            <div className="lg:col-span-7 sticky-preview flex flex-col gap-4">
              
              {/* Models List Wrapper */}
              <div 
                className="flex flex-col gap-2"
                style={{
                  maxHeight: '232px',
                  overflowY: 'auto',
                  paddingRight: direction === 'rtl' ? '0' : '4px',
                  paddingLeft: direction === 'rtl' ? '4px' : '0'
                }}
              >
                {models.map((m, index) => {
                  const isLast = index === models.length - 1;
                  return (
                    <div 
                      key={m.id}
                      className="flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer hover:border-orange-200"
                      style={{ 
                        backgroundColor: m.id === activeModelId ? '#fffaf7' : '#ffffff', 
                        borderColor: m.id === activeModelId ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                        boxShadow: m.id === activeModelId ? '0 4px 12px rgba(249, 115, 22, 0.05)' : 'none',
                        outline: 'none',
                        userSelect: 'none'
                      }}
                      onClick={() => setActiveModelId(m.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="rounded-lg border shrink-0 relative overflow-hidden"
                          style={{ 
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#ffffff', 
                            borderColor: m.id === activeModelId ? 'rgba(249, 115, 22, 0.3)' : 'rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                          }}
                        >
                          <ModelViewer 
                            data={m.modelData} 
                            color={m.color} 
                            materialType={getMaterialVisualPreset(m.material)}
                            isMinimal={true}
                          />
                          <span 
                            className="absolute h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm"
                            style={{
                              top: '2px',
                              right: direction === 'rtl' ? 'auto' : '2px',
                              left: direction === 'rtl' ? '2px' : 'auto',
                              backgroundColor: m.id === activeModelId ? 'var(--primary)' : 'var(--text-secondary)',
                              color: '#ffffff',
                              zIndex: 10
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }} className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold truncate max-w-xs pr-2" style={{ color: m.id === activeModelId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{m.name}</h3>
                          <span className="block text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                            {(m.size / (1024 * 1024)).toFixed(2)} MB • {m.modelData.triangleCount.toLocaleString()} Polygons • {m.quantity}x
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLast && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="p-2 rounded-lg transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: 'var(--primary)', 
                              border: 'none',
                              outline: 'none',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title={language === 'he' ? 'הוסף מודל נוסף' : 'Add another model'}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(m.id);
                          }}
                          className="p-2 rounded-lg transition-all hover:scale-105"
                          style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                            border: 'none',
                            outline: 'none',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title={t('quoteRemoveModel')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Model Canvas */}
              <div className="responsive-canvas">
                <ModelViewer 
                  data={activeModel.modelData} 
                  color={activeModel.color} 
                  materialType={getMaterialVisualPreset(activeModel.material)}
                  autoRotate={autoRotate}
                />
                
                {/* Auto Rotate Control */}
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="absolute top-4 py-1.5 px-3 rounded-lg border text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
                  style={{
                    right: language === 'he' ? 'auto' : '1rem',
                    left: language === 'he' ? '1rem' : 'auto',
                    backgroundColor: autoRotate ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.85)',
                    borderColor: autoRotate ? 'rgba(249, 115, 22, 0.3)' : 'rgba(0, 0, 0, 0.06)',
                    color: autoRotate ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                >
                  {autoRotate ? t('quoteRotateOn') : t('quoteRotateOff')}
                </button>
              </div>

              {/* Specs Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{t('quoteSpecVolume')}</span>
                  <span className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{activeModel.modelData.volume} <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>cm³</span></span>
                </div>
                <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{t('quoteSpecWeight')}</span>
                  {activeModel.slicing ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm font-semibold mt-1" style={{ color: 'var(--primary)', height: '28px' }}>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {language === 'he' ? 'מחשב...' : 'Slicing...'}
                    </span>
                  ) : (
                    <span className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{getWeight(activeModel)} <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>g</span></span>
                  )}
                </div>
                <div className="p-4 rounded-xl border text-center col-span-1" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{t('quoteSpecTime')}</span>
                  {activeModel.slicing ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm font-semibold mt-1" style={{ color: 'var(--primary)', height: '28px' }}>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {language === 'he' ? 'מחשב...' : 'Slicing...'}
                    </span>
                  ) : (
                    <span className="text-lg font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{getPrintTime(activeModel)}</span>
                  )}
                </div>
                <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="block text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{t('quoteSpecBounding')}</span>
                  <span className="text-xs font-bold font-mono block mt-1" style={{ color: 'var(--text-secondary)', direction: 'ltr' }}>
                    {activeModel.modelData.boundingBox ? (
                      `${activeModel.modelData.boundingBox.width.toFixed(0)} × ${activeModel.modelData.boundingBox.depth.toFixed(0)} × ${activeModel.modelData.boundingBox.height.toFixed(0)} mm`
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Slicing Configuration & Price (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Configuration panel */}
              <div className="card-glass flex flex-col gap-5" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="text-lg font-bold flex items-center gap-2 font-heading" style={{ color: 'var(--text-primary)' }}>
                  <Settings className="h-5 w-5" style={{ color: 'var(--primary)' }} /> {t('quoteConfigTitle')} ({activeModel.name})
                </h3>

                {/* Material Dropdown */}
                <div className="form-group">
                  <label className="form-label">{t('quoteConfigMaterial')}</label>
                  <select 
                    className="form-select"
                    value={activeModel.material}
                    onChange={(e) => handleMaterialChange(activeModel.id, e.target.value as MaterialType)}
                  >
                    <option value="PLA">PLA - {language === 'he' ? 'פלסטיק מתכלה סטנדרטי (קל ונקי)' : 'Plant-based Standard (Easy & Clean)'}</option>
                    <option value="PETG">PETG - {language === 'he' ? 'פלסטיק מבני עמיד (לתנאי חוץ וחוזק)' : 'Durable structural plastic (Outdoor/Tough)'}</option>
                    <option value="TPU">TPU - {language === 'he' ? 'אלסטומר גמיש דמוי גומי (רך ואלסטי)' : 'Rubber-like elastomeric (Flexible/Soft)'}</option>
                  </select>
                </div>

                {/* Color Selector */}
                <div className="form-group">
                  <label className="form-label">{t('quoteConfigColor')}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {(materialColors[activeModel.material] || []).map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => c.stock && handleColorChange(activeModel.id, c.hex)}
                        disabled={!c.stock}
                        className="group relative h-9 w-9 rounded-full border transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: c.hex,
                          borderColor: activeModel.color === c.hex ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                          boxShadow: activeModel.color === c.hex ? '0 0 10px rgba(249, 115, 22, 0.4)' : 'none',
                          opacity: c.stock ? 1 : 0.25,
                          cursor: c.stock ? 'pointer' : 'not-allowed'
                        }}
                        title={`${language === 'he' ? c.nameHe : c.nameEn}${!c.stock ? (language === 'he' ? ' (חסר במלאי)' : ' (Out of Stock)') : ''}`}
                      >
                        {activeModel.color === c.hex && (
                          <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow-sm border border-slate-900" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {t('quoteConfigColorSel')}{' '}
                    {language === 'he' 
                      ? (materialColors[activeModel.material].find(c => c.hex === activeModel.color)?.nameHe || 'מותאם אישית') 
                      : (materialColors[activeModel.material].find(c => c.hex === activeModel.color)?.nameEn || 'Custom')}
                  </span>
                </div>

                {/* Infill slider */}
                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">{t('quoteConfigInfill')}</label>
                    <span className="text-xs font-bold font-heading" style={{ color: 'var(--primary)' }}>{activeModel.infill}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={activeModel.infill}
                    onChange={(e) => handleInfillChange(activeModel.id, parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg cursor-pointer"
                    style={{ accentColor: 'var(--primary)', backgroundColor: 'var(--bg-dark)' }}
                  />
                  <div className="grid grid-cols-4 gap-2 mt-2 select-none" style={{ direction: 'ltr' }}>
                    {infillLabels.map((lbl) => (
                      <button
                        key={lbl.value}
                        type="button"
                        onClick={() => handleInfillChange(activeModel.id, lbl.value)}
                        className="py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        style={{
                          backgroundColor: activeModel.infill === lbl.value ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-dark)',
                          borderColor: activeModel.infill === lbl.value ? 'var(--primary)' : 'var(--border-color)',
                          color: activeModel.infill === lbl.value ? 'var(--primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <span className="block font-heading text-[11px] leading-none">{lbl.pct}</span>
                        <span className="block text-[8px] font-normal leading-none" style={{ color: activeModel.infill === lbl.value ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {language === 'he' ? lbl.descHe : lbl.descEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality options */}
                <div className="form-group">
                  <label className="form-label">{t('quoteConfigQuality')}</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[0.12, 0.20, 0.28].map((h) => (
                      <button
                        key={h}
                        onClick={() => handleLayerHeightChange(activeModel.id, h as LayerHeightType)}
                        className="py-2.5 px-2 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        style={{
                          backgroundColor: activeModel.layerHeight === h ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-dark)',
                          borderColor: activeModel.layerHeight === h ? 'var(--primary)' : 'var(--border-color)',
                          color: activeModel.layerHeight === h ? 'var(--primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <span className="block font-heading" style={{ direction: 'ltr' }}>{h.toFixed(2)} mm</span>
                        <span className="block text-[8px] font-normal uppercase" style={{ color: 'var(--text-muted)' }}>
                          {h === 0.12 ? t('quoteConfigQualityFine') : h === 0.28 ? t('quoteConfigQualityDraft') : t('quoteConfigQualityStd')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity and Counter */}
                <div className="flex justify-between items-center border-t pt-4" style={{ borderTopColor: 'rgba(0, 0, 0, 0.05)' }}>
                  <span className="form-label">{t('quoteConfigQuantity')}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleQuantityChange(activeModel.id, Math.max(1, activeModel.quantity - 1))}
                      className="h-8 w-8 rounded-lg border text-xl font-bold flex items-center justify-center transition-colors cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      -
                    </button>
                    <span className="text-sm font-bold font-heading min-w-[20px] text-center" style={{ color: 'var(--text-primary)' }}>{activeModel.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(activeModel.id, activeModel.quantity + 1)}
                      className="h-8 w-8 rounded-lg border text-xl font-bold flex items-center justify-center transition-colors cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Price Panel */}
              <div 
                className="card-glass text-left flex flex-col gap-4 relative overflow-hidden" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(245, 158, 11, 0.02) 100%)',
                  border: '1px solid rgba(249, 115, 22, 0.2)'
                }}
              >
                <div className="absolute top-0 right-0 h-16 w-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom left, rgba(245, 158, 11, 0.1), transparent)' }} />
                <h3 className="text-sm uppercase tracking-widest font-extrabold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} /> {t('quoteSummaryTitle')}
                </h3>
                
                <div className="flex flex-col gap-2 border-b pb-3 text-xs" style={{ borderBottomColor: 'rgba(0, 0, 0, 0.05)', color: 'var(--text-secondary)' }}>
                  {models.map((m, index) => {
                    const mp = getModelPricing(m);
                    return (
                      <div key={m.id} className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100 last:border-0">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold truncate max-w-[180px]">
                            {language === 'he' ? `מודל ${index + 1}` : `Model ${index + 1}`}: {m.name}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {m.quantity}x {m.material} ({m.layerHeight}mm, {m.infill}%)
                          </span>
                        </div>
                        <span className="font-semibold shrink-0">{formatPrice(mp.total)}</span>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between border-t border-dashed pt-2 mt-1 text-[10px]" style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}>
                    <span>{t('quoteSummarySetup')} (Total)</span>
                    <span>{formatPrice(pricing.setupCost)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>{t('quoteSummaryMaterial')} (Total)</span>
                    <span>{formatPrice(pricing.materialCost)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>{t('quoteSummaryRuntime')} (Total)</span>
                    <span>{formatPrice(pricing.printTimeCost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-1.5 mt-1.5 text-[10px] font-semibold" style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}>
                    <span>{language === 'he' ? 'סה"כ לפני מע"מ' : 'Subtotal (excl. VAT)'}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{language === 'he' ? 'מע"מ (17%)' : 'VAT (17%)'}</span>
                    <span>{formatPrice(vatAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-700">{language === 'he' ? 'מחיר כולל מע"מ' : 'Total (incl. VAT)'}</span>
                  <div style={{ textAlign: direction === 'rtl' ? 'left' : 'right' }}>
                    <span className="text-3xl font-extrabold text-gradient font-heading">
                      {formatPrice(totalWithVat)}
                    </span>
                    <span className="block text-[8px] uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {language === 'he' ? 'לא כולל משלוח' : 'Excludes shipping'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="card-glass text-left" style={{ backgroundColor: '#ffffff' }}>
                <h3 className="text-base font-bold font-heading mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Send className="h-4.5 w-4.5" style={{ color: 'var(--primary)' }} /> {t('quoteFormTitle')}
                </h3>
                <form onSubmit={handleOrderSubmit} className="flex flex-col gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">{t('quoteFormName')}</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder={language === 'he' ? 'ישראל ישראלי' : 'Jane Doe'}
                      className="form-input" 
                      value={form.name}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">{t('quoteFormEmail')}</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="form-input"
                      value={form.email}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">{language === 'he' ? 'טלפון' : 'Phone Number'}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder={language === 'he' ? '050-000-0000' : '+1 (555) 000-0000'}
                      className="form-input"
                      value={form.phone}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label">{t('quoteFormComments')}</label>
                    <textarea 
                      name="comments"
                      rows={3}
                      placeholder={t('quoteFormCommentsPlh')}
                      className="form-textarea resize-none"
                      value={form.comments}
                      onChange={handleFormChange}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center">
                    {t('quoteFormSubmit')}
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* --- STEP 3: SUBMITTING PRINTER ANIMATION --- */}
        {submitting && (
          <div className="max-w-md mx-auto card-glass py-12 text-center flex flex-col gap-6 items-center" style={{ backgroundColor: '#ffffff' }}>
            <div 
              className="relative w-40 h-40 rounded-2xl border flex flex-col justify-end p-4 overflow-hidden"
              style={{ backgroundColor: '#f8fafc', borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed rounded-lg pointer-events-none" style={{ borderColor: 'rgba(0,0,0,0.04)' }} />
              <div className="flex-1 flex items-center justify-center">
                <Box className="h-16 w-16 animate-bounce" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="printer-nozzle-animation mt-2">
                <div 
                  className="printer-bar" 
                  style={{ width: `${submitProgress}%`, transition: 'width 0.4s ease' }}
                ></div>
                <div 
                  className="printer-head" 
                  style={{ left: `calc(${submitProgress}% - 9px)`, transition: 'left 0.4s ease' }}
                ></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('quoteSubmitTitle')}</h3>
              <p className="text-xs h-8 flex items-center justify-center px-4" style={{ color: 'var(--text-secondary)' }}>
                {submitStep}
              </p>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  width: `${submitProgress}%` 
                }}
              />
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-muted)' }}>{submitProgress}% {language === 'he' ? 'הושלם' : 'Complete'}</span>
          </div>
        )}

        {/* --- STEP 4: SUCCESS BOARD --- */}
        {success && (
          <div className="max-w-lg mx-auto card-glass p-8 text-center flex flex-col items-center gap-6 animate-fadeInUp" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{t('quoteSuccessTitle')}</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {t('quoteSuccessDesc1')}{' '}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.name}</span>
                {language === 'he' ? ' עבור ' : ' for '}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{models.length} {language === 'he' ? 'קבצים' : 'files'}</span>{' '}
                {t('quoteSuccessDesc3')}{' '}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.email}</span>.
              </p>
            </div>

            <div className="w-full rounded-xl p-4 border text-left text-xs flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', direction: direction }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t('quoteSuccessRef')}</span>
                <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{successRef || `P3D-${Math.floor(100000 + Math.random() * 900000)}`}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t('quoteSuccessMat')}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {models.map(m => m.material).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{t('quoteSuccessRes')}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)', direction: 'ltr' }}>
                  {models.map(m => `${m.layerHeight.toFixed(2)}mm`).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2" style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}>
                <span className="font-bold">{language === 'he' ? 'סה"כ כולל מע"מ' : 'Total incl. VAT'}</span>
                <span className="text-emerald-600 font-extrabold text-sm font-heading">{formatPrice(subtotal * 1.17)}</span>
              </div>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('quoteSuccessNotice')}
            </p>

            {thingiverseUrl && (
              <div className="w-full rounded-xl p-3 border text-xs flex items-start gap-3" style={{ backgroundColor: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 mt-0.5" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="min-w-0">
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>{language === 'he' ? 'מקור מ-Thingiverse' : 'Sourced from Thingiverse'}</span>
                  <a href={thingiverseUrl} target="_blank" rel="noreferrer" className="underline truncate block" style={{ color: 'var(--primary)', direction: 'ltr' }}>{thingiverseName || thingiverseUrl}</a>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {setCurrentPage && (
                <button
                  onClick={() => setCurrentPage('home')}
                  className="btn-secondary flex-1 justify-center"
                >
                  {language === 'he' ? '← חזרה לדף הבית' : '← Back to Home'}
                </button>
              )}
              <button 
                onClick={startNewEstimate} 
                className="btn-primary flex-1 justify-center"
              >
                {t('quoteSuccessBtn')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
