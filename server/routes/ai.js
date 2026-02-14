const express = require('express');
const OpenAI = require('openai');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Groq client (used when GROQ_API_KEY is set)
const groq =
  process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

// Analyze CV and provide suggestions
router.post('/analyze', auth, async (req, res) => {
  try {
    const { cvContent } = req.body;

    if (!cvContent) {
      return res.status(400).json({ message: 'CV content is required' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Return helpful suggestions without AI
      const suggestions = [];
      
      if (!cvContent.professionalSummary || cvContent.professionalSummary.length < 50) {
        suggestions.push({
          section: 'Professional Summary',
          issue: 'Summary is too short or missing',
          suggestion: 'Add a compelling 2-3 sentence summary highlighting your key strengths and career objectives.',
          priority: 'high'
        });
      }
      
      if (!cvContent.workExperience || cvContent.workExperience.length === 0) {
        suggestions.push({
          section: 'Work Experience',
          issue: 'No work experience added',
          suggestion: 'Add your work experience with company names, positions, dates, and key achievements.',
          priority: 'high'
        });
      }
      
      if (!cvContent.skills || cvContent.skills.length === 0) {
        suggestions.push({
          section: 'Skills',
          issue: 'Skills section is empty',
          suggestion: 'List your technical and soft skills. Group them by category for better organization.',
          priority: 'high'
        });
      }
      
      return res.json({
        suggestions: suggestions.length > 0 ? suggestions : [
          {
            section: 'General',
            issue: 'CV needs improvement',
            suggestion: 'Use action verbs, quantify achievements, and ensure all sections are complete.',
            priority: 'medium'
          }
        ],
        missingInfo: [],
        keywords: ['leadership', 'management', 'development', 'implementation', 'optimization'],
        overallScore: '7/10'
      });
    }

    // Extract key CV sections for analysis
    const summary = cvContent.professionalSummary || '';
    const workExp = Array.isArray(cvContent.workExperience) ? cvContent.workExperience : [];
    const education = Array.isArray(cvContent.education) ? cvContent.education : [];
    const skills = Array.isArray(cvContent.skills) ? cvContent.skills : [];
    const projects = Array.isArray(cvContent.projects) ? cvContent.projects : [];
    const personalInfo = cvContent.personalInfo || {};
    
    const prompt = `You are a professional CV/resume advisor. Analyze this CV and provide specific, actionable suggestions.

CV Details:
- Name: ${personalInfo.fullName || 'Not provided'}
- Job Title: ${personalInfo.jobTitle || 'Not provided'}
- Professional Summary: ${summary.substring(0, 200)}${summary.length > 200 ? '...' : ''}
- Work Experience: ${workExp.length} position(s)
- Education: ${education.length} entry/entries
- Skills: ${skills.length} category/categories
- Projects: ${projects.length} project(s)

Analyze and provide suggestions focusing on:
1. Professional Summary: Is it compelling? Does it highlight key strengths?
2. Work Experience: Are achievements quantified? Are action verbs used?
3. Skills: Are they relevant? Are they properly categorized?
4. Missing Information: What important sections or details are missing?
5. Keywords: What industry-relevant keywords should be added?
6. Overall Quality: Rate the CV out of 10

Provide your analysis in JSON format ONLY (no markdown, no code blocks):
{
  "suggestions": [
    {
      "section": "section name",
      "issue": "specific issue found",
      "suggestion": "detailed improvement recommendation",
      "priority": "high/medium/low"
    }
  ],
  "missingInfo": ["list of missing information"],
  "keywords": ["suggested industry keywords"],
  "overallScore": "X/10"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional CV/resume advisor. Always respond with valid JSON only, no markdown code blocks, no explanations. Provide constructive, specific feedback." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    let analysis;
    try {
      const content = completion.choices[0].message.content.trim();
      // Try to parse JSON, handle if it's wrapped in markdown code blocks
      let jsonString = content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
      // Remove any leading/trailing non-JSON text
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', completion.choices[0].message.content);
      // Return structured response even if parsing fails
      analysis = {
        suggestions: [
          {
            section: 'General',
            issue: 'AI response parsing error',
            suggestion: 'Review your CV content and ensure all sections are complete with professional language. Use action verbs and quantify achievements.',
            priority: 'medium'
          }
        ],
        missingInfo: [],
        keywords: ['professional', 'experience', 'skills', 'leadership', 'management'],
        overallScore: '7/10'
      };
    }
    
    // Ensure response has correct structure
    if (!analysis.suggestions) {
      analysis.suggestions = [];
    }
    if (!analysis.keywords) {
      analysis.keywords = [];
    }
    if (!analysis.missingInfo) {
      analysis.missingInfo = [];
    }
    if (!analysis.overallScore) {
      analysis.overallScore = '7/10';
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Fallback suggestions if AI fails
    res.json({
      suggestions: [
        {
          section: "General",
          issue: "AI service unavailable",
          suggestion: "Use action verbs and quantify achievements",
          priority: "medium"
        }
      ],
      missingInfo: [],
      keywords: ["leadership", "management", "development", "implementation"],
      overallScore: "N/A"
    });
  }
});

// Improve text with AI
router.post('/improve-text', auth, async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service not configured',
        improvedText: text
      });
    }

    const prompt = `Improve the following text for a CV/resume. Make it more professional, concise, and impactful. Context: ${context || 'general CV section'}

Original text: "${text}"

Provide only the improved version without explanations.`;

    // If GROQ configured, prefer it for this endpoint
    let improvedText = text;
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a professional CV writer. Improve text to be more impactful and professional." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      });
      improvedText = completion.choices[0]?.message?.content?.trim() || text;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional CV writer. Improve text to be more impactful and professional." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      });
      improvedText = completion.choices[0].message.content.trim();
    }
    res.json({ improvedText });
  } catch (error) {
    console.error('AI Improve text error:', error);
    res.json({ improvedText: text });
  }
});

// Generate cover letter from CV + job details
router.post('/cover-letter', auth, async (req, res) => {
  try {
    const { cvContent, jobTitle, companyName, jobDescription } = req.body;

    if (!cvContent) {
      return res.status(400).json({ message: 'CV content is required' });
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      return res.status(503).json({
        message: 'AI service not configured (set OPENAI_API_KEY or GROQ_API_KEY)',
      });
    }

    const personalInfo = cvContent.personalInfo || {};
    const summary = cvContent.professionalSummary || '';
    const workExp = Array.isArray(cvContent.workExperience) ? cvContent.workExperience : [];
    const skills = Array.isArray(cvContent.skills) ? cvContent.skills : [];

    const flatSkills = skills
      .flatMap((s) =>
        Array.isArray(s.items)
          ? s.items.map((it) => (typeof it === 'string' ? it : it?.name || '')).filter(Boolean)
          : []
      )
      .join(', ');

    const prompt = `Write a professional, ATS-friendly cover letter.

Candidate:
- Name: ${personalInfo.fullName || 'Not specified'}
- Target Job Title: ${personalInfo.jobTitle || jobTitle || 'Not specified'}
- Email: ${personalInfo.email || 'Not specified'}

Company / Role:
- Job Title: ${jobTitle || personalInfo.jobTitle || 'Not specified'}
- Company: ${companyName || 'Not specified'}
- Job Description: ${jobDescription || 'Not provided'}

CV Summary:
- Professional Summary: ${summary}
- Work Experience count: ${workExp.length}
- Key Skills: ${flatSkills || 'Not specified'}

Instructions:
- Use a formal, concise tone (no more than 4–6 short paragraphs).
- Focus on relevant experience, quantified achievements, and matching skills.
- Avoid generic fluff; be specific and tailored to the job title/company if given.
- Do NOT include placeholders like [Company] or [Your Name]; use actual data from above.
- Return only the final cover letter text (no markdown, no bullet lists, no explanation).`;

    let letter = '';

    if (groq) {
      // Use Groq (llama3) when GROQ_API_KEY is configured
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: 'system',
            content:
              'You are an expert professional cover letter writer. Always return only the final cover letter text, ready to send.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 900,
      });
      letter = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      // Fallback to OpenAI if GROQ is not configured
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert professional cover letter writer. Always return only the final cover letter text, ready to send.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 900,
      });
      letter = completion.choices[0].message.content.trim();
    }

    res.json({
      coverLetter: letter,
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate cover letter',
    });
  }
});

// Helper function to extract skills from CV content
function extractSkillsFromCV(cvContent) {
  const skills = new Set();
  
  // Extract from skills section
  if (Array.isArray(cvContent.skills)) {
    cvContent.skills.forEach(skillCategory => {
      if (skillCategory.items && Array.isArray(skillCategory.items)) {
        skillCategory.items.forEach(skill => {
          if (typeof skill === 'string') {
            skills.add(skill.toLowerCase().trim());
          }
        });
      }
    });
  }
  
  // Extract from professional summary
  if (cvContent.professionalSummary) {
    const commonTechSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'mongodb', 'postgresql',
      'html', 'css', 'typescript', 'angular', 'vue', 'express', 'django', 'flask',
      'aws', 'docker', 'kubernetes', 'git', 'github', 'agile', 'scrum', 'rest',
      'api', 'graphql', 'redux', 'next', 'php', 'ruby', 'c++', 'c#', '.net',
      'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi'
    ];
    
    const summaryLower = cvContent.professionalSummary.toLowerCase();
    commonTechSkills.forEach(skill => {
      if (summaryLower.includes(skill)) {
        skills.add(skill);
      }
    });
  }
  
  // Extract from work experience
  if (Array.isArray(cvContent.workExperience)) {
    cvContent.workExperience.forEach(exp => {
      const description = (exp.description || '').toLowerCase();
      const title = (exp.title || '').toLowerCase();
      
      const commonTechSkills = [
        'javascript', 'python', 'java', 'react', 'node', 'sql', 'mongodb', 'postgresql',
        'html', 'css', 'typescript', 'angular', 'vue', 'express', 'django', 'flask',
        'aws', 'docker', 'kubernetes', 'git', 'github', 'agile', 'scrum', 'rest',
        'api', 'graphql', 'redux', 'next', 'php', 'ruby', 'c++', 'c#', '.net',
        'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi',
        'project management', 'leadership', 'team management', 'communication'
      ];
      
      commonTechSkills.forEach(skill => {
        if (description.includes(skill) || title.includes(skill)) {
          skills.add(skill);
        }
      });
    });
  }
  
  return Array.from(skills);
}

// Helper function to calculate match score between CV skills and job
function calculateMatchScore(cvSkills, jobTitle, jobDescription) {
  const jobText = `${jobTitle} ${jobDescription || ''}`.toLowerCase();
  let matchCount = 0;
  
  cvSkills.forEach(skill => {
    if (jobText.includes(skill)) {
      matchCount++;
    }
  });
  
  if (cvSkills.length === 0) return 0;
  
  const matchPercentage = Math.round((matchCount / cvSkills.length) * 100);
  return Math.min(matchPercentage, 100); // Cap at 100%
}

// Get job recommendations based on CV
router.post('/job-recommendations', auth, async (req, res) => {
  try {
    const { cvContent, location = '', jobTitle = '' } = req.body;
    
    if (!cvContent) {
      return res.status(400).json({ message: 'CV content is required' });
    }
    
    // Extract skills from CV
    const cvSkills = extractSkillsFromCV(cvContent);
    
    let jobs = [];
    let totalFound = 0;
    
    // Try to fetch real jobs from Adzuna API (free tier)
    if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
      try {
        const searchQuery = jobTitle || cvContent.personalInfo?.jobTitle || 'developer';
        const searchLocation = location || 'us';
        
        const adzunaResponse = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
          params: {
            app_id: process.env.ADZUNA_APP_ID,
            app_key: process.env.ADZUNA_APP_KEY,
            results_per_page: 20,
            what: searchQuery,
            where: searchLocation,
            content_type: 'application/json'
          },
          timeout: 10000
        });
        
        if (adzunaResponse.data && adzunaResponse.data.results) {
          jobs = adzunaResponse.data.results.map((job, index) => ({
            id: job.id || index,
            title: job.title || 'Job Title Not Available',
            company: job.company?.display_name || 'Company Not Specified',
            location: job.location?.display_name || location || 'Location Not Specified',
            description: job.description || '',
            url: job.redirect_url || '',
            salaryMin: job.salary_min,
            salaryMax: job.salary_max,
            salaryCurrency: job.salary_is_predicted ? 'USD' : (job.salary_min ? 'USD' : null),
            created: job.created,
            match: `${calculateMatchScore(cvSkills, job.title || '', job.description || '')}%`
          }));
          
          totalFound = adzunaResponse.data.count || jobs.length;
        }
      } catch (adzunaError) {
        console.error('Adzuna API error:', adzunaError.message);
        // Fall through to GPT fallback
      }
    }
    
    // If no jobs from Adzuna, use GPT to generate recommendations
    if (jobs.length === 0 && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Based on this CV, suggest 10 real job opportunities that would be a good match. 
        
CV Skills: ${cvSkills.join(', ') || 'Not specified'}
Job Title Preference: ${jobTitle || cvContent.personalInfo?.jobTitle || 'Not specified'}
Location Preference: ${location || 'Not specified'}

Return ONLY a JSON array of job objects with this exact structure (no markdown, no code blocks):
[
  {
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, State/Country",
    "description": "Brief job description",
    "match": "85%",
    "url": "https://example.com/job"
  }
]`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a job matching expert. Return ONLY valid JSON array, no markdown, no explanations." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });
        
        let gptJobs = [];
        try {
          const content = completion.choices[0].message.content.trim();
          let jsonString = content;
          
          // Handle if wrapped in markdown
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
          }
          
          // Try to parse as object first (if GPT returns {jobs: [...]})
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
            gptJobs = parsed;
          } else if (parsed.jobs && Array.isArray(parsed.jobs)) {
            gptJobs = parsed.jobs;
          } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
            gptJobs = parsed.recommendations;
          }
          
          // Calculate match scores for GPT jobs
          gptJobs = gptJobs.map((job, index) => ({
            id: job.id || `gpt-${index}`,
            title: job.title || 'Job Title Not Available',
            company: job.company || 'Company Not Specified',
            location: job.location || location || 'Location Not Specified',
            description: job.description || '',
            url: job.url || '',
            match: job.match || `${calculateMatchScore(cvSkills, job.title || '', job.description || '')}%`
          }));
          
          jobs = gptJobs;
          totalFound = jobs.length;
        } catch (parseError) {
          console.error('Error parsing GPT job recommendations:', parseError);
        }
      } catch (gptError) {
        console.error('GPT job recommendations error:', gptError);
      }
    }
    
    // Sort jobs by match score (highest first)
    jobs.sort((a, b) => {
      const scoreA = parseInt(a.match) || 0;
      const scoreB = parseInt(b.match) || 0;
      return scoreB - scoreA;
    });
    
    // Skills gap analysis - identify missing skills from top matching jobs
    const skillsGap = [];
    if (jobs.length > 0 && cvSkills.length > 0) {
      const topJobs = jobs.slice(0, 5); // Analyze top 5 jobs
      const requiredSkills = new Set();
      
      topJobs.forEach(job => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        const commonTechSkills = [
          'javascript', 'python', 'java', 'react', 'node', 'sql', 'mongodb', 'postgresql',
          'html', 'css', 'typescript', 'angular', 'vue', 'express', 'django', 'flask',
          'aws', 'docker', 'kubernetes', 'git', 'github', 'agile', 'scrum', 'rest',
          'api', 'graphql', 'redux', 'next', 'php', 'ruby', 'c++', 'c#', '.net',
          'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi'
        ];
        
        commonTechSkills.forEach(skill => {
          if (jobText.includes(skill) && !cvSkills.includes(skill)) {
            requiredSkills.add(skill);
          }
        });
      });
      
      skillsGap.push(...Array.from(requiredSkills));
    }
    
    res.json({
      jobs: jobs.slice(0, 20), // Return top 20
      skillsGap: skillsGap.slice(0, 10), // Top 10 missing skills
      totalFound: totalFound || jobs.length,
      cvSkills: cvSkills
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch job recommendations',
      jobs: [],
      skillsGap: [],
      totalFound: 0
    });
  }
});

