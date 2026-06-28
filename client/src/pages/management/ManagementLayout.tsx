import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Button, Drawer } from '@mui/material';
import { LayoutDashboard, ShoppingBag, Users, Layers, Image as ImageIcon, LogOut, RefreshCw, Menu, PenTool, BarChart2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const drawerWidth = 240;

interface ManagementLayoutProps {
  activeTab: string;
  setActiveTab: (tab: 'overview'|'orders'|'modeling'|'customers'|'filaments'|'gallery'|'analytics') => void;
  pendingOrdersCount: number;
  pendingModelingCount?: number;
  onLogout: () => void;
  onRefresh: () => void;
  onStorefront: () => void;
  dataLoading: boolean;
  children: React.ReactNode;
}

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({ 
  activeTab, setActiveTab, pendingOrdersCount, pendingModelingCount = 0, onLogout, onRefresh, onStorefront, dataLoading, children 
}) => {
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems: Array<{ id: string, icon: React.ReactNode, labelHe: string, labelEn: string, badge?: number }> = [
    { id: 'overview',  icon: <LayoutDashboard size={20} />, labelHe: 'לוח בקרה',       labelEn: 'Overview' },
    { id: 'orders',   icon: <ShoppingBag size={20} />,    labelHe: 'הזמנות ייצור',   labelEn: 'Print Jobs', badge: pendingOrdersCount },
    { id: 'modeling', icon: <PenTool size={20} />,        labelHe: 'בקשות מידול',    labelEn: 'Modeling Requests', badge: pendingModelingCount },
    { id: 'customers',icon: <Users size={20} />,          labelHe: 'לקוחות סדנה',    labelEn: 'Customers' },
    { id: 'filaments',icon: <Layers size={20} />,         labelHe: 'מלאי פילמנט',    labelEn: 'Filaments' },
    { id: 'gallery',  icon: <ImageIcon size={20} />,      labelHe: 'גלריית עבודות',  labelEn: 'Gallery Curator' },
    { id: 'analytics',icon: <BarChart2 size={20} />,      labelHe: 'אנליטיקס',       labelEn: 'Analytics' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }} dir={direction}>
      
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, color: 'text.primary', display: { md: 'none' } }}
            >
              <Menu size={20} />
            </IconButton>
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: { xs: 'none', sm: 'block' } }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: { xs: '0.85rem', sm: '1.25rem' } }}>
              BLUEPRINT 3D <span style={{ color: '#f97316' }}>CONTROL HUB</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 2 }, alignItems: 'center' }}>
            <IconButton onClick={onRefresh} color="primary" disabled={dataLoading}>
              <RefreshCw className={dataLoading ? 'animate-spin' : ''} size={20} />
            </IconButton>
            <Button variant="outlined" color="inherit" onClick={onStorefront} sx={{ borderColor: 'divider', px: { xs: 1, sm: 2 }, py: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {language === 'he' ? 'חזרה לחנות' : 'Storefront'}
            </Button>
            <Button variant="text" color="error" startIcon={<LogOut size={16} />} onClick={onLogout} sx={{ fontWeight: 'bold', px: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {language === 'he' ? 'התנתק' : 'Logout'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            bgcolor: 'rgba(15,23,42,0.98)',
            color: '#fff',
            borderRight: '1px solid',
            borderColor: 'divider',
            paddingTop: '64px'
          },
        }}
        dir={direction}
      >
        <Box sx={{ p: 2 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton 
                  selected={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileOpen(false);
                  }}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } } 
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: direction === 'rtl' ? 0 : 2, ml: direction === 'rtl' ? 2 : 0, color: activeTab === item.id ? '#fff' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: activeTab === item.id ? 'bold' : 'medium', color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.7)' }}>{language === 'he' ? item.labelHe : item.labelEn}</Typography>} 
                  />
                  {item.badge && item.badge > 0 ? (
                    <Box sx={{ bgcolor: activeTab === item.id ? '#fff' : 'primary.main', color: activeTab === item.id ? 'primary.main' : '#fff', px: 1, py: 0.5, borderRadius: 4, fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {item.badge}
                    </Box>
                  ) : null}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Static Flex Sidebar (Desktop) */}
      <Box 
        component="aside" 
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0,
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: 64, // Below AppBar
          bgcolor: 'rgba(15,23,42,0.8)',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflowY: 'auto',
          mt: 8, // Match main content margin
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton 
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } } 
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: direction === 'rtl' ? 0 : 2, ml: direction === 'rtl' ? 2 : 0, color: activeTab === item.id ? '#fff' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: activeTab === item.id ? 'bold' : 'medium' }}>{language === 'he' ? item.labelHe : item.labelEn}</Typography>} 
                  />
                  {item.badge && item.badge > 0 ? (
                    <Box sx={{ bgcolor: activeTab === item.id ? '#fff' : 'primary.main', color: activeTab === item.id ? 'primary.main' : '#fff', px: 1, py: 0.5, borderRadius: 4, fontSize: '0.65rem', fontWeight: 'bold' }}>
                      {item.badge}
                    </Box>
                  ) : null}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 8 }}>
        {children}
      </Box>

    </Box>
  );
};
