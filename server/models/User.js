const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create user
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return this.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, createdAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find user by email (with password for login)
  static async findByEmail(email, includePassword = false) {
    const fields = includePassword 
      ? 'id, name, email, password, createdAt' 
      : 'id, name, email, createdAt';
    
    const [rows] = await pool.execute(
      `SELECT ${fields} FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  // Find one user (for compatibility)
  static async findOne(query) {
    if (query.email) {
      return await this.findByEmail(query.email);
    }
    if (query._id || query.id) {
      return await this.findById(query._id || query.id);
    }
    return null;
  }

  // Compare password
  static async comparePassword(userPassword, candidatePassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  // Update password by email (for reset without email sending)
  static async updatePasswordByEmail(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
