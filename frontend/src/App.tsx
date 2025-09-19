import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import KYCRegistrationPage from './components/auth/KYCRegistrationPage';
import TouristDashboard from './components/tourist/TouristDashboard';
import PoliceDashboard from './components/police/PoliceDashboard';
import TourismDepartmentDashboard from './components/tourism/TourismDepartmentDashboard';
import Layout from './components/layout/Layout';
import { Box, Typography } from '@mui/material';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Dashboard Router Component
const DashboardRouter: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route 
            path="/dashboard" 
            element={<RoleBasedDashboard />} 
          />
          <Route 
            path="/kyc-registration" 
            element={<KYCRegistrationPage />} 
          />
          <Route 
            path="/profile" 
            element={<div>Profile Page (Coming Soon)</div>} 
          />
          <Route 
            path="/settings" 
            element={<div>Settings Page (Coming Soon)</div>} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

// Role-based Dashboard Component
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'tourist':
      return <TouristDashboard />;
    case 'police':
      return <PoliceDashboard />;
    case 'tourism_authority':
      return <AdminDashboard />;
    default:
      return <UnauthorizedPage />;
  }
};

// Temporary Admin Dashboard
const AdminDashboard: React.FC = () => {
  return <TourismDepartmentDashboard />;
};

// Unauthorized Page
const UnauthorizedPage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        p: 3
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Unauthorized Access
      </Typography>
      <Typography variant="body1" color="textSecondary">
        You don't have permission to access this page.
      </Typography>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={<DashboardRouter />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;