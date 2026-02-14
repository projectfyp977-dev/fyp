import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField,
  Chip,
  Fade,
  Zoom,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const VoicePromptScreen = ({ onComplete, onSkip }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && listening) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [listening]);

  const startListening = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Send to Whisper API
        await transcribeAudio(audioBlob);
        
        // Reset
        audioChunksRef.current = [];
      };
      
      // Start recording
      mediaRecorder.start();
      setListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && listening) {
      mediaRecorderRef.current.stop();
      setListening(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${getApiUrl()}/ai/whisper`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.text) {
        const transcribedText = response.data.text.trim();
        setTranscript(prev => prev + (prev ? ' ' : '') + transcribedText);
      } else {
        alert('Failed to transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Whisper API error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to transcribe audio';
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. OpenAI API key is configured\n3. Internet connection is active`);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCVData = (text) => {
    const data = {
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        website: '',
        github: '',
      },
      professionalSummary: '',
      workExperience: [],
      education: [],
      skills: [],
    };

    // Extract name (usually at the start)
    const nameMatch = text.match(/(?:my name is|i am|i'm|name is|i'm called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    if (nameMatch) {
      data.personalInfo.fullName = nameMatch[1];
    }

    // Extract job title
    const jobTitleMatch = text.match(/(?:i am|i'm|job title|position|role|designation|work as)\s+(?:a|an)?\s*([a-z\s]+(?:developer|engineer|manager|designer|analyst|specialist|consultant|director|executive|coordinator|assistant|administrator|architect|consultant|lead|senior|junior|intern))/i);
    if (jobTitleMatch) {
      data.personalInfo.jobTitle = jobTitleMatch[1].trim();
    }

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      data.personalInfo.email = emailMatch[1];
    }

    // Extract phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,11}/);
    if (phoneMatch) {
      data.personalInfo.phone = phoneMatch[0];
    }

    // Extract professional summary
    const summaryKeywords = ['summary', 'about me', 'professional summary', 'overview', 'introduction'];
    const summaryMatch = text.match(new RegExp(`(?:${summaryKeywords.join('|')})[:\\.]?\\s*([^.]+(?:\\.|$))`, 'i'));
    if (summaryMatch) {
      data.professionalSummary = summaryMatch[1].trim();
    } else {
      // If no explicit summary, take first 2-3 sentences
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        data.professionalSummary = sentences.slice(0, 2).join(' ').trim();
      }
    }

    // Extract skills
    const skillsKeywords = ['skills', 'technologies', 'proficient in', 'know', 'expertise'];
    const skillsMatch = text.match(new RegExp(`(?:${skillsKeywords.join('|')})[:\\.]?\\s*([^.]+)`, 'i'));
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      // Split by common delimiters
      const skillsList = skillsText.split(/(?:,|and|&|\s+and\s+)/).map(s => s.trim()).filter(s => s.length > 0);
      if (skillsList.length > 0) {
        data.skills = [{ category: 'Technical Skills', items: skillsList.slice(0, 10) }];
      }
    }

    // Extract work experience
    const workKeywords = ['worked at', 'work at', 'worked for', 'work for', 'company', 'employer'];
    const workMatches = text.match(new RegExp(`(?:${workKeywords.join('|')})[:\\.]?\\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)`, 'gi'));
    if (workMatches) {
      workMatches.forEach((match, index) => {
        const companyMatch = match.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        if (companyMatch && index < 3) {
          data.workExperience.push({
            company: companyMatch[1],
            position: data.personalInfo.jobTitle || 'Position',
            designation: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: []
          });
        }
      });
    }

    // Extract education
    const educationKeywords = ['studied at', 'graduate from', 'university', 'college', 'degree'];
    const eduMatch = text.match(new RegExp(`(?:${educationKeywords.join('|')})[:\\.]?\\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)`, 'i'));
    if (eduMatch) {
      data.education.push({
        institution: eduMatch[1],
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        achievements: []
      });
    }

    return data;
  };

  const handleProcess = async () => {
    if (!transcript.trim()) {
      alert('Please speak something first or click Skip to continue manually.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const parsed = parseCVData(transcript);
      setExtractedData(parsed);
      setIsProcessing(false);
    }, 1500);
  };

  const handleUseData = () => {
    if (extractedData && onComplete) {
      onComplete(extractedData);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Zoom in={true}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </Zoom>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                color: 'text.primary',
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Create Your CV with Voice
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}
            >
              Speak your details and we'll automatically extract your information to create your professional CV
            </Typography>
          </Box>

          {/* Microphone Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Zoom in={true}>
              <Button
                variant="contained"
                size="large"
                onClick={listening ? stopListening : startListening}
                disabled={isProcessing || typeof MediaRecorder === 'undefined'}
                sx={{
                  width: { xs: 120, sm: 140 },
                  height: { xs: 120, sm: 140 },
                  borderRadius: '50%',
                  minWidth: 'auto',
                  background: listening
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: listening
                    ? '0 0 0 8px rgba(239, 68, 68, 0.2), 0 8px 32px rgba(239, 68, 68, 0.4)'
                    : '0 8px 32px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: listening
                      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    boxShadow: listening
                      ? '0 0 0 12px rgba(239, 68, 68, 0.3), 0 12px 40px rgba(239, 68, 68, 0.5)'
                      : '0 12px 40px rgba(99, 102, 241, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                  animation: listening ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {listening ? (
                  <StopIcon sx={{ fontSize: 60, color: 'white' }} />
                ) : (
                  <MicIcon sx={{ fontSize: 60, color: 'white' }} />
                )}
              </Button>
            </Zoom>
          </Box>

          {/* Status Indicator */}
          {listening && (
            <Box
              sx={{
                textAlign: 'center',
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                🎤 Recording... Speak clearly
              </Typography>
              <Typography variant="caption">
                Click the red button to stop recording
              </Typography>
            </Box>
          )}
          {isProcessing && (
            <Box
              sx={{
                textAlign: 'center',
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'info.light',
                color: 'info.contrastText',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                ⏳ Processing with Whisper AI...
              </Typography>
              <Typography variant="caption">
                Please wait while we transcribe your audio
              </Typography>
            </Box>
          )}

          {/* Transcript Display */}
          {transcript && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your spoken text will appear here..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {/* Process Button */}
          {transcript && !extractedData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleProcess}
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
              >
                {isProcessing ? 'Processing...' : 'Extract CV Data'}
              </Button>
            </Box>
          )}

          {/* Extracted Data Preview */}
          {extractedData && (
            <Fade in={true}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Data Extracted Successfully!
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {extractedData.personalInfo.fullName && (
                    <Chip label={`Name: ${extractedData.personalInfo.fullName}`} />
                  )}
                  {extractedData.personalInfo.jobTitle && (
                    <Chip label={`Job: ${extractedData.personalInfo.jobTitle}`} />
                  )}
                  {extractedData.personalInfo.email && (
                    <Chip label={`Email: ${extractedData.personalInfo.email}`} />
                  )}
                  {extractedData.skills.length > 0 && (
                    <Chip label={`${extractedData.skills[0].items.length} Skills`} />
                  )}
                  {extractedData.workExperience.length > 0 && (
                    <Chip label={`${extractedData.workExperience.length} Work Experience`} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleUseData}
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': { bgcolor: 'success.dark' },
                    }}
                  >
                    Use This Data
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setExtractedData(null);
                      setTranscript('');
                    }}
                    sx={{ borderColor: 'success.main', color: 'success.main' }}
                  >
                    Try Again
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleSkip}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                borderColor: 'divider',
              }}
            >
              Skip & Fill Manually
            </Button>
          </Box>

          {/* Instructions */}
          <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              💡 Tips for best results:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Speak clearly and at a moderate pace</li>
                <li>Start with: "My name is [Your Name], I am a [Job Title]"</li>
                <li>Mention your email, phone, and key skills</li>
                <li>Describe your work experience and education</li>
                <li>You can edit everything after extraction</li>
              </ul>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default VoicePromptScreen;
