import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const templates = {
  all: [
    { id: 'ats-simple', name: 'ATS Simple', description: 'Single-column, clean ATS-friendly layout', category: 'ATS', color: '#0f766e', preview: 'ats-simple' },
    { id: 'ats-sidebar', name: 'ATS Sidebar', description: 'Left sidebar for contact & skills, ATS-safe structure', category: 'ATS', color: '#2563eb', preview: 'ats-sidebar' },
    { id: 'ats-card', name: 'ATS Card', description: 'Section cards with clear headings for ATS parsing', category: 'ATS', color: '#7c3aed', preview: 'ats-card' },
  ],
  cv: [
    { id: 'ats-simple', name: 'ATS Simple', description: 'Single-column, clean ATS-friendly layout', category: 'ATS', color: '#0f766e', preview: 'ats-simple' },
    { id: 'ats-sidebar', name: 'ATS Sidebar', description: 'Left sidebar for contact & skills, ATS-safe structure', category: 'ATS', color: '#2563eb', preview: 'ats-sidebar' },
    { id: 'ats-card', name: 'ATS Card', description: 'Section cards with clear headings for ATS parsing', category: 'ATS', color: '#7c3aed', preview: 'ats-card' },
  ],
  'visiting-card': [
    { id: 'vc-minimal', name: 'ATS Minimal Card', description: 'Clean, ATS-friendly visiting card', category: 'ATS', color: '#059669', preview: 'vc-minimal' },
    { id: 'vc-professional', name: 'ATS Professional', description: 'Professional layout for business cards', category: 'ATS', color: '#2563eb', preview: 'vc-professional' },
    { id: 'vc-modern', name: 'ATS Modern', description: 'Modern design with clear structure', category: 'ATS', color: '#7c3aed', preview: 'vc-modern' },
  ],
  poster: [
    { id: 'poster-ats-clean', name: 'ATS Clean Poster', description: 'Clean, ATS-optimized poster layout', category: 'ATS', color: '#dc2626', preview: 'poster-clean' },
    { id: 'poster-ats-bold', name: 'ATS Bold Poster', description: 'Bold sections for easy parsing', category: 'ATS', color: '#ea580c', preview: 'poster-bold' },
    { id: 'poster-ats-elegant', name: 'ATS Elegant', description: 'Elegant poster with ATS structure', category: 'ATS', color: '#4f46e5', preview: 'poster-elegant' },
  ],
  biographics: [
    { id: 'bio-ats-simple', name: 'ATS Simple Bio', description: 'Clean biography layout', category: 'ATS', color: '#0f766e', preview: 'ats-simple' },
    { id: 'bio-ats-narrative', name: 'ATS Narrative', description: 'Story-style with clear sections', category: 'ATS', color: '#7c3aed', preview: 'ats-sidebar' },
    { id: 'bio-ats-card', name: 'ATS Bio Card', description: 'Card-style biography', category: 'ATS', color: '#2563eb', preview: 'ats-card' },
  ],
};

