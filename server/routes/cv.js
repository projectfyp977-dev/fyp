const express = require('express');
const CV = require('../models/CV');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all CVs for user
router.get('/', auth, async (req, res) => {
  try {
    const cvs = await CV.findByUserId(req.user.id);
    res.json(cvs);
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single CV
router.get('/:id', auth, async (req, res) => {
  try {
    const cv = await CV.findOne({ id: req.params.id, userId: req.user.id });
    if (!cv) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.json(cv);
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create CV
router.post('/', auth, async (req, res) => {
  try {
    const cvData = {
      ...req.body,
      userId: req.user.id
    };
    const cv = await CV.create(cvData);
    res.status(201).json(cv);
  } catch (error) {
    console.error('Create CV error:', error);
    res.status(500).json({
      message: error.message || 'Server error',
      code: error.code,
    });
  }
});

// Update CV
router.put('/:id', auth, async (req, res) => {
  try {
    const cv = await CV.update(req.params.id, req.user.id, req.body);
    if (!cv) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.json(cv);
  } catch (error) {
    console.error('Update CV error:', error);
    res.status(500).json({
      message: error.message || 'Server error',
      code: error.code,
    });
  }
});

// Delete CV
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await CV.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
