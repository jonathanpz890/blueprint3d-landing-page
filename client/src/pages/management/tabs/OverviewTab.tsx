import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';

interface OverviewTabProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    totalWeight: number;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  const { language, formatPrice } = useLanguage();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Grid container spacing={3}>
        {[
          {
            title: language === 'he' ? 'מחזור עסקאות (משולמות)' : 'Revenue (Completed)',
            value: formatPrice(stats.totalRevenue),
            color: 'text.primary',
          },
          {
            title: language === 'he' ? 'עבודות הדפסה פעילות' : 'Active Print Jobs',
            value: stats.pendingOrders,
            color: 'primary.main',
          },
          {
            title: language === 'he' ? 'לקוחות ייחודיים' : 'Customers',
            value: stats.totalCustomers,
            color: 'text.primary',
          },
          {
            title: language === 'he' ? 'משקל פלסטיק שנצרך' : 'Filament Converted',
            value: `${stats.totalWeight} g`,
            color: 'info.main',
          },
        ].map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                {stat.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: stat.color }}>
                {stat.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
