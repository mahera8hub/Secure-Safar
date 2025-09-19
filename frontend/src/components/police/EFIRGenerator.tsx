import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Assignment,
  Send,
  Print,
  FileCopy,
} from '@mui/icons-material';

interface Tourist {
  id: number;
  name: string;
  passport_number: string;
  nationality: string;
  phone_number: string;
  emergency_contact: string;
  blockchain_id: string;
  last_known_location: {
    lat: number;
    lng: number;
  };
  last_update: string;
}

interface EFIRData {
  report_id: string;
  tourist_id: number;
  tourist_name: string;
  passport_number: string;
  nationality: string;
  blockchain_id: string;
  reported_by: string;
  reporter_contact: string;
  reporter_relation: string;
  incident_type: string;
  incident_description: string;
  last_known_location: {
    lat: number;
    lng: number;
    address: string;
  };
  last_seen_time: string;
  circumstances: string;
  witnesses: string;
  clothing_description: string;
  physical_description: string;
  medical_conditions: string;
  report_date: string;
  priority_level: string;
  investigating_officer: string;
  status: string;
}

interface EFIRGeneratorProps {
  tourist: Tourist;
  onClose: () => void;
  onGenerate: (efirData: EFIRData) => void;
}

const steps = [
  'Basic Information',
  'Incident Details',
  'Location & Time',
  'Review & Submit'
];