// Skills gap analysis for a specific job
router.post('/skills-gap', auth, async (req, res) => {
  try {
    const { cvContent, jobDescription, jobTitle } = req.body;
    
    if (!cvContent || !jobDescription) {
      return res.status(400).json({ message: 'CV content and job description are required' });
    }
    
    // Extract CV skills
    const cvSkills = extractSkillsFromCV(cvContent);
    
    // Extract required skills from job description
    const jobText = `${jobTitle || ''} ${jobDescription}`.toLowerCase();
    const commonTechSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'mongodb', 'postgresql',
      'html', 'css', 'typescript', 'angular', 'vue', 'express', 'django', 'flask',
      'aws', 'docker', 'kubernetes', 'git', 'github', 'agile', 'scrum', 'rest',
      'api', 'graphql', 'redux', 'next', 'php', 'ruby', 'c++', 'c#', '.net',
      'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi',
      'project management', 'leadership', 'team management', 'communication', 'problem solving'
    ];
    
    const requiredSkills = new Set();
    commonTechSkills.forEach(skill => {
      if (jobText.includes(skill)) {
        requiredSkills.add(skill);
      }
    });
    
    // Use GPT to extract additional skills if available
    if (process.env.OPENAI_API_KEY && requiredSkills.size < 5) {
      try {
        const prompt = `Extract the key technical and professional skills required for this job. Return ONLY a JSON array of skill names (no markdown, no code blocks):
        
Job Title: ${jobTitle || 'Not specified'}
Job Description: ${jobDescription.substring(0, 1000)}

Return format: ["skill1", "skill2", "skill3"]`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a job analysis expert. Return ONLY a JSON array of skills, no markdown, no explanations." },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });
        
        try {
          const content = completion.choices[0].message.content.trim();
          let jsonString = content;
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
          }
          
          const parsed = JSON.parse(jsonString);
          const gptSkills = Array.isArray(parsed) ? parsed : (parsed.skills || []);
          
          gptSkills.forEach(skill => {
            if (typeof skill === 'string') {
              requiredSkills.add(skill.toLowerCase().trim());
            }
          });
        } catch (parseError) {
          console.error('Error parsing GPT skills:', parseError);
        }
      } catch (gptError) {
        console.error('GPT skills extraction error:', gptError);
      }
    }
    
    const requiredSkillsArray = Array.from(requiredSkills);
    const matchingSkills = cvSkills.filter(skill => requiredSkillsArray.includes(skill));
    const missingSkills = requiredSkillsArray.filter(skill => !cvSkills.includes(skill));
    
    const matchPercentage = requiredSkillsArray.length > 0 
      ? Math.round((matchingSkills.length / requiredSkillsArray.length) * 100)
      : 0;
    
    // Generate recommendations
    const recommendations = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Learn or gain experience with: ${missingSkills.slice(0, 5).join(', ')}`);
    }
    if (matchPercentage < 70) {
      recommendations.push('Consider highlighting your matching skills more prominently in your CV');
      recommendations.push('Add relevant projects or certifications that demonstrate required skills');
    }
    if (matchingSkills.length > 0) {
      recommendations.push(`You already have these matching skills: ${matchingSkills.join(', ')}`);
    }
    
    res.json({
      matchPercentage,
      matchingSkills,
      missingSkills: missingSkills.slice(0, 15), // Top 15 missing skills
      requiredSkills: requiredSkillsArray,
      recommendations: recommendations.length > 0 ? recommendations : ['Your skills match well with this position!']
    });
  } catch (error) {
    console.error('Skills gap analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze skills gap',
      matchPercentage: 0,
      matchingSkills: [],
      missingSkills: [],
      requiredSkills: [],
      recommendations: []
    });
  }
});

module.exports = router;

