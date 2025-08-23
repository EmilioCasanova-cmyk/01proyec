const Property = require('../Models/Property');

const propertyController = {
  getAllProperties: (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const property_type = req.query.property_type || 'all';
    const status = req.query.status || '';
    const min_price = req.query.min_price;
    const max_price = req.query.max_price;
    const city = req.query.city || '';
    
    Property.search({
      page,
      limit,
      search,
      property_type,
      status,
      min_price,
      max_price,
      city
    }, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener propiedades' });
      }
      
      // Obtener el total de propiedades para paginación
      let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE 1=1';
      let countParams = [];
      
      if (search) {
        countQuery += ' AND (title LIKE ? OR description LIKE ? OR address LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (property_type && property_type !== 'all') {
        countQuery += ' AND property_type = ?';
        countParams.push(property_type);
      }
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      if (min_price) {
        countQuery += ' AND price >= ?';
        countParams.push(min_price);
      }
      
      if (max_price) {
        countQuery += ' AND price <= ?';
        countParams.push(max_price);
      }
      
      if (city) {
        countQuery += ' AND city = ?';
        countParams.push(city);
      }
      
      const db = require('../config/database');
      db.query(countQuery, countParams, (err, countResults) => {
        if (err) {
          return res.status(500).json({ error: 'Error al contar propiedades' });
        }
        
        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);
        
        res.json({
          properties: results,
          pagination: {
            current: page,
            total: totalPages,
            count: results.length,
            totalItems: total
          }
        });
      });
    });
  },
  
  getPropertyById: (req, res) => {
    const id = req.params.id;
    
    Property.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener propiedad' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }
      
      // Parsear imágenes si existen
      const property = results[0];
      if (property.images) {
        try {
          property.images = JSON.parse(property.images);
        } catch (e) {
          property.images = [];
        }
      } else {
        property.images = [];
      }
      
      res.json(property);
    });
  },
  
  createProperty: (req, res) => {
    const propertyData = req.body;
    
    // Validar campos requeridos
    if (!propertyData.title || !propertyData.price || !propertyData.address) {
      return res.status(400).json({ error: 'Título, precio y dirección son requeridos' });
    }
    
    Property.create(propertyData, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al crear propiedad' });
      }
      
      res.status(201).json({
        message: 'Propiedad creada exitosamente',
        propertyId: results.insertId
      });
    });
  },
  
  updateProperty: (req, res) => {
    const id = req.params.id;
    const propertyData = req.body;
    
    Property.update(id, propertyData, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar propiedad' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }
      
      res.json({ message: 'Propiedad actualizada exitosamente' });
    });
  },
  
  deleteProperty: (req, res) => {
    const id = req.params.id;
    
    Property.delete(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar propiedad' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }
      
      res.json({ message: 'Propiedad eliminada exitosamente' });
    });
  }
};

module.exports = propertyController;