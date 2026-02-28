import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await axios.post(`${getApiUrl()}/auth/forgot-password`, { email }, { timeout: 10000 });
      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
      setEmail('');
    } catch (err) {
      if (err.response?.status === 200 || err.response?.data?.message) {
        setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        setEmail('');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mb: 3, color: 'white' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                ATS CV Builder
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Reset your password
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight={600}>
                Forgot Password
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email and we&apos;ll send you a link to reset your password.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              {message && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Remember your password?{' '}
                    <Link
                      to="/login"
                      style={{
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
