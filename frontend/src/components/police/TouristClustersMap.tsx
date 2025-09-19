import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Map,
  LocationOn,
  Person,
  Warning,
  Emergency,
  Security,
  Refresh,
  Visibility,
  VerifiedUser,
  Flag,
  Info,
  Phone,
  Navigation,
} from '@mui/icons-material';

interface TouristLocation {
  tourist_id: number;
  full_name: string;
  nationality: string;
  location: {
    lat: number;
    lng: number;
  };
  last_update: string;
  safety_score: number;
  status: 'active' | 'alert' | 'emergency' | 'offline';
  verification_level: 'basic' | 'standard' | 'enhanced' | 'premium';
  blockchain_id?: string;
  phone_number?: string;
  emergency_contact?: string;
}

interface MapCluster {
  id: string;
  center: { lat: number; lng: number };
  tourists: TouristLocation[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

const TouristClustersMap: React.FC = () => {
  const [touristLocations, setTouristLocations] = useState<TouristLocation[]>([]);
  const [mapClusters, setMapClusters] = useState<MapCluster[]>([]);
  const [selectedTourist, setSelectedTourist] = useState<TouristLocation | null>(null);
  const [viewMode, setViewMode] = useState<'individuals' | 'clusters' | 'heatmap'>('individuals');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTouristLocations();
    
    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(fetchTouristLocations, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchTouristLocations = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockTourists: TouristLocation[] = [
        {
          tourist_id: 1,
          full_name: "John Doe",
          nationality: "United States",
          location: { lat: 28.6139, lng: 77.2090 },
          last_update: new Date(Date.now() - 5 * 60000).toISOString(),
          safety_score: 95,
          status: 'active',
          verification_level: 'premium',
          blockchain_id: 'block_001',
          phone_number: '+1-555-123-4567',
          emergency_contact: '+1-555-987-6543'
        },
        {
          tourist_id: 2,
          full_name: "Maria Garcia",
          nationality: "Spain",
          location: { lat: 28.6129, lng: 77.2095 },
          last_update: new Date(Date.now() - 2 * 60000).toISOString(),
          safety_score: 88,
          status: 'active',
          verification_level: 'enhanced',
          blockchain_id: 'block_002',
          phone_number: '+34-666-123-456'
        },
        {
          tourist_id: 3,
          full_name: "Akira Tanaka",
          nationality: "Japan",
          location: { lat: 28.6145, lng: 77.2085 },
          last_update: new Date(Date.now() - 15 * 60000).toISOString(),
          safety_score: 92,
          status: 'alert',
          verification_level: 'standard',
          blockchain_id: 'block_003'
        },
        {
          tourist_id: 4,
          full_name: "Sarah Johnson",
          nationality: "United Kingdom",
          location: { lat: 28.6155, lng: 77.2075 },
          last_update: new Date(Date.now() - 45 * 60000).toISOString(),
          safety_score: 65,
          status: 'emergency',
          verification_level: 'premium',
          blockchain_id: 'block_004',
          phone_number: '+44-7700-123456',
          emergency_contact: '+44-7700-987654'
        },
        {
          tourist_id: 5,
          full_name: "Hans Mueller",
          nationality: "Germany",
          location: { lat: 28.6120, lng: 77.2110 },
          last_update: new Date(Date.now() - 90 * 60000).toISOString(),
          safety_score: 78,
          status: 'offline',
          verification_level: 'basic'
        }
      ];

      setTouristLocations(mockTourists);
      generateMapClusters(mockTourists);
    } catch (error) {
      console.error('Error fetching tourist locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMapClusters = (tourists: TouristLocation[]) => {
    // Simple clustering algorithm for demonstration
    const clusters: MapCluster[] = [
      {
        id: 'cluster_1',
        center: { lat: 28.6139, lng: 77.2090 },
        tourists: tourists.slice(0, 3),
        risk_level: tourists.slice(0, 3).some(t => t.status === 'emergency') ? 'critical' : 
                   tourists.slice(0, 3).some(t => t.status === 'alert') ? 'medium' : 'low'
      },
      {
        id: 'cluster_2',
        center: { lat: 28.6145, lng: 77.2085 },
        tourists: tourists.slice(3),
        risk_level: tourists.slice(3).some(t => t.status === 'emergency') ? 'critical' : 'high'
      }
    ];
    setMapClusters(clusters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'alert': return 'warning';
      case 'emergency': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'premium': return <VerifiedUser color="primary" />;
      case 'enhanced': return <Security color="secondary" />;
      case 'standard': return <Person color="action" />;
      default: return <Person color="disabled" />;
    }
  };

  const filteredTourists = touristLocations.filter(tourist => 
    filterStatus === 'all' || tourist.status === filterStatus
  );

  const emergencyCount = touristLocations.filter(t => t.status === 'emergency').length;
  const alertCount = touristLocations.filter(t => t.status === 'alert').length;

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Map sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Tourist Location Monitor</Typography>
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              {emergencyCount > 0 && (
                <Badge badgeContent={emergencyCount} color="error">
                  <Emergency color="error" />
                </Badge>
              )}
              {alertCount > 0 && (
                <Badge badgeContent={alertCount} color="warning">
                  <Warning color="warning" />
                </Badge>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                label="View Mode"
                onChange={(e) => setViewMode(e.target.value as any)}
              >
                <MenuItem value="individuals">Individual Tourists</MenuItem>
                <MenuItem value="clusters">Tourist Clusters</MenuItem>
                <MenuItem value="heatmap">Density Heatmap</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterStatus}
                label="Filter"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
            <IconButton 
              onClick={fetchTouristLocations}
              disabled={loading}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Status Summary */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Person />} 
            label={`${touristLocations.length} Total Tourists`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            icon={<LocationOn />} 
            label={`${touristLocations.filter(t => t.status === 'active').length} Active`} 
            color="success" 
            size="small" 
          />
          {alertCount > 0 && (
            <Chip 
              icon={<Warning />} 
              label={`${alertCount} Alerts`} 
              color="warning" 
              size="small" 
            />
          )}
          {emergencyCount > 0 && (
            <Chip 
              icon={<Emergency />} 
              label={`${emergencyCount} Emergencies`} 
              color="error" 
              size="small" 
            />
          )}
        </Box>

        {/* Emergency Alerts */}
        {emergencyCount > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>EMERGENCY:</strong> {emergencyCount} tourist{emergencyCount > 1 ? 's' : ''} requiring immediate assistance!
          </Alert>
        )}

        {/* Interactive Map Area */}
        <Box 
          sx={{ 
            height: 400, 
            mb: 2, 
            borderRadius: 1, 
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(45deg, #e8f5e8 25%, transparent 25%), linear-gradient(-45deg, #e8f5e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8f5e8 75%), linear-gradient(-45deg, transparent 75%, #e8f5e8 75%)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px',
            border: '2px solid #4CAF50',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            🗺️ Interactive Police Map Interface
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
            Real-time tourist tracking with blockchain verification
          </Typography>
          
          {/* Simulated Tourist Markers */}
          <Box sx={{ position: 'relative', width: '100%', height: '60%' }}>
            {filteredTourists.map((tourist, index) => (
              <Tooltip 
                key={tourist.tourist_id}
                title={`${tourist.full_name} - ${tourist.status.toUpperCase()}`}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${20 + (index * 15)}%`,
                    top: `${30 + (index * 10)}%`,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 
                      tourist.status === 'emergency' ? '#f44336' :
                      tourist.status === 'alert' ? '#ff9800' :
                      tourist.status === 'active' ? '#4caf50' : '#757575',
                    color: 'white',
                    cursor: 'pointer',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      zIndex: 10
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedTourist(tourist)}
                >
                  {getVerificationIcon(tourist.verification_level)}
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Map Legend */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 10, 
            right: 10, 
            background: 'rgba(255,255,255,0.95)', 
            p: 1, 
            borderRadius: 1, 
            fontSize: '0.8rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
              Status Legend:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                <Typography variant="caption">Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                <Typography variant="caption">Alert</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                <Typography variant="caption">Emergency</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tourist List */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tourist Locations ({filteredTourists.length})
        </Typography>
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {filteredTourists.map((tourist) => (
            <Box 
              key={tourist.tourist_id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2, 
                mb: 1, 
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: `1px solid ${
                  tourist.status === 'emergency' ? '#f44336' :
                  tourist.status === 'alert' ? '#ff9800' : '#e0e0e0'
                }`,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.50' }
              }}
              onClick={() => setSelectedTourist(tourist)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: getStatusColor(tourist.status) === 'error' ? '#f44336' :
                          getStatusColor(tourist.status) === 'warning' ? '#ff9800' :
                          getStatusColor(tourist.status) === 'success' ? '#4caf50' : '#757575'
                }}>
                  {getVerificationIcon(tourist.verification_level)}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {tourist.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tourist.nationality} • ID: {tourist.tourist_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last update: {new Date(tourist.last_update).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={tourist.status.toUpperCase()}
                  color={getStatusColor(tourist.status) as any}
                  size="small"
                />
                <Chip
                  label={`${tourist.safety_score}%`}
                  color={tourist.safety_score >= 90 ? 'success' : 
                         tourist.safety_score >= 70 ? 'warning' : 'error'}
                  size="small"
                />
                <IconButton size="small" color="primary">
                  <Visibility />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>

      {/* Tourist Detail Dialog */}
      <Dialog 
        open={!!selectedTourist} 
        onClose={() => setSelectedTourist(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTourist && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: getStatusColor(selectedTourist.status) === 'error' ? '#f44336' :
                        getStatusColor(selectedTourist.status) === 'warning' ? '#ff9800' :
                        getStatusColor(selectedTourist.status) === 'success' ? '#4caf50' : '#757575'
              }}>
                {getVerificationIcon(selectedTourist.verification_level)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedTourist.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tourist ID: {selectedTourist.tourist_id} | {selectedTourist.nationality}
                </Typography>
              </Box>
              <Chip
                label={selectedTourist.status.toUpperCase()}
                color={getStatusColor(selectedTourist.status) as any}
              />
            </DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemIcon><LocationOn /></ListItemIcon>
                  <ListItemText
                    primary="Current Location"
                    secondary={`${selectedTourist.location.lat.toFixed(6)}, ${selectedTourist.location.lng.toFixed(6)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Security /></ListItemIcon>
                  <ListItemText
                    primary="Safety Score"
                    secondary={`${selectedTourist.safety_score}% - ${
                      selectedTourist.safety_score >= 90 ? 'Excellent' :
                      selectedTourist.safety_score >= 70 ? 'Good' : 'Requires Attention'
                    }`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><VerifiedUser /></ListItemIcon>
                  <ListItemText
                    primary="Verification Level"
                    secondary={`${selectedTourist.verification_level.toUpperCase()} - ${
                      selectedTourist.blockchain_id ? `Blockchain ID: ${selectedTourist.blockchain_id}` : 'No blockchain ID'
                    }`}
                  />
                </ListItem>
                {selectedTourist.phone_number && (
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText
                      primary="Contact Information"
                      secondary={selectedTourist.phone_number}
                    />
                  </ListItem>
                )}
                {selectedTourist.emergency_contact && (
                  <ListItem>
                    <ListItemIcon><Emergency /></ListItemIcon>
                    <ListItemText
                      primary="Emergency Contact"
                      secondary={selectedTourist.emergency_contact}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><Info /></ListItemIcon>
                  <ListItemText
                    primary="Last Update"
                    secondary={new Date(selectedTourist.last_update).toLocaleString()}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTourist(null)}>Close</Button>
              {selectedTourist.status === 'emergency' && (
                <Button variant="contained" color="error" startIcon={<Emergency />}>
                  Dispatch Emergency Response
                </Button>
              )}
              {selectedTourist.status === 'alert' && (
                <Button variant="contained" color="warning" startIcon={<Warning />}>
                  Contact Tourist
                </Button>
              )}
              <Button variant="outlined" startIcon={<Navigation />}>
                Track Location
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default TouristClustersMap;