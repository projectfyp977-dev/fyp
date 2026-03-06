import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { getTemplatePath, getPlaceholderValues } from '../config/templates';

/**
 * Fetches the HTML template from public path, replaces {{placeholders}} with cv data,
 * optionally injects customization CSS, and renders in an iframe.
 */
const HTMLTemplatePreview = ({ documentType, templateId, cv, customization }) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const path = getTemplatePath(documentType, templateId);

  useEffect(() => {
    if (!path || !cv) {
      setLoading(false);
      setHtml('');
      return;
    }
    setLoading(true);
    setError(null);
    const base = process.env.PUBLIC_URL || '';
    fetch(`${base}${path}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const values = getPlaceholderValues(cv, templateId);
        let filled = text;
        Object.entries(values).forEach(([placeholder, value]) => {
          filled = filled.split(placeholder).join(value || '');
        });
        // Inject customization overrides if the template uses :root variables
        const accent = customization?.headingColor || customization?.accentColor;
        const bg = customization?.backgroundColor;
        const textColor = customization?.textColor;
        if (accent || bg || textColor) {
          const overrides = [
            accent ? `--cyan: ${accent}; --accent: ${accent}; --dark-navy: ${accent};` : '',
            bg ? `--dark: ${bg}; --bg: ${bg}; --poster-bg: ${bg};` : '',
            textColor ? `--text-dark: ${textColor};` : '',
          ].filter(Boolean).join(' ');
          const bodyOverrides = bg ? ` body { background: ${bg} !important; } .poster, .letterhead, .page-container, .flyer { background: ${bg} !important; }` : '';
          const colorOverrides = textColor ? ` body, .poster, .content p, .body-text { color: ${textColor} !important; }` : '';
          const styleBlock = `<style id="customization-override">:root { ${overrides} }${bodyOverrides}${colorOverrides}</style>`;
          filled = filled.replace('</head>', `${styleBlock}</head>`);
        }
        setHtml(filled);
      })
      .catch((err) => {
        setError(err.message);
        setHtml('');
      })
      .finally(() => setLoading(false));
  }, [path, cv, customization]);

  if (!path) return null;
  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}>Loading template…</Box>;
  if (error) return <Box sx={{ p: 3, color: 'error.main' }}>Error: {error}</Box>;
  if (!html) return null;

  return (
    <Box sx={{ width: '100%', minHeight: 400 }}>
      <iframe
        title="Template preview"
        srcDoc={html}
        style={{
          width: '100%',
          minHeight: '80vh',
          border: 'none',
          borderRadius: 8,
        }}
        sandbox="allow-same-origin"
      />
    </Box>
  );
};

export default HTMLTemplatePreview;
