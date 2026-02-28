const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware - increase limit for base64 images (e.g. photo in CV)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ats', require('./routes/ats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test MySQL connection
pool.getConnection()
  .then(connection => {
    console.log('MySQL connected successfully');
    connection.release();
    // Ensure cvs table has template and customization columns (for existing DBs)
    return pool.execute("SHOW COLUMNS FROM cvs LIKE 'template'");
  })
  .then(([cols]) => {
    if (cols && cols.length === 0) {
      return pool.execute("ALTER TABLE cvs ADD COLUMN template VARCHAR(255) DEFAULT 'ats-simple' AFTER title")
        .then(() => pool.execute('ALTER TABLE cvs ADD COLUMN customization JSON AFTER template'))
        .then(() => console.log('Added template and customization columns to cvs table'));
    }
  })
  .catch(err => {
    console.error('MySQL connection error:', err.message);
    console.log('Make sure XAMPP MySQL is running and database is created');
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (accepts connections from same network)`);
});
