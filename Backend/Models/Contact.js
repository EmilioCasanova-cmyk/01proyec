const db = require('../config/database');

const Contact = {
  create: (contactData, callback) => {
    const query = `
      INSERT INTO contacts (property_id, user_id, name, email, phone, message) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      query,
      [
        contactData.property_id,
        contactData.user_id,
        contactData.name,
        contactData.email,
        contactData.phone,
        contactData.message
      ],
      callback
    );
  },
  
  getByPropertyId: (propertyId, callback) => {
    const query = 'SELECT * FROM contacts WHERE property_id = ? ORDER BY created_at DESC';
    db.query(query, [propertyId], callback);
  },
  
  getByUserId: (userId, callback) => {
    const query = `
      SELECT c.*, p.title as property_title 
      FROM contacts c 
      LEFT JOIN properties p ON c.property_id = p.id 
      WHERE c.user_id = ? 
      ORDER BY c.created_at DESC
    `;
    db.query(query, [userId], callback);
  }
};

module.exports = Contact;