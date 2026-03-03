import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from 'axios';
import VoiceInput from '../components/VoiceInput';
import ATSScoreChecker from '../components/ATSScoreChecker';
import CVTemplateSelector from '../components/CVTemplateSelector';
import CVPreview from '../components/CVPreview';
import CVCustomization from '../components/CVCustomization';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getApiUrl } from '../utils/apiUrl';
import { getFieldsForTemplate } from '../config/templates';

const CVEditor = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const documentTypeFromState = location.state?.documentType || 'cv';
  const defaultTemplateByType = {
    cv: 'ats-simple',
    'visiting-card': 'card1',
    poster: 'poster1',
    biographics: 'bio1',
  };
  const [documentType, setDocumentType] = useState(documentTypeFromState);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState(defaultTemplateByType[documentTypeFromState] || 'ats-simple');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customization, setCustomization] = useState({
    fontFamily: 'Inter',
    fontSize: 14,
    headingFontSize: 18,
    headingColor: '#6366f1',
    textColor: '#1e293b',
    layout: 'single-column',
    lineSpacing: 1.5,
    margins: 20,
    sectionSpacing: 24,
    showIcons: true,
    showDividers: true,
    compactMode: false,
    showPhoto: true,
    headerAlignment: 'left',
    textAlignment: 'left',
    boldHeadings: true,
    uppercaseHeadings: false,
    sections: {
      professionalSummary: { enabled: true, title: 'Professional Summary' },
      workExperience: { enabled: true, title: 'Work Experience' },
      education: { enabled: true, title: 'Education' },
      skills: { enabled: true, title: 'Skills' },
      certifications: { enabled: true, title: 'Certifications' },
      languages: { enabled: true, title: 'Languages' },
      projects: { enabled: true, title: 'Projects' },
      hobbies: { enabled: true, title: 'Hobbies & Interests' },
      references: { enabled: true, title: 'References' },
      awards: { enabled: true, title: 'Awards & Honors' },
    },
  });
  const [cv, setCv] = useState({
    title: documentTypeFromState === 'cv' ? 'My CV' : documentTypeFromState === 'visiting-card' ? 'My Visiting Card' : documentTypeFromState === 'poster' ? 'My Poster' : 'My Biographics',
    documentType: documentTypeFromState,
    template: documentTypeFromState === 'cv' ? 'ats-simple' : documentTypeFromState === 'visiting-card' ? 'card1' : documentTypeFromState === 'poster' ? 'poster1' : 'bio1',
    customization: {
      fontFamily: 'Inter',
      fontSize: 14,
      headingColor: '#6366f1',
      textColor: '#1e293b',
      layout: 'single-column',
      lineSpacing: 1.5,
      margins: 20,
    },
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      linkedIn: '',
      website: '',
      github: '',
      photo: ''
    },
    professionalSummary: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    hobbies: [],
    references: [],
    awards: []
  });

  useEffect(() => {
    if (id) {
      fetchCV();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCV = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/cv/${id}`);
      const cvData = response.data;
      
      // Normalize array fields to ensure they are arrays (not null/undefined)
      const normalizedCv = {
        ...cvData,
        workExperience: Array.isArray(cvData.workExperience) ? cvData.workExperience : [],
        education: Array.isArray(cvData.education) ? cvData.education : [],
        skills: Array.isArray(cvData.skills) 
          ? cvData.skills.map(skill => ({
              ...skill,
              items: Array.isArray(skill.items) ? skill.items : []
            }))
          : [],
        certifications: Array.isArray(cvData.certifications) ? cvData.certifications : [],
        languages: Array.isArray(cvData.languages) ? cvData.languages : [],
        projects: Array.isArray(cvData.projects) ? cvData.projects : [],
        hobbies: Array.isArray(cvData.hobbies) ? cvData.hobbies : [],
        references: Array.isArray(cvData.references) ? cvData.references : [],
        awards: Array.isArray(cvData.awards) ? cvData.awards : [],
      };
      
      setCv(normalizedCv);
      if (cvData.documentType) setDocumentType(cvData.documentType);
      if (cvData.template) {
        setTemplate(cvData.template);
      }
      if (cvData.customization) {
        setCustomization(prev => ({
          ...prev,
          fontFamily: prev.fontFamily || 'Inter',
          fontSize: prev.fontSize || 14,
          headingFontSize: prev.headingFontSize || 18,
          headingColor: prev.headingColor || '#6366f1',
          textColor: prev.textColor || '#1e293b',
          layout: prev.layout || 'single-column',
          lineSpacing: prev.lineSpacing || 1.5,
          margins: prev.margins || 20,
          sectionSpacing: prev.sectionSpacing || 24,
          showIcons: prev.showIcons !== false,
          showDividers: prev.showDividers !== false,
          compactMode: prev.compactMode === true,
          showPhoto: prev.showPhoto !== false,
          headerAlignment: prev.headerAlignment || 'left',
          textAlignment: prev.textAlignment || 'left',
          boldHeadings: prev.boldHeadings !== false,
          uppercaseHeadings: prev.uppercaseHeadings === true,
          sections: { ...prev.sections, ...(cvData.customization.sections || {}) },
          ...cvData.customization,
        }));
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
      alert('Failed to load CV');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if server is accessible
      try {
        await axios.get(`${getApiUrl().replace('/api', '')}/api/health`);
      } catch (healthError) {
        alert('Server is not running. Please start the backend server:\n\ncd server\nnpm run dev\n\nOr run: npm run dev from project root');
        setSaving(false);
        return;
      }

      const cvToSave = {
        ...cv,
        documentType: documentType,
        template: template,
        customization: customization,
      };
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      };

      if (id) {
        await axios.put(`${getApiUrl()}/cv/${id}`, cvToSave, config);
      } else {
        const response = await axios.post(`${getApiUrl()}/cv`, cvToSave, config);
        // MySQL returns 'id', not '_id'
        const cvId = response.data.id || response.data._id;
        navigate(`/cv/${cvId}`);
      }
      alert('CV saved successfully!');
    } catch (error) {
      console.error('Error saving CV:', error);
      let errorMessage = 'Failed to save CV';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Server is taking too long to respond.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check:\n1. Backend server is running (npm run dev)\n2. Server is on http://localhost:5000\n3. No firewall blocking the connection';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    setCv(prev => {
      const newCv = { ...prev };
      const keys = path.split('.');
      let current = newCv;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newCv;
    });
  };

  const addItem = (section) => {
    const templates = {
      workExperience: { company: '', position: '', designation: '', startDate: '', endDate: '', current: false, description: '', achievements: [] },
      education: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', achievements: [] },
      skills: { category: '', items: [] },
      certifications: { name: '', issuer: '', date: '', expiryDate: '' },
      languages: { language: '', proficiency: '' },
      projects: { name: '', description: '', technologies: [], link: '' },
      hobbies: [],
      references: { name: '', jobTitle: '', company: '', email: '', phone: '', relationship: '', yearsKnown: '' },
      awards: { name: '', organization: '', date: '', description: '', category: '' }
    };
    setCv(prev => ({
      ...prev,
      [section]: [...(Array.isArray(prev[section]) ? prev[section] : []), templates[section]]
    }));
  };

  const removeItem = (section, index) => {
    setCv(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section]) ? prev[section].filter((_, i) => i !== index) : []
    }));
  };

  const updateItem = (section, index, field, value) => {
    setCv(prev => {
      const newCv = { ...prev };
      // Ensure section is an array and index exists before accessing
      if (Array.isArray(newCv[section]) && newCv[section][index] !== undefined) {
        newCv[section] = [...newCv[section]];
        newCv[section][index] = { ...newCv[section][index], [field]: value };
      }
      return newCv;
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  };

  const formatDateString = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    try {
      return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const templateFields = documentType !== 'cv' && template ? getFieldsForTemplate(documentType, template) : null;
  const showField = (name) => !templateFields || templateFields.length === 0 || templateFields.includes(name);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Box>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton 
            edge="start" 
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {documentType === 'cv' && 'CV Editor'}
            {documentType === 'visiting-card' && 'Visiting Card Editor'}
            {documentType === 'poster' && 'Poster Editor'}
            {documentType === 'biographics' && 'Biographics Editor'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PaletteIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {(documentType === 'cv' || showField('title')) && (
              <TextField
                fullWidth
                label={documentType === 'cv' ? 'CV Title' : documentType === 'visiting-card' ? 'Visiting Card Title' : documentType === 'poster' ? 'Poster Title' : 'Biographics Title'}
                value={cv.title}
                onChange={(e) => updateField('title', e.target.value)}
                margin="normal"
              />
              )}

              {(documentType === 'cv' || templateFields === null || templateFields.some(f => ['fullName','jobTitle','company','email','phone','address','website','photo'].includes(f))) && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Personal Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {(documentType === 'cv' || showField('fullName')) && (
                    <Grid item xs={12} sm={6}>
                      <VoiceInput
                        label="Full Name"
                        value={cv.personalInfo.fullName}
                        onChange={(value) => updateField('personalInfo.fullName', value)}
                      />
                    </Grid>
                    )}
                    {(documentType === 'cv' || showField('jobTitle')) && (
                    <Grid item xs={12} sm={6}>
                      <VoiceInput
                        label="Job Title / Designation"
                        value={cv.personalInfo.jobTitle || ''}
                        onChange={(value) => updateField('personalInfo.jobTitle', value)}
                        placeholder="e.g. Software Engineer, CMS Developer, Designer"
                      />
                    </Grid>
                    )}
                    {(documentType === 'cv' || documentType === 'visiting-card' || documentType === 'poster') && showField('company') && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="Company / Brand"
                          value={cv.personalInfo.company || ''}
                          onChange={(value) => updateField('personalInfo.company', value)}
                        />
                      </Grid>
                    )}
                    {(documentType === 'cv' || showField('email')) && (
                    <Grid item xs={12} sm={6}>
                      <VoiceInput
                        label="Email"
                        value={cv.personalInfo.email}
                        onChange={(value) => updateField('personalInfo.email', value)}
                      />
                    </Grid>
                    )}
                    {(documentType === 'cv' || showField('phone')) && (
                    <Grid item xs={12} sm={6}>
                      <VoiceInput
                        label="Phone"
                        value={cv.personalInfo.phone}
                        onChange={(value) => updateField('personalInfo.phone', value)}
                      />
                    </Grid>
                    )}
                    {documentType === 'cv' && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="Address"
                          value={cv.personalInfo.address}
                          onChange={(value) => updateField('personalInfo.address', value)}
                        />
                      </Grid>
                    )}
                    {(documentType === 'visiting-card' || documentType === 'poster') && showField('address') && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="Address"
                          value={cv.personalInfo.address}
                          onChange={(value) => updateField('personalInfo.address', value)}
                          placeholder="Street, City, State, ZIP"
                        />
                      </Grid>
                    )}
                    {documentType === 'biographics' && showField('address') && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="Address"
                          value={cv.personalInfo.address}
                          onChange={(value) => updateField('personalInfo.address', value)}
                        />
                      </Grid>
                    )}
                    {documentType === 'cv' && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="LinkedIn"
                          value={cv.personalInfo.linkedIn}
                          onChange={(value) => updateField('personalInfo.linkedIn', value)}
                        />
                      </Grid>
                    )}
                    {(documentType === 'cv' || showField('website')) && (
                    <Grid item xs={12} sm={6}>
                      <VoiceInput
                        label="Website"
                        value={cv.personalInfo.website}
                        onChange={(value) => updateField('personalInfo.website', value)}
                      />
                    </Grid>
                    )}
                    {documentType === 'cv' && (
                      <Grid item xs={12} sm={6}>
                        <VoiceInput
                          label="GitHub"
                          value={cv.personalInfo.github}
                          onChange={(value) => updateField('personalInfo.github', value)}
                        />
                      </Grid>
                    )}
                    {(documentType === 'cv' || showField('photo')) && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Profile Photo
                        </Typography>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateField('personalInfo.photo', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }}
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload">
                          <Button variant="outlined" component="span" fullWidth>
                            {cv.personalInfo.photo ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                        </label>
                        {cv.personalInfo.photo && (
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img
                              src={cv.personalInfo.photo}
                              alt="Profile"
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #6366f1',
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              )}

              {(documentType === 'cv' || showField('tagline') || showField('body') || showField('headline') || showField('subhead')) && (
              <Accordion defaultExpanded={documentType !== 'cv'}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    {documentType === 'visiting-card' ? 'Tagline' : documentType === 'poster' ? 'Poster Text' : documentType === 'biographics' ? 'Biography' : 'Professional Summary'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <VoiceInput
                    label={documentType === 'visiting-card' ? 'Tagline' : documentType === 'poster' ? 'Main text' : 'Summary'}
                    value={cv.professionalSummary}
                    onChange={(value) => updateField('professionalSummary', value)}
                    multiline
                    rows={documentType === 'visiting-card' ? 2 : 4}
                  />
                </AccordionDetails>
              </Accordion>
              )}

              {documentType === 'cv' && (
              <>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Work Experience</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.workExperience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Experience {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('workExperience', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Company"
                            value={exp.company}
                            onChange={(value) => updateItem('workExperience', index, 'company', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Position"
                            value={exp.position}
                            onChange={(value) => updateItem('workExperience', index, 'position', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Designation"
                            value={exp.designation || ''}
                            onChange={(value) => updateItem('workExperience', index, 'designation', value)}
                            placeholder="e.g., Senior Software Engineer, Manager"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="Start Date"
                            value={formatDate(exp.startDate)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('workExperience', index, 'startDate', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="End Date"
                            value={exp.current ? null : formatDate(exp.endDate)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('workExperience', index, 'endDate', dateStr);
                            }}
                            disabled={exp.current}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" disabled={exp.current} />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={exp.current || false}
                                onChange={(e) => updateItem('workExperience', index, 'current', e.target.checked)}
                              />
                            }
                            label="Currently Working"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Description"
                            value={exp.description}
                            onChange={(value) => updateItem('workExperience', index, 'description', value)}
                            multiline
                            rows={3}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('workExperience')}>
                    Add Experience
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Education</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.education.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Education {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('education', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Institution"
                            value={edu.institution}
                            onChange={(value) => updateItem('education', index, 'institution', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Degree"
                            value={edu.degree}
                            onChange={(value) => updateItem('education', index, 'degree', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Field of Study"
                            value={edu.field || ''}
                            onChange={(value) => updateItem('education', index, 'field', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="Start Date"
                            value={formatDate(edu.startDate)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('education', index, 'startDate', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="End Date"
                            value={formatDate(edu.endDate)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('education', index, 'endDate', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <VoiceInput
                            label="GPA (Optional)"
                            value={edu.gpa || ''}
                            onChange={(value) => updateItem('education', index, 'gpa', value)}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('education')}>
                    Add Education
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Skills</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.skills.map((skill, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Skill Category {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('skills', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Category Name"
                            value={skill.category || ''}
                            onChange={(value) => updateItem('skills', index, 'category', value)}
                            placeholder="e.g., Programming Languages, Design Tools, Soft Skills"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                            Skills in this category:
                          </Typography>
                          {skill.items?.map((item, itemIndex) => (
                            <Box key={itemIndex} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                  <VoiceInput
                                    label="Skill Name"
                                    value={typeof item === 'string' ? item : item.name || ''}
                                    onChange={(value) => {
                                      const items = [...(skill.items || [])];
                                      if (typeof items[itemIndex] === 'string') {
                                        items[itemIndex] = { name: value, level: 'intermediate' };
                                      } else {
                                        items[itemIndex] = { ...items[itemIndex], name: value };
                                      }
                                      updateItem('skills', index, 'items', items);
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <FormControl fullWidth>
                                    <InputLabel>Proficiency Level</InputLabel>
                                    <Select
                                      value={typeof item === 'object' && item.level ? item.level : 'intermediate'}
                                      onChange={(e) => {
                                        const items = [...(skill.items || [])];
                                        if (typeof items[itemIndex] === 'string') {
                                          items[itemIndex] = { name: items[itemIndex], level: e.target.value };
                                        } else {
                                          items[itemIndex] = { ...items[itemIndex], level: e.target.value };
                                        }
                                        updateItem('skills', index, 'items', items);
                                      }}
                                      label="Proficiency Level"
                                    >
                                      <MenuItem value="beginner">Beginner (25%)</MenuItem>
                                      <MenuItem value="intermediate">Intermediate (50%)</MenuItem>
                                      <MenuItem value="advanced">Advanced (75%)</MenuItem>
                                      <MenuItem value="expert">Expert (100%)</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const items = skill.items.filter((_, i) => i !== itemIndex);
                                      updateItem('skills', index, 'items', items);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                                      {typeof item === 'object' && item.level ? 
                                        item.level.charAt(0).toUpperCase() + item.level.slice(1) : 
                                        'Intermediate'}
                                    </Typography>
                                    <Box sx={{ flex: 1, height: 8, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                                      <Box
                                        sx={{
                                          height: '100%',
                                          bgcolor: customization?.headingColor || 'primary.main',
                                          width: typeof item === 'object' && item.level ? 
                                            (item.level === 'beginner' ? '25%' : 
                                             item.level === 'intermediate' ? '50%' : 
                                             item.level === 'advanced' ? '75%' : '100%') : '50%',
                                          transition: 'width 0.3s ease'
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              const items = [...(skill.items || []), { name: '', level: 'intermediate' }];
                              updateItem('skills', index, 'items', items);
                            }}
                            sx={{ mt: 1 }}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('skills')}>
                    Add Skill Category
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Certifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.certifications?.map((cert, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Certification {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('certifications', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Certification Name"
                            value={cert.name || ''}
                            onChange={(value) => updateItem('certifications', index, 'name', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Issuing Organization"
                            value={cert.issuer || ''}
                            onChange={(value) => updateItem('certifications', index, 'issuer', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Date Received"
                            value={formatDate(cert.date)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('certifications', index, 'date', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Expiry Date (Optional)"
                            value={formatDate(cert.expiryDate)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('certifications', index, 'expiryDate', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('certifications')}>
                    Add Certification
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Languages</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.languages?.map((lang, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Language {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('languages', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Language"
                            value={lang.language || ''}
                            onChange={(value) => updateItem('languages', index, 'language', value)}
                            placeholder="e.g., English, Urdu, Spanish"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Proficiency Level</InputLabel>
                            <Select
                              value={lang.proficiency || 'intermediate'}
                              onChange={(e) => updateItem('languages', index, 'proficiency', e.target.value)}
                              label="Proficiency Level"
                            >
                              <MenuItem value="beginner">Beginner</MenuItem>
                              <MenuItem value="intermediate">Intermediate</MenuItem>
                              <MenuItem value="advanced">Advanced</MenuItem>
                              <MenuItem value="native">Native</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('languages')}>
                    Add Language
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Projects</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.projects?.map((project, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Project {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('projects', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Project Name"
                            value={project.name || ''}
                            onChange={(value) => updateItem('projects', index, 'name', value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Description"
                            value={project.description || ''}
                            onChange={(value) => updateItem('projects', index, 'description', value)}
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Technologies (comma separated)"
                            value={Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || '')}
                            onChange={(value) => {
                              const techArray = value.split(',').map(t => t.trim()).filter(t => t);
                              updateItem('projects', index, 'technologies', techArray);
                            }}
                            placeholder="e.g., React, Node.js, MongoDB"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Project Link (Optional)"
                            value={project.link || ''}
                            onChange={(value) => updateItem('projects', index, 'link', value)}
                            placeholder="e.g., https://github.com/username/project"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('projects')}>
                    Add Project
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Hobbies & Interests</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Add your hobbies and interests (comma separated or one per line)
                    </Typography>
                    <VoiceInput
                      label="Hobbies"
                      value={cv.hobbies?.join(', ') || ''}
                      onChange={(value) => {
                        const hobbiesArray = value.split(',').map(h => h.trim()).filter(h => h);
                        updateField('hobbies', hobbiesArray);
                      }}
                      multiline
                      rows={3}
                      placeholder="e.g., Reading, Photography, Traveling, Coding"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                    <Typography variant="h6">References</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.references?.map((ref, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Reference {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('references', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Name"
                            value={ref.name || ''}
                            onChange={(value) => updateItem('references', index, 'name', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Job Title"
                            value={ref.jobTitle || ''}
                            onChange={(value) => updateItem('references', index, 'jobTitle', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Company/Organization"
                            value={ref.company || ''}
                            onChange={(value) => updateItem('references', index, 'company', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Email"
                            value={ref.email || ''}
                            onChange={(value) => updateItem('references', index, 'email', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Phone"
                            value={ref.phone || ''}
                            onChange={(value) => updateItem('references', index, 'phone', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Relationship"
                            value={ref.relationship || ''}
                            onChange={(value) => updateItem('references', index, 'relationship', value)}
                            placeholder="e.g., Manager, Colleague, Professor"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('references')}>
                    Add Reference
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ fontSize: 20 }} />
                    <Typography variant="h6">Awards & Honors</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {cv.awards?.map((award, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Award {index + 1}</Typography>
                        <Button size="small" color="error" onClick={() => removeItem('awards', index)}>
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Award Name"
                            value={award.name || ''}
                            onChange={(value) => updateItem('awards', index, 'name', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Issuing Organization"
                            value={award.organization || ''}
                            onChange={(value) => updateItem('awards', index, 'organization', value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Date Received"
                            value={formatDate(award.date)}
                            onChange={(newValue) => {
                              const dateStr = formatDateString(newValue);
                              updateItem('awards', index, 'date', dateStr);
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <VoiceInput
                            label="Category"
                            value={award.category || ''}
                            onChange={(value) => updateItem('awards', index, 'category', value)}
                            placeholder="e.g., Academic, Professional, Sports"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <VoiceInput
                            label="Description"
                            value={award.description || ''}
                            onChange={(value) => updateItem('awards', index, 'description', value)}
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => addItem('awards')}>
                    Add Award
                  </Button>
                </AccordionDetails>
              </Accordion>
              </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <CVCustomization customization={customization} onChange={setCustomization} documentType={documentType} />
              <ATSScoreChecker cvContent={cv} documentType={documentType} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Template Selector Dialog */}
      <CVTemplateSelector
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={(selected) => {
          if (selected) {
            setTemplate(selected);
            setCv(prev => ({ ...prev, template: selected }));
            setTemplateDialogOpen(false);
          }
        }}
        selectedTemplate={template}
        documentType={documentType}
      />

      {/* CV Preview Dialog */}
      <CVPreview
        cv={cv}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={template}
        customization={customization}
      />
    </Box>
    </LocalizationProvider>
  );
};

export default CVEditor;

