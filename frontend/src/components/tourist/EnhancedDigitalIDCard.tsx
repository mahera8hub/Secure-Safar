import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Container,
} from '@mui/material';
import {
  Person,
  Security,
  CalendarMonth,
  Phone,
  Email,
  Home,
  Flight,
  Verified,
  QrCode,
  Close,
  Warning,
  CheckCircle,
  Info,
  AccessTime,
  Fingerprint,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface DigitalIDData {
  id: number;
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expiry_date?: string;
  phone_number?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  entry_date?: string;
  planned_exit_date?: string;
  trip_purpose?: string;
  accommodation_address?: string;
  kyc_status: string;
  verification_level: string;
  blockchain_id?: string;
  digital_id_expires_at?: string;
  safety_score: number;
  current_location_lat?: number;
  current_location_lng?: number;
}

interface KYCStatus {
  kyc_status: string;
  verification_level: string;
  documents_required: string[];
  documents_submitted: string[];
  blockchain_id?: string;
  rejection_reason?: string;
  verification_date?: string;
}

const EnhancedDigitalIDCard: React.FC = () => {
  const [profileData, setProfileData] = useState<DigitalIDData | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProfileData();
    fetchKYCStatus();
  }, []);

  useEffect(() => {
    if (profileData?.digital_id_expires_at) {
      calculateDaysRemaining();
    }
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/kyc/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        
        // Generate QR code if blockchain ID exists
        if (data.blockchain_id) {
          generateQRCode(data);
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      setError('Error fetching profile data');
    }
  };

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (data: DigitalIDData) => {
    try {
      // For demo purposes, create a simple QR code data URL
      const qrData = {
        tourist_id: data.blockchain_id,
        full_name: data.full_name,
        nationality: data.nationality,
        document_number: data.document_number,
        expires_at: data.digital_id_expires_at,
        verification_url: `https://securesafar.gov/verify/${data.blockchain_id}`,
        issued_at: new Date().toISOString(),
        verification_level: data.verification_level
      };
      
      // Simple base64 encoded QR placeholder - in real implementation use QRCode library
      const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12">
            QR CODE
            ID: ${data.blockchain_id}
            Valid: ${data.digital_id_expires_at ? new Date(data.digital_id_expires_at).toLocaleDateString() : 'N/A'}
          </text>
        </svg>
      `)}`;
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const calculateDaysRemaining = () => {
    if (profileData?.digital_id_expires_at) {
      const expiryDate = new Date(profileData.digital_id_expires_at);
      const currentDate = new Date();
      const timeDiff = expiryDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysRemaining(Math.max(0, daysDiff));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 'success';
      case 'pending':
      case 'under_review':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'full':
        return <Verified color="success" />;
      case 'enhanced':
        return <Security color="primary" />;
      case 'basic':
        return <CheckCircle color="action" />;
      default:
        return <Warning color="warning" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2 }} align="center">
            Loading Digital ID...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !profileData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'No digital ID found. Please complete KYC registration.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Digital Tourist ID
        </Typography>
        
        {/* Main ID Card */}
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '3rem'
                    }}
                  >
                    {profileData.full_name.charAt(0)}
                  </Avatar>
                  <Chip
                    label={profileData.verification_level.toUpperCase()}
                    color={getStatusColor(profileData.kyc_status) as any}
                    icon={getVerificationIcon(profileData.verification_level)}
                    sx={{ mb: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {profileData.full_name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                  {profileData.nationality} • {profileData.document_type?.toUpperCase()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                  ID: {profileData.blockchain_id || 'Pending'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">
                    Valid until: {profileData.digital_id_expires_at ? 
                      new Date(profileData.digital_id_expires_at).toLocaleDateString() : 'N/A'
                    }
                  </Typography>
                </Box>
                
                {daysRemaining > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonth sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">
                      {daysRemaining} days remaining
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<QrCode />}
                    onClick={() => setShowQRDialog(true)}
                    disabled={!profileData.blockchain_id}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    Show QR Code
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            {/* Security Badge */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                px: 2,
                py: 1
              }}
            >
              <Fingerprint sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography variant="caption">BLOCKCHAIN SECURED</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Date of Birth" 
                    secondary={profileData.date_of_birth || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Document Number" 
                    secondary={profileData.document_number || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Document Expiry" 
                    secondary={profileData.document_expiry_date || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Safety Score" 
                    secondary={`${profileData.safety_score}/100`} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon><Phone /></ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={profileData.phone_number || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={profileData.email || 'Not provided'} 
                  />
                </ListItem>
                {profileData.emergency_contact_name && (
                  <ListItem>
                    <ListItemIcon><Warning color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Emergency Contact" 
                      secondary={`${profileData.emergency_contact_name} (${profileData.emergency_contact_relationship}) - ${profileData.emergency_contact_phone}`} 
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Trip Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Flight sx={{ mr: 1, verticalAlign: 'middle' }} />
                Trip Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entry Date
                  </Typography>
                  <Typography variant="body1">
                    {profileData.entry_date ? new Date(profileData.entry_date).toLocaleDateString() : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Exit Date
                  </Typography>
                  <Typography variant="body1">
                    {profileData.planned_exit_date ? new Date(profileData.planned_exit_date).toLocaleDateString() : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Purpose
                  </Typography>
                  <Typography variant="body1">
                    {profileData.trip_purpose || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={profileData.kyc_status.toUpperCase()} 
                    color={getStatusColor(profileData.kyc_status) as any}
                    size="small"
                  />
                </Grid>
                {profileData.accommodation_address && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Accommodation
                    </Typography>
                    <Typography variant="body1">
                      {profileData.accommodation_address}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* QR Code Dialog */}
        <Dialog 
          open={showQRDialog} 
          onClose={() => setShowQRDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Digital ID QR Code
            <IconButton
              onClick={() => setShowQRDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="Digital ID QR Code" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Scan this QR code for instant verification of your digital tourist ID
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                This QR code contains your blockchain-verified digital ID information 
                and can be scanned by authorized personnel for identity verification.
              </Alert>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EnhancedDigitalIDCard;