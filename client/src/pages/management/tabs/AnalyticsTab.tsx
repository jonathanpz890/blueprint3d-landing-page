import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, CircularProgress, ToggleButtonGroup,
  ToggleButton, Divider, Tooltip
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Users, Eye, ShoppingCart,
  AlertTriangle, BarChart2, Zap, Mouse, MessageSquare, PenTool
} from 'lucide-react';

interface AnalyticsData {
  period: { days: number; since: string };
  totalSessions: number;
  pageViews: { page: string; views: number; uniqueSessions: number }[];
  quoteFunnel: {
    started: number;
    priced: number;
    abandoned: number;
    ordered: number;
    abandonmentRate: number;
    conversionRate: number;
  };
  dailyEvents: { date: string; count: number }[];
  topExploreModels: { modelName: string; thingId: string; opens: number }[];
  otherEvents: { modelingSubmitted: number; contactSubmitted: number };
}

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  onPeriodChange: (days: number) => void;
  period: number;
}

const PAGE_DISPLAY: Record<string, { label: string; color: string }> = {
  home: { label: 'Home', color: '#6366f1' },
  quote: { label: 'Get a Quote', color: '#f97316' },
  explore: { label: 'Explore', color: '#06b6d4' },
  showcase: { label: 'Showcase', color: '#a78bfa' },
  modeling: { label: 'Modeling', color: '#22c55e' },
  contact: { label: 'Contact', color: '#ec4899' },
};

