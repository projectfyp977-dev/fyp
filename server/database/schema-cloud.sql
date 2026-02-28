-- Run this in your cloud MySQL (PlanetScale / RemoteMySQL / etc.)
-- Database should already exist; just run these two tables.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cvs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) DEFAULT 'My CV',
  document_type VARCHAR(50) DEFAULT 'cv',
  template VARCHAR(255) DEFAULT 'ats-simple',
  customization JSON,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
