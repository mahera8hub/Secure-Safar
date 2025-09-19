import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PersonAdd,
  ContactPhone,
  DocumentScanner,
  Flight,
  Security,
  CheckCircle,
  UploadFile,
  Verified,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// Validation schemas for each step
const personalInfoSchema = yup.object({
  full_name: yup.string().required('Full name is required').min(2, 'Name too short'),
  date_of_birth: yup.string().required('Date of birth is required'),
  nationality: yup.string().required('Nationality is required'),
  phone_number: yup.string().required('Phone number is required').min(10, 'Invalid phone number'),
});

const emergencyContactSchema = yup.object({
  emergency_contact: yup.string().required('Emergency contact is required').min(10, 'Invalid phone number'),
  emergency_contact_relation: yup.string().required('Relationship is required'),
});

// Enhanced validation schemas for document requirement
const documentsSchema = yup.object({
  passport_number: yup.string().nullable(),
  aadhaar_number: yup.string().nullable(),
}).test('at-least-one-document', 'Either Passport number or Aadhaar number must be provided for digital ID creation', function(value: any) {
  if (!value.passport_number && !value.aadhaar_number) {
    return this.createError({
      message: 'Either Passport number or Aadhaar number is required for blockchain digital ID creation',
      path: 'passport_number'
    });
  }
  
  // Validate passport if provided
  if (value.passport_number && value.passport_number.length < 6) {
    return this.createError({
      message: 'Passport number must be at least 6 characters',
      path: 'passport_number'
    });
  }
  
  // Validate Aadhaar if provided
  if (value.aadhaar_number && !/^\d{12}$/.test(value.aadhaar_number)) {
    return this.createError({
      message: 'Aadhaar number must be exactly 12 digits',
      path: 'aadhaar_number'
    });
  }
  
  return true;
});

const tripInfoSchema = yup.object({
  planned_entry_date: yup.string().required('Entry date is required'),
  planned_exit_date: yup.string().required('Exit date is required'),
  entry_point: yup.string().required('Entry point is required'),
  purpose_of_visit: yup.string().required('Purpose of visit is required'),
});

interface KYCFormData {
  // Personal Information
  full_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  
  // Emergency Contact
  emergency_contact: string;
  emergency_contact_relation: string;
  
  // Documents
  passport_number: string;
  aadhaar_number?: string;
  
  // Trip Information
  planned_entry_date: string;
  planned_exit_date: string;
  entry_point: string;
  purpose_of_visit: string;
  accommodation_details?: string;
  planned_itinerary?: string;
}

const steps = [
  'Personal Information',
  'Emergency Contact',
  'Documents',
  'Trip Information',
  'Review & Submit'
];

