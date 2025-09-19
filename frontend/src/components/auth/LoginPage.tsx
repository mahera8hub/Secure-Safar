import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Validation schemas
const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

// Enhanced validation schema with tourist document validation
const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),  
  username: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  full_name: yup.string().required('Full name is required'),
  role: yup.string().oneOf(['tourist', 'police', 'tourism_authority']).required('Role is required'),
  passport_number: yup.string().default(''),
  aadhaar_number: yup.string().default(''),
});

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: 'tourist' | 'police' | 'tourism_authority';
  passport_number?: string;
  aadhaar_number?: string;
}

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
    setError: setRegisterError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      passport_number: '',
      aadhaar_number: ''
    }
  });

  const watchedRole = watch('role');

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt:', data.email);
      console.log('API Base URL:', 'http://localhost:8000');
      
      const success = await login(data.email, data.password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed - invalid credentials or server error');
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('Login error caught in component:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`Login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Custom validation for tourist documents
      if (data.role === 'tourist') {
        const hasPassport = data.passport_number && data.passport_number.trim().length > 0;
        const hasAadhaar = data.aadhaar_number && data.aadhaar_number.trim().length > 0;
        
        if (!hasPassport && !hasAadhaar) {
          setRegisterError('passport_number', {
            type: 'manual',
            message: 'Either Passport number or Aadhaar number is required for digital ID creation'
          });
          setLoading(false);
          return;
        }
        
        if (hasAadhaar && !/^\d{12}$/.test(data.aadhaar_number!.trim())) {
          setRegisterError('aadhaar_number', {
            type: 'manual',
            message: 'Aadhaar number must be exactly 12 digits'
          });
          setLoading(false);
          return;
        }
        
        if (hasPassport && data.passport_number!.trim().length < 6) {
          setRegisterError('passport_number', {
            type: 'manual',
            message: 'Passport number must be at least 6 characters'
          });
          setLoading(false);
          return;
        }
      }
      
      console.log('Registration attempt:', data.email);
      console.log('Registration data:', { ...data, password: '[HIDDEN]' });
      
      const success = await register(data);
      console.log('Registration result:', success);
      
      if (success) {
        console.log('Registration successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Registration failed - server error or validation failed');
        setError('Registration failed. Please check your information and try again.');
      }
    } catch (err: any) {
      console.error('Registration error caught in component:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        position: 'relative', // Changed from absolute
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ 
          width: '100%',
          maxWidth: { xs: '95%', sm: '500px', md: '600px' },
          mx: 'auto',
          my: { xs: 2, sm: 4 }, // Add vertical margin for scrolling
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px',
            mx: 'auto',
            my: { xs: 2, sm: 4 },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                fontSize: { xs: '1.8rem', sm: '2.125rem', md: '2.5rem' }
              }}
            >
              SecureSafar
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Safe Tourism Platform
            </Typography>
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)} 
            centered
            variant="fullWidth"
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
              }
            }}
          >
            <Tab label="LOGIN" />
            <Tab label="REGISTER" />
          </Tabs>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleLoginSubmit(handleLogin)} sx={{ mt: { xs: 1, sm: 2 } }}>
              <Controller
                name="email"
                control={loginControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    margin="normal"
                    variant="outlined"
                    error={!!loginErrors.email}
                    helperText={loginErrors.email?.message}
                    sx={{ 
                      mb: { xs: 1.5, sm: 2 },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: { xs: 1, sm: 1.25 }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />
              
              <Controller
                name="password"
                control={loginControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    error={!!loginErrors.password}
                    helperText={loginErrors.password?.message}
                    sx={{ 
                      mb: { xs: 2, sm: 3 },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: { xs: 1, sm: 1.25 }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: { xs: 1, sm: 2 }, 
                  mb: 2,
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          )}

          {/* Register Form */}
          {tabValue === 1 && (
            <Box 
              component="form" 
              onSubmit={handleRegisterSubmit(handleRegister)} 
              sx={{ 
                mt: { xs: 1, sm: 2 }
              }}
            >
              <Controller
                name="full_name"
                control={registerControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    margin="normal"
                    variant="outlined"
                    error={!!registerErrors.full_name}
                    helperText={registerErrors.full_name?.message}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />

              <Controller
                name="username"
                control={registerControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username"
                    margin="normal"
                    variant="outlined"
                    error={!!registerErrors.username}
                    helperText={registerErrors.username?.message}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />

              <Controller
                name="email"
                control={registerControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    margin="normal"
                    variant="outlined"
                    error={!!registerErrors.email}
                    helperText={registerErrors.email?.message}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={registerControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    variant="outlined"
                    error={!!registerErrors.password}
                    helperText={registerErrors.password?.message}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                    InputProps={{
                      style: { borderRadius: 8 }
                    }}
                  />
                )}
              />

              <Controller
                name="role"
                control={registerControl}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!registerErrors.role}
                    sx={{ mb: 2 }}
                  >
                    <InputLabel>Role</InputLabel>
                    <Select 
                      {...field} 
                      label="Role"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="tourist">Tourist</MenuItem>
                      <MenuItem value="police">Police</MenuItem>
                      <MenuItem value="tourism_authority">Tourism Authority</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              {/* Conditional Document Fields for Tourists */}
              {watchedRole === 'tourist' && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    color="primary" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    🔒 Digital ID Information (Required for Blockchain Verification)
                  </Typography>
                  
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      fontSize: { xs: '0.8rem', sm: '0.85rem' }
                    }}
                  >
                    <strong>Required:</strong> Provide either Passport OR Aadhaar number to create your secure blockchain-based digital tourist ID.
                  </Alert>
                  
                  <Controller
                    name="passport_number"
                    control={registerControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Passport Number"
                        placeholder="e.g., A1234567"
                        margin="normal"
                        variant="outlined"
                        error={!!registerErrors.passport_number}
                        helperText={registerErrors.passport_number?.message || "For international travelers"}
                        sx={{ 
                          mb: 2,
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                        InputProps={{
                          style: { borderRadius: 8 }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="aadhaar_number"
                    control={registerControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Aadhaar Number"
                        placeholder="e.g., 123456789012"
                        margin="normal"
                        variant="outlined"
                        error={!!registerErrors.aadhaar_number}
                        helperText={registerErrors.aadhaar_number?.message || "For Indian citizens (12 digits)"}
                        sx={{ 
                          mb: 2,
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                        InputProps={{
                          style: { borderRadius: 8 }
                        }}
                      />
                    )}
                  />
                  
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="caption" color="success.800" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      ✅ Digital ID Benefits:
                    </Typography>
                    <Typography variant="body2" color="success.700" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                      • Secure blockchain verification • Faster check-ins • Enhanced safety tracking
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
          )}

          <Box sx={{ 
            mt: { xs: 2, sm: 3 }, 
            p: { xs: 1.5, sm: 2 }, 
            bgcolor: 'grey.50', 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'grey.200' 
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              Demo Accounts:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.85rem' }, 
                mt: 1, 
                lineHeight: 1.4 
              }}
            >
              <strong>Tourist:</strong> tourist@securesafar.com / tourist123<br />
              <strong>Police:</strong> police@securesafar.com / police123<br />
              <strong>Admin:</strong> admin@securesafar.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;