function KpiCard({
  icon, label, value, sub, color, highlight = false
}: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; highlight?: boolean;
}) {
  return (
    <Card sx={{
      bgcolor: highlight ? `${color}18` : 'rgba(15,23,42,0.6)',
      border: `1px solid ${color}30`,
      borderRadius: 3,
      height: '100%',
      transition: 'all 0.2s',
      '&:hover': { boxShadow: `0 0 20px ${color}25`, transform: 'translateY(-2px)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: `${color}20`, borderRadius: 2, display: 'flex', color }}>
            {icon}
          </Box>
          {sub && (
            <Chip
              label={sub}
              size="small"
              sx={{ bgcolor: `${color}20`, color, fontWeight: 'bold', fontSize: '0.65rem' }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color, mb: 0.5, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function FunnelBar({
  label, count, max, color, pct
}: {
  label: string; count: number; max: number; color: string; pct?: string;
}) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary', fontSize: '0.82rem' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color }}>
            {count.toLocaleString()}
          </Typography>
          {pct && (
            <Chip label={pct} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 'bold', fontSize: '0.6rem', height: 18 }} />
          )}
        </Box>
      </Box>
      <Box sx={{ height: 10, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${width}%`,
            bgcolor: color,
            borderRadius: 5,
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 0 10px ${color}60`
          }}
        />
      </Box>
    </Box>
  );
}

function MiniSparkline({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length === 0) return <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No data for this period</Typography>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 480;
  const height = 80;
  const padL = 0, padR = 0, padT = 8, padB = 4;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const step = data.length > 1 ? chartW / (data.length - 1) : 0;

  const pts = data.map((d, i) => {
    const x = padL + i * step;
    const y = padT + chartH - (d.count / max) * chartH;
    return `${x},${y}`;
  });

  const fillPts = [
    `${padL},${padT + chartH}`,
    ...pts,
    `${padL + (data.length - 1) * step},${padT + chartH}`
  ].join(' ');

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: 80 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#sparkGrad)" />
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = padL + i * step;
          const y = padT + chartH - (d.count / max) * chartH;
          return (
            <Tooltip key={i} title={`${d.date}: ${d.count} events`} arrow>
              <circle cx={x} cy={y} r="3.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" style={{ cursor: 'pointer' }} />
            </Tooltip>
          );
        })}
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
        {data.length > 0 && (
          <>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
              {data[0].date.slice(5)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
              {data[data.length - 1].date.slice(5)}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics, loading, error, onPeriodChange, period }) => {
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={40} color="primary" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading analytics data…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 8 }} />
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const f = analytics?.quoteFunnel;
  const maxFunnel = f?.started || 1;

  const totalViews = analytics?.pageViews.reduce((s, p) => s + p.views, 0) || 0;
  const maxPageViews = Math.max(...(analytics?.pageViews.map(p => p.views) || [1]), 1);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart2 size={22} style={{ color: '#6366f1' }} />
            Analytics Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Last {period} days · {analytics ? new Date(analytics.period.since).toLocaleDateString() : ''} – today
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && onPeriodChange(v)}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}
        >
          {[7, 14, 30, 90].map(d => (
            <ToggleButton
              key={d}
              value={d}
              sx={{ px: 2, fontSize: '0.75rem', fontWeight: 'bold', color: period === d ? 'primary.main' : 'text.secondary' }}
            >
              {d}d
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            icon={<Users size={18} />}
            label="Total Sessions"
            value={analytics?.totalSessions.toLocaleString() || '0'}
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            icon={<Eye size={18} />}
            label="Page Views"
            value={totalViews.toLocaleString()}
            color="#06b6d4"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            icon={<ShoppingCart size={18} />}
            label="Orders Placed"
            value={analytics?.quoteFunnel.ordered || 0}
            sub={`${analytics?.quoteFunnel.conversionRate || 0}% CVR`}
            color="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            icon={f && f.abandonmentRate > 50 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            label="Quote Abandonment"
            value={`${analytics?.quoteFunnel.abandonmentRate || 0}%`}
            sub={analytics?.quoteFunnel.abandoned ? `${analytics.quoteFunnel.abandoned} sessions` : undefined}
            color={f && f.abandonmentRate > 50 ? '#ef4444' : '#f97316'}
            highlight={!!(f && f.abandonmentRate > 50)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Events Sparkline */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Zap size={16} style={{ color: '#6366f1' }} /> Events Over Time
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Total tracked events per day
              </Typography>
              <MiniSparkline data={analytics?.dailyEvents || []} />
            </CardContent>
          </Card>
        </Grid>

        {/* Other Events */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Other Events
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#a78bfa' }}>
                    <PenTool size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Modeling Requests</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#a78bfa' }}>
                    {analytics?.otherEvents.modelingSubmitted || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ec4899' }}>
                    <MessageSquare size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Contact Submissions</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ec4899' }}>
                    {analytics?.otherEvents.contactSubmitted || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#06b6d4' }}>
                    <Mouse size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Models Explored</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>
                    {analytics?.topExploreModels.reduce((s, m) => s + m.opens, 0) || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quote Funnel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={16} style={{ color: '#f97316' }} /> Quote Funnel
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                From upload to order
              </Typography>
              <FunnelBar label="Quote Started (file uploaded)" count={f?.started || 0} max={maxFunnel} color="#6366f1" />
              <FunnelBar
                label="Quote Priced (slicing complete)"
                count={f?.priced || 0}
                max={maxFunnel}
                color="#06b6d4"
                pct={f && f.started > 0 ? `${Math.round((f.priced / f.started) * 100)}%` : undefined}
              />
              <FunnelBar
                label="Abandoned (priced, not ordered)"
                count={f?.abandoned || 0}
                max={maxFunnel}
                color="#ef4444"
                pct={f?.abandonmentRate ? `${f.abandonmentRate}% of priced` : undefined}
              />
              <FunnelBar
                label="Order Placed"
                count={f?.ordered || 0}
                max={maxFunnel}
                color="#22c55e"
                pct={f && f.started > 0 ? `${f.conversionRate}% CVR` : undefined}
              />
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>{f?.conversionRate || 0}%</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Conversion</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: f && f.abandonmentRate > 50 ? '#ef4444' : '#f97316' }}>{f?.abandonmentRate || 0}%</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Abandonment</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Page Views */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Eye size={16} style={{ color: '#06b6d4' }} /> Page Views
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Views and unique sessions per page
              </Typography>
              {(analytics?.pageViews || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No page view data yet</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(analytics?.pageViews || []).map(pg => {
                    const info = PAGE_DISPLAY[pg.page] || { label: pg.page, color: '#94a3b8' };
                    const barWidth = Math.round((pg.views / maxPageViews) * 100);
                    return (
                      <Box
                        key={pg.page}
                        onMouseEnter={() => setHoveredPage(pg.page)}
                        onMouseLeave={() => setHoveredPage(null)}
                        sx={{
                          transition: 'all 0.2s',
                          opacity: hoveredPage && hoveredPage !== pg.page ? 0.5 : 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: info.color }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary', fontSize: '0.8rem' }}>
                              {info.label}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Tooltip title="Unique sessions">
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {pg.uniqueSessions} uniq.
                              </Typography>
                            </Tooltip>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: info.color, minWidth: 32, textAlign: 'right' }}>
                              {pg.views}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{
                            height: '100%', width: `${barWidth}%`, bgcolor: info.color, borderRadius: 3,
                            transition: 'width 0.8s ease', boxShadow: `0 0 6px ${info.color}50`
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Explored Models */}
        <Grid size={12}>
          <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mouse size={16} style={{ color: '#06b6d4' }} /> Top Explored Models
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Most-opened Thingiverse models in the Explore page
              </Typography>
              {(analytics?.topExploreModels || []).length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No explore activity yet</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 'bold', fontSize: '0.72rem' }}>#</TableCell>
                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 'bold', fontSize: '0.72rem' }}>Model Name</TableCell>
                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 'bold', fontSize: '0.72rem' }}>Thing ID</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 'bold', fontSize: '0.72rem' }}>Opens</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(analytics?.topExploreModels || []).map((m, i) => (
                        <TableRow key={i} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontSize: '0.78rem' }}>
                            {i + 1}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                            {m.modelName}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            {m.thingId || '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <Chip
                              label={m.opens}
                              size="small"
                              sx={{ bgcolor: 'rgba(6,182,212,0.15)', color: '#06b6d4', fontWeight: 'bold', fontSize: '0.72rem', height: 20 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
