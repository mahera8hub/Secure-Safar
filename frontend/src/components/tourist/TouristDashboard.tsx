import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Alert,
  Fab,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  Security,
  Route,
  Emergency,
  AccountCircle,
  Refresh,
  Notifications,
  Settings,
  Share,
  Help,
  PersonAdd,
  VerifiedUser,
} from '@mui/icons-material';
import { useAuth, api } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DigitalIDCard from './DigitalIDCard';
import SafetyScore from './SafetyScore';
import LocationTracker from './LocationTracker';
import ComingSoon from '../common/ComingSoon';

interface TouristProfile {
  id: number;
  passport_number?: string;
  nationality?: string;
  phone_number?: string;
  emergency_contact?: string;
  safety_score: number;
  current_location_lat?: number;
  current_location_lng?: number;
  blockchain_id?: string;
}

const TouristDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TouristProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [panicLoading, setPanicLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchTouristProfile();
    fetchAlerts();
  }, []);

  const fetchTouristProfile = async () => {
    try {
      const response = await api.get('/api/tourist/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching tourist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      // This would fetch recent alerts for the tourist
      // For now, we'll use mock data
      setAlerts([]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handlePanicButton = async () => {
    setPanicLoading(true);
    try {
      await api.post('/api/emergency/panic');
      alert('Emergency alert sent! Help is on the way.');
    } catch (error) {
      console.error('Error sending panic alert:', error);
      alert('Failed to send emergency alert. Please try again.');
    } finally {
      setPanicLoading(false);
    }
  };

  const handleLocationUpdate = async (lat: number, lng: number) => {
    try {
      await api.post('/api/tourist/location', {
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
      });
      
      // Update profile with new location
      if (profile) {
        setProfile({
          ...profile,
          current_location_lat: lat,
          current_location_lng: lng,
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            mb: 3, 
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  mr: 3, 
                  width: 64, 
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <AccountCircle sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {t('welcome')}, {user?.full_name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {t('touristDashboard')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('notifications', 'Notifications')}>
                <IconButton sx={{ color: 'white' }}>
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('settings')}>
                <IconButton sx={{ color: 'white' }}>
                  <Settings />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchTouristProfile}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {t('refresh')}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {alerts.map((alert, index) => (
              <Alert key={index} severity={alert.severity} sx={{ mb: 1 }}>
                {alert.message}
              </Alert>
            ))}
          </Box>
        )}

        {/* KYC Registration Alert */}
        {(!profile || !profile.blockchain_id) && (
          <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
              <Box sx={{ flex: 1, mb: { xs: 2, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VerifiedUser sx={{ mr: 2, color: 'warning.main', fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Complete Your KYC Registration
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Secure your trip with a blockchain-based digital ID. Complete KYC verification to access 
                  all safety features including location tracking, emergency alerts, and official verification by authorities.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<Security />} label="Blockchain Security" color="primary" size="small" />
                  <Chip icon={<VerifiedUser />} label="Government Verified" color="secondary" size="small" />
                  <Chip icon={<Emergency />} label="Emergency Ready" color="warning" size="small" />
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: { md: '300px' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate('/kyc-registration')}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                    }
                  }}
                >
                  Start KYC Registration
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Takes 5-10 minutes
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top Row - Digital ID and Safety Score */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <DigitalIDCard profile={profile} user={user} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SafetyScore score={profile?.safety_score || 0} />
            </Box>
          </Box>

          {/* Middle Row - Enhanced Location Tracker and Quick Actions */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '2 1 500px', minWidth: 500 }}>
              <LocationTracker 
                currentLocation={{
                  lat: profile?.current_location_lat || 28.6139,
                  lng: profile?.current_location_lng || 77.2090
                }}
                onLocationUpdate={handleLocationUpdate}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
                  borderRadius: 3
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                  {t('quickActions')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Route />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.5
                    }}
                  >
                    {t('viewItinerary')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.5,
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      '&:hover': {
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.04)'
                      }
                    }}
                  >
                    {t('shareLocation')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Help />}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.5,
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.04)'
                      }
                    }}
                  >
                    {t('safetyTips')}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Bottom Row - Itinerary */}
          <Box>
            <ComingSoon 
              feature={t('itinerary')}
              description={t('itineraryDesc', 'Detailed trip itinerary with timeline, attractions, bookings, and real-time updates will be available soon.')}
            />
          </Box>
        </Box>
      </Container>

      {/* Panic Button */}
      <Fab
        color="error"
        aria-label="panic"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 80,
          height: 80,
          background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
          boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease'
        }}
        onClick={handlePanicButton}
        disabled={panicLoading}
      >
        <Emergency sx={{ fontSize: 40 }} />
      </Fab>
    </Box>
  );
};

export default TouristDashboard;