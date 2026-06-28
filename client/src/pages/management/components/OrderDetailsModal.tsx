import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Grid, 
  Select, MenuItem, Button, FormControl, InputLabel
} from '@mui/material';
import { X, RefreshCw, Download } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { Order } from '../types';
import { parseSTLAsync, type STLModelData } from '../../../components/STLParser';
import { ModelViewer } from '../../../components/ModelViewer';
import { SERVER_BASE } from '../../../utils/api';

interface OrderModelPreviewProps {
  fileKey?: string;
  color: string;
  material: string;
  weightg?: number;
  timeSeconds?: number;
}

const OrderModelPreview: React.FC<OrderModelPreviewProps> = ({ 
  fileKey, 
  color, 
  material,
  weightg,
  timeSeconds
}) => {
  const { language } = useLanguage();
  const [modelData, setModelData] = useState<STLModelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrintTimeCompact = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return language === 'he' ? `${h} ש' ${m} ד'` : `${h}h ${m}m`;
    return language === 'he' ? `${m} דק'` : `${m}m`;
  };

  useEffect(() => {
    if (!fileKey) return;
    const fetchAndParse = async () => {
      setLoading(true); setError(null);
      try {
        // Try permanent storage first, fallback to temporary storage
        let res = await fetch(`${SERVER_BASE}/uploads/${fileKey}`);
        if (!res.ok) {
          res = await fetch(`${SERVER_BASE}/temp/uploads/${fileKey}`);
        }
        if (!res.ok) throw new Error('File not found');
        const buffer = await res.arrayBuffer();
        setModelData(await parseSTLAsync(buffer));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndParse();
  }, [fileKey]);

  if (!fileKey) return <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="text.secondary">No 3D Model file</Typography></Box>;
  if (loading) return <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><RefreshCw className="animate-spin" /><Typography color="primary.main">Loading...</Typography></Box>;
  if (error || !modelData) return <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ height: 280, bgcolor: '#ffffff', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', position: 'relative' }}>
      <ModelViewer data={modelData} color={color} materialType={material === 'TPU' ? 'matte' : 'glossy'} autoRotate showGrid={false} showBoundingBox={false} showHelpText={false} isMinimal />
      
      {/* Weight and Print Time Overlay */}
      {(weightg !== undefined || timeSeconds !== undefined) && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 12, 
            left: 12, 
            bgcolor: 'rgba(15, 23, 42, 0.85)', 
            backdropFilter: 'blur(6px)',
            borderRadius: 2, 
            px: 1.5, 
            py: 0.75, 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {weightg !== undefined && (
            <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 'bold', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {weightg ? `${weightg.toFixed(1)}g` : '0g'}
            </Typography>
          )}
          {weightg !== undefined && timeSeconds !== undefined && (
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>|</span>
          )}
          {timeSeconds !== undefined && (
            <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '0.75rem' }}>
              {timeSeconds ? formatPrintTimeCompact(timeSeconds) : '0m'}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, open, onClose, onUpdateStatus }) => {
  const { language, formatPrice, direction } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const formatPrintTimeCompact = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return language === 'he' ? `${h} ש' ${m} ד'` : `${h}h ${m}m`;
    return language === 'he' ? `${m} דק'` : `${m}m`;
  };

  // Dynamically resolve STL download URL (checks permanent uploads first, fallback to temp)
  useEffect(() => {
    if (!order || !order.models || order.models.length === 0) return;
    const activeModel = order.models[activeIndex];
    if (!activeModel || !activeModel.fileKey) return;

    const checkFile = async () => {
      try {
        const res = await fetch(`${SERVER_BASE}/uploads/${activeModel.fileKey}`, { method: 'HEAD' });
        if (res.ok) {
          setDownloadUrl(`${SERVER_BASE}/uploads/${activeModel.fileKey}`);
        } else {
          setDownloadUrl(`${SERVER_BASE}/temp/uploads/${activeModel.fileKey}`);
        }
      } catch {
        setDownloadUrl(`${SERVER_BASE}/uploads/${activeModel.fileKey}`);
      }
    };
    checkFile();
  }, [order, activeIndex]);

  if (!order) return null;

  const m = order.models[activeIndex];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', borderRadius: 4, direction } }}>
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        pb: 2, 
        display: 'flex', 
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>
            {language === 'he' ? 'פרטי הזמנת ייצור' : 'Production Job Details'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#f8fafc' }}>{order.id}</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}><X /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 0, bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Box sx={{ pt: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#94a3b8', '&.Mui-focused': { color: 'primary.main' } }}>{language === 'he' ? 'עדכן מצב' : 'Update Status'}</InputLabel>
                  <Select 
                    value={order.status} 
                    label="Update Status" 
                    onChange={e => onUpdateStatus(order.id, e.target.value)}
                    sx={{ 
                      color: '#f8fafc',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                      '.MuiSvgIcon-root': { color: '#94a3b8' }
                    }}
                  >
                    <MenuItem value="pending">Pending Queue</MenuItem>
                    <MenuItem value="slicing">Slicing & Toolpaths</MenuItem>
                    <MenuItem value="printing">Active Printing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="shipped">Shipped & Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{language === 'he' ? 'לקוח' : 'Customer Profile'}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f8fafc', mt: 0.5 }}>{order.customer.name}</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{order.customer.email}</Typography>
                {order.customer.phone && (
                  <Typography variant="body2" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    📞 {order.customer.phone}
                  </Typography>
                )}
                {order.customer.comments && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(249, 115, 22, 0.05)', borderRadius: 1, border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#fdba74' }}>"{order.customer.comments}"</Typography>
                  </Box>
                )}
              </Box>

              {/* Thingiverse Source Card */}
              {order.thingiverseUrl && (
                <Box sx={{ p: 3, bgcolor: 'rgba(249,115,22,0.04)', borderRadius: 2, border: '1px solid', borderColor: 'rgba(249,115,22,0.2)' }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {language === 'he' ? 'מקור מ-Thingiverse' : 'Thingiverse Source'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc', mt: 0.5, mb: 1 }}>
                    {order.thingiverseName || 'Thingiverse Model'}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href={order.thingiverseUrl}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      borderColor: 'rgba(249,115,22,0.4)',
                      color: 'primary.main',
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(249,115,22,0.07)' }
                    }}
                  >
                    {language === 'he' ? 'פתח ב-Thingiverse ↗' : 'View on Thingiverse ↗'}
                  </Button>
                </Box>
              )}

              <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{language === 'he' ? 'עלויות' : 'Financials'}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>{formatPrice(order.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>VAT</Typography>
                  <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 'bold' }}>{formatPrice(order.vatAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#22c55e' }}>{formatPrice(order.totalWithVat)}</Typography>
                </Box>
              </Box>

            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            {m && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                  {order.models.map((mod, idx) => (
                    <Button 
                      key={idx} 
                      variant={activeIndex === idx ? 'contained' : 'outlined'} 
                      onClick={() => setActiveIndex(idx)}
                      sx={{ borderRadius: 4, minWidth: 120, whiteSpace: 'nowrap' }}
                    >
                      {mod.name.length > 20 ? mod.name.substring(0, 18) + '...' : mod.name}
                    </Button>
                  ))}
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  gap: 3, 
                  p: 2.5, 
                  bgcolor: 'rgba(30, 41, 59, 0.4)', 
                  borderRadius: 3, 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  direction: direction
                }}>
                  {/* Download Action - Renders on the Left (swapped first child) */}
                  {m.fileKey && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      href={downloadUrl || `${SERVER_BASE}/uploads/${m.fileKey}`}
                      download={m.name}
                      target="_blank"
                      sx={{ 
                        whiteSpace: 'nowrap', 
                        flexShrink: 0,
                        py: 1,
                        px: 3,
                        borderRadius: 2.5,
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row'
                      }}
                    >
                      <Download size={16} />
                      <span>{language === 'he' ? 'הורד קובץ STL' : 'Download STL'}</span>
                    </Button>
                  )}

                  {/* Filename Details - Renders on the Right (swapped second child) */}
                  <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, textAlign: direction === 'rtl' ? 'right' : 'left' }}>
                    <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600, textTransform: 'uppercase', tracking: 0.5 }}>
                      {language === 'he' ? 'שם הקובץ הפעיל' : 'Active Model File'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>
                      {m.name}
                    </Typography>
                  </Box>
                </Box>

                <OrderModelPreview fileKey={m.fileKey} color={m.color} material={m.material} weightg={m.weightg} timeSeconds={m.timeSeconds} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'חומר' : 'Material'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.material}</Typography></Box></Grid>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}><Box><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'צבע' : 'Color'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.color}</Typography></Box><Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: m.color, mt: 1 }} /></Box></Grid>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'משקל פילמנט' : 'Filament Weight'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.weightg ? `${m.weightg.toFixed(1)}g` : '0g'}</Typography></Box></Grid>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'זמן הדפסה' : 'Print Time'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.timeSeconds ? formatPrintTimeCompact(m.timeSeconds) : '0m'}</Typography></Box></Grid>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'גובה שכבה' : 'Layer Height'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.layerHeight}mm</Typography></Box></Grid>
                  <Grid size={{ xs: 4 }}><Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>{language === 'he' ? 'כמות' : 'Quantity'}</Typography><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{m.quantity}x</Typography></Box></Grid>
                </Grid>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mt: 2, 
                  pt: 3, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  direction: direction
                }}>
                  <Box sx={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{language === 'he' ? 'עלות פריט' : 'Item Price'}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>{formatPrice(m.price)}</Typography>
                  </Box>
                  {m.fileKey && (
                    <Button 
                      variant="outlined" 
                      color="primary"
                      href={downloadUrl || `${SERVER_BASE}/uploads/${m.fileKey}`}
                      download={m.name}
                      target="_blank"
                      sx={{ 
                        borderRadius: 2.5,
                        px: 2.5,
                        fontWeight: 'bold',
                        borderColor: 'rgba(249, 115, 22, 0.3)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(249, 115, 22, 0.05)'
                        },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row'
                      }}
                    >
                      <Download size={16} />
                      <span>{language === 'he' ? 'הורד קובץ' : 'Download STL'}</span>
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </DialogContent>
    </Dialog>
  );
};
