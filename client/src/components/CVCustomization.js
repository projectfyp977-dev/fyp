import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';

const fonts = [
  'Inter',
  'Roboto',
  'Poppins',
  'Lato',
  'Open Sans',
  'Montserrat',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
];

const CVCustomization = ({ customization, onChange, documentType = 'cv' }) => {
  const [localCustomization, setLocalCustomization] = useState(customization || {
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

  const updateCustomization = (key, value) => {
    const updated = { ...localCustomization, [key]: value };
    setLocalCustomization(updated);
    onChange(updated);
  };

  const updateSection = (sectionKey, field, value) => {
    const updated = {
      ...localCustomization,
      sections: {
        ...localCustomization.sections,
        [sectionKey]: {
          ...localCustomization.sections[sectionKey],
          [field]: value,
        },
      },
    };
    setLocalCustomization(updated);
    onChange(updated);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <PaletteIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Customize Design
        </Typography>
      </Box>

      {/* Font Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormatSizeIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Typography
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={localCustomization.fontFamily}
                  onChange={(e) => updateCustomization('fontFamily', e.target.value)}
                  label="Font Family"
                >
                  {fonts.map((font) => (
                    <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Font Size: {localCustomization.fontSize}px</Typography>
              <Slider
                value={localCustomization.fontSize}
                onChange={(e, value) => updateCustomization('fontSize', value)}
                min={10}
                max={18}
                step={1}
                marks
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Line Spacing: {localCustomization.lineSpacing}</Typography>
              <Slider
                value={localCustomization.lineSpacing}
                onChange={(e, value) => updateCustomization('lineSpacing', value)}
                min={1}
                max={2.5}
                step={0.1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 1.5, label: '1.5' },
                  { value: 2, label: '2' },
                  { value: 2.5, label: '2.5' },
                ]}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Colors */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Colors
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Heading / Accent Color</Typography>
              <input
                type="color"
                value={localCustomization.headingColor}
                onChange={(e) => updateCustomization('headingColor', e.target.value)}
                style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Text Color</Typography>
              <input
                type="color"
                value={localCustomization.textColor}
                onChange={(e) => updateCustomization('textColor', e.target.value)}
                style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </Grid>
            {(documentType === 'visiting-card' || documentType === 'poster') && (
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Background Color</Typography>
              <input
                type="color"
                value={localCustomization.backgroundColor || (documentType === 'visiting-card' ? '#2563eb' : '#0d9488')}
                onChange={(e) => updateCustomization('backgroundColor', e.target.value)}
                style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid #ddd' }}
              />
            </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Layout - only for CV */}
      {documentType === 'cv' && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewColumnIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Layout
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Page Layout</InputLabel>
                <Select
                  value={localCustomization.layout}
                  onChange={(e) => updateCustomization('layout', e.target.value)}
                  label="Page Layout"
                >
                  <MenuItem value="single-column">Single Column</MenuItem>
                  <MenuItem value="two-column">Two Column</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Margins: {localCustomization.margins}mm</Typography>
              <Slider
                value={localCustomization.margins}
                onChange={(e, value) => updateCustomization('margins', value)}
                min={10}
                max={40}
                step={5}
                marks
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      )}

      {/* Section Control - only for CV */}
      {documentType === 'cv' && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Section Control
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(localCustomization.sections).map(([key, section]) => (
              <Box key={key} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={section.enabled}
                        onChange={(e) => updateSection(key, 'enabled', e.target.checked)}
                      />
                    }
                    label={section.title}
                  />
                </Box>
                {section.enabled && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Section Title"
                    value={section.title}
                    onChange={(e) => updateSection(key, 'title', e.target.value)}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      )}

      {/* Advanced Options - only for CV */}
      {documentType === 'cv' && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BorderColorIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Advanced Options
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Heading Font Size</Typography>
              <Slider
                value={localCustomization.headingFontSize || 18}
                onChange={(e, value) => updateCustomization('headingFontSize', value)}
                min={14}
                max={28}
                step={1}
                marks
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Section Spacing</Typography>
              <Slider
                value={localCustomization.sectionSpacing || 24}
                onChange={(e, value) => updateCustomization('sectionSpacing', value)}
                min={12}
                max={48}
                step={4}
                marks
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.showIcons !== false}
                    onChange={(e) => updateCustomization('showIcons', e.target.checked)}
                  />
                }
                label="Show Section Icons"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.showDividers !== false}
                    onChange={(e) => updateCustomization('showDividers', e.target.checked)}
                  />
                }
                label="Show Section Dividers"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.compactMode === true}
                    onChange={(e) => updateCustomization('compactMode', e.target.checked)}
                  />
                }
                label="Compact Mode"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.showPhoto !== false}
                    onChange={(e) => updateCustomization('showPhoto', e.target.checked)}
                  />
                }
                label="Show Profile Photo"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      )}

      {/* Text Alignment - only for CV */}
      {documentType === 'cv' && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormatAlignLeftIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Text Alignment & Formatting
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Header Alignment</InputLabel>
                <Select
                  value={localCustomization.headerAlignment || 'left'}
                  onChange={(e) => updateCustomization('headerAlignment', e.target.value)}
                  label="Header Alignment"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Text Alignment</InputLabel>
                <Select
                  value={localCustomization.textAlignment || 'left'}
                  onChange={(e) => updateCustomization('textAlignment', e.target.value)}
                  label="Text Alignment"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.boldHeadings === true}
                    onChange={(e) => updateCustomization('boldHeadings', e.target.checked)}
                  />
                }
                label="Bold Section Headings"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localCustomization.uppercaseHeadings === false}
                    onChange={(e) => updateCustomization('uppercaseHeadings', e.target.checked)}
                  />
                }
                label="Uppercase Headings"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            const reset = {
              fontFamily: 'Inter',
              fontSize: 14,
              headingColor: '#6366f1',
              textColor: '#1e293b',
              layout: 'single-column',
              lineSpacing: 1.5,
              margins: 20,
              sections: localCustomization.sections,
              ...(documentType === 'visiting-card' || documentType === 'poster' ? { backgroundColor: '' } : {}),
            };
            setLocalCustomization(reset);
            onChange(reset);
          }}
        >
          Reset to Default
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            // Apply customization immediately
            onChange(localCustomization);
            alert('Customization applied! Check preview to see changes.');
          }}
        >
          Apply Changes
        </Button>
      </Box>
    </Paper>
  );
};

export default CVCustomization;
