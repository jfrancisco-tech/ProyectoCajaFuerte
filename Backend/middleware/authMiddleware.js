const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar formato "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error verificando token',
      error: error.message
    });
  }
};

// Middleware para verificar rol de admin
const adminMiddleware = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware para verificar rol de usuario o admin
const userMiddleware = (req, res, next) => {
  if (req.user.rol !== 'usuario' && req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de usuario'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  userMiddleware
};
