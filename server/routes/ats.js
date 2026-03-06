const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// ATS Score Checker - CV uses full analysis; visiting-card, poster, biographics use simplified checks
router.post('/analyze', auth, async (req, res) => {
  try {
    const { cvContent, documentType = 'cv' } = req.body;

    if (!cvContent) {
      return res.status(400).json({ message: 'CV content is required' });
    }

    const analysis = {
      overallScore: 0,
      scores: {},
      issues: [],
      suggestions: [],
      missingKeywords: [],
      formatIssues: [],
      sectionOrder: [],
      keywordDensity: {}
    };

    let totalScore = 0;
    let maxScore = 0;
    const isSimpleDoc = ['visiting-card', 'poster', 'biographics'].includes(documentType);

    if (isSimpleDoc) {
      // Simplified ATS for visiting card, poster, biographics - only contact + content completeness
      const p = cvContent.personalInfo || {};
      const nameVal = (p.fullName || p.name || '').toString().trim();
      const emailVal = (p.email || '').toString().trim();
      const hasName = nameVal.length > 0;
      const hasEmail = emailVal.length > 0;
      const hasPhone = !!((p.phone || '').toString().trim());
      const hasContent = !!(
        (cvContent.professionalSummary || '').toString().trim() ||
        (cvContent.title || '').toString().trim() ||
        (p.company || '').toString().trim()
      );

      analysis.scores.contactInfo = (hasName ? 3 : 0) + (hasEmail ? 3 : 0) + (hasPhone ? 2 : 0) + (p.website ? 2 : 0);
      analysis.scores.professionalSummary = hasContent ? 20 : 0;
      totalScore = analysis.scores.contactInfo + analysis.scores.professionalSummary;
      maxScore = 30;

      if (!hasName || !hasEmail) {
        analysis.issues.push({
          section: 'Contact',
          issue: 'Name and email are required',
          priority: 'high',
          suggestion: 'Add your full name and email for contact purposes.'
        });
      }
      if (!hasContent) {
        analysis.issues.push({
          section: 'Content',
          issue: 'Add title, tagline, or company name',
          priority: 'medium',
          suggestion: documentType === 'visiting-card' ? 'Add your tagline or company name.' : documentType === 'poster' ? 'Add poster title and main text.' : 'Add a biography or summary.'
        });
      }
      analysis.overallScore = Math.round((totalScore / maxScore) * 100);
      if (analysis.overallScore < 60) {
        analysis.suggestions.push({ priority: 'medium', suggestion: 'Complete your contact info and add main content.' });
      } else {
        analysis.suggestions.push({ priority: 'low', suggestion: 'Looking good! Your content is complete.' });
      }
      // Clarity / grammar note for short content
      const mainText = (cvContent.professionalSummary || cvContent.title || '').toString().trim();
      if (mainText.length > 0 && mainText.length < 20) {
        analysis.issues.push({
          section: 'Content',
          issue: 'Main text is very short',
          priority: 'low',
          suggestion: 'Add a bit more detail for clarity and impact.'
        });
      }
      return res.json(analysis);
    }

    // Full CV ATS analysis below
    // 1. Professional Summary Check (20 points)
    maxScore += 20;
    if (cvContent.professionalSummary && cvContent.professionalSummary.length >= 50) {
      const summaryScore = Math.min(20, Math.floor(cvContent.professionalSummary.length / 10));
      analysis.scores.professionalSummary = summaryScore;
      totalScore += summaryScore;
      if (summaryScore < 15) {
        analysis.issues.push({
          section: 'Professional Summary',
          issue: 'Summary is too short or lacks detail',
          priority: 'high',
          suggestion: 'Expand your professional summary to 3-5 sentences highlighting key achievements and skills.'
        });
      }
    } else {
      analysis.issues.push({
        section: 'Professional Summary',
        issue: 'Professional summary is missing or too short',
        priority: 'high',
        suggestion: 'Add a compelling 3-5 sentence professional summary at the top of your CV.'
      });
    }

    // 2. Work Experience Check (25 points)
    maxScore += 25;
    const workExp = Array.isArray(cvContent.workExperience) ? cvContent.workExperience : [];
    if (workExp.length > 0) {
      let expScore = Math.min(25, workExp.length * 8);
      // Check for quantifiable achievements
      const hasQuantified = workExp.some(exp => {
        const desc = exp.description || '';
        return /\d+/.test(desc) || 
               desc.toLowerCase().includes('increased') || 
               desc.toLowerCase().includes('reduced') ||
               desc.toLowerCase().includes('improved') ||
               desc.toLowerCase().includes('%');
      });
      if (hasQuantified) expScore += 5;
      if (workExp.length >= 2) expScore += 5;
      analysis.scores.workExperience = Math.min(25, expScore);
      totalScore += analysis.scores.workExperience;

      if (workExp.length < 2) {
        analysis.issues.push({
          section: 'Work Experience',
          issue: 'Limited work experience entries',
          priority: 'medium',
          suggestion: 'Add more work experience entries. Include internships, part-time jobs, or freelance work if applicable.'
        });
      }

      // Check for action verbs
      const actionVerbs = ['managed', 'developed', 'created', 'implemented', 'led', 'designed', 'improved', 'achieved', 'increased', 'reduced'];
      const hasActionVerbs = workExp.some(exp => {
        const desc = (exp.description || '').toLowerCase();
        return actionVerbs.some(verb => desc.includes(verb));
      });
      if (!hasActionVerbs) {
        analysis.issues.push({
          section: 'Work Experience',
          issue: 'Missing action verbs',
          priority: 'high',
          suggestion: 'Start bullet points with action verbs (e.g., "Managed", "Developed", "Created", "Implemented").'
        });
      }
    } else {
      analysis.issues.push({
        section: 'Work Experience',
        issue: 'No work experience added',
        priority: 'high',
        suggestion: 'Add your work experience with company names, positions, dates, and key achievements.'
      });
    }

    // 3. Skills Check (20 points)
    maxScore += 20;
    const skills = Array.isArray(cvContent.skills) ? cvContent.skills : [];
    if (skills.length > 0) {
      let skillsScore = Math.min(20, skills.length * 5);
      const totalSkillItems = skills.reduce((sum, skill) => sum + (Array.isArray(skill.items) ? skill.items.length : 0), 0);
      if (totalSkillItems >= 10) skillsScore += 5;
      if (totalSkillItems >= 15) skillsScore += 5;
      analysis.scores.skills = Math.min(20, skillsScore);
      totalScore += analysis.scores.skills;

      if (totalSkillItems < 10) {
        analysis.issues.push({
          section: 'Skills',
          issue: 'Limited skills listed',
          priority: 'medium',
          suggestion: 'Add more relevant skills. Include both technical and soft skills.'
        });
      }
    } else {
      analysis.issues.push({
        section: 'Skills',
        issue: 'Skills section is empty',
        priority: 'high',
        suggestion: 'List your technical and soft skills. Group them by category for better organization.'
      });
    }

    // 4. Education Check (15 points)
    maxScore += 15;
    const education = Array.isArray(cvContent.education) ? cvContent.education : [];
    if (education.length > 0) {
      analysis.scores.education = 15;
      totalScore += 15;
    } else {
      analysis.issues.push({
        section: 'Education',
        issue: 'Education section is empty',
        priority: 'high',
        suggestion: 'Add your educational background including degree, institution, and dates.'
      });
    }

    // 5. Contact Information Check (10 points)
    maxScore += 10;
    const personalInfo = cvContent.personalInfo || {};
    let contactScore = 0;
    if (personalInfo.fullName) contactScore += 2;
    if (personalInfo.email) contactScore += 3;
    if (personalInfo.phone) contactScore += 2;
    if (personalInfo.address) contactScore += 1;
    if (personalInfo.linkedIn || personalInfo.github) contactScore += 2;
    analysis.scores.contactInfo = contactScore;
    totalScore += contactScore;

    if (contactScore < 8) {
      analysis.issues.push({
        section: 'Contact Information',
        issue: 'Incomplete contact information',
        priority: 'high',
        suggestion: 'Ensure you have name, email, phone, and at least one professional link (LinkedIn/GitHub).'
      });
    }

    // 6. Keywords Analysis (10 points)
    maxScore += 10;
    const commonKeywords = [
      'leadership', 'management', 'development', 'implementation', 'optimization',
      'analysis', 'strategy', 'collaboration', 'communication', 'problem-solving',
      'project', 'team', 'client', 'customer', 'revenue', 'efficiency', 'quality'
    ];
    
    const allText = [
      cvContent.professionalSummary || '',
      ...(workExp.map(exp => exp.description || '').join(' ')),
      ...(education.map(edu => `${edu.degree} ${edu.field || ''}`).join(' ')),
      ...(skills.map(skill => skill.category || '').join(' '))
    ].join(' ').toLowerCase();

    const foundKeywords = commonKeywords.filter(keyword => allText.includes(keyword));
    const keywordScore = Math.min(10, Math.floor((foundKeywords.length / commonKeywords.length) * 10));
    analysis.scores.keywords = keywordScore;
    totalScore += keywordScore;
    analysis.keywordDensity = {
      found: foundKeywords.length,
      total: commonKeywords.length,
      keywords: foundKeywords
    };

    const missingKeywords = commonKeywords.filter(kw => !foundKeywords.includes(kw));
    if (missingKeywords.length > 5) {
      analysis.missingKeywords = missingKeywords.slice(0, 10);
      analysis.issues.push({
        section: 'Keywords',
        issue: 'Missing important keywords',
        priority: 'medium',
        suggestion: `Consider adding these keywords naturally: ${missingKeywords.slice(0, 5).join(', ')}`
      });
    }

    // 7. Format Issues Check
    // Check for images (not ATS-friendly)
    if (personalInfo.photo) {
      analysis.formatIssues.push({
        issue: 'Profile photo detected',
        severity: 'low',
        suggestion: 'ATS systems may not process images well. Consider removing photo for ATS-optimized version.'
      });
    }

    // Check section order (standard: Contact, Summary, Experience, Education, Skills)
    const sections = [];
    if (personalInfo.fullName) sections.push('contact');
    if (cvContent.professionalSummary) sections.push('summary');
    if (workExp.length > 0) sections.push('experience');
    if (education.length > 0) sections.push('education');
    if (skills.length > 0) sections.push('skills');

    const idealOrder = ['contact', 'summary', 'experience', 'education', 'skills'];
    const currentOrder = sections;
    const orderScore = currentOrder.every((section, index) => 
      idealOrder.includes(section) && idealOrder.indexOf(section) <= index + 1
    );

    if (!orderScore && sections.length > 2) {
      analysis.sectionOrder = {
        current: currentOrder,
        recommended: idealOrder.filter(s => sections.includes(s))
      };
      analysis.formatIssues.push({
        issue: 'Non-standard section order',
        severity: 'medium',
        suggestion: 'Consider reordering sections: Contact → Summary → Experience → Education → Skills'
      });
    }

    // Calculate overall score
    analysis.overallScore = Math.round((totalScore / maxScore) * 100);

    // Generate overall suggestions
    if (analysis.overallScore < 60) {
      analysis.suggestions.push({
        priority: 'high',
        suggestion: 'Your CV needs significant improvement for ATS compatibility. Focus on adding more content and quantifiable achievements.'
      });
    } else if (analysis.overallScore < 80) {
      analysis.suggestions.push({
        priority: 'medium',
        suggestion: 'Your CV is decent but can be improved. Add more keywords and ensure all sections are complete.'
      });
    } else {
      analysis.suggestions.push({
        priority: 'low',
        suggestion: 'Great! Your CV is well-optimized for ATS. Keep it updated and maintain keyword relevance.'
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('ATS Analysis error:', error);
    res.status(500).json({ 
      message: 'Server error',
      overallScore: 0,
      issues: [{ section: 'General', issue: 'Analysis failed', priority: 'low', suggestion: 'Please try again.' }]
    });
  }
});

module.exports = router;
