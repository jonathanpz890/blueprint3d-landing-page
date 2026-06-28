import React, { useState } from 'react';
import { Box, Typography, Card, Grid, Button, Divider } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';
import type { Filament } from '../types';
import { FilamentEditModal } from '../components/FilamentEditModal';
import { Plus } from 'lucide-react';

interface FilamentsTabProps {
  filaments: Filament[];
  onToggle: (id: string, property: 'stock' | 'active', currentValue: boolean) => void;
  onSave: (filament: Partial<Filament>, isNew: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const FilamentsTab: React.FC<FilamentsTabProps> = ({ 
  filaments, 
  onSave,
  onDelete
}) => {
  const { language, direction } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState<Filament | null>(null);

  const handleAddClick = () => {
    setSelectedFilament(null);
    setModalOpen(true);
  };

  const handleEditClick = (filament: Filament) => {
    setSelectedFilament(filament);
    setModalOpen(true);
  };

  return (
    <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header section inside the card */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {language === 'he' ? 'ניהול קטלוג צבעים ומלאי פילמנט' : 'Active Filament Inventory'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {filaments.length} {language === 'he' ? 'צבעים מוגדרים בקטלוג' : 'Colors configured in catalog'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={handleAddClick}
          sx={{ px: 3, py: 1 }}
        >
          {language === 'he' ? 'הוסף צבע חדש' : 'Add New Color'}
        </Button>
      </Box>

      <Divider sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />

      {filaments.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {language === 'he' ? 'אין צבעים מוגדרים במערכת.' : 'No filament colors loaded.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {['PLA', 'PETG', 'TPU'].map((mat, index) => {
            const matFilaments = filaments.filter(f => 
              Array.isArray(f.material) 
                ? f.material.includes(mat as any) 
                : f.material === mat
            );
            return (
              <Grid 
                size={{ xs: 12, md: 4 }} 
                key={mat}
                sx={{ 
                  borderLeft: {
                    xs: 'none',
                    md: index > 0 && direction === 'ltr' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  },
                  borderRight: {
                    xs: 'none',
                    md: index > 0 && direction === 'rtl' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  },
                  pl: {
                    xs: 0,
                    md: index > 0 && direction === 'ltr' ? 4 : 0
                  },
                  pr: {
                    xs: 0,
                    md: index > 0 && direction === 'rtl' ? 4 : 0
                  }
                }}
              >
                {/* Section Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1.5, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                    {mat} Specifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                    {matFilaments.length} {language === 'he' ? 'צבעים' : 'Colors'}
                  </Typography>
                </Box>

                {/* Grid of cubes */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {matFilaments.map(f => (
                    <Box
                      key={f.id}
                      onClick={() => handleEditClick(f)}
                      title={`${language === 'he' ? f.nameHe : f.nameEn} (${f.hex.toUpperCase()})${!f.stock ? (language === 'he' ? ' - חסר במלאי' : ' - Out of Stock') : ''}`}
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: f.active ? 'rgba(255,255,255,0.06)' : 'rgba(239, 68, 68, 0.2)',
                        borderStyle: f.active ? 'solid' : 'dashed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        opacity: f.active ? 1 : 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.06)',
                          borderColor: f.active ? 'primary.light' : 'rgba(239, 68, 68, 0.4)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      {/* Color Circle inside the cube */}
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '50%', 
                          bgcolor: f.hex, 
                          border: '2px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Red overlay marker if out of stock */}
                        {!f.stock && (
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              border: '1px solid #1e293b'
                            }}
                          />
                        )}
                      </Box>

                      {/* Color Name Caption */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.7rem', 
                          color: 'text.primary',
                          textAlign: 'center',
                          px: 0.5,
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {language === 'he' ? f.nameHe : f.nameEn}
                      </Typography>
                    </Box>
                  ))}

                  {matFilaments.length === 0 && (
                    <Box sx={{ width: '100%', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        {language === 'he' ? 'אין צבעים מוגדרים' : 'No colors configured'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      <FilamentEditModal
        open={modalOpen}
        filament={selectedFilament}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        onDelete={onDelete}
      />
    </Card>
  );
};
