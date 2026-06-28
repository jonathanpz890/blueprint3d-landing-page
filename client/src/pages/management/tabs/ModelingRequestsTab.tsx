import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Card, Chip, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent,
  IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { PenTool, List, LayoutGrid, X, Mail, Phone, Ruler, FileText, Calendar } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { ModelingRequest } from '../types';

const COLUMNS: { status: ModelingRequest['status']; labelEn: string; labelHe: string; color: string }[] = [
  { status: 'new',         labelEn: 'New',         labelHe: 'חדש',           color: '#64748b' },
  { status: 'reviewing',   labelEn: 'Reviewing',   labelHe: 'בבדיקה',        color: '#0ea5e9' },
  { status: 'quoted',      labelEn: 'Quoted',      labelHe: 'הוצע מחיר',     color: '#a855f7' },
  { status: 'in_progress', labelEn: 'In Progress', labelHe: 'בתהליך מידול', color: '#f59e0b' },
  { status: 'completed',   labelEn: 'Completed',   labelHe: 'הושלם',         color: '#10b981' },
];

const STATUS_COLORS: Record<ModelingRequest['status'], string> = {
  new: '#64748b',
  reviewing: '#0ea5e9',
  quoted: '#a855f7',
  in_progress: '#f59e0b',
  completed: '#10b981',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Details Modal ──────────────────────────────────────────────────────────────

interface DetailsModalProps {
  open: boolean;
  request: ModelingRequest | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
}

const ModelingRequestDetailsModal: React.FC<DetailsModalProps> = ({ open, request, onClose, onUpdateStatus }) => {
  const { language } = useLanguage();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!request) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus) return;
    setUpdatingStatus(true);
    try { await onUpdateStatus(request.id, newStatus); } finally { setUpdatingStatus(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{request.id}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(request.createdAt)}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><X size={18} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
        {/* Status Change */}
        {onUpdateStatus && (
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ color: 'text.secondary' }}>{language === 'he' ? 'סטטוס' : 'Status'}</InputLabel>
            <Select
              value={request.status}
              label={language === 'he' ? 'סטטוס' : 'Status'}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              sx={{ color: '#f8fafc', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' } }}
            >
              {COLUMNS.map(c => (
                <MenuItem key={c.status} value={c.status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                    {language === 'he' ? c.labelHe : c.labelEn}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Client Info */}
        <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.65rem' }}>
            {language === 'he' ? 'פרטי לקוח' : 'Client'}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>{request.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mail size={13} style={{ color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>{request.email}</Typography>
          </Box>
          {request.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone size={13} style={{ color: '#94a3b8' }} />
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>{request.phone}</Typography>
            </Box>
          )}
        </Box>

        {/* Project Name */}
        <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PenTool size={11} /> {language === 'he' ? 'שם הפרויקט' : 'Project Name'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5, color: '#f8fafc' }}>{request.projectName}</Typography>
        </Box>

        {/* Description */}
        <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FileText size={11} /> {language === 'he' ? 'תיאור הפרויקט' : 'Description'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {request.description}
          </Typography>
        </Box>

        {/* Dimensions & Notes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {request.dimensions && (
            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Ruler size={10} /> {language === 'he' ? 'מידות' : 'Dimensions'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{request.dimensions}</Typography>
            </Box>
          )}
          {request.notes && (
            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                {language === 'he' ? 'הערות נוספות' : 'Notes'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{request.notes}</Typography>
            </Box>
          )}
        </Box>

        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <Calendar size={13} />
          <Typography variant="caption">{language === 'he' ? 'נשלח ב: ' : 'Submitted: '}{formatDate(request.createdAt)}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Tab ───────────────────────────────────────────────────────────────────

interface ModelingRequestsTabProps {
  requests: ModelingRequest[];
  onUpdateStatus?: (id: string, newStatus: string) => Promise<void>;
}

export const ModelingRequestsTab: React.FC<ModelingRequestsTabProps> = ({ requests, onUpdateStatus }) => {
  const { language, direction } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selected, setSelected] = useState<ModelingRequest | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('text/plain', id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnter = (e: React.DragEvent, status: string) => { e.preventDefault(); setDragOverCol(status); };
  const handleDrop = async (e: React.DragEvent, targetStatus: ModelingRequest['status']) => {
    e.preventDefault(); setDragOverCol(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id && onUpdateStatus) await onUpdateStatus(id, targetStatus);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {language === 'he' ? 'בקשות מידול CAD' : 'CAD Modeling Requests'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {requests.length} {language === 'he' ? 'בקשות במאגר' : 'requests in database'}
          </Typography>
        </Box>
        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
          <ToggleButton value="list" aria-label="List View">
            <List size={16} style={{ marginRight: direction === 'rtl' ? 0 : 6, marginLeft: direction === 'rtl' ? 6 : 0 }} />
            {language === 'he' ? 'רשימה' : 'List View'}
          </ToggleButton>
          <ToggleButton value="kanban" aria-label="Kanban Board">
            <LayoutGrid size={16} style={{ marginRight: direction === 'rtl' ? 0 : 6, marginLeft: direction === 'rtl' ? 6 : 0 }} />
            {language === 'he' ? 'לוח קנבן' : 'Kanban'}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {requests.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <PenTool size={32} style={{ color: '#64748b', marginBottom: 12 }} />
          <Typography color="text.secondary">
            {language === 'he' ? 'לא נמצאו בקשות מידול.' : 'No modeling requests submitted yet.'}
          </Typography>
        </Card>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650, direction }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <TableCell>{language === 'he' ? 'מזהה' : 'Request ID'}</TableCell>
                <TableCell>{language === 'he' ? 'לקוח' : 'Client'}</TableCell>
                <TableCell>{language === 'he' ? 'שם הפרויקט' : 'Project'}</TableCell>
                <TableCell>{language === 'he' ? 'מידות' : 'Dimensions'}</TableCell>
                <TableCell>{language === 'he' ? 'תאריך' : 'Date'}</TableCell>
                <TableCell>{language === 'he' ? 'סטטוס' : 'Status'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  onClick={() => setSelected(r)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>{r.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{r.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{r.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{r.projectName}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {r.dimensions || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(r.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(language === 'he' ? COLUMNS.find(c => c.status === r.status)?.labelHe : COLUMNS.find(c => c.status === r.status)?.labelEn) || r.status}
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem', bgcolor: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status], border: `1px solid ${STATUS_COLORS[r.status]}44` }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* KANBAN BOARD */
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, overflowX: 'auto', pb: 2, minHeight: '60vh', direction }}>
          {COLUMNS.map((col) => {
            const colItems = requests.filter(r => r.status === col.status);
            const isDraggedOver = dragOverCol === col.status;
            return (
              <Box
                key={col.status}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                sx={{
                  display: 'flex', flexDirection: 'column', gap: 2, p: 1.5, borderRadius: 2,
                  bgcolor: isDraggedOver ? 'rgba(249,115,22,0.08)' : 'rgba(0,0,0,0.15)',
                  border: '1px solid', borderColor: isDraggedOver ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.2s ease', minWidth: 190, height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid', borderBottomColor: col.color, pb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: col.color }}>
                    {language === 'he' ? col.labelHe : col.labelEn}
                  </Typography>
                  <Chip label={colItems.length} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', fontWeight: 'bold', fontSize: '0.7rem' }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto' }}>
                  {colItems.map((req) => (
                    <Card
                      key={req.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, req.id)}
                      onClick={() => setSelected(req)}
                      sx={{
                        p: 1.5, cursor: 'grab',
                        bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: col.color, boxShadow: `0 4px 12px ${col.color}22` },
                        '&:active': { cursor: 'grabbing' }, transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        #{req.id.slice(-6)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.projectName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{req.name}</Typography>
                      {req.dimensions && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Ruler size={10} /> {req.dimensions}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>{formatDate(req.createdAt)}</Typography>
                    </Card>
                  ))}
                  {colItems.length === 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 2, height: 100, opacity: 0.3 }}>
                      <Typography variant="caption">{language === 'he' ? 'גרור לכאן' : 'Drag here'}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Details Modal */}
      <ModelingRequestDetailsModal
        open={!!selected}
        request={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={async (id, status) => {
          if (onUpdateStatus) {
            await onUpdateStatus(id, status);
            setSelected(prev => prev ? { ...prev, status: status as ModelingRequest['status'] } : null);
          }
        }}
      />
    </Box>
  );
};
