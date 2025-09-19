import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Shield,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';

interface SafetyScoreProps {
  score: number;
}

const SafetyScore: React.FC<SafetyScoreProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle />;
    if (score >= 60) return <Warning />;
    return <Warning />;
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Shield sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Safety Score</Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h2" color={`${getScoreColor(score)}.main`}>
            {score}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            out of 100
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            color={getScoreColor(score)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Chip
            icon={getScoreIcon(score)}
            label={getScoreStatus(score)}
            color={getScoreColor(score)}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Factors affecting your score:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2">Regular location updates</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2">Following planned itinerary</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2">No recent safety alerts</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.contrastText">
            💡 Keep your safety score high by staying in safe areas, following your itinerary, and keeping your emergency contacts updated.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SafetyScore;