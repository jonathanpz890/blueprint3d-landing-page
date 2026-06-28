import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Card, Chip, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { RefreshCw, List, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { Order } from '../types';
import { parseSTLAsync, type STLModelData } from '../../../components/STLParser';
import { ModelViewer } from '../../../components/ModelViewer';

interface OrderRowPreviewProps {
  model: {
    fileKey?: string;
    color: string;
    material: string;
  } | undefined;
}

const OrderRowPreview: React.FC<OrderRowPreviewProps> = ({ model }) => {
  const [modelData, setModelData] = useState<STLModelData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!model || !model.fileKey) return;
    const fetchAndParse = async () => {
      setLoading(true);
      try {
        let res = await fetch(`http://localhost:5001/uploads/${model.fileKey}`);
        if (!res.ok) {
          res = await fetch(`http://localhost:5001/temp/uploads/${model.fileKey}`);
        }
        if (!res.ok) throw new Error('File not found');
        const buffer = await res.arrayBuffer();
        setModelData(await parseSTLAsync(buffer));
      } catch (err) {
        console.error('Row preview parse error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndParse();
  }, [model]);

  if (!model || !model.fileKey) {
    return (
      <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>
        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>N/A</Typography>
      </Box>
    );
  }

  if (loading || !modelData) {
    return (
      <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
        <RefreshCw size={12} className="animate-spin" style={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: 50, 
        height: 50, 
        borderRadius: 2, 
        bgcolor: '#ffffff', 
        overflow: 'hidden', 
        border: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <ModelViewer 
        data={modelData} 
        color={model.color} 
        materialType={model.material === 'TPU' ? 'matte' : 'glossy'} 
        autoRotate={false} 
        showGrid={false} 
        showBoundingBox={false} 
        showHelpText={false} 
        isMinimal 
      />
    </Box>
  );
};

interface OrdersTabProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus?: (orderId: string, newStatus: string) => Promise<void>;
}

const COLUMNS: { status: Order['status']; labelEn: string; labelHe: string; color: string }[] = [
  { status: 'pending', labelEn: 'Pending', labelHe: 'ממתין', color: '#64748b' },
  { status: 'slicing', labelEn: 'Slicing', labelHe: 'סלייסינג', color: '#0ea5e9' },
  { status: 'printing', labelEn: 'Printing', labelHe: 'בהדפסה', color: '#f59e0b' },
  { status: 'completed', labelEn: 'Completed', labelHe: 'הושלם', color: '#10b981' },
  { status: 'shipped', labelEn: 'Shipped', labelHe: 'נשלח', color: '#10b981' }
];

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onSelectOrder, onUpdateStatus }) => {
  const { language, formatPrice, direction } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed':
      case 'shipped': return 'success';
      case 'printing': return 'warning';
      default: return 'primary';
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Order['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId && onUpdateStatus) {
      await onUpdateStatus(orderId, targetStatus);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title & View Toggle Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {language === 'he' ? 'ניהול הזמנות והדפסות בסדנה' : 'Workshop Print Queue'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {orders.length} {language === 'he' ? 'עבודות במאגר' : 'Jobs in database'}
          </Typography>
        </Box>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          aria-label="View Mode"
        >
          <ToggleButton value="list" aria-label="List View">
            <List size={16} style={{ marginRight: direction === 'rtl' ? 0 : 6, marginLeft: direction === 'rtl' ? 6 : 0 }} />
            {language === 'he' ? 'תצוגת רשימה' : 'List View'}
          </ToggleButton>
          <ToggleButton value="kanban" aria-label="Kanban Board">
            <LayoutGrid size={16} style={{ marginRight: direction === 'rtl' ? 0 : 6, marginLeft: direction === 'rtl' ? 6 : 0 }} />
            {language === 'he' ? 'לוח קנבן' : 'Kanban Board'}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {orders.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {language === 'he' ? 'לא נמצאו הזמנות הדפסה במערכת.' : 'No print jobs submitted yet.'}
          </Typography>
        </Card>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650, direction }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <TableCell>{language === 'he' ? 'מזהה' : 'Job ID'}</TableCell>
                <TableCell>{language === 'he' ? 'לקוח' : 'Customer'}</TableCell>
                <TableCell>{language === 'he' ? 'פרטים' : 'Config'}</TableCell>
                <TableCell>{language === 'he' ? 'מחיר' : 'Price'}</TableCell>
                <TableCell>{language === 'he' ? 'סטטוס' : 'Status'}</TableCell>
                <TableCell align="center">{language === 'he' ? 'תצוגה מקדימה' : 'Preview'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow 
                  key={o.id}
                  hover
                  onClick={() => onSelectOrder(o)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                  }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{o.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{o.customer.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{o.customer.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{o.models.length} {language === 'he' ? 'קבצים' : 'files'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {o.models.map(m => m.material).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatPrice(o.totalWithVat)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={o.status.toUpperCase()} 
                      size="small" 
                      color={getStatusColor(o.status)}
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => { e.stopPropagation(); onSelectOrder(o); }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <OrderRowPreview model={o.models?.[0]} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* KANBAN BOARD VIEW */
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 2, 
            overflowX: 'auto', 
            pb: 2,
            minHeight: '60vh',
            direction
          }}
        >
          {COLUMNS.map((col) => {
            const colOrders = orders.filter(o => o.status === col.status);
            const isDraggedOver = dragOverCol === col.status;

            return (
              <Box
                key={col.status}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isDraggedOver ? 'rgba(249, 115, 22, 0.08)' : 'rgba(0, 0, 0, 0.15)',
                  border: '1px solid',
                  borderColor: isDraggedOver ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s ease',
                  minWidth: 200,
                  height: '100%'
                }}
              >
                {/* Column Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid', borderBottomColor: col.color, pb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: col.color }}>
                    {language === 'he' ? col.labelHe : col.labelEn}
                  </Typography>
                  <Chip 
                    label={colOrders.length} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', fontWeight: 'bold', fontSize: '0.7rem' }} 
                  />
                </Box>

                {/* Cards List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto' }}>
                  {colOrders.map((order) => (
                    <Card
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      onClick={() => onSelectOrder(order)}
                      sx={{
                        p: 1.5,
                        cursor: 'grab',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.08)',
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        '&:active': { cursor: 'grabbing' },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'text.secondary' }}>
                          #{order.id.slice(-4).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatPrice(order.totalWithVat)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.customer.name}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        {order.models.length} {language === 'he' ? 'קבצים' : 'files'} | {order.models[0]?.material}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <OrderRowPreview model={order.models?.[0]} />
                      </Box>
                    </Card>
                  ))}
                  {colOrders.length === 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 2, height: 100, opacity: 0.3 }}>
                      <Typography variant="caption">
                        {language === 'he' ? 'גרור לכאן' : 'Drag here'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
