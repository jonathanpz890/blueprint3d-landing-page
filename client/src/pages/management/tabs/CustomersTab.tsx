import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';
import type { Order } from '../types';

interface CustomersTabProps {
  orders: Order[];
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ orders }) => {
  const { language, formatPrice, direction } = useLanguage();

  const getCustomerLedger = () => {
    const map: Record<string, { name: string; email: string; ordersCount: number; spend: number }> = {};
    orders.forEach(o => {
      const key = o.customer.email.toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: o.customer.name,
          email: o.customer.email,
          ordersCount: 0,
          spend: 0
        };
      }
      map[key].ordersCount += 1;
      map[key].spend += o.totalWithVat;
    });
    return Object.values(map).sort((a, b) => b.spend - a.spend);
  };

  const customerLedger = getCustomerLedger();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {language === 'he' ? 'ספר לקוחות ורכישות' : 'Workshop Customer Directory'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {customerLedger.length} {language === 'he' ? 'לקוחות רשומים' : 'Profiles found'}
        </Typography>
      </Box>

      {customerLedger.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {language === 'he' ? 'לא נמצאו רשומות לקוחות.' : 'No customer records generated yet.'}
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Card} sx={{ overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650, direction }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <TableCell>{language === 'he' ? 'שם לקוח' : 'Customer Name'}</TableCell>
                <TableCell>{language === 'he' ? 'כתובת אימייל' : 'Email Address'}</TableCell>
                <TableCell>{language === 'he' ? 'מספר הזמנות' : 'Total Print Jobs'}</TableCell>
                <TableCell>{language === 'he' ? 'סה"כ רכישות (כולל מע"מ)' : 'Aggregate Spend (incl. VAT)'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerLedger.map((c, idx) => (
                <TableRow key={idx} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{c.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{c.email}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{c.ordersCount}x</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatPrice(c.spend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