const KYCRegistration: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<KYCFormData>({
    resolver: yupResolver(
      activeStep === 0 ? personalInfoSchema :
      activeStep === 1 ? emergencyContactSchema :
      activeStep === 2 ? documentsSchema :
      activeStep === 3 ? tripInfoSchema :
      yup.object() // Review step
    ) as any,
    mode: 'onChange'
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (activeStep === steps.length - 1) {
        // Submit form
        await handleKYCSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleKYCSubmit = async () => {
    setLoading(true);
    try {
      const formData = getValues();
      
      // Prepare accommodation details as JSON
      const accommodationData = formData.accommodation_details ? {
        description: formData.accommodation_details,
        type: 'hotel', // Could be enhanced with more fields
        booking_reference: null
      } : null;

      // Prepare itinerary as JSON array
      const itineraryData = formData.planned_itinerary ? [
        {
          date: formData.planned_entry_date,
          location: formData.entry_point,
          activity: 'Arrival',
          type: 'arrival'
        },
        {
          date: formData.planned_exit_date,
          location: formData.entry_point,
          activity: 'Departure',
          type: 'departure'
        }
      ] : null;

      const kycPayload = {
        ...formData,
        accommodation_details: accommodationData ? JSON.stringify(accommodationData) : null,
        planned_itinerary: itineraryData ? JSON.stringify(itineraryData) : null
      };

      console.log('Submitting KYC data:', kycPayload);

      const response = await fetch('http://localhost:8000/api/kyc/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(kycPayload),
      });

      const result = await response.json();
      console.log('KYC registration result:', result);

      if (response.ok && result.success) {
        setSubmitResult(result);
        setShowResult(true);
      } else {
        throw new Error(result.detail || result.message || 'KYC registration failed');
      }
    } catch (error: any) {
      console.error('KYC registration error:', error);
      setSubmitResult({
        success: false,
        message: error.message || 'Registration failed. Please try again.',
        error: error.message
      });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.nationality}>
                    <InputLabel>Nationality *</InputLabel>
                    <Select {...field} label="Nationality *">
                      <MenuItem value="Indian">Indian</MenuItem>
                      <MenuItem value="American">American</MenuItem>
                      <MenuItem value="British">British</MenuItem>
                      <MenuItem value="Australian">Australian</MenuItem>
                      <MenuItem value="Canadian">Canadian</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="+91 9876543210"
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Emergency Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergency_contact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Emergency Contact Number"
                    placeholder="+91 9876543211"
                    error={!!errors.emergency_contact}
                    helperText={errors.emergency_contact?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="emergency_contact_relation"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.emergency_contact_relation}>
                    <InputLabel>Relationship *</InputLabel>
                    <Select {...field} label="Relationship *">
                      <MenuItem value="Father">Father</MenuItem>
                      <MenuItem value="Mother">Mother</MenuItem>
                      <MenuItem value="Spouse">Spouse</MenuItem>
                      <MenuItem value="Sibling">Sibling</MenuItem>
                      <MenuItem value="Friend">Friend</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <DocumentScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                Identity Documents
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Digital ID Requirement:</strong> Provide either Passport OR Aadhaar number to create your blockchain-based digital identity.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="passport_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Passport Number"
                    placeholder="A1234567"
                    error={!!errors.passport_number}
                    helperText={errors.passport_number?.message || "For international travelers"}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="aadhaar_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Aadhaar Number"
                    placeholder="123456789012"
                    error={!!errors.aadhaar_number}
                    helperText={errors.aadhaar_number?.message || "For Indian citizens (12 digits only)"}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                <strong>Blockchain Digital ID:</strong> Your chosen document will be used to create a secure, blockchain-based digital identity for enhanced verification and tourist safety.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                You will need to upload document photos after completing this registration.
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Flight sx={{ mr: 1, verticalAlign: 'middle' }} />
                Trip Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="planned_entry_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Planned Entry Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.planned_entry_date}
                    helperText={errors.planned_entry_date?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="planned_exit_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Planned Exit Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.planned_exit_date}
                    helperText={errors.planned_exit_date?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="entry_point"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.entry_point}>
                    <InputLabel>Entry Point *</InputLabel>
                    <Select {...field} label="Entry Point *">
                      <MenuItem value="Delhi International Airport">Delhi International Airport</MenuItem>
                      <MenuItem value="Mumbai International Airport">Mumbai International Airport</MenuItem>
                      <MenuItem value="Bangalore International Airport">Bangalore International Airport</MenuItem>
                      <MenuItem value="Chennai International Airport">Chennai International Airport</MenuItem>
                      <MenuItem value="Kolkata International Airport">Kolkata International Airport</MenuItem>
                      <MenuItem value="Land Border - Wagah">Land Border - Wagah</MenuItem>
                      <MenuItem value="Seaport - Mumbai">Seaport - Mumbai</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="purpose_of_visit"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.purpose_of_visit}>
                    <InputLabel>Purpose of Visit *</InputLabel>
                    <Select {...field} label="Purpose of Visit *">
                      <MenuItem value="Tourism">Tourism</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Medical">Medical</MenuItem>
                      <MenuItem value="Conference">Conference</MenuItem>
                      <MenuItem value="Transit">Transit</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="accommodation_details"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Accommodation Details (Optional)"
                    placeholder="Hotel name, address, or other accommodation details"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="planned_itinerary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Planned Itinerary (Optional)"
                    placeholder="Brief description of places you plan to visit"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 4:
        const formData = getValues();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review & Submit KYC Registration
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  <Typography><strong>Name:</strong> {formData.full_name}</Typography>
                  <Typography><strong>Date of Birth:</strong> {formData.date_of_birth}</Typography>
                  <Typography><strong>Nationality:</strong> {formData.nationality}</Typography>
                  <Typography><strong>Phone:</strong> {formData.phone_number}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Emergency Contact
                  </Typography>
                  <Typography><strong>Contact:</strong> {formData.emergency_contact}</Typography>
                  <Typography><strong>Relationship:</strong> {formData.emergency_contact_relation}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Documents
                  </Typography>
                  <Typography><strong>Passport:</strong> {formData.passport_number}</Typography>
                  {formData.aadhaar_number && (
                    <Typography><strong>Aadhaar:</strong> {formData.aadhaar_number}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Trip Information
                  </Typography>
                  <Typography><strong>Entry Date:</strong> {formData.planned_entry_date}</Typography>
                  <Typography><strong>Exit Date:</strong> {formData.planned_exit_date}</Typography>
                  <Typography><strong>Entry Point:</strong> {formData.entry_point}</Typography>
                  <Typography><strong>Purpose:</strong> {formData.purpose_of_visit}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                By submitting this form, you agree to the terms and conditions of SecureSafar's digital identity system. 
                Your information will be securely stored on the blockchain and used for tourist safety and verification purposes.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          KYC Registration & Digital ID Creation
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={handleNext}
            disabled={loading}
            variant="contained"
            sx={{ minWidth: 120 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              'Submit KYC'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Result Dialog */}
      <Dialog 
        open={showResult} 
        onClose={() => setShowResult(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {submitResult?.success ? (
            <>
              <CheckCircle color="success" sx={{ mr: 2 }} />
              KYC Registration Successful
            </>
          ) : (
            <>
              <Alert severity="error" sx={{ mr: 2 }} />
              Registration Failed
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {submitResult?.success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                {submitResult.message}
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Tourist ID:</strong> {submitResult.tourist_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>KYC Status:</strong> 
                    <Chip 
                      label={submitResult.kyc_status} 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                </Grid>
                {submitResult.blockchain_id && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Blockchain ID:</strong> {submitResult.blockchain_id}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Verification Progress:</strong> {submitResult.verification_progress}%
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Next Steps:
              </Typography>
              <ul>
                {submitResult.next_steps?.map((step: string, index: number) => (
                  <li key={index}>
                    <Typography variant="body2">{step}</Typography>
                  </li>
                ))}
              </ul>

              {submitResult.required_documents?.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Required Documents:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {submitResult.required_documents.map((doc: string, index: number) => (
                      <Chip 
                        key={index}
                        icon={<UploadFile />}
                        label={doc}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Alert severity="error">
              {submitResult?.message || 'An error occurred during registration. Please try again.'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)}>
            {submitResult?.success ? 'Continue to Dashboard' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KYCRegistration;