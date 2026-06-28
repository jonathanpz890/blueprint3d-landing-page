import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { managementTheme } from './theme';
import { useLanguage } from '../../context/LanguageContext';
import { ManagementLogin } from './ManagementLogin';
import { ManagementLayout } from './ManagementLayout';
import { OverviewTab } from './tabs/OverviewTab';
import { OrdersTab } from './tabs/OrdersTab';
import { CustomersTab } from './tabs/CustomersTab';
import { FilamentsTab } from './tabs/FilamentsTab';
import { GalleryTab } from './tabs/GalleryTab';
import { ModelingRequestsTab } from './tabs/ModelingRequestsTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import type { Order, Filament, GalleryItem, ManagementProps, ModelingRequest } from './types';
import { Alert, Snackbar } from '@mui/material';
import { API_BASE } from '../../utils/api';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

export const Management: React.FC<ManagementProps> = ({ setCurrentPage }) => {
  const { direction } = useLanguage();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_session_token'));
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'filaments' | 'gallery' | 'modeling' | 'analytics'>('overview');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [modelingRequests, setModelingRequests] = useState<ModelingRequest[]>([]);
  
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token');
    setToken(null);
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setDataLoading(true);
    setError(null);

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resOrders, resFilaments, resGallery, resModeling] = await Promise.all([
        fetch(`${API_BASE}/orders`, { headers }),
        fetch(`${API_BASE}/filaments`),
        fetch(`${API_BASE}/gallery`),
        fetch(`${API_BASE}/modeling-requests`, { headers })
      ]);

      if (!resOrders.ok) throw new Error('Failed to load orders');
      if (!resFilaments.ok) throw new Error('Failed to load filaments');
      if (!resGallery.ok) throw new Error('Failed to load gallery');
      // modeling requests may fail gracefully if collection is empty

      const [dataOrders, dataFilaments, dataGallery] = await Promise.all([
        resOrders.json(), resFilaments.json(), resGallery.json()
      ]);

      setOrders(dataOrders.data);
      setFilaments(dataFilaments.data);
      setGallery(dataGallery.data);

      if (resModeling.ok) {
        const dataModeling = await resModeling.json();
        setModelingRequests(dataModeling.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching dashboard data');
      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAnalytics = async (days = analyticsPeriod) => {
    if (!token) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalyticsData(data.data);
    } catch (err: any) {
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'analytics') fetchAnalytics(analyticsPeriod);
  }, [token, activeTab, analyticsPeriod]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedData = await res.json();
      
      setOrders(prev => prev.map(o => o.id === orderId ? updatedData.data : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedData.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleUpdateModelingRequestStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/modeling-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update modeling request status');
      const updatedData = await res.json();
      setModelingRequests(prev => prev.map(r => r.id === id ? updatedData.data : r));
    } catch (err: any) {
      setError(err.message || 'Failed to update modeling request status');
    }
  };

  const handleToggleFilament = async (filamentId: string, property: 'stock' | 'active', currentValue: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/filaments/${filamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [property]: !currentValue })
      });
      if (!res.ok) throw new Error('Failed to update filament');
      const updatedData = await res.json();
      setFilaments(prev => prev.map(f => f.id === filamentId ? updatedData.data : f));
    } catch (err: any) {
      setError(err.message || 'Failed to update filament');
    }
  };

  const handleSaveFilament = async (filamentData: Partial<Filament>, isNew: boolean) => {
    const url = isNew ? `${API_BASE}/filaments` : `${API_BASE}/filaments/${filamentData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(filamentData)
      });
      if (!res.ok) throw new Error('Failed to save filament color');
      const savedData = await res.json();

      if (!isNew) {
        setFilaments(prev => prev.map(f => f.id === filamentData.id ? savedData.data : f));
      } else {
        setFilaments(prev => [...prev, savedData.data]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save filament color');
      throw err;
    }
  };

  const handleDeleteFilament = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/filaments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete filament color');
      setFilaments(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete filament color');
      throw err;
    }
  };

  const handleSaveGalleryItem = async (item: Partial<GalleryItem>, isNew: boolean) => {
    const url = isNew ? `${API_BASE}/gallery` : `${API_BASE}/gallery/${item.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to save showcase item');
      const savedData = await res.json();

      if (!isNew) {
        setGallery(prev => prev.map(g => g.id === item.id ? savedData.data : g));
      } else {
        setGallery(prev => [...prev, savedData.data]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save showcase project');
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      setGallery(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete showcase item');
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status !== 'completed' && o.status !== 'shipped').length,
    totalCustomers: Array.from(new Set(orders.map(o => o.customer.email.toLowerCase()))).length,
    totalRevenue: Number(orders.filter(o => o.status === 'completed' || o.status === 'shipped').reduce((sum, o) => sum + o.subtotal, 0).toFixed(2)),
    totalWeight: Number(orders.filter(o => o.status === 'printing' || o.status === 'completed' || o.status === 'shipped').reduce((sum, o) => sum + o.models.reduce((w, m) => w + (m.weightg * m.quantity), 0), 0).toFixed(1)),
    pendingModelingRequests: modelingRequests.filter(r => r.status === 'new' || r.status === 'reviewing').length
  };

  const theme = React.useMemo(() => createTheme(managementTheme, { direction: direction as 'ltr' | 'rtl' }), [direction]);

  // Render Login if no token
  if (!token) {
    return (
      <CacheProvider value={direction === 'rtl' ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ManagementLogin onLoginSuccess={setToken} onBackToStorefront={() => setCurrentPage('home')} />
        </ThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <CacheProvider value={direction === 'rtl' ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      
      <ManagementLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingOrdersCount={stats.pendingOrders}
        pendingModelingCount={stats.pendingModelingRequests}
        onLogout={handleLogout}
        onRefresh={fetchDashboardData}
        onStorefront={() => setCurrentPage('home')}
        dataLoading={dataLoading}
      >
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} 
            onSelectOrder={(o) => { setSelectedOrder(o); setIsOrderModalOpen(true); }} 
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
        {activeTab === 'modeling' && (
          <ModelingRequestsTab
            requests={modelingRequests}
            onUpdateStatus={handleUpdateModelingRequestStatus}
          />
        )}
        {activeTab === 'customers' && <CustomersTab orders={orders} />}
        {activeTab === 'filaments' && (
          <FilamentsTab 
            filaments={filaments} 
            onToggle={handleToggleFilament} 
            onSave={handleSaveFilament}
            onDelete={handleDeleteFilament}
          />
        )}
        {activeTab === 'gallery' && <GalleryTab gallery={gallery} orders={orders} onSave={handleSaveGalleryItem} onDelete={handleDeleteGalleryItem} />}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            analytics={analyticsData}
            loading={analyticsLoading}
            error={analyticsError}
            period={analyticsPeriod}
            onPeriodChange={(d) => setAnalyticsPeriod(d)}
          />
        )}
      </ManagementLayout>

      <OrderDetailsModal 
        open={isOrderModalOpen} 
        order={selectedOrder} 
        onClose={() => { setIsOrderModalOpen(false); setSelectedOrder(null); }}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      </ThemeProvider>
    </CacheProvider>
  );
};
