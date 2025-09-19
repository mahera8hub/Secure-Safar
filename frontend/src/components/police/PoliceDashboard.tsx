import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Security,
  LocationOn,
  Warning,
  Person,
  Assignment,
  Phone,
  Refresh,
  FileDownload,
  Search,
  Visibility,
  Map,
  NotificationImportant,
  Group,
  Timeline,
  Settings,
} from '@mui/icons-material';
import HeatmapView from './HeatmapView';
import TouristClustersMap from './TouristClustersMap';
import AlertFeed from './AlertFeed';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Tourist {
  id: number;
  name: string;
  passport_number: string;
  nationality: string;
  phone_number: string;
  emergency_contact: string;
  safety_score: number;
  current_location: {
    lat: number;
    lng: number;
  };
  last_update: string;
  blockchain_id: string;
  kyc_status: string;
}

interface Alert {
  id: number;
  tourist_id: number;
  alert_type: string;
  message: string;
  severity: string;
  location: {
    lat: number;
    lng: number;
  };
  created_at: string;
  is_resolved: boolean;
}

interface MissingPersonReport {
  tourist_id: number;
  reported_by: string;
  description: string;
  last_known_location: {
    lat: number;
    lng: number;
  };
  contact_details: string;
}

const PoliceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [eFirDialog, setEFirDialog] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [missingPersonData, setMissingPersonData] = useState<MissingPersonReport>({
    tourist_id: 0,
    reported_by: '',
    description: '',
    last_known_location: { lat: 0, lng: 0 },
    contact_details: '',
  });

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    // Initialize mock data
    const mockTourists: Tourist[] = [
      {
        id: 1,
        name: "John Smith",
        passport_number: "P123456789",
        nationality: "USA",
        phone_number: "+1-555-0123",
        emergency_contact: "+1-555-0456",
        safety_score: 85,
        current_location: { lat: 28.6139, lng: 77.2090 },
        last_update: "2024-01-20T10:30:00Z",
        blockchain_id: "BTC001",
        kyc_status: "verified"
      },
      {
        id: 2,
        name: "Maria Garcia",
        passport_number: "P987654321",
        nationality: "Spain",
        phone_number: "+34-666-123456",
        emergency_contact: "+34-666-789012",
        safety_score: 92,
        current_location: { lat: 28.6129, lng: 77.2295 },
        last_update: "2024-01-20T10:25:00Z",
        blockchain_id: "BTC002",
        kyc_status: "verified"
      },
      {
        id: 3,
        name: "David Chen",
        passport_number: "P555666777",
        nationality: "Canada",
        phone_number: "+1-416-555-0789",
        emergency_contact: "+1-416-555-0321",
        safety_score: 78,
        current_location: { lat: 28.5355, lng: 77.3910 },
        last_update: "2024-01-20T09:45:00Z",
        blockchain_id: "BTC003",
        kyc_status: "verified"
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: 1,
        tourist_id: 3,
        alert_type: "geofence_violation",
        message: "Tourist entered restricted area near Red Fort",
        severity: "high",
        location: { lat: 28.6562, lng: 77.2410 },
        created_at: "2024-01-20T10:15:00Z",
        is_resolved: false
      },
      {
        id: 2,
        tourist_id: 1,
        alert_type: "anomaly_detection",
        message: "Unusual movement pattern detected",
        severity: "medium",
        location: { lat: 28.6139, lng: 77.2090 },
        created_at: "2024-01-20T09:30:00Z",
        is_resolved: false
      }
    ];

    setTourists(mockTourists);
    setAlerts(mockAlerts);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'panic': return <NotificationImportant color="error" />;
      case 'geofence_violation': return <LocationOn color="warning" />;
      case 'anomaly_detection': return <Warning color="warning" />;
      default: return <Security color="info" />;
    }
  };

  const onResolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_resolved: true } : alert
    ));
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.passport_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.blockchain_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateEFIR = () => {
    if (!selectedTourist) return;
    
    // In real implementation, this would call an API to generate E-FIR
    const eFirData = {
      ...missingPersonData,
      tourist_id: selectedTourist.id,
      tourist_name: selectedTourist.name,
      passport_number: selectedTourist.passport_number,
      blockchain_id: selectedTourist.blockchain_id,
      report_date: new Date().toISOString(),
      report_id: `EFIR${Date.now()}`,
    };
    
    console.log('E-FIR Generated:', eFirData);
    alert(`E-FIR generated successfully for ${selectedTourist.name}. Report ID: ${eFirData.report_id}`);
    setEFirDialog(false);
    setSelectedTourist(null);
    setMissingPersonData({
      tourist_id: 0,
      reported_by: '',
      description: '',
      last_known_location: { lat: 0, lng: 0 },
      contact_details: '',
    });
  };

  const openEFIRDialog = (tourist: Tourist) => {
    setSelectedTourist(tourist);
    setMissingPersonData(prev => ({
      ...prev,
      tourist_id: tourist.id,
      last_known_location: tourist.current_location,
    }));
    setEFirDialog(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🚔 Police & Tourism Department Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Real-time monitoring and emergency response system
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">{tourists.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Tourists
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationImportant sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6">{alerts.filter(a => !a.is_resolved).length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Alerts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">
                    {tourists.filter(t => t.safety_score >= 80).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Safe Zones
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6">
                    {tourists.filter(t => t.safety_score < 80).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    At Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab
              label="Live Monitoring"
              icon={<Dashboard />}
              iconPosition="start"
            />
            <Tab
              label="Tourist Registry"
              icon={<Person />}
              iconPosition="start"
            />
            <Tab
              label="Heat Maps"
              icon={<Map />}
              iconPosition="start"
            />
            <Tab
              label="Alert Management"
              icon={<Warning />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Live Monitoring Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <TouristClustersMap
                touristLocations={tourists.map(t => ({
                  tourist_id: t.id,
                  location: t.current_location,
                  last_update: t.last_update,
                  safety_score: t.safety_score,
                }))}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <AlertFeed
                alerts={alerts}
                onResolveAlert={onResolveAlert}
                getSeverityColor={getSeverityColor}
                getAlertIcon={getAlertIcon}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tourist Registry Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name, passport, or blockchain ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          <Paper sx={{ overflow: 'hidden' }}>
            <List>
              {filteredTourists.map((tourist, index) => (
                <React.Fragment key={tourist.id}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{tourist.name}</Typography>
                            <Chip
                              label={tourist.kyc_status}
                              color={tourist.kyc_status === 'verified' ? 'success' : 'warning'}
                              size="small"
                            />
                            <Chip
                              label={`Safety: ${tourist.safety_score}%`}
                              color={tourist.safety_score >= 80 ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              📄 Passport: {tourist.passport_number} | 🌍 {tourist.nationality}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              🔗 Blockchain ID: {tourist.blockchain_id}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              📞 Phone: {tourist.phone_number} | 🆘 Emergency: {tourist.emergency_contact}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              📍 Location: {tourist.current_location.lat.toFixed(4)}, {tourist.current_location.lng.toFixed(4)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              ⏰ Last Update: {new Date(tourist.last_update).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          // In real implementation, this would open tourist details view
                          alert(`Viewing details for ${tourist.name}`);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openEFIRDialog(tourist)}
                      >
                        <Assignment />
                      </IconButton>
                      <IconButton
                        color="success"
                        href={`tel:${tourist.phone_number}`}
                      >
                        <Phone />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < filteredTourists.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {filteredTourists.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No tourists found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>

        {/* Heat Maps Tab */}
        <TabPanel value={activeTab} index={2}>
          <HeatmapView />
        </TabPanel>

        {/* Alert Management Tab */}
        <TabPanel value={activeTab} index={3}>
          <AlertFeed
            alerts={alerts}
            onResolveAlert={onResolveAlert}
            getSeverityColor={getSeverityColor}
            getAlertIcon={getAlertIcon}
          />
        </TabPanel>
      </Card>

      {/* E-FIR Dialog */}
      <Dialog open={eFirDialog} onClose={() => setEFirDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 1 }} />
            Generate E-FIR for Missing Person
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTourist && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info">
                <strong>Tourist Information:</strong><br />
                Name: {selectedTourist.name}<br />
                Passport: {selectedTourist.passport_number}<br />
                Nationality: {selectedTourist.nationality}<br />
                Blockchain ID: {selectedTourist.blockchain_id}
              </Alert>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reported By"
                value={missingPersonData.reported_by}
                onChange={(e) => setMissingPersonData(prev => ({
                  ...prev,
                  reported_by: e.target.value
                }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Details"
                value={missingPersonData.contact_details}
                onChange={(e) => setMissingPersonData(prev => ({
                  ...prev,
                  contact_details: e.target.value
                }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description / Circumstances"
                value={missingPersonData.description}
                onChange={(e) => setMissingPersonData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Describe the circumstances of disappearance, last seen location, clothing description, etc."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEFirDialog(false)}>Cancel</Button>
          <Button
            onClick={generateEFIR}
            variant="contained"
            color="primary"
            disabled={!missingPersonData.reported_by || !missingPersonData.description}
          >
            Generate E-FIR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PoliceDashboard;