import React, { useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Whatshot,
  Warning,
  Info,
} from '@mui/icons-material';

const HeatmapView: React.FC = () => {
  const heatmapContainer = useRef<HTMLDivElement>(null);
  const [heatmapType, setHeatmapType] = React.useState('risk');
  const [timeRange, setTimeRange] = React.useState('24h');

  useEffect(() => {
    renderHeatmap();
  }, [heatmapType, timeRange]);

  const renderHeatmap = () => {
    if (!heatmapContainer.current) return;

    const container = heatmapContainer.current;
    
    // Sample heatmap data based on type
    const getHeatmapData = () => {
      switch (heatmapType) {
        case 'risk':
          return [
            { x: 80, y: 60, intensity: 0.9, label: 'High Crime Area' },
            { x: 200, y: 120, intensity: 0.7, label: 'Crowded Market' },
            { x: 320, y: 80, intensity: 0.6, label: 'Night District' },
            { x: 150, y: 200, intensity: 0.4, label: 'Construction Zone' },
          ];
        case 'tourist_density':
          return [
            { x: 120, y: 100, intensity: 0.8, label: 'Tourist Hub' },
            { x: 280, y: 150, intensity: 0.9, label: 'Main Attraction' },
            { x: 200, y: 80, intensity: 0.6, label: 'Hotel District' },
            { x: 100, y: 180, intensity: 0.5, label: 'Shopping Area' },
          ];
        case 'incidents':
          return [
            { x: 180, y: 90, intensity: 0.7, label: 'Recent Incident' },
            { x: 300, y: 140, intensity: 0.5, label: 'Minor Incident' },
            { x: 90, y: 160, intensity: 0.6, label: 'Theft Report' },
          ];
        default:
          return [];
      }
    };

    const heatmapData = getHeatmapData();

    container.innerHTML = `
      <div style="
        width: 100%;
        height: 300px;
        background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%);
        position: relative;
        border-radius: 8px;
        overflow: hidden;
      ">
        <!-- Grid Background -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        "></div>
        
        <!-- Heatmap Points -->
        ${heatmapData.map((point, index) => `
          <div style="
            position: absolute;
            left: ${point.x - 30}px;
            top: ${point.y - 30}px;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, 
              ${point.intensity > 0.7 ? 'rgba(244, 67, 54, ' + point.intensity + ')' : 
                point.intensity > 0.5 ? 'rgba(255, 152, 0, ' + point.intensity + ')' : 
                'rgba(255, 235, 59, ' + point.intensity + ')'} 0%, 
              transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          "></div>
          
          <div style="
            position: absolute;
            left: ${point.x - 15}px;
            top: ${point.y - 15}px;
            width: 30px;
            height: 30px;
            background: ${point.intensity > 0.7 ? '#d32f2f' : 
                        point.intensity > 0.5 ? '#f57c00' : '#fbc02d'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 10;
          " title="${point.label}">
            ${point.intensity > 0.7 ? '⚠️' : point.intensity > 0.5 ? '⚡' : '📍'}
          </div>
        `).join('')}
        
        <!-- Legend -->
        <div style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
          backdrop-filter: blur(4px);
          min-width: 120px;
        ">
          <div style="font-weight: bold; margin-bottom: 6px;">${heatmapType.replace('_', ' ').toUpperCase()}</div>
          <div style="display: flex; align-items: center; margin-bottom: 3px;">
            <div style="width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; margin-right: 6px;"></div>
            High (${heatmapData.filter(p => p.intensity > 0.7).length})
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 3px;">
            <div style="width: 12px; height: 12px; background: #f57c00; border-radius: 50%; margin-right: 6px;"></div>
            Medium (${heatmapData.filter(p => p.intensity > 0.5 && p.intensity <= 0.7).length})
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background: #fbc02d; border-radius: 50%; margin-right: 6px;"></div>
            Low (${heatmapData.filter(p => p.intensity <= 0.5).length})
          </div>
        </div>
        
        <!-- Time Range Indicator -->
        <div style="
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(33, 150, 243, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
        ">
          ${timeRange} data
        </div>
      </div>
    `;
  };

  const getHeatmapDescription = () => {
    switch (heatmapType) {
      case 'risk':
        return 'Areas with higher security risks based on historical data and current conditions';
      case 'tourist_density':
        return 'Areas with highest concentration of tourists for crowd management';
      case 'incidents':
        return 'Recent incident locations requiring increased monitoring';
      default:
        return 'Heatmap visualization of selected data';
    }
  };

  const getHighRiskCount = () => {
    // Mock data - in real implementation, this would come from API
    switch (heatmapType) {
      case 'risk': return 3;
      case 'tourist_density': return 2;
      case 'incidents': return 1;
      default: return 0;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Whatshot sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Risk Heatmap</Typography>
          </Box>
          <Chip
            icon={<Warning />}
            label={`${getHighRiskCount()} High Risk Zones`}
            color="error"
            size="small"
          />
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Heatmap Type</InputLabel>
            <Select
              value={heatmapType}
              label="Heatmap Type"
              onChange={(e) => setHeatmapType(e.target.value)}
            >
              <MenuItem value="risk">Security Risk</MenuItem>
              <MenuItem value="tourist_density">Tourist Density</MenuItem>
              <MenuItem value="incidents">Recent Incidents</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
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
        </Box>

        {/* Heatmap Container */}
        <Box ref={heatmapContainer} sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }} />

        {/* Description */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Info sx={{ mr: 1, mt: 0.5, fontSize: 16, color: 'info.main' }} />
          <Typography variant="body2" color="textSecondary">
            {getHeatmapDescription()}
          </Typography>
        </Box>

        {/* Summary Statistics */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="error.main">
              {getHighRiskCount()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              High Risk
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {Math.max(0, 4 - getHighRiskCount())}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Medium Risk
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              12
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Safe Zones
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HeatmapView;