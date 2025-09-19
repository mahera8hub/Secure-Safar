import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Route,
  LocationOn,
  Schedule,
  Add,
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  Map,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ItineraryItem {
  id: number;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'current' | 'upcoming';
  description?: string;
}

const ItineraryView: React.FC = () => {
  const { t } = useTranslation();
  const [itinerary] = useState<ItineraryItem[]>([
    {
      id: 1,
      title: 'Hotel Check-in',
      location: 'Grand Palace Hotel',
      startTime: '2024-01-15T14:00:00',
      endTime: '2024-01-15T15:00:00',
      status: 'completed',
      description: 'Check into hotel and rest',
    },
    {
      id: 2,
      title: 'City Tour',
      location: 'Historic District',
      startTime: '2024-01-15T16:00:00',
      endTime: '2024-01-15T19:00:00',
      status: 'current',
      description: 'Guided tour of historic landmarks',
    },
    {
      id: 3,
      title: 'Dinner',
      location: 'Local Restaurant',
      startTime: '2024-01-15T19:30:00',
      endTime: '2024-01-15T21:00:00',
      status: 'upcoming',
      description: 'Traditional cuisine experience',
    },
    {
      id: 4,
      title: 'Museum Visit',
      location: 'National Museum',
      startTime: '2024-01-16T10:00:00',
      endTime: '2024-01-16T13:00:00',
      status: 'upcoming',
      description: 'Explore local culture and history',
    },
  ]);

  const getProgress = () => {
    const completed = itinerary.filter(item => item.status === 'completed').length;
    return (completed / itinerary.length) * 100;
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'grey' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'current':
        return 'primary';
      case 'upcoming':
        return 'grey';
      default:
        return 'grey';
    }
  };

  const getChipColor = (status: string): 'success' | 'primary' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'current':
        return 'primary';
      case 'upcoming':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'Current';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Route sx={{ mr: 2, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {t('itinerary')}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {t('yourTripPlan', 'Your personalized trip plan')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {Math.round(getProgress())}% {t('complete', 'Complete')}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={getProgress()} 
              sx={{ 
                width: 100, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50'
                }
              }} 
            />
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ 
                background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3
              }}
            >
              {t('addItem', 'Add Item')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Map />}
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              {t('viewOnMap', 'View on Map')}
            </Button>
          </Box>

          {/* Timeline */}
          <Timeline sx={{ '& .MuiTimelineItem-missingOppositeContent:before': { display: 'none' } }}>
            {itinerary.map((item, index) => (
              <TimelineItem key={item.id}>
                <TimelineSeparator>
                  <TimelineDot 
                    color={getStatusColor(item.status)}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {item.status === 'completed' && <CheckCircle sx={{ fontSize: 24 }} />}
                    {item.status === 'current' && <LocationOn sx={{ fontSize: 24 }} />}
                    {item.status === 'upcoming' && <RadioButtonUnchecked sx={{ fontSize: 24 }} />}
                  </TimelineDot>
                  {index < itinerary.length - 1 && (
                    <TimelineConnector sx={{ minHeight: 60, width: 3 }} />
                  )}
                </TimelineSeparator>
                
                <TimelineContent sx={{ py: '20px', px: 3 }}>
                  <Paper 
                    elevation={item.status === 'current' ? 8 : 2}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: item.status === 'current' 
                        ? 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)'
                        : item.status === 'completed'
                        ? 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)'
                        : 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
                      border: item.status === 'current' ? '2px solid #2196f3' : '1px solid #e0e0e0',
                      transform: item.status === 'current' ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getChipColor(item.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#666' }}>
                      <LocationOn sx={{ mr: 1, fontSize: 20, color: '#f44336' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#666' }}>
                      <AccessTime sx={{ mr: 1, fontSize: 20, color: '#ff9800' }} />
                      <Typography variant="body2">
                        {formatDate(item.startTime)} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </Typography>
                    </Box>
                    
                    {item.description && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
                          {item.description}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>

          {/* Safety Notice */}
          <Paper 
            sx={{ 
              mt: 4, 
              p: 3, 
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
              border: '1px solid #4caf50',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: '#4caf50' }} />
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                {t('safetyMonitoring', 'Safety Monitoring')}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#2e7d32', lineHeight: 1.6 }}>
              {t('itineraryMonitoringMessage', 'Your itinerary is monitored for safety. Significant deviations will trigger alerts to ensure your wellbeing.')}
            </Typography>
          </Paper>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default ItineraryView;