const TemplatePreview = ({ template }) => {
  const previews = {
    'ats-simple': (
      <Box sx={{ p: 2, bgcolor: '#0f766e', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ width: '80%', height: 10, bgcolor: 'white', borderRadius: 1, mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '100%', height: 2, bgcolor: 'rgba(255,255,255,0.7)', mb: 1 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.9)', mb: 0.5 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.9)', mb: 0.5 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.9)' }} />
      </Box>
    ),
    'ats-sidebar': (
      <Box sx={{ p: 1, bgcolor: '#2563eb', borderRadius: 2, height: '100%', display: 'flex', gap: 0.75 }}>
        <Box sx={{ flex: '0 0 32%', bgcolor: 'rgba(15,23,42,0.5)', borderRadius: 1, p: 1 }}>
          <Box sx={{ width: '80%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 1, mx: 'auto' }} />
          <Box sx={{ width: '90%', height: 3, bgcolor: 'rgba(148,163,184,0.9)', borderRadius: 1, mb: 0.5, mx: 'auto' }} />
          <Box sx={{ width: '90%', height: 2, bgcolor: 'rgba(148,163,184,0.7)', borderRadius: 1, mb: 0.25, mx: 'auto' }} />
          <Box sx={{ width: '90%', height: 2, bgcolor: 'rgba(148,163,184,0.7)', borderRadius: 1, mb: 0.25, mx: 'auto' }} />
        </Box>
        <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 1, p: 1.25 }}>
          <Box sx={{ width: '70%', height: 4, bgcolor: '#2563eb', borderRadius: 1, mb: 0.75 }} />
          <Box sx={{ width: '100%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.25 }} />
          <Box sx={{ width: '95%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.25 }} />
          <Box sx={{ width: '90%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    'ats-card': (
      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ bgcolor: '#7c3aed', borderRadius: 1.5, p: 1.25 }}>
          <Box sx={{ width: '60%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '40%', height: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
          <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 0.75 }}>
            <Box sx={{ width: '80%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.25 }} />
            <Box sx={{ width: '70%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1 }} />
          </Box>
          <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 0.75 }}>
            <Box sx={{ width: '80%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.25 }} />
            <Box sx={{ width: '70%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1 }} />
          </Box>
        </Box>
      </Box>
    ),
    'vc-minimal': (
      <Box sx={{ p: 1.5, bgcolor: '#059669', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
        <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'white', mx: 'auto' }} />
        <Box sx={{ width: '90%', height: 4, bgcolor: 'white', borderRadius: 1, mx: 'auto' }} />
        <Box sx={{ width: '70%', height: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mx: 'auto' }} />
      </Box>
    ),
    'vc-professional': (
      <Box sx={{ p: 1.5, bgcolor: '#2563eb', borderRadius: 2, height: '100%', display: 'flex', gap: 1 }}>
        <Box sx={{ width: 40, height: 40, bgcolor: 'white', borderRadius: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ width: '100%', height: 4, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '80%', height: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    'vc-modern': (
      <Box sx={{ p: 1.5, borderRadius: 2, height: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
        <Box sx={{ width: '85%', height: 5, bgcolor: 'white', borderRadius: 1, mx: 'auto' }} />
        <Box sx={{ width: '60%', height: 3, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1, mx: 'auto' }} />
      </Box>
    ),
    'poster-clean': (
      <Box sx={{ p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, height: '100%', border: '2px solid #dc2626' }}>
        <Box sx={{ width: '100%', height: 8, bgcolor: '#dc2626', borderRadius: 1, mb: 1 }} />
        <Box sx={{ width: '90%', height: 4, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.5 }} />
        <Box sx={{ width: '80%', height: 4, bgcolor: '#e5e7eb', borderRadius: 1 }} />
      </Box>
    ),
    'poster-bold': (
      <Box sx={{ p: 1.5, bgcolor: '#ea580c', borderRadius: 0, height: '100%', border: '3px solid white' }}>
        <Box sx={{ width: '100%', height: 10, bgcolor: 'white', mb: 1 }} />
        <Box sx={{ width: '70%', height: 4, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }} />
      </Box>
    ),
    'poster-elegant': (
      <Box sx={{ p: 1.5, bgcolor: '#4f46e5', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ width: '50%', height: 6, bgcolor: 'white', borderRadius: 1, mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '100%', height: 2, bgcolor: 'rgba(255,255,255,0.5)', mb: 0.5 }} />
        <Box sx={{ width: '85%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mx: 'auto' }} />
      </Box>
    ),
    // Fallback (not really used now, but keeps default safe)
    modern: (
      <Box sx={{ p: 2, bgcolor: template.color, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ width: '100%', height: 12, bgcolor: 'white', borderRadius: 1 }} />
        <Box sx={{ width: '70%', height: 8, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        <Box sx={{ width: '60%', height: 8, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
          <Box sx={{ width: 25, height: 25, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
          <Box sx={{ width: 25, height: 25, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    classic: (
      <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 0, height: '100%', border: '2px solid #1e293b' }}>
        <Box sx={{ width: '100%', height: 14, bgcolor: 'white', mb: 1 }} />
        <Box sx={{ width: '100%', height: 2, bgcolor: '#1e293b', mb: 1 }} />
        <Box sx={{ width: '80%', height: 6, bgcolor: '#e5e7eb', mb: 0.5 }} />
        <Box sx={{ width: '70%', height: 6, bgcolor: '#e5e7eb', mb: 0.5 }} />
      </Box>
    ),
    creative: (
      <Box sx={{ p: 2, bgcolor: template.color, borderRadius: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
        <Box sx={{ width: '60%', height: 10, bgcolor: 'white', borderRadius: 2, mb: 1 }} />
        <Box sx={{ width: '80%', height: 6, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mb: 0.5 }} />
        <Box sx={{ width: '50%', height: 6, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
      </Box>
    ),
    minimal: (
      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, height: '100%', border: '1px solid #e5e7eb' }}>
        <Box sx={{ width: '50%', height: 8, bgcolor: '#64748b', mx: 'auto', mb: 2 }} />
        <Box sx={{ width: '100%', height: 1, bgcolor: '#e5e7eb', mb: 1 }} />
        <Box sx={{ width: '70%', height: 5, bgcolor: '#f1f5f9', mb: 0.5 }} />
        <Box sx={{ width: '60%', height: 5, bgcolor: '#f1f5f9', mb: 0.5 }} />
      </Box>
    ),
    it: (
      <Box sx={{ p: 2, bgcolor: '#3b82f6', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ width: '100%', height: 10, bgcolor: 'white', borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Box sx={{ flex: 1, height: 40, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
          <Box sx={{ flex: 1, height: 40, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
        </Box>
        <Box sx={{ width: '80%', height: 6, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
      </Box>
    ),
    marketing: (
      <Box sx={{ p: 2, bgcolor: '#f59e0b', borderRadius: 2, height: '100%', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 5, right: 5, width: 30, height: 30, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
        <Box sx={{ width: '70%', height: 10, bgcolor: 'white', borderRadius: 2, mb: 1 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1, mb: 0.5 }} />
        <Box sx={{ width: '90%', height: 4, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
      </Box>
    ),
    designer: (
      <Box sx={{ p: 2, bgcolor: '#8b5cf6', borderRadius: 3, height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1 }}>
          <Box sx={{ width: '100%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '70%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1 }}>
          <Box sx={{ width: '100%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '70%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    student: (
      <Box sx={{ p: 2, bgcolor: '#10b981', borderRadius: 2, height: '100%', border: '3px solid white' }}>
        <Box sx={{ width: '60%', height: 8, bgcolor: 'white', borderRadius: 1, mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '100%', height: 2, bgcolor: 'white', mb: 1 }} />
        <Box sx={{ width: '80%', height: 5, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mb: 0.5 }} />
        <Box sx={{ width: '70%', height: 5, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
      </Box>
    ),
    manager: (
      <Box sx={{ p: 2, bgcolor: '#ef4444', borderRadius: 1, height: '100%', border: '4px solid white' }}>
        <Box sx={{ width: '100%', height: 12, bgcolor: 'white', mb: 1 }} />
        <Box sx={{ width: '100%', height: 3, bgcolor: '#ef4444', mb: 1 }} />
        <Box sx={{ width: '85%', height: 5, bgcolor: '#fecaca', mb: 0.5 }} />
        <Box sx={{ width: '75%', height: 5, bgcolor: '#fecaca' }} />
      </Box>
    ),
    ats: (
      <Box sx={{ p: 2, borderRadius: 1, height: '100%', bgcolor: 'white', border: '2px solid #06b6d4' }}>
        <Box sx={{ width: '100%', height: 10, bgcolor: '#06b6d4', mb: 1 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: '#e0f2fe', mb: 0.5 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: '#e0f2fe', mb: 0.5 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: '#e0f2fe' }} />
      </Box>
    ),
    twocolumn: (
      <Box sx={{ p: 1, bgcolor: '#6366f1', borderRadius: 2, height: '100%', display: 'flex', gap: 1 }}>
        <Box sx={{ flex: '0 0 30%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, p: 1 }}>
          <Box sx={{ width: '100%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '80%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
        <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1 }}>
          <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '90%', height: 4, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    colorful: (
      <Box sx={{ p: 2, borderRadius: 2, height: '100%', background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}>
        <Box sx={{ width: '70%', height: 8, bgcolor: 'white', borderRadius: 2, mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }} />
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }} />
          <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }} />
        </Box>
        <Box sx={{ width: '80%', height: 5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
      </Box>
    ),
    elegant: (
      <Box sx={{ p: 2, bgcolor: '#6b7280', borderRadius: 1, height: '100%', border: '1px solid #374151' }}>
        <Box sx={{ width: '50%', height: 10, bgcolor: 'white', mx: 'auto', mb: 2 }} />
        <Box sx={{ width: '100%', height: 1, bgcolor: '#9ca3af', mb: 1 }} />
        <Box sx={{ width: '75%', height: 4, bgcolor: '#e5e7eb', mb: 0.5 }} />
        <Box sx={{ width: '65%', height: 4, bgcolor: '#e5e7eb' }} />
      </Box>
    ),
    bold: (
      <Box sx={{ p: 2, bgcolor: '#dc2626', borderRadius: 0, height: '100%', border: '5px solid white' }}>
        <Box sx={{ width: '100%', height: 14, bgcolor: 'white', mb: 1 }} />
        <Box sx={{ width: '100%', height: 4, bgcolor: '#dc2626', mb: 1 }} />
        <Box sx={{ width: '90%', height: 5, bgcolor: '#fee2e2', mb: 0.5 }} />
        <Box sx={{ width: '80%', height: 5, bgcolor: '#fee2e2' }} />
      </Box>
    ),
    academic: (
      <Box sx={{ p: 2, borderRadius: 1, height: '100%', bgcolor: 'white', border: '2px solid #1e40af' }}>
        <Box sx={{ width: '100%', height: 2, bgcolor: '#1e40af', mb: 1 }} />
        <Box sx={{ width: '60%', height: 8, bgcolor: '#1e40af', mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '100%', height: 1, bgcolor: '#93c5fd', mb: 1 }} />
        <Box sx={{ width: '85%', height: 4, bgcolor: '#dbeafe', mb: 0.5 }} />
        <Box sx={{ width: '75%', height: 4, bgcolor: '#dbeafe' }} />
      </Box>
    ),
    sidebar: (
      <Box sx={{ p: 1, borderRadius: 1, height: '100%', display: 'flex', gap: 0.5 }}>
        <Box sx={{ width: '35%', bgcolor: '#2563eb', borderRadius: 1, p: 1 }}>
          <Box sx={{ width: '80%', height: 6, bgcolor: 'white', borderRadius: 1, mb: 0.5, mx: 'auto' }} />
          <Box sx={{ width: '60%', height: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mx: 'auto', mb: 1 }} />
          <Box sx={{ width: '90%', height: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1, mx: 'auto', mb: 0.5 }} />
          <Box sx={{ width: '90%', height: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1, mx: 'auto' }} />
        </Box>
        <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 1, p: 1 }}>
          <Box sx={{ width: '100%', height: 4, bgcolor: '#2563eb', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '90%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1, mb: 0.5 }} />
          <Box sx={{ width: '85%', height: 3, bgcolor: '#e5e7eb', borderRadius: 1 }} />
        </Box>
      </Box>
    ),
    centered: (
      <Box sx={{ p: 2, borderRadius: 1, height: '100%', bgcolor: 'white', textAlign: 'center' }}>
        <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: '#1e293b', mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '60%', height: 4, bgcolor: '#1e293b', mx: 'auto', mb: 0.5 }} />
        <Box sx={{ width: '40%', height: 3, bgcolor: '#64748b', mx: 'auto', mb: 2 }} />
        <Box sx={{ width: '70%', height: 2, bgcolor: '#e5e7eb', mx: 'auto', mb: 1 }} />
        <Box sx={{ width: '50%', height: 3, bgcolor: '#f1f5f9', mx: 'auto', mb: 0.5 }} />
        <Box sx={{ width: '50%', height: 3, bgcolor: '#f1f5f9', mx: 'auto' }} />
      </Box>
    ),
    card: (
      <Box sx={{ p: 1.5, borderRadius: 1, height: '100%', bgcolor: '#f8fafc' }}>
        <Box sx={{ bgcolor: '#8b5cf6', borderRadius: 1, p: 1, mb: 0.5 }}>
          <Box sx={{ width: '70%', height: 4, bgcolor: 'white', borderRadius: 1, mx: 'auto', mb: 0.5 }} />
          <Box sx={{ width: '50%', height: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, mx: 'auto' }} />
        </Box>
        <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 0.75, mb: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Box sx={{ width: '100%', height: 2, bgcolor: '#8b5cf6', borderRadius: 0.5, mb: 0.5 }} />
          <Box sx={{ width: '90%', height: 2, bgcolor: '#e5e7eb', borderRadius: 0.5 }} />
        </Box>
        <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 0.75, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Box sx={{ width: '100%', height: 2, bgcolor: '#8b5cf6', borderRadius: 0.5, mb: 0.5 }} />
          <Box sx={{ width: '85%', height: 2, bgcolor: '#e5e7eb', borderRadius: 0.5 }} />
        </Box>
      </Box>
    ),
  };

  return previews[template.preview] || previews.modern;
};

const CVTemplateSelector = ({ open, onClose, onSelect, selectedTemplate, documentType = 'cv' }) => {
  const [category, setCategory] = React.useState('all');

  const templateList = templates[documentType] || templates.cv || templates.all;
  const categories = ['all', 'ATS'];
  const filteredTemplates = category === 'all'
    ? templateList
    : templateList.filter(t => t.category === 'ATS');

  const docTypeLabel = documentType === 'cv' ? 'CV' : documentType === 'visiting-card' ? 'Visiting Card' : documentType === 'poster' ? 'Poster' : 'Biographics';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Choose {docTypeLabel} Template
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          All templates are ATS-optimized for best results
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={category}
            onChange={(e, newValue) => setCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((cat) => (
              <Tab key={cat} label={cat} value={cat} />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate === template.id ? 3 : 1,
                  borderColor: selectedTemplate === template.id ? template.color : 'divider',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: template.color,
                    boxShadow: `0 8px 24px ${template.color}40`,
                  },
                }}
                onClick={() => onSelect(template.id)}
              >
                {selectedTemplate === template.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: template.color,
                        fontSize: 32,
                        bgcolor: 'white',
                        borderRadius: '50%',
                      }}
                    />
                  </Box>
                )}
                <Box sx={{ height: 180, p: 1 }}>
                  <TemplatePreview template={template} />
                </Box>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {template.name}
                    </Typography>
                    <Chip
                      label={template.category}
                      size="small"
                      sx={{
                        bgcolor: `${template.color}15`,
                        color: template.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Chip
                    label="Free"
                    size="small"
                    sx={{
                      bgcolor: `${template.color}15`,
                      color: template.color,
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedTemplate) {
                onSelect(selectedTemplate);
                onClose();
              }
            }}
            variant="contained"
            disabled={!selectedTemplate}
          >
            Use Template
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CVTemplateSelector;
