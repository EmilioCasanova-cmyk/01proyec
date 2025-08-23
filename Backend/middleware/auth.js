const jwt = require('jsonwebtoken');

const auth = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luxurystate_secret');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
  },
  
  isAgent: (req, res, next) => {
    // Esta función asume que el usuario ya ha sido verificado con verifyToken
    // y que la información del usuario está en req.user
    
    // En una implementación real, buscaríamos el usuario en la base de datos
    // para verificar su tipo de usuario
    if (req.user.user_type !== 'agent') {
      return res.status(403).json({ error: 'Se requieren permisos de agente' });
    }
    
    next();
  }
};

module.exports = auth;