import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getApiUrl } from '../utils/apiUrl';
import axios from 'axios';

const ATSScoreChecker = ({ cvContent, documentType = 'cv' }) => {
  const title = documentType === 'cv' ? 'ATS Score Checker' : documentType === 'visiting-card' ? 'Visiting Card ATS' : documentType === 'poster' ? 'Poster ATS' : 'Biographics ATS';
  const description = documentType === 'cv'
    ? "Check your CV's compatibility with Applicant Tracking Systems (ATS). Get a score and specific improvement suggestions."
    : documentType === 'visiting-card'
    ? 'Check your visiting card for clarity and contact completeness.'
    : documentType === 'poster'
    ? 'Check your poster for readability and impact.'
    : 'Check your biographics for clarity and structure.';
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyzeATS = async () => {
    if (!cvContent) {
      setError('Please fill in some CV content first');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${getApiUrl()}/ats/analyze`,
        { cvContent: cvContent, documentType },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('ATS Analysis error:', error);
      let errorMsg = 'Failed to analyze CV for ATS compatibility';
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMsg = 'Network error. Please check backend server is running.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ErrorIcon fontSize="small" />;
      case 'medium': return <WarningIcon fontSize="small" />;
      default: return <CheckCircleIcon fontSize="small" />;
    }
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
        <AssessmentIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!analysis && (
        <Button
          variant="contained"
          fullWidth
          onClick={analyzeATS}
          disabled={loading}
          sx={{ py: 1.5, fontWeight: 600 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Analyzing...
            </>
          ) : (
            'Check ATS Score'
          )}
        </Button>
      )}

      {analysis && (
        <Box>
          {/* Overall Score */}
          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              bgcolor: `${getScoreColor(analysis.overallScore)}15`,
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="h3" fontWeight={700} sx={{ color: getScoreColor(analysis.overallScore), mb: 1 }}>
              {analysis.overallScore}%
            </Typography>
            <Typography variant="h6" sx={{ color: getScoreColor(analysis.overallScore), mb: 2 }}>
              {getScoreLabel(analysis.overallScore)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={analysis.overallScore}
              sx={{
                height: 10,
                borderRadius: 1,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getScoreColor(analysis.overallScore),
                },
              }}
            />
          </Box>

          {/* Section Scores */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Section Scores
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(analysis.scores || {}).map(([section, score]) => {
                const maxScore = {
                  professionalSummary: 20,
                  workExperience: 25,
                  skills: 20,
                  education: 15,
                  contactInfo: 10,
                  keywords: 10
                }[section] || 100;
                const percentage = Math.round((score / maxScore) * 100);
                return (
                  <Box key={section}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {score}/{maxScore} ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getScoreColor(percentage),
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Issues & Suggestions */}
          {analysis.issues && analysis.issues.length > 0 && (
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Issues & Suggestions ({analysis.issues.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {analysis.issues.map((issue, idx) => (
                    <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, width: '100%' }}>
                        {getPriorityIcon(issue.priority)}
                        <Typography variant="subtitle2" fontWeight={600}>
                          {issue.section}
                        </Typography>
                        <Chip
                          label={issue.priority}
                          size="small"
                          color={getPriorityColor(issue.priority)}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Issue:</strong> {issue.issue}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main' }}>
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Missing Keywords */}
          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Missing Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {analysis.missingKeywords.map((keyword, idx) => (
                  <Chip key={idx} label={keyword} size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Consider adding these keywords naturally throughout your CV.
              </Typography>
            </Box>
          )}

          {/* Format Issues */}
          {analysis.formatIssues && analysis.formatIssues.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Format Issues
              </Typography>
              {analysis.formatIssues.map((issue, idx) => (
                <Alert key={idx} severity={issue.severity === 'high' ? 'warning' : 'info'} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{issue.issue}</strong> - {issue.suggestion}
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}

          {/* Keyword Density */}
          {analysis.keywordDensity && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Keyword Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Found {analysis.keywordDensity.found} out of {analysis.keywordDensity.total} common keywords.
              </Typography>
              {analysis.keywordDensity.keywords && analysis.keywordDensity.keywords.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                  {analysis.keywordDensity.keywords.map((keyword, idx) => (
                    <Chip key={idx} label={keyword} size="small" color="success" />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Overall Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Overall Recommendations
              </Typography>
              {analysis.suggestions.map((suggestion, idx) => (
                <Alert key={idx} severity={suggestion.priority === 'high' ? 'error' : 'info'} sx={{ mb: 1 }}>
                  {suggestion.suggestion}
                </Alert>
              ))}
            </Box>
          )}

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setAnalysis(null);
              setError('');
            }}
            sx={{ mt: 2 }}
          >
            Analyze Again
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ATSScoreChecker;
