import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  LocationOn,
  Phone,
  ContactEmergency,
  Security,
  Verified,
  QrCode,
  CreditCard,
  DateRange,
  Flight,
  Hotel,
  Restaurant,
  Museum,
  Close,
  Visibility,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DigitalIDCardProps {
  profile: any;
  user: any;
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ profile, user }) => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  // Mock blockchain verification data
  const blockchainData = {
    isVerified: true,
    verificationDate: '2024-01-15T10:00:00Z',
    aadhaarVerified: true,
    passportVerified: true,
    kycStatus: 'COMPLETE',
    validUntil: '2024-02-15T23:59:59Z',
    issuePoint: 'Delhi International Airport',
    blockchainHash: '0x1a2b3c4d5e6f...',
  };

  // Mock itinerary data
  const itineraryData = [
    { icon: Flight, title: 'Arrival', location: 'Delhi Airport', time: '2024-01-15 10:00', status: 'completed' },
    { icon: Hotel, title: 'Hotel Check-in', location: 'Grand Palace Hotel', time: '2024-01-15 14:00', status: 'completed' },
    { icon: Museum, title: 'Red Fort Visit', location: 'Red Fort', time: '2024-01-16 10:00', status: 'upcoming' },
    { icon: Restaurant, title: 'Local Cuisine', location: 'Karim\'s Restaurant', time: '2024-01-16 19:00', status: 'upcoming' },
    { icon: Flight, title: 'Departure', location: 'Delhi Airport', time: '2024-01-20 18:00', status: 'upcoming' },
  ];
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Paper 
        elevation={8}
        sx={{
          background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Security sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {t('digitalId')}
            </Typography>
            <Chip
              icon={<Verified />}
              label={blockchainData.isVerified ? t('verified') : t('pending', 'Pending')}
              color="success"
              size="small"
              sx={{ 
                ml: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {t('blockchainSecured')}
          </Typography>
        </Box>

        {/* Main Content */}
        <Paper 
          sx={{ 
            mx: 2, 
            mb: 2, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  fontSize: '2rem',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <AccountCircle sx={{ fontSize: '3rem' }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  {t('touristId', 'Tourist ID')}: <strong>{profile?.id || 'DT-001234'}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('blockchainId', 'Blockchain ID')}: <strong>{blockchainData.blockchainHash}</strong>
                </Typography>
              </Box>
              <Tooltip title={t('viewQRCode', 'View QR Code')}>
                <IconButton 
                  onClick={() => setShowQR(true)}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <QrCode />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* KYC Verification Status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                {t('kycVerification', 'KYC Verification')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f0f8f0', borderRadius: 2 }}>
                    <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('aadhaarCard', 'Aadhaar Card')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {blockchainData.aadhaarVerified ? t('verified') : t('pending')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f0f8f0', borderRadius: 2 }}>
                    <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('passport', 'Passport')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {blockchainData.passportVerified ? t('verified') : t('pending')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Personal Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                {t('personalInformation', 'Personal Information')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCard sx={{ mr: 2, color: '#666' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('nationality')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile?.nationality || 'Indian'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: '#666' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('phone')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile?.phone_number || '+91 9876543210'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactEmergency sx={{ mr: 2, color: '#f44336' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('emergencyContact', 'Emergency Contact')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile?.emergency_contact || '+91 9876543211 (Family)'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Visit Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                {t('visitInformation', 'Visit Information')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DateRange sx={{ mr: 2, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('issueDate', 'Issue Date')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(blockchainData.verificationDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ mr: 2, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('validUntil', 'Valid Until')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(blockchainData.validUntil).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: '#2196f3' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('issuePoint', 'Issue Point')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {blockchainData.issuePoint}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => setShowItinerary(true)}
                sx={{
                  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                {t('viewItinerary')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<QrCode />}
                onClick={() => setShowQR(true)}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderColor: '#667eea',
                  color: '#667eea'
                }}
              >
                {t('showQR', 'Show QR')}
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Paper>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onClose={() => setShowQR(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('digitalIdQR', 'Digital ID QR Code')}
          <IconButton onClick={() => setShowQR(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box 
            sx={{ 
              width: 200, 
              height: 200, 
              mx: 'auto', 
              mb: 2,
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2
            }}
          >
            <QrCode sx={{ fontSize: 120, color: '#666' }} />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {t('qrCodeMessage', 'Scan this QR code for instant verification by authorities')}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Itinerary Dialog */}
      <Dialog open={showItinerary} onClose={() => setShowItinerary(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('tripItinerary', 'Trip Itinerary')}
          <IconButton onClick={() => setShowItinerary(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {itineraryData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    mb: 2,
                    bgcolor: item.status === 'completed' ? '#f0f8f0' : '#f5f5f5',
                    borderRadius: 2,
                    border: item.status === 'completed' ? '1px solid #4caf50' : '1px solid #e0e0e0'
                  }}
                >
                  <IconComponent sx={{ mr: 2, color: item.status === 'completed' ? '#4caf50' : '#666' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.location} • {item.time}
                    </Typography>
                  </Box>
                  <Chip 
                    label={item.status === 'completed' ? t('completed', 'Completed') : t('upcoming', 'Upcoming')}
                    size="small"
                    color={item.status === 'completed' ? 'success' : 'default'}
                  />
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DigitalIDCard;