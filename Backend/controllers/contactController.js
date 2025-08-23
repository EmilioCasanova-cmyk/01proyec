const Contact = require('../Models/Contact');

const contactController = {
  createContact: (req, res) => {
    const contactData = req.body;
    
    // Validar campos requeridos
    if (!contactData.property_id || !contactData.name || !contactData.email) {
      return res.status(400).json({ error: 'Property ID, nombre y email son requeridos' });
    }
    
    Contact.create(contactData, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar mensaje' });
      }
      
      res.status(201).json({ message: 'Mensaje enviado exitosamente' });
    });
  },
  
  getContactsByProperty: (req, res) => {
    const propertyId = req.params.propertyId;
    
    Contact.getByPropertyId(propertyId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener contactos' });
      }
      
      res.json(results);
    });
  },
  
  getContactsByUser: (req, res) => {
    const userId = req.params.userId;
    
    Contact.getByUserId(userId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener contactos' });
      }
      
      res.json(results);
    });
  }
};

module.exports = contactController;