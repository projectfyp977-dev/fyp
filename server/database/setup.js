const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'voice_cv_maker';

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);
    console.log(`Using database '${dbName}'`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Users table created or already exists');

    // Create CVs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cvs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) DEFAULT 'My CV',
        document_type VARCHAR(50) DEFAULT 'cv',
        personalInfo JSON,
        professionalSummary TEXT,
        workExperience JSON,
        education JSON,
        skills JSON,
        certifications JSON,
        languages JSON,
        projects JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('CVs table created or already exists');

    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.log('\nMake sure:');
    console.log('1. XAMPP MySQL is running');
    console.log('2. MySQL credentials in .env are correct');
    console.log('3. You can manually run schema.sql in phpMyAdmin');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
