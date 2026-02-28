import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';
import { exportCVToPDF } from '../utils/pdfExport';
import { exportCVToDOCX } from '../utils/docxExport';
import CVPreview from '../components/CVPreview';

const Dashboard = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCv, setSelectedCv] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCv, setPreviewCv] = useState(null);
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/cv`);
      setCvs(response.data);
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      try {
        await axios.delete(`${getApiUrl()}/cv/${id}`);
        setCvs(cvs.filter(cv => (cv.id || cv._id) !== id));
      } catch (error) {
        console.error('Error deleting CV:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete CV';
        alert(`Failed to delete CV: ${errorMessage}`);
      }
    }
    handleCloseMenu();
  };

  const handleDuplicate = async (cv) => {
    try {
      const cvData = { ...cv };
      delete cvData.id;
      delete cvData._id;
      cvData.title = `${cv.title} (Copy)`;
      const response = await axios.post(`${getApiUrl()}/cv`, cvData);
      fetchCVs();
      navigate(`/cv/${response.data.id || response.data._id}`);
    } catch (error) {
      console.error('Error duplicating CV:', error);
      alert('Failed to duplicate CV');
    }
    handleCloseMenu();
  };

  const handleMenuOpen = (event, cv) => {
    setAnchorEl(event.currentTarget);
    setSelectedCv(cv);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCv(null);
  };

  const documentTypes = [
    { value: 'cv', label: 'CV / Resume', desc: 'ATS-optimized CV' },
    { value: 'visiting-card', label: 'Visiting Card', desc: 'ATS-friendly visiting card' },
    { value: 'poster', label: 'Poster', desc: 'ATS-optimized poster' },
    { value: 'biographics', label: 'Biographics', desc: 'ATS-friendly biography' },
  ];

  const handleCreateNew = (documentType) => {
    setCreateMenuAnchor(null);
    navigate('/cv/new', { state: { documentType: documentType || 'cv' } });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadPDF = async (cv) => {
    setPreviewCv(cv);
    setPreviewOpen(true);
    // Wait for dialog to render, then export
    setTimeout(async () => {
      const cvElement = document.getElementById('cv-preview-content');
      if (cvElement) {
        const result = await exportCVToPDF(cvElement, cv?.title || 'CV');
        if (result.success) {
          // Close preview after successful export
          setTimeout(() => {
            setPreviewOpen(false);
            setPreviewCv(null);
          }, 500);
        } else {
          alert('Failed to download PDF: ' + result.error);
          setPreviewOpen(false);
          setPreviewCv(null);
        }
      } else {
        setPreviewOpen(false);
        setPreviewCv(null);
      }
    }, 1000);
  };

  const handleDownloadDOCX = async (cv) => {
    const result = await exportCVToDOCX(cv, cv?.title || 'CV');
    if (result.success) {
      alert('DOCX downloaded successfully!');
    } else {
      alert('Failed to download DOCX: ' + result.error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
          borderBottom: 'none',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1.5, minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.35rem',
                boxShadow: 1,
              }}
            >
              A
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              ATS CV Builder
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<AccountCircleIcon sx={{ color: 'white !important' }} />}
              label={user?.name || 'User'}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            gutterBottom
            sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}
          >
            My Documents
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            Create, optimize, and download ATS-friendly CVs, visiting cards, posters & biographics with built-in scoring and AI suggestions.
          </Typography>
        </Box>

        {cvs.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              p: 6,
              bgcolor: 'white',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <AddIcon sx={{ fontSize: 44, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first CV, visiting card, poster or biographic — all ATS-optimized
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleCreateNew('cv')}
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              Create Your First Document
            </Button>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {documentTypes.map((dt) => (
                <Button
                  key={dt.value}
                  variant="outlined"
                  size="small"
                  onClick={() => handleCreateNew(dt.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {dt.label}
                </Button>
              ))}
            </Box>
          </Card>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => setCreateMenuAnchor(e.currentTarget)}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)' }
                }}
              >
                Create New
              </Button>
              <Menu
                anchorEl={createMenuAnchor}
                open={Boolean(createMenuAnchor)}
                onClose={() => setCreateMenuAnchor(null)}
                PaperProps={{ sx: { minWidth: 220, borderRadius: 2, mt: 1.5 } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {documentTypes.map((dt) => (
                  <MenuItem
                    key={dt.value}
                    onClick={() => handleCreateNew(dt.value)}
                    sx={{ py: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={600}>{dt.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{dt.desc}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Grid container spacing={3}>
              {cvs.map((cv) => {
                const cvId = cv.id || cv._id;
                return (
                  <Grid item xs={12} sm={6} md={4} key={cvId}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
                          borderColor: 'primary.light',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 6,
                          background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', pr: 1, lineHeight: 1.3 }}>
                            {cv.title || 'Untitled CV'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, cv)}
                            sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                          Updated {new Date(cv.updatedAt).toLocaleDateString()}
                          {(cv.documentType && cv.documentType !== 'cv') && ` • ${cv.documentType === 'visiting-card' ? 'Visiting Card' : cv.documentType === 'poster' ? 'Poster' : cv.documentType === 'biographics' ? 'Biographics' : cv.documentType}`}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {(cv.documentType && cv.documentType !== 'cv') && (
                            <Chip label={cv.documentType === 'visiting-card' ? 'Visiting Card' : cv.documentType === 'poster' ? 'Poster' : cv.documentType === 'biographics' ? 'Biographics' : cv.documentType} size="small" sx={{ borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.dark' }} />
                          )}
                          {cv.personalInfo?.fullName && (
                            <Chip label={cv.personalInfo.fullName} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                          )}
                          {cv.personalInfo?.jobTitle && (
                            <Chip label={cv.personalInfo.jobTitle} size="small" sx={{ borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.dark' }} />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/cv/${cvId}`)}
                          variant="contained"
                          sx={{ flex: 1, borderRadius: 2, py: 1, fontWeight: 600 }}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPDF(cv)}
                          sx={{ 
                            color: 'error.main',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'error.light', color: 'white' }
                          }}
                          title="Download PDF"
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadDOCX(cv)}
                          sx={{ 
                            color: 'info.main',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'info.light', color: 'white' }
                          }}
                          title="Download DOCX"
                        >
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => {
          setCreateMenuAnchor(null);
          navigate('/cv/new', { state: { documentType: 'cv' } });
        }}
      >
        <AddIcon />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => selectedCv && navigate(`/cv/${selectedCv.id || selectedCv._id}`)}>
          <EditIcon sx={{ mr: 2 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedCv && handleDuplicate(selectedCv)}>
          <FileCopyIcon sx={{ mr: 2 }} fontSize="small" />
          Duplicate
        </MenuItem>
        <MenuItem 
          onClick={() => selectedCv && handleDelete(selectedCv.id || selectedCv._id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Preview Dialog for PDF Export */}
      {previewCv && (
        <CVPreview
          cv={previewCv}
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewCv(null);
          }}
          template={previewCv.template || 'modern'}
          customization={previewCv.customization}
        />
      )}
    </Box>
  );
};

export default Dashboard;
