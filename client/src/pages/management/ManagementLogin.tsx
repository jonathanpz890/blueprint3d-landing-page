import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { Lock, ShieldAlert, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ManagementLoginProps {
  onLoginSuccess: (token: string) => void;
  onBackToStorefront: () => void;
}

export const ManagementLogin: React.FC<ManagementLoginProps> = ({ onLoginSuccess, onBackToStorefront }) => {
  const { language, direction } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('admin_session_token', data.token);
      onLoginSuccess(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3,
        py: 6,
        position: 'relative',
        overflow: 'hidden',
        direction
      }}
    >
      {/* Decorative glows */}
      <Box sx={{ position: 'absolute', top: '25%', left: '25%', width: 320, height: 320, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.05, filter: 'blur(80px)' }} />
      <Box sx={{ position: 'absolute', bottom: '25%', right: '25%', width: 320, height: 320, borderRadius: '50%', bgcolor: 'info.main', opacity: 0.05, filter: 'blur(80px)' }} />

      <Box 
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          position: 'relative',
          zIndex: 10,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          bgcolor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(16px)',
          boxShadow: 24,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            height: 56, width: 56, borderRadius: 4, bgcolor: 'rgba(249, 115, 22, 0.1)', 
            border: '1px solid rgba(249, 115, 22, 0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            mx: 'auto', mb: 2, color: 'primary.main' 
          }}>
            <Lock size={28} />
          </Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {language === 'he' ? 'כניסת מנהל מערכת' : 'Administrator Portal'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            {language === 'he' ? 'הזן את פרטי הניהול של Blueprint 3D' : 'Enter credentials to manage Blueprint 3D Studios'}
          </Typography>
        </Box>

        {loginError && (
          <Alert icon={<ShieldAlert size={18} />} severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.05)', color: '#f87171', '& .MuiAlert-icon': { color: '#f87171' } }}>
            {loginError}
          </Alert>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField 
            label={language === 'he' ? 'שם משתמש' : 'Username'}
            variant="outlined"
            size="small"
            required
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'text.secondary' },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(2, 6, 23, 0.8)',
                color: 'text.primary',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.light' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              }
            }}
          />

          <TextField 
            label={language === 'he' ? 'סיסמה' : 'Password'}
            type="password"
            variant="outlined"
            size="small"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'text.secondary' },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(2, 6, 23, 0.8)',
                color: 'text.primary',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.light' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              }
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={authLoading}
            sx={{ py: 1.5, mt: 1, fontWeight: 'bold' }}
          >
            {authLoading ? <RefreshCw className="animate-spin" size={20} /> : (language === 'he' ? 'כניסה למערכת' : 'Sign In')}
          </Button>

          <Button 
            variant="outlined" 
            fullWidth 
            onClick={onBackToStorefront}
            sx={{ 
              py: 1, 
              color: 'text.secondary', 
              borderColor: 'divider', 
              '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.4)', color: 'text.primary', borderColor: 'divider' } 
            }}
          >
            {language === 'he' ? 'חזרה לאתר' : 'Back to Storefront'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};
