import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Person,
  Description,
  Flight,
  Verified,
  Upload,
  CheckCircle,
  Error,
  Info,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Validation schemas for each step
const personalInfoSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  date_of_birth: yup.string().required('Date of birth is required'),
  nationality: yup.string().required('Nationality is required'),
  gender: yup.string().required('Gender is required'),
});

const documentInfoSchema = yup.object({
  document_type: yup.string().required('Document type is required'),
  document_number: yup.string().required('Document number is required'),
  document_expiry_date: yup.string().nullable(),
});

const contactInfoSchema = yup.object({
  phone_number: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  emergency_contact_name: yup.string().required('Emergency contact name is required'),
  emergency_contact_phone: yup.string().required('Emergency contact phone is required'),
  emergency_contact_relationship: yup.string().required('Emergency contact relationship is required'),
});

const tripInfoSchema = yup.object({
  entry_date: yup.string().required('Entry date is required'),
  planned_exit_date: yup.string().required('Planned exit date is required'),
  trip_purpose: yup.string().required('Trip purpose is required'),
  accommodation_address: yup.string().nullable(),
});

interface KYCFormData {
  // Personal Information
  full_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  
  // Document Information
  document_type: string;
  document_number: string;
  document_expiry_date?: string;
  
  // Contact Information
  phone_number: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Trip Information
  entry_date: string;
  planned_exit_date: string;
  trip_purpose: string;
  accommodation_address?: string;
  local_contact_name?: string;
  local_contact_phone?: string;
  
  // Additional Information
  planned_destinations?: string[];
  itinerary_details?: string;
  special_requirements?: string;
  medical_conditions?: string;
  travel_insurance_number?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
}

const KYCRegistrationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [digitalIdResult, setDigitalIdResult] = useState<any>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<KYCFormData>({
    resolver: yupResolver(
      activeStep === 0 ? personalInfoSchema :
      activeStep === 1 ? documentInfoSchema :
      activeStep === 2 ? contactInfoSchema :
      tripInfoSchema
    ),
    mode: 'onBlur',
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue('full_name', user.full_name || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const steps = [
    {
      label: 'Personal Information',
      icon: <Person />,
      description: 'Basic personal details and identity information',
    },
    {
      label: 'Document Information',
      icon: <Description />,
      description: 'Identity document details (Passport/Aadhaar)',
    },
    {
      label: 'Contact Information',
      icon: <Person />,
      description: 'Contact details and emergency contacts',
    },
    {
      label: 'Trip Information',
      icon: <Flight />,
      description: 'Travel dates, purpose, and accommodation details',
    },
    {
      label: 'Document Upload',
      icon: <Upload />,
      description: 'Upload required verification documents',
    },
    {
      label: 'Verification',
      icon: <Verified />,
      description: 'Review and complete KYC verification',
    },
  ];

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const validateKYCData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = getValues();
      
      const response = await fetch('http://localhost:8000/api/kyc/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      setValidationResult(result);
      
      if (!result.eligible) {
        setError(`Validation failed: ${result.validation_errors.join(', ')}`);
      } else {
        setSuccess('KYC data validated successfully!');
      }
    } catch (err: any) {
      setError(`Validation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitKYCRegistration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = getValues();
      
      const response = await fetch('http://localhost:8000/api/kyc/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setDigitalIdResult(result);
        setSuccess('Blockchain Digital ID created successfully!');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(`Registration error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    const uploadId = Date.now().toString();
    const newDocument: UploadedDocument = {
      id: uploadId,
      name: file.name,
      size: file.size,
      type: documentType,
      status: 'uploading',
    };

    setUploadedDocuments(prev => [...prev, newDocument]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const response = await fetch('http://localhost:8000/api/kyc/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === uploadId ? { ...doc, status: 'uploaded' } : doc
        )
      );
    } catch (err) {
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === uploadId ? { ...doc, status: 'error' } : doc
        )
      );
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name *"
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    disabled={!!user?.full_name}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date of Birth *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nationality *"
                    error={!!errors.nationality}
                    helperText={errors.nationality?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender *</InputLabel>
                    <Select {...field} label="Gender *">
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="document_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.document_type}>
                    <InputLabel>Document Type *</InputLabel>
                    <Select {...field} label="Document Type *">
                      <MenuItem value="passport">Passport</MenuItem>
                      <MenuItem value="aadhaar">Aadhaar Card</MenuItem>
                      <MenuItem value="national_id">National ID</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="document_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Document Number *"
                    error={!!errors.document_number}
                    helperText={errors.document_number?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="document_expiry_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Document Expiry Date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number *"
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email *"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={!!user?.email}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="emergency_contact_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Emergency Contact Name *"
                    error={!!errors.emergency_contact_name}
                    helperText={errors.emergency_contact_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="emergency_contact_phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Emergency Contact Phone *"
                    error={!!errors.emergency_contact_phone}
                    helperText={errors.emergency_contact_phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="emergency_contact_relationship"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Relationship *"
                    error={!!errors.emergency_contact_relationship}
                    helperText={errors.emergency_contact_relationship?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="entry_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Entry Date *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.entry_date}
                    helperText={errors.entry_date?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="planned_exit_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Planned Exit Date *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.planned_exit_date}
                    helperText={errors.planned_exit_date?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="trip_purpose"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.trip_purpose}>
                    <InputLabel>Trip Purpose *</InputLabel>
                    <Select {...field} label="Trip Purpose *">
                      <MenuItem value="tourism">Tourism</MenuItem>
                      <MenuItem value="business">Business</MenuItem>
                      <MenuItem value="education">Education</MenuItem>
                      <MenuItem value="medical">Medical</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="accommodation_address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Accommodation Address"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="travel_insurance_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Travel Insurance Number"
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Required Documents
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please upload clear, high-quality images or PDFs of your documents. 
              Maximum file size: 10MB per file.
            </Alert>
            
            {validationResult?.verification_requirements?.map((docType: string) => (
              <Paper key={docType} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {docType.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, docType);
                    }
                  }}
                  style={{ display: 'none' }}
                  id={`upload-${docType}`}
                />
                <label htmlFor={`upload-${docType}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mr: 2 }}
                  >
                    Choose File
                  </Button>
                </label>
              </Paper>
            ))}
            
            {uploadedDocuments.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {uploadedDocuments.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        {doc.status === 'uploading' && <CircularProgress size={20} />}
                        {doc.status === 'uploaded' && <CheckCircle color="success" />}
                        {doc.status === 'error' && <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.type} - ${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <IconButton onClick={() => removeDocument(doc.id)}>
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );
      
      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review and Complete KYC Verification
            </Typography>
            
            {validationResult && (
              <Alert 
                severity={validationResult.eligible ? "success" : "error"} 
                sx={{ mb: 3 }}
              >
                {validationResult.eligible 
                  ? `KYC validation successful! Risk level: ${validationResult.risk_level}`
                  : `Validation failed: ${validationResult.validation_errors?.join(', ')}`
                }
              </Alert>
            )}
            
            {digitalIdResult && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    🎉 Blockchain Digital ID Created Successfully!
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tourist ID: {digitalIdResult.tourist_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(digitalIdResult.expires_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction ID: {digitalIdResult.transaction_id}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            <Typography variant="body1" paragraph>
              By completing this process, you will receive a secure, blockchain-based 
              digital tourist ID that is:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText primary="Time-bound and valid only for your visit duration" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText primary="Includes verified KYC information and emergency contacts" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText primary="Contains your trip itinerary and accommodation details" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText primary="Provides secure verification for authorities" />
              </ListItem>
            </List>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        KYC Registration & Digital ID Creation
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" align="center" paragraph>
        Complete your Know Your Customer (KYC) verification to receive a secure blockchain-based digital tourist ID
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={step.icon}
                  optional={
                    <Typography variant="caption">{step.description}</Typography>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  
                  <Box sx={{ mb: 2, mt: 3 }}>
                    <div>
                      {index === steps.length - 1 ? (
                        <Box>
                          {!validationResult && (
                            <Button
                              variant="contained"
                              onClick={validateKYCData}
                              disabled={loading}
                              sx={{ mr: 1 }}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Validate KYC Data'}
                            </Button>
                          )}
                          
                          {validationResult?.eligible && !digitalIdResult && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={submitKYCRegistration}
                              disabled={loading}
                              sx={{ mr: 1 }}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Create Digital ID'}
                            </Button>
                          )}
                          
                          {digitalIdResult && (
                            <Button
                              variant="contained"
                              onClick={() => navigate('/dashboard')}
                              sx={{ mr: 1 }}
                            >
                              Continue to Dashboard
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mr: 1 }}
                        >
                          Continue
                        </Button>
                      )}
                      
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default KYCRegistrationPage;