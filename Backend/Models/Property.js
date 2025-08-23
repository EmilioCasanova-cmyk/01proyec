const db = require('../config/database');

const Property = {
  getAll: (callback) => {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.phone as agent_phone 
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id
    `;
    db.query(query, callback);
  },
  
  getById: (id, callback) => {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.phone as agent_phone 
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE p.id = ?
    `;
    db.query(query, [id], callback);
  },
  
  create: (propertyData, callback) => {
    const query = `
      INSERT INTO properties 
      (title, description, price, address, city, state, property_type, status, bedrooms, bathrooms, area, agent_id, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      query,
      [
        propertyData.title,
        propertyData.description,
        propertyData.price,
        propertyData.address,
        propertyData.city,
        propertyData.state,
        propertyData.property_type,
        propertyData.status,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.area,
        propertyData.agent_id,
        JSON.stringify(propertyData.images || [])
      ],
      callback
    );
  },
  
  update: (id, propertyData, callback) => {
    const query = `
      UPDATE properties 
      SET title=?, description=?, price=?, address=?, city=?, state=?, property_type=?, status=?, bedrooms=?, bathrooms=?, area=?, agent_id=?, images=?
      WHERE id=?
    `;
    
    db.query(
      query,
      [
        propertyData.title,
        propertyData.description,
        propertyData.price,
        propertyData.address,
        propertyData.city,
        propertyData.state,
        propertyData.property_type,
        propertyData.status,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.area,
        propertyData.agent_id,
        JSON.stringify(propertyData.images || []),
        id
      ],
      callback
    );
  },
  
  delete: (id, callback) => {
    const query = 'DELETE FROM properties WHERE id = ?';
    db.query(query, [id], callback);
  },
  
  search: (filters, callback) => {
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.phone as agent_phone 
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE 1=1
    `;
    let params = [];
    
    if (filters.search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.property_type && filters.property_type !== 'all') {
      query += ' AND p.property_type = ?';
      params.push(filters.property_type);
    }
    
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }
    
    if (filters.min_price) {
      query += ' AND p.price >= ?';
      params.push(filters.min_price);
    }
    
    if (filters.max_price) {
      query += ' AND p.price <= ?';
      params.push(filters.max_price);
    }
    
    if (filters.city) {
      query += ' AND p.city = ?';
      params.push(filters.city);
    }
    
    // Paginación
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 5;
    const offset = (page - 1) * limit;
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.query(query, params, callback);
  }
};

module.exports = Property;