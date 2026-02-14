import React from 'react';
import { TextField } from '@mui/material';

// Simplified text-only input. All previous voice/Whisper logic removed.
const VoiceInput = ({ label, value, onChange, multiline = false, rows = 1, ...rest }) => {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={multiline}
      rows={rows}
      {...rest}
    />
  );
};

export default VoiceInput;