const EFIRGenerator: React.FC<EFIRGeneratorProps> = ({ tourist, onClose, onGenerate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [efirData, setEFIRData] = useState<Partial<EFIRData>>({
    report_id: `EFIR${Date.now()}`,
    tourist_id: tourist.id,
    tourist_name: tourist.name,
    passport_number: tourist.passport_number,
    nationality: tourist.nationality,
    blockchain_id: tourist.blockchain_id,
    last_known_location: {
      lat: tourist.last_known_location.lat,
      lng: tourist.last_known_location.lng,
      address: ''
    },
    report_date: new Date().toISOString(),
    status: 'pending_investigation',
    priority_level: 'high'
  });
  const [previewDialog, setPreviewDialog] = useState(false);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    if (efirData) {
      onGenerate(efirData as EFIRData);
    }
  };

  const updateEFIRData = (field: string, value: any) => {
    setEFIRData(prev => ({ ...prev, [field]: value }));
  };

  const updateLocationData = (field: string, value: any) => {
    setEFIRData(prev => ({
      ...prev,
      last_known_location: {
        ...prev.last_known_location!,
        [field]: value
      }
    }));
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return efirData.reported_by && efirData.reporter_contact && efirData.reporter_relation;
      case 1:
        return efirData.incident_type && efirData.incident_description && efirData.circumstances;
      case 2:
        return efirData.last_known_location?.address && efirData.last_seen_time;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Missing Tourist Information:</strong><br />
                Name: {tourist.name}<br />
                Passport: {tourist.passport_number}<br />
                Nationality: {tourist.nationality}<br />
                Blockchain ID: {tourist.blockchain_id}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reported By *"
                value={efirData.reported_by || ''}
                onChange={(e) => updateEFIRData('reported_by', e.target.value)}
                placeholder="Full name of the person reporting"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reporter Contact *"
                value={efirData.reporter_contact || ''}
                onChange={(e) => updateEFIRData('reporter_contact', e.target.value)}
                placeholder="Phone number or email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Relation to Missing Person *</InputLabel>
                <Select
                  value={efirData.reporter_relation || ''}
                  label="Relation to Missing Person *"
                  onChange={(e) => updateEFIRData('reporter_relation', e.target.value)}
                >
                  <MenuItem value="family_member">Family Member</MenuItem>
                  <MenuItem value="friend">Friend</MenuItem>
                  <MenuItem value="tour_guide">Tour Guide</MenuItem>
                  <MenuItem value="hotel_staff">Hotel Staff</MenuItem>
                  <MenuItem value="fellow_tourist">Fellow Tourist</MenuItem>
                  <MenuItem value="police_officer">Police Officer</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Investigating Officer"
                value={efirData.investigating_officer || ''}
                onChange={(e) => updateEFIRData('investigating_officer', e.target.value)}
                placeholder="Assigned police officer"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Incident Type *</InputLabel>
                <Select
                  value={efirData.incident_type || ''}
                  label="Incident Type *"
                  onChange={(e) => updateEFIRData('incident_type', e.target.value)}
                >
                  <MenuItem value="missing_person">Missing Person</MenuItem>
                  <MenuItem value="lost_contact">Lost Contact</MenuItem>
                  <MenuItem value="failed_to_return">Failed to Return</MenuItem>
                  <MenuItem value="suspicious_disappearance">Suspicious Disappearance</MenuItem>
                  <MenuItem value="medical_emergency">Medical Emergency</MenuItem>
                  <MenuItem value="accident">Accident</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={efirData.priority_level || 'high'}
                  label="Priority Level"
                  onChange={(e) => updateEFIRData('priority_level', e.target.value)}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Incident Description *"
                value={efirData.incident_description || ''}
                onChange={(e) => updateEFIRData('incident_description', e.target.value)}
                placeholder="Detailed description of what happened..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Circumstances *"
                value={efirData.circumstances || ''}
                onChange={(e) => updateEFIRData('circumstances', e.target.value)}
                placeholder="Circumstances leading to the incident..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Clothing Description"
                value={efirData.clothing_description || ''}
                onChange={(e) => updateEFIRData('clothing_description', e.target.value)}
                placeholder="Last seen wearing..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Physical Description"
                value={efirData.physical_description || ''}
                onChange={(e) => updateEFIRData('physical_description', e.target.value)}
                placeholder="Height, build, distinctive features..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions"
                value={efirData.medical_conditions || ''}
                onChange={(e) => updateEFIRData('medical_conditions', e.target.value)}
                placeholder="Any medical conditions or medications..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Witnesses"
                value={efirData.witnesses || ''}
                onChange={(e) => updateEFIRData('witnesses', e.target.value)}
                placeholder="Contact details of any witnesses..."
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Current Location Data:</strong><br />
                Latitude: {tourist.last_known_location.lat.toFixed(6)}<br />
                Longitude: {tourist.last_known_location.lng.toFixed(6)}<br />
                Last Update: {new Date(tourist.last_update).toLocaleString()}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Known Address *"
                value={efirData.last_known_location?.address || ''}
                onChange={(e) => updateLocationData('address', e.target.value)}
                placeholder="Street address, landmark, or location description"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={efirData.last_known_location?.lat || ''}
                onChange={(e) => updateLocationData('lat', parseFloat(e.target.value))}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={efirData.last_known_location?.lng || ''}
                onChange={(e) => updateLocationData('lng', parseFloat(e.target.value))}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Seen Date & Time *"
                type="datetime-local"
                value={efirData.last_seen_time || ''}
                onChange={(e) => updateEFIRData('last_seen_time', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              📋 E-FIR Summary
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              E-FIR Report ID: <strong>{efirData.report_id}</strong>
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      👤 Tourist Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Name" secondary={efirData.tourist_name} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Passport" secondary={efirData.passport_number} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Nationality" secondary={efirData.nationality} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Blockchain ID" secondary={efirData.blockchain_id} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      📞 Reporter Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Reported By" secondary={efirData.reported_by} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Contact" secondary={efirData.reporter_contact} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Relation" secondary={efirData.reporter_relation} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Priority" secondary={
                          <Chip
                            label={efirData.priority_level}
                            color={efirData.priority_level === 'critical' ? 'error' : 'warning'}
                            size="small"
                          />
                        } />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      🚨 Incident Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Type" secondary={efirData.incident_type} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Description" secondary={efirData.incident_description} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Last Known Location" secondary={efirData.last_known_location?.address} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Last Seen Time" secondary={
                          efirData.last_seen_time ? new Date(efirData.last_seen_time).toLocaleString() : 'Not specified'
                        } />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileCopy />}
                onClick={() => setPreviewDialog(true)}
              >
                Preview Full Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
              >
                Print Report
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Assignment sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5">
              Generate E-FIR Report
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={activeStep === 0 ? onClose : handleBack}
              variant="outlined"
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            <Button
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              variant="contained"
              disabled={!isStepValid()}
              startIcon={activeStep === steps.length - 1 ? <Send /> : undefined}
            >
              {activeStep === steps.length - 1 ? 'Generate E-FIR' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          E-FIR Report Preview - {efirData.report_id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, fontFamily: 'monospace', backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" align="center" gutterBottom>
              ELECTRONIC FIRST INFORMATION REPORT (E-FIR)
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
              TOURISM SAFETY DEPARTMENT
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" component="div">
              <strong>Report ID:</strong> {efirData.report_id}<br />
              <strong>Date:</strong> {new Date(efirData.report_date!).toLocaleString()}<br />
              <strong>Priority:</strong> {efirData.priority_level?.toUpperCase()}<br />
              <strong>Status:</strong> {efirData.status?.toUpperCase()}<br /><br />
              
              <strong>MISSING PERSON DETAILS:</strong><br />
              Name: {efirData.tourist_name}<br />
              Passport: {efirData.passport_number}<br />
              Nationality: {efirData.nationality}<br />
              Blockchain ID: {efirData.blockchain_id}<br /><br />
              
              <strong>REPORTED BY:</strong><br />
              Name: {efirData.reported_by}<br />
              Contact: {efirData.reporter_contact}<br />
              Relation: {efirData.reporter_relation}<br /><br />
              
              <strong>INCIDENT DETAILS:</strong><br />
              Type: {efirData.incident_type}<br />
              Description: {efirData.incident_description}<br />
              Circumstances: {efirData.circumstances}<br /><br />
              
              <strong>LAST KNOWN LOCATION:</strong><br />
              Address: {efirData.last_known_location?.address}<br />
              Coordinates: {efirData.last_known_location?.lat}, {efirData.last_known_location?.lng}<br />
              Last Seen: {efirData.last_seen_time ? new Date(efirData.last_seen_time).toLocaleString() : 'Not specified'}<br /><br />
              
              {efirData.clothing_description && (
                <><strong>CLOTHING:</strong> {efirData.clothing_description}<br /></>
              )}
              {efirData.physical_description && (
                <><strong>PHYSICAL DESCRIPTION:</strong> {efirData.physical_description}<br /></>
              )}
              {efirData.medical_conditions && (
                <><strong>MEDICAL CONDITIONS:</strong> {efirData.medical_conditions}<br /></>
              )}
              {efirData.witnesses && (
                <><strong>WITNESSES:</strong> {efirData.witnesses}<br /></>
              )}
              
              <br /><strong>INVESTIGATING OFFICER:</strong> {efirData.investigating_officer || 'To be assigned'}<br />
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button onClick={() => window.print()} startIcon={<Print />}>Print</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EFIRGenerator;