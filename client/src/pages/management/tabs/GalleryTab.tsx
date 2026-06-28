import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Card, Grid, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  List, ListItem, ListItemText, ListItemButton, Divider
} from '@mui/material';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { GalleryItem, Order } from '../types';

interface GalleryTabProps {
  gallery: GalleryItem[];
  orders: Order[];
  onSave: (item: Partial<GalleryItem>, isNew: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const formatTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const GalleryTab: React.FC<GalleryTabProps> = ({ gallery, orders, onSave, onDelete }) => {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    titleEn: '', titleHe: '', descEn: '', descHe: '',
    material: 'PLA', layerHeight: '0.20 mm', infill: '20%',
    weight: '15 g', time: '1h 30m', 
    imageUrl: 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?auto=format&fit=crop&q=80&w=400',
    category: 'fdm'
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('admin_session_token');
    if (!token) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      titleEn: '', titleHe: '', descEn: '', descHe: '',
      material: 'PLA', layerHeight: '0.20 mm', infill: '20%',
      weight: '15 g', time: '1h 30m', 
      imageUrl: 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?auto=format&fit=crop&q=80&w=400',
      category: 'fdm'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, !editingItem);
    setIsModalOpen(false);
  };

  // Import completed / shipped orders models
  const completedModels = orders
    .filter(o => o.status === 'completed' || o.status === 'shipped')
    .flatMap(o => o.models.map(m => ({
      orderId: o.id,
      customerName: o.customer.name,
      modelName: m.name,
      material: m.material,
      layerHeight: `${m.layerHeight} mm`,
      infill: `${m.infill}%`,
      weight: `${m.weightg ? m.weightg.toFixed(1) : 0} g`,
      time: m.timeSeconds ? formatTime(m.timeSeconds) : '0m',
      fileKey: m.fileKey
    })));

  const handleImportModel = (item: typeof completedModels[0]) => {
    setEditingItem(null);
    setFormData({
      titleEn: item.modelName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), // strip extension and replace separators
      titleHe: item.modelName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      descEn: `Custom 3D printed model requested by ${item.customerName}.`,
      descHe: `מודל מודפס בתלת-מימד שהוזמן על ידי ${item.customerName}.`,
      material: item.material,
      layerHeight: item.layerHeight,
      infill: item.infill,
      weight: item.weight,
      time: item.time,
      imageUrl: 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?auto=format&fit=crop&q=80&w=400',
      category: item.material === 'TPU' ? 'flexible' : 'fdm'
    });
    setIsImportModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {language === 'he' ? 'ניהול ועריכת גלריית עבודות' : 'Showcase Gallery Curator'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {language === 'he' ? 'הוסף, ערוך או מחק פרויקטים המוצגים ללקוחות' : 'Manage portfolio items displayed on storefront showcase'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Plus size={18} />} 
            onClick={() => setIsImportModalOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            {language === 'he' ? 'ייבוא מהזמנה שהושלמה' : 'Import from Completed Order'}
          </Button>

          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />} 
            onClick={handleOpenNew}
            sx={{ textTransform: 'none' }}
          >
            {language === 'he' ? 'הוסף פרויקט חדש' : 'Add Showcase Project'}
          </Button>
        </Box>
      </Box>

      {gallery.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {language === 'he' ? 'גלריית העבודות ריקה. לחץ למעלה כדי להוסיף את הפרויקט הראשון!' : 'The showcase gallery is currently empty. Click above to add your first project!'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {gallery.map(g => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={g.id}>
              <Card sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ height: 180, position: 'relative', bgcolor: 'background.default' }}>
                  <img src={g.imageUrl} alt={g.titleEn} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  <Typography variant="caption" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(15,23,42,0.9)', px: 1, py: 0.5, borderRadius: 1, color: 'primary.main', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {g.category}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{language === 'he' ? g.titleHe : g.titleEn}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {language === 'he' ? g.descHe : g.descEn}
                    </Typography>
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Material: <strong style={{ color: '#fff' }}>{g.material}</strong></Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Infill: <strong style={{ color: '#fff' }}>{g.infill}</strong></Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Res: <strong style={{ color: '#fff' }}>{g.layerHeight}</strong></Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Weight: <strong style={{ color: '#fff' }}>{g.weight}</strong></Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button size="small" variant="outlined" startIcon={<Edit2 size={14} />} onClick={() => handleEdit(g)} sx={{ flex: 1 }}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => onDelete(g.id)} sx={{ minWidth: 'auto', p: 1 }}><Trash2 size={14} /></Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Import Completed/Shipped Orders Dialog */}
      <Dialog open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {language === 'he' ? 'ייבוא מפרט הדפסה מהזמנות שהושלמו' : 'Import Print Specs from Completed Orders'}
        </DialogTitle>
        <DialogContent dividers>
          {completedModels.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {language === 'he' ? 'אין הזמנות שהושלמו או נשלחו עדיין במאגר.' : 'No completed or shipped orders found in print queue.'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {completedModels.map((item, idx) => (
                <React.Fragment key={`${item.orderId}-${idx}`}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleImportModel(item)}>
                      <ListItemText
                        primary={item.modelName}
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {language === 'he' ? 'לקוח' : 'Customer'}: <strong>{item.customerName}</strong> | {item.material} | {item.layerHeight} | {item.infill} | {item.weight} | {item.time}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {idx < completedModels.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsImportModalOpen(false)}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Showcase Item Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingItem ? 'Edit Showcase Project' : 'Curate New Showcase Project'}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Title (English)" required value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} /></Grid>
              <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="כותרת (עברית)" required value={formData.titleHe} onChange={e => setFormData({...formData, titleHe: e.target.value})} /></Grid>
              <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Description (English)" multiline rows={2} value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} /></Grid>
              <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="תיאור (עברית)" multiline rows={2} value={formData.descHe} onChange={e => setFormData({...formData, descHe: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}><TextField fullWidth size="small" label="Material" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}><TextField fullWidth size="small" label="Layer Height" value={formData.layerHeight} onChange={e => setFormData({...formData, layerHeight: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}><TextField fullWidth size="small" label="Infill Density" value={formData.infill} onChange={e => setFormData({...formData, infill: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}><TextField fullWidth size="small" label="Weight" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}><TextField fullWidth size="small" label="Print Time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></Grid>
              <Grid size={{ xs: 4 }}>
                <TextField fullWidth size="small" select label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                  <MenuItem value="fdm">FDM Filament / פילמנט</MenuItem>
                  <MenuItem value="flexible">TPU Flexible / גמיש</MenuItem>
                  <MenuItem value="mechanical">Mechanical & Functional / מכני</MenuItem>
                  <MenuItem value="artistic">Artistic & Decorative / אמנותי</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField fullWidth size="small" label="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
                  <Button 
                    variant="outlined" 
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />} 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    sx={{ minWidth: 160 }}
                  >
                    {uploading ? (language === 'he' ? 'מעלה...' : 'Uploading...') : (language === 'he' ? 'העלאת תמונה' : 'Upload Image')}
                  </Button>
                </Box>
                {formData.imageUrl && (
                  <Box sx={{ mt: 2, height: 160, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Project</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
