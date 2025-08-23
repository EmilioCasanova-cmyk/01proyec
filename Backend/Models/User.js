const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  create: (userData, callback) => {
    bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = `
        INSERT INTO users (email, password, first_name, last_name, phone, user_type) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.query(
        query,
        [userData.email, hashedPassword, userData.first_name, userData.last_name, userData.phone, userData.user_type || 'client'],
        callback
      );
    });
  },
  
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },
  
  findById: (id, callback) => {
    const query = 'SELECT id, email, first_name, last_name, phone, user_type, created_at FROM users WHERE id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = User;