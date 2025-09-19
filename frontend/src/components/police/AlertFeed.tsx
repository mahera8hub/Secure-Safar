import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Badge,
  Divider,
} from '@mui/material';
import {
  Notifications,
  CheckCircle,
  Visibility,
  MoreVert,
} from '@mui/icons-material';

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

interface AlertFeedProps {
  alerts: Alert[];
  onResolveAlert: (alertId: number) => void;
  getSeverityColor: (severity: string) => any;
  getAlertIcon: (alertType: string) => React.ReactElement;
}

const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onResolveAlert,
  getSeverityColor,
  getAlertIcon,
}) => {
  const activeAlerts = alerts.filter(alert => !alert.is_resolved);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPriorityOrder = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 0;
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 4;
    }
  };

  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    const priorityDiff = getPriorityOrder(a.severity) - getPriorityOrder(b.severity);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Card sx={{ height: '100%', maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={activeAlerts.length} color="error">
              <Notifications sx={{ mr: 1, color: 'primary.main' }} />
            </Badge>
            <Typography variant="h6">Live Alerts</Typography>
          </Box>
          <Chip
            label={`${activeAlerts.length} Active`}
            color={activeAlerts.length > 0 ? 'error' : 'success'}
            size="small"
          />
        </Box>
      </CardContent>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        {sortedAlerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main">
              All Clear!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              No active alerts at this time
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {sortedAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 1,
                    bgcolor: alert.severity === 'critical' ? 'error.light' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onResolveAlert(alert.id)}
                        sx={{ mr: 1 }}
                      >
                        <CheckCircle color="success" />
                      </IconButton>
                      <IconButton edge="end" size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getAlertIcon(alert.alert_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Tourist #{alert.tourist_id}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatTimeAgo(alert.created_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5,
                          }}
                        >
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          📍 {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < sortedAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Alert Summary */}
      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length} Critical`}
              color="error"
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${alerts.filter(a => a.severity === 'high' && !a.is_resolved).length} High`}
              color="warning"
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default AlertFeed;