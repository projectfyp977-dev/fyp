const pool = require('../config/database');

class CV {
  // Create CV
  static async create(cvData) {
    const {
      userId,
      title = 'My CV',
      documentType = 'cv',
      personalInfo,
      professionalSummary = '',
      workExperience = [],
      education = [],
      skills = [],
      certifications = [],
      languages = [],
      projects = []
    } = cvData;

    const [result] = await pool.execute(
      `INSERT INTO cvs 
       (userId, title, document_type, personalInfo, professionalSummary, workExperience, 
        education, skills, certifications, languages, projects) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        documentType || 'cv',
        JSON.stringify(personalInfo || {}),
        professionalSummary,
        JSON.stringify(workExperience),
        JSON.stringify(education),
        JSON.stringify(skills),
        JSON.stringify(certifications),
        JSON.stringify(languages),
        JSON.stringify(projects)
      ]
    );

    return this.findById(result.insertId);
  }

  // Find CV by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM cvs WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return this.parseRow(rows[0]);
  }

  // Find all CVs for a user
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM cvs WHERE userId = ? ORDER BY updatedAt DESC',
      [userId]
    );
    
    return rows.map(row => this.parseRow(row));
  }

  // Find one CV (for compatibility)
  static async findOne(query) {
    if (query._id || query.id) {
      const id = query._id || query.id;
      const cv = await this.findById(id);
      
      // Check userId if provided
      if (cv && query.userId && cv.userId !== query.userId) {
        return null;
      }
      
      return cv;
    }
    return null;
  }

  // Update CV
  static async update(id, userId, updateData) {
    const {
      title,
      documentType,
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      certifications,
      languages,
      projects
    } = updateData;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (documentType !== undefined) {
      updates.push('document_type = ?');
      values.push(documentType);
    }
    if (personalInfo !== undefined) {
      updates.push('personalInfo = ?');
      values.push(JSON.stringify(personalInfo));
    }
    if (professionalSummary !== undefined) {
      updates.push('professionalSummary = ?');
      values.push(professionalSummary);
    }
    if (workExperience !== undefined) {
      updates.push('workExperience = ?');
      values.push(JSON.stringify(workExperience));
    }
    if (education !== undefined) {
      updates.push('education = ?');
      values.push(JSON.stringify(education));
    }
    if (skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(skills));
    }
    if (certifications !== undefined) {
      updates.push('certifications = ?');
      values.push(JSON.stringify(certifications));
    }
    if (languages !== undefined) {
      updates.push('languages = ?');
      values.push(JSON.stringify(languages));
    }
    if (projects !== undefined) {
      updates.push('projects = ?');
      values.push(JSON.stringify(projects));
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id, userId);

    await pool.execute(
      `UPDATE cvs SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ? AND userId = ?`,
      values
    );

    return await this.findById(id);
  }

  // Delete CV
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM cvs WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Parse database row to object format
  static parseRow(row) {
    return {
      _id: row.id,
      id: row.id,
      userId: row.userId,
      title: row.title,
      documentType: row.document_type || 'cv',
      personalInfo: typeof row.personalInfo === 'string' ? JSON.parse(row.personalInfo) : row.personalInfo,
      professionalSummary: row.professionalSummary,
      workExperience: typeof row.workExperience === 'string' ? JSON.parse(row.workExperience) : row.workExperience,
      education: typeof row.education === 'string' ? JSON.parse(row.education) : row.education,
      skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills,
      certifications: typeof row.certifications === 'string' ? JSON.parse(row.certifications) : row.certifications,
      languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
      projects: typeof row.projects === 'string' ? JSON.parse(row.projects) : row.projects,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}

module.exports = CV;
