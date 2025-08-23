const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');

const authController = {
  register: (req, res) => {
    const { email, password, first_name, last_name, phone, user_type } = req.body;
    
    // Validar campos requeridos
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Verificar si el usuario ya existe
    User.findByEmail(email, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
      
      // Crear nuevo usuario
      User.create({ email, password, first_name, last_name, phone, user_type }, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Error al crear usuario' });
        }
        
        // Generar token JWT
        const token = jwt.sign(
          { id: results.insertId, email: email },
          process.env.JWT_SECRET || 'luxurystate_secret',
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          message: 'Usuario creado exitosamente',
          token,
          user: {
            id: results.insertId,
            email,
            first_name,
            last_name,
            phone,
            user_type: user_type || 'client'
          }
        });
      });
    });
  },
  
  login: (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    // Buscar usuario por email
    User.findByEmail(email, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      const user = results[0];
      
      // Verificar contraseña
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generar token JWT
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || 'luxurystate_secret',
          { expiresIn: '24h' }
        );
        
        res.json({
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            user_type: user.user_type
          }
        });
      });
    });
  }
};

module.exports = authController;