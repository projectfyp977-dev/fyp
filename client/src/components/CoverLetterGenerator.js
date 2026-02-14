import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getApiUrl } from '../utils/apiUrl';
import axios from 'axios';

const CoverLetterGenerator = ({ cvContent }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!cvContent) {
      setError('Please fill your CV details first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${getApiUrl()}/ai/cover-letter`,
        {
          cvContent,
          jobTitle,
          companyName,
          jobDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      setCoverLetter(response.data.coverLetter || '');
    } catch (err) {
      console.error('Cover letter error:', err);
      let msg = 'Failed to generate cover letter.';
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        msg = 'Network error. Please check that the backend server is running.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter).then(
      () => {
        alert('Cover letter copied to clipboard.');
      },
      () => {
        alert('Failed to copy. You can copy manually from the text area.');
      }
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Cover Letter Generator
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generate a professional cover letter automatically from your CV and job details.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Job Title (e.g. Frontend Developer)"
        fullWidth
        size="small"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        sx={{ mb: 1.5 }}
      />
      <TextField
        label="Company Name (optional)"
        fullWidth
        size="small"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        sx={{ mb: 1.5 }}
      />
      <TextField
        label="Job Description (paste from job post, optional but recommended)"
        fullWidth
        multiline
        minRows={3}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleGenerate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : <DescriptionIcon />}
          sx={{ fontWeight: 600 }}
        >
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleCopy}
          disabled={!coverLetter}
          startIcon={<ContentCopyIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Copy
        </Button>
      </Box>

      {coverLetter && (
        <TextField
          label="Generated Cover Letter"
          fullWidth
          multiline
          minRows={8}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      )}
    </Paper>
  );
};

export default CoverLetterGenerator;

