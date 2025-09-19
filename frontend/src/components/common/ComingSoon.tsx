import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
} from '@mui/material';
import {
  Construction,
  Schedule,
  ArrowBack,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ComingSoonProps {
  feature: string;
  description?: string;
  onBack?: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  feature, 
  description = "This feature is currently under development and will be available soon.",
  onBack 
}) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={6}
        sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 4
        }}
      >
        <Construction sx={{ fontSize: 80, mb: 3, opacity: 0.8 }} />
        
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('comingSoon', 'Coming Soon')}
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          {feature}
        </Typography>
        
        <Box 
          sx={{ 
            p: 3, 
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }}
        >
          <Schedule sx={{ mb: 2, fontSize: 32 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, opacity: 0.8 }}>
          {t('stayTuned', 'Stay tuned for exciting updates!')}
        </Typography>
        
        {onBack && (
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            {t('goBack', 'Go Back')}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ComingSoon;