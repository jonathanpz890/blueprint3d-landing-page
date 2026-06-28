import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, Switch, 
  FormControlLabel, Typography, IconButton, Grid, Slider
} from '@mui/material';
import { X, Trash2, Sun } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { Filament } from '../types';
import Wheel from '@uiw/react-color-wheel';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';

interface FilamentEditModalProps {
  open: boolean;
  filament: Filament | null;
  onClose: () => void;
  onSave: (filament: Partial<Filament>, isNew: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FilamentEditModal: React.FC<FilamentEditModalProps> = ({
  open,
  filament,
  onClose,
  onSave,
  onDelete
}) => {
  const { language, direction } = useLanguage();
  const isNew = !filament;

  const [material, setMaterial] = useState<('PLA' | 'PETG' | 'TPU')[]>(['PLA']);
  const [nameEn, setNameEn] = useState('');
  const [nameHe, setNameHe] = useState('');
  const [hex, setHex] = useState('#111827');
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 10, a: 1 });
  const [stock, setStock] = useState(true);
  const [active, setActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubmitting(false);
      if (filament) {
        const rawMat = filament.material;
        const mats = Array.isArray(rawMat) 
          ? rawMat 
          : (rawMat ? [rawMat] : ['PLA']);
        setMaterial(mats as ('PLA' | 'PETG' | 'TPU')[]);
        setNameEn(filament.nameEn);
        setNameHe(filament.nameHe);
        setHex(filament.hex);
        setHsva(hexToHsva(filament.hex));
        setStock(filament.stock);
        setActive(filament.active);
        setIsDefault(filament.isDefault || false);
      } else {
        setMaterial(['PLA']);
        setNameEn('');
        setNameHe('');
        const initialHex = '#f97316';
        setHex(initialHex);
        setHsva(hexToHsva(initialHex));
        setStock(true);
        setActive(true);
        setIsDefault(false);
      }
      setError(null);
    }
  }, [open, filament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameHe.trim()) {
      setError(language === 'he' ? 'אנא מלא את כל השדות' : 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: Partial<Filament> = {
        material,
        nameEn: nameEn.trim(),
        nameHe: nameHe.trim(),
        hex: hex.toLowerCase(),
        stock,
        active,
        isDefault
      };
      if (!isNew && filament) {
        payload.id = filament.id;
      }
      await onSave(payload, isNew);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save color');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!filament) return;
    setSubmitting(true);
    try {
      await onDelete(filament.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete color');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{ 
        '& .MuiDialog-paper': { 
          bgcolor: 'background.paper', 
          borderRadius: 4, 
          direction 
        } 
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        pb: 2, 
        display: 'flex', 
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {isNew 
            ? (language === 'he' ? 'הוספת צבע פילמנט חדש' : 'Add New Filament Color')
            : (language === 'he' ? 'עריכת צבע פילמנט' : 'Edit Filament Color')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel id="material-select-label">{language === 'he' ? 'סוגי חומרים' : 'Material Types'}</InputLabel>
              <Select
                labelId="material-select-label"
                multiple
                value={material}
                label={language === 'he' ? 'סוגי חומרים' : 'Material Types'}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaterial(typeof val === 'string' ? val.split(',') as any : val);
                }}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                <MenuItem value="PLA">PLA</MenuItem>
                <MenuItem value="PETG">PETG</MenuItem>
                <MenuItem value="TPU">TPU</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={language === 'he' ? 'שם בעברית' : 'Name in Hebrew'}
                  value={nameHe}
                  onChange={(e) => setNameHe(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={language === 'he' ? 'שם באנגלית' : 'Name in English'}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            {/* Interactive Color Wheel section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                {language === 'he' ? 'בחר צבע מגלגל הצבעים' : 'Select Color from Color Wheel'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' }}>
                {/* Vertical Brightness Slider on the left of the color wheel */}
                <Box sx={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Sun size={18} style={{ color: '#94a3b8' }} />
                  <Slider
                    orientation="vertical"
                    value={hsva.v}
                    min={0}
                    max={100}
                    onChange={(_, value) => {
                      const newV = value as number;
                      const newHsva = { ...hsva, v: newV };
                      setHsva(newHsva);
                      setHex(hsvaToHex(newHsva));
                    }}
                    sx={{
                      height: 120,
                      width: 10,
                      padding: '0 13px',
                      '& .MuiSlider-track': {
                        border: 'none',
                        background: 'transparent'
                      },
                      '& .MuiSlider-rail': {
                        opacity: 1,
                        width: 10,
                        borderRadius: 5,
                        background: `linear-gradient(to top, #000000 0%, hsl(${hsva.h}, ${hsva.s}%, 50%) 100%)`
                      },
                      '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                        backgroundColor: '#ffffff',
                        border: '2px solid currentColor',
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                          boxShadow: 'inherit',
                        },
                      },
                    }}
                  />
                </Box>

                {/* NPM Color Wheel */}
                <Box sx={{ flexShrink: 0, bgcolor: 'transparent', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                  <Wheel
                    width={160}
                    height={160}
                    color={hsva}
                    onChange={(color) => {
                      const newHsva = { ...hsva, ...color.hsva };
                      setHsva(newHsva);
                      setHex(hsvaToHex(newHsva));
                    }}
                  />
                </Box>

                {/* Color Visual Preview box */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 3, 
                      bgcolor: hex, 
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }} 
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {hex.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={stock} 
                    onChange={(e) => setStock(e.target.checked)} 
                    color="primary"
                  />
                }
                label={language === 'he' ? 'במלאי (זמין להזמנה)' : 'In Stock (Available for ordering)'}
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={active} 
                    onChange={(e) => setActive(e.target.checked)} 
                    color="primary"
                  />
                }
                label={language === 'he' ? 'פעיל (מוצג בקטלוג)' : 'Active (Visible in catalog)'}
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={isDefault} 
                    onChange={(e) => setIsDefault(e.target.checked)} 
                    color="primary"
                  />
                }
                label={language === 'he' ? 'צבע ברירת מחדל (נבחר אוטומטית בהצעות מחיר)' : 'Default Color (Chosen automatically for new quotes)'}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            {!isNew && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleDeleteClick}
                disabled={submitting}
                sx={{ 
                  display: 'flex', 
                  gap: 1.5, 
                  alignItems: 'center', 
                  flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' 
                }}
              >
                <Trash2 size={16} />
                <span>{language === 'he' ? 'מחק צבע' : 'Delete Color'}</span>
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} color="inherit" disabled={submitting}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
