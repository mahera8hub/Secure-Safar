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
  IconButton,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard,
  Security,
  LocationOn,
  Warning,
  Person,
  Assignment,
  Refresh,
  FileDownload,
  Search,
  Visibility,
  Map,
  NotificationImportant,
  Group,
  Timeline,
  BarChart,
  TrendingUp,
  Assessment,
  Public,
  FlightTakeoff,
  Hotel,
  Analytics,
} from '@mui/icons-material';
import HeatmapView from '../police/HeatmapView';
import TouristClustersMap from '../police/TouristClustersMap';

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
      id={`tourism-tabpanel-${index}`}
      aria-labelledby={`tourism-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TouristStats {
  total_tourists: number;
  active_tourists: number;
  high_risk_tourists: number;
  safe_tourists: number;
  new_arrivals_today: number;
  departures_today: number;
  avg_safety_score: number;
  kyc_pending: number;
}

interface LocationStats {
  location: string;
  tourist_count: number;
  safety_level: 'high' | 'medium' | 'low';
  alert_count: number;
  last_incident: string;
}

interface TouristFlow {
  entry_point: string;
  arrivals_today: number;
  departures_today: number;
  current_capacity: number;
  max_capacity: number;
}

const TourismDepartmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  const [stats, setStats] = useState<TouristStats>({
    total_tourists: 0,
    active_tourists: 0,
    high_risk_tourists: 0,
    safe_tourists: 0,
    new_arrivals_today: 0,
    departures_today: 0,
    avg_safety_score: 0,
    kyc_pending: 0,
  });

  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [touristFlow, setTouristFlow] = useState<TouristFlow[]>([]);

  // Mock data initialization
  useEffect(() => {
    // Initialize mock tourism statistics
    const mockStats: TouristStats = {
      total_tourists: 2847,
      active_tourists: 2234,
      high_risk_tourists: 89,
      safe_tourists: 2145,
      new_arrivals_today: 156,
      departures_today: 89,
      avg_safety_score: 87.3,
      kyc_pending: 23,
    };

    const mockLocationStats: LocationStats[] = [
      {
        location: "India Gate",
        tourist_count: 245,
        safety_level: 'high',
        alert_count: 2,
        last_incident: "2024-01-19T14:30:00Z"
      },
      {
        location: "Red Fort",
        tourist_count: 189,
        safety_level: 'medium',
        alert_count: 5,
        last_incident: "2024-01-20T09:15:00Z"
      },
      {
        location: "Qutub Minar",
        tourist_count: 134,
        safety_level: 'high',
        alert_count: 1,
        last_incident: "2024-01-18T16:45:00Z"
      },
      {
        location: "Lotus Temple",
        tourist_count: 298,
        safety_level: 'high',
        alert_count: 0,
        last_incident: "2024-01-17T11:20:00Z"
      },
      {
        location: "Humayun's Tomb",
        tourist_count: 167,
        safety_level: 'medium',
        alert_count: 3,
        last_incident: "2024-01-20T08:30:00Z"
      }
    ];

    const mockTouristFlow: TouristFlow[] = [
      {
        entry_point: "IGI Airport Terminal 1",
        arrivals_today: 89,
        departures_today: 45,
        current_capacity: 134,
        max_capacity: 500
      },
      {
        entry_point: "IGI Airport Terminal 3",
        arrivals_today: 156,
        departures_today: 78,
        current_capacity: 234,
        max_capacity: 800
      },
      {
        entry_point: "New Delhi Railway Station",
        arrivals_today: 67,
        departures_today: 34,
        current_capacity: 101,
        max_capacity: 300
      },
      {
        entry_point: "Online Check-in",
        arrivals_today: 45,
        departures_today: 12,
        current_capacity: 33,
        max_capacity: 200
      }
    ];

    setStats(mockStats);
    setLocationStats(mockLocationStats);
    setTouristFlow(mockTouristFlow);
  }, [timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏛️ Tourism Department Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Comprehensive tourism analytics and safety monitoring
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h5">{stats.total_tourists.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Tourists
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ↑ {stats.active_tourists} active
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
                <FlightTakeoff sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h5">{stats.new_arrivals_today}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    New Arrivals Today
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    ↓ {stats.departures_today} departures
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
                  <Typography variant="h5">{stats.avg_safety_score.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Safety Score
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ↑ +2.3% this week
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
                  <Typography variant="h5">{stats.high_risk_tourists}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    High Risk Tourists
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    KYC Pending: {stats.kyc_pending}
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
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="tourism dashboard tabs">
            <Tab
              label="Overview"
              icon={<Dashboard />}
              iconPosition="start"
            />
            <Tab
              label="Location Analytics"
              icon={<Map />}
              iconPosition="start"
            />
            <Tab
              label="Tourist Flow"
              icon={<Timeline />}
              iconPosition="start"
            />
            <Tab
              label="Safety Reports"
              icon={<Assessment />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <TouristClustersMap
                touristLocations={[
                  { tourist_id: 1, location: { lat: 28.6139, lng: 77.2090 }, last_update: "2024-01-20T10:30:00Z", safety_score: 85 },
                  { tourist_id: 2, location: { lat: 28.6129, lng: 77.2295 }, last_update: "2024-01-20T10:25:00Z", safety_score: 92 },
                  { tourist_id: 3, location: { lat: 28.5355, lng: 77.3910 }, last_update: "2024-01-20T09:45:00Z", safety_score: 78 }
                ]}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Quick Statistics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Safety Score Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(stats.safe_tourists / stats.total_tourists) * 100}
                          color="success"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {((stats.safe_tourists / stats.total_tourists) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Top Tourist Destinations
                  </Typography>
                  {locationStats.slice(0, 3).map((location, index) => (
                    <Box key={location.location} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        {index + 1}. {location.location}
                      </Typography>
                      <Chip
                        label={location.tourist_count}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Today's Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Arrivals</Typography>
                    <Typography variant="body2" color="success.main">+{stats.new_arrivals_today}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Departures</Typography>
                    <Typography variant="body2" color="error.main">-{stats.departures_today}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Net Growth</Typography>
                    <Typography variant="body2" color="primary.main">
                      +{stats.new_arrivals_today - stats.departures_today}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Location Analytics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <HeatmapView />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🗺️ Location Safety Status
                  </Typography>
                  <List>
                    {locationStats.map((location, index) => (
                      <React.Fragment key={location.location}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1">{location.location}</Typography>
                                <Chip
                                  label={location.safety_level}
                                  color={getSafetyLevelColor(location.safety_level)}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  👥 {location.tourist_count} tourists
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  ⚠️ {location.alert_count} active alerts
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  🕐 Last incident: {new Date(location.last_incident).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < locationStats.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tourist Flow Tab */}
        <TabPanel value={activeTab} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Entry Point</TableCell>
                  <TableCell align="right">Arrivals Today</TableCell>
                  <TableCell align="right">Departures Today</TableCell>
                  <TableCell align="right">Current Capacity</TableCell>
                  <TableCell align="right">Capacity Usage</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {touristFlow.map((flow) => (
                  <TableRow key={flow.entry_point}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {flow.entry_point}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={flow.arrivals_today}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={flow.departures_today}
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {flow.current_capacity} / {flow.max_capacity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(flow.current_capacity / flow.max_capacity) * 100}
                            color={getCapacityColor(flow.current_capacity, flow.max_capacity)}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {((flow.current_capacity / flow.max_capacity) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          (flow.current_capacity / flow.max_capacity) >= 0.9 ? 'Full' :
                          (flow.current_capacity / flow.max_capacity) >= 0.7 ? 'Busy' : 'Normal'
                        }
                        color={getCapacityColor(flow.current_capacity, flow.max_capacity)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📈 Flow Trends
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Flow trend analysis chart would be displayed here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏨 Accommodation Analytics
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Hotel sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Hotel occupancy and booking trends
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Safety Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Safety Incident Reports
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    All incidents are tracked and analyzed for pattern recognition and preventive measures.
                  </Alert>
                  
                  <List>
                    {locationStats.map((location) => (
                      <ListItem key={location.location} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{location.location}</Typography>
                              <Chip
                                label={`${location.alert_count} alerts`}
                                color={location.alert_count > 3 ? 'error' : location.alert_count > 0 ? 'warning' : 'success'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary">
                              Last incident: {new Date(location.last_incident).toLocaleString()} | 
                              Current tourists: {location.tourist_count} | 
                              Safety level: {location.safety_level}
                            </Typography>
                          }
                        />
                        <IconButton color="primary">
                          <Visibility />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Safety Metrics
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Overall Safety Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={stats.avg_safety_score}
                          color="success"
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="h6" color="success.main">
                        {stats.avg_safety_score.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Risk Distribution
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">High Risk</Typography>
                      <Typography variant="body2" color="error.main">{stats.high_risk_tourists}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Safe</Typography>
                      <Typography variant="body2" color="success.main">{stats.safe_tourists}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Compliance Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">KYC Verified</Typography>
                    <Typography variant="body2" color="success.main">
                      {((stats.total_tourists - stats.kyc_pending) / stats.total_tourists * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Pending KYC</Typography>
                    <Typography variant="body2" color="warning.main">{stats.kyc_pending}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default TourismDepartmentDashboard;