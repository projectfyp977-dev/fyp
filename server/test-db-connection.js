/**
 * Test MySQL connection using server/.env
 * Run: node test-db-connection.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'voice_cv_maker'
};

console.log('Trying to connect with:');
console.log('  DB_HOST=', config.host);
console.log('  DB_USER=', config.user);
console.log('  DB_PASSWORD=', config.password ? '(set)' : '(empty)');
console.log('  DB_NAME=', config.database);
console.log('');

mysql.createConnection(config)
  .then(conn => {
    console.log('OK – MySQL connected successfully.');
    conn.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED –', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\n→ MySQL is not running. Start MySQL in XAMPP Control Panel.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n→ Wrong user or password. For XAMPP default, set in server/.env:');
      console.log('   DB_PASSWORD=');
      console.log('   (empty – no value after =)');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('\n→ Database does not exist. Run: node database/setup.js');
    }
    process.exit(1);
  